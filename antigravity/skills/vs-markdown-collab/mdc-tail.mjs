#!/usr/bin/env node
// Markdown Collab event-log tailer for Claude Code's Monitor tool.
//
// Why a Node tailer instead of `tail -f`?
//   When run as a background bash with stdout connected to a pipe (which is
//   how Claude Code captures it), `tail -f` switches to block-buffered mode
//   on most platforms — lines aren't visible to Monitor until ~4 KB
//   accumulates. We avoid that by writing through fs.writeSync(1, ...) so
//   every emitted line is flushed synchronously to fd 1; Node's regular
//   process.stdout.write is itself buffered on POSIX pipes and would have
//   the same problem.
//
// Acked-event suppression:
//   After addressing a batch, Claude appends `{"id":"<event-id>"}` to a
//   sibling `.events.acked.jsonl` (see SKILL.md → channel modes). The tailer
//   reads that file on startup and watches it; any event whose id is already
//   acked is silently skipped on emit. This makes `--from-start` safe to
//   re-run without re-bothering Claude with already-addressed batches.
//
// Usage:
//   node mdc-tail.mjs [--workspace <ws>] [--from-start]
//
// Default: streams ONLY new lines (history is skipped, matching `tail -n 0`).
// Pass --from-start to replay all existing events first.

import { readFileSync, statSync, watch, openSync, readSync, closeSync, existsSync, writeSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

// Synchronous, unbuffered write to stdout. process.stdout.write is async
// when stdout is a pipe on POSIX, so lines could sit in the buffer until
// the event loop ticks — bad for Monitor / TaskOutput which expects each
// notification to arrive as soon as the underlying append happens.
function emit(line) {
  writeSync(1, line);
}

function fail(msg, code = 1) {
  process.stderr.write(`mdc-tail: ${msg}\n`);
  process.exit(code);
}

function parseArgs(argv) {
  const out = { workspace: null, fromStart: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--workspace") out.workspace = argv[++i];
    else if (a === "--from-start") out.fromStart = true;
  }
  return out;
}

function findWorkspace(start) {
  let cur = resolve(start);
  while (true) {
    if (existsSync(join(cur, ".markdown-collab"))) return cur;
    const parent = dirname(cur);
    if (parent === cur) return null;
    cur = parent;
  }
}

const args = parseArgs(process.argv.slice(2));
const ws = args.workspace || process.env.MDC_WORKSPACE || findWorkspace(process.cwd());
if (!ws) fail("could not locate a workspace with a .markdown-collab/ directory; pass --workspace <path>");

const logPath = join(ws, ".markdown-collab", ".events.jsonl");
const ackedPath = join(ws, ".markdown-collab", ".events.acked.jsonl");

// Seek positions. When a file doesn't exist yet we start at 0 and wait for
// fs.watch to surface its creation.
let pos = 0;
try {
  const st = statSync(logPath);
  pos = args.fromStart ? 0 : st.size;
} catch {
  pos = 0;
}
let ackedPos = 0;
const ackedIds = new Set();

let leftover = "";
let ackedLeftover = "";

function loadAcked() {
  let st;
  try {
    st = statSync(ackedPath);
  } catch {
    return;
  }
  if (st.size < ackedPos) {
    ackedPos = 0;
    ackedLeftover = "";
    ackedIds.clear();
  }
  if (st.size === ackedPos) return;
  const fd = openSync(ackedPath, "r");
  try {
    const need = st.size - ackedPos;
    const buf = Buffer.alloc(need);
    let read = 0;
    while (read < need) {
      const n = readSync(fd, buf, read, need - read, ackedPos + read);
      if (n === 0) break;
      read += n;
    }
    ackedPos += read;
    ackedLeftover += buf.subarray(0, read).toString("utf8");
    let nl;
    while ((nl = ackedLeftover.indexOf("\n")) >= 0) {
      const line = ackedLeftover.slice(0, nl);
      ackedLeftover = ackedLeftover.slice(nl + 1);
      if (line.length === 0) continue;
      try {
        const obj = JSON.parse(line);
        if (obj && typeof obj.id === "string") ackedIds.add(obj.id);
      } catch { /* skip malformed */ }
    }
  } finally {
    closeSync(fd);
  }
}

function drain() {
  let st;
  try {
    st = statSync(logPath);
  } catch {
    return;
  }
  if (st.size < pos) {
    // File was truncated or rotated. Restart at 0.
    pos = 0;
    leftover = "";
  }
  if (st.size === pos) return;
  const fd = openSync(logPath, "r");
  try {
    const need = st.size - pos;
    const buf = Buffer.alloc(need);
    let read = 0;
    while (read < need) {
      const n = readSync(fd, buf, read, need - read, pos + read);
      if (n === 0) break;
      read += n;
    }
    pos += read;
    leftover += buf.subarray(0, read).toString("utf8");
    let nl;
    while ((nl = leftover.indexOf("\n")) >= 0) {
      const line = leftover.slice(0, nl);
      leftover = leftover.slice(nl + 1);
      if (line.length === 0) continue;
      // Suppress emission when this event is already acked. Parse defensively;
      // a malformed line is forwarded as-is so debugging stays observable.
      let id = null;
      try {
        const obj = JSON.parse(line);
        if (obj && typeof obj.id === "string") id = obj.id;
      } catch { /* fall through */ }
      if (id && ackedIds.has(id)) continue;
      emit(line + "\n");
    }
  } finally {
    closeSync(fd);
  }
}

loadAcked();
drain();

// Watch both files. fs.watch may fire 'rename' on some platforms when a
// file is replaced; in that case we re-arm by polling.
function armWatch(target, onChange) {
  let watcher = null;
  function arm() {
    try {
      watcher = watch(target, { persistent: true }, () => onChange());
      watcher.on("error", () => {
        if (watcher) watcher.close();
        setTimeout(arm, 250);
      });
    } catch {
      setTimeout(arm, 250);
    }
  }
  arm();
}
armWatch(logPath, drain);
armWatch(ackedPath, () => {
  loadAcked();
  // After acks update, no need to re-emit anything from the main log —
  // an ack arrives AFTER the corresponding event was emitted (if at all).
});

// Belt-and-suspenders polling — handles editors / FS layers that drop
// inotify events. Cheap; runs every 500ms.
setInterval(() => { loadAcked(); drain(); }, 500).unref?.();

// Keep the process alive forever.
process.stdin.resume();
