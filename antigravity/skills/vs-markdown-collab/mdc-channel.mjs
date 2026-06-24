#!/usr/bin/env node
// Markdown Collab — Claude Code MCP channel server (research preview).
//
// Spawned by Claude Code over stdio when the user runs:
//   claude --dangerously-load-development-channels server:markdown-collab
// after registering this script in .mcp.json or ~/.claude.json:
//   "markdown-collab": { "command": "node", "args": ["<this script>"] }
//
// What it does:
// - Implements the minimum MCP handshake to declare the experimental
//   "claude/channel" capability. (Hand-rolled JSON-RPC; no SDK dep.)
// - Opens a localhost HTTP listener on a random port and writes the port
//   plus a per-session bearer token to <workspace>/.markdown-collab/.channel.json.
// - On POST /push, forwards the body to Claude as a notifications/claude/channel
//   event so it arrives in Claude's next turn as a <channel source="markdown-collab" ...>
//   tag.
//
// Reference: https://code.claude.com/docs/en/channels-reference

import { createServer } from "node:http";
import { writeFileSync, unlinkSync, mkdirSync, existsSync, writeSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { randomBytes } from "node:crypto";

function findWorkspace(start) {
  let cur = resolve(start);
  while (true) {
    if (existsSync(join(cur, ".markdown-collab"))) return cur;
    const parent = dirname(cur);
    if (parent === cur) return null;
    cur = parent;
  }
}

let workspace = process.env.MDC_WORKSPACE || null;
for (let i = 0; i < process.argv.length; i++) {
  if (process.argv[i] === "--workspace") workspace = process.argv[i + 1];
}
workspace = workspace || findWorkspace(process.cwd()) || process.cwd();

// ---------------------------------------------------------------------------
// JSON-RPC over stdio
// ---------------------------------------------------------------------------

let nextId = 1;
let buffer = "";
let initialized = false;

function send(message) {
  // writeSync to fd 1 — process.stdout.write is async on POSIX pipes and
  // Claude Code is on the other end of this pipe expecting line-delimited
  // JSON-RPC. Buffering would stall the handshake and notifications.
  writeSync(1, JSON.stringify(message) + "\n");
}

function sendNotification(method, params) {
  send({ jsonrpc: "2.0", method, params });
}

function reply(id, result) {
  send({ jsonrpc: "2.0", id, result });
}

function replyError(id, code, message) {
  send({ jsonrpc: "2.0", id, error: { code, message } });
}

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let nl;
  while ((nl = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (!line) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    handle(msg);
  }
});

function handle(msg) {
  if (msg.method === "initialize") {
    reply(msg.id, {
      protocolVersion: msg.params?.protocolVersion ?? "2024-11-05",
      capabilities: {
        experimental: { "claude/channel": {} },
      },
      serverInfo: { name: "markdown-collab", version: "0.13.0" },
      instructions:
        "Markdown Collab review batches arrive as <channel source=markdown-collab file=... count=N id=evt_...>. " +
        "The body is JSON: { prompt, file, unresolvedCount, comments }. " +
        "Address each unresolved comment per the vs-markdown-collab skill, then mark the event addressed " +
        "by writing an ack line to <workspace>/.markdown-collab/.events.acked.jsonl using the event id from the tag.",
    });
    return;
  }
  if (msg.method === "initialized" || msg.method === "notifications/initialized") {
    initialized = true;
    return;
  }
  if (msg.method === "shutdown") {
    reply(msg.id, {});
    cleanup();
    process.exit(0);
  }
  // Unknown methods: respond with method-not-found if it's a request.
  if (typeof msg.id !== "undefined") {
    replyError(msg.id, -32601, "method not found: " + msg.method);
  }
}

// ---------------------------------------------------------------------------
// Localhost HTTP receiver — extension POSTs button-click payloads here
// ---------------------------------------------------------------------------

const token = randomBytes(32).toString("hex");
const channelDir = join(workspace, ".markdown-collab");
const channelFile = join(channelDir, ".channel.json");

const server = createServer((req, res) => {
  const remote = req.socket.remoteAddress ?? "";
  if (remote !== "127.0.0.1" && remote !== "::1" && remote !== "::ffff:127.0.0.1") {
    res.statusCode = 403; res.end(); return;
  }
  if (req.headers.authorization !== `Bearer ${token}`) {
    res.statusCode = 401; res.end(); return;
  }
  if (req.method !== "POST" || req.url !== "/push") {
    res.statusCode = 404; res.end(); return;
  }
  const chunks = [];
  let total = 0;
  req.on("data", (c) => {
    total += c.length;
    if (total > 256 * 1024) { res.statusCode = 413; res.end(); req.destroy(); return; }
    chunks.push(c);
  });
  req.on("end", () => {
    if (res.writableEnded) return;
    let payload;
    try { payload = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { res.statusCode = 400; res.end("bad json"); return; }
    if (!initialized) { res.statusCode = 503; res.end("not initialized"); return; }
    sendNotification("notifications/claude/channel", {
      content: JSON.stringify(payload, null, 2),
      meta: {
        file: String(payload.file ?? ""),
        count: String(payload.unresolvedCount ?? 0),
        id: String(payload.id ?? ""),
      },
    });
    res.statusCode = 200; res.end("ok");
  });
});

server.listen(0, "127.0.0.1", () => {
  const port = server.address().port;
  mkdirSync(channelDir, { recursive: true });
  writeFileSync(
    channelFile,
    JSON.stringify({ port, token, pid: process.pid }, null, 2),
    { mode: 0o600 },
  );
});

// ---------------------------------------------------------------------------
// Cleanup
// ---------------------------------------------------------------------------

function cleanup() {
  try { unlinkSync(channelFile); } catch {}
  try { server.close(); } catch {}
}
process.on("SIGINT", () => { cleanup(); process.exit(0); });
process.on("SIGTERM", () => { cleanup(); process.exit(0); });
process.on("exit", cleanup);
