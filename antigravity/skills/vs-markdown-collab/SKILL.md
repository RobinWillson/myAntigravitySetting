---
name: vs-markdown-collab
description: Agentic workflow for addressing review comments on Markdown (.md) files in a Markdown Collab workspace, AND for reviewing Markdown docs by leaving review comments for the human. Comments are stored INLINE in the .md file itself (look for `<!--mc:threads:begin-->`). TRIGGER when the user asks to address, resolve, respond to, incorporate, or act on review comments, notes, suggestions, or feedback on any Markdown document — trigger phrases include "address the comments on foo.md", "apply the review feedback", "respond to the notes in README", "incorporate the suggestions", "fix the markdown collab comments", "work through the review on docs/spec.md". ALSO TRIGGER on review-mode requests where the user asks YOU to play reviewer — "review this doc", "leave your thoughts on README", "do a review pass on docs/spec.md", "second pair of eyes on this", "what would you flag in this file", "review the markdown collab doc on X".
---

# Markdown Collab — agentic review-address skill

You are addressing human review comments left on Markdown files via the Markdown Collab VS Code extension. The user runs the IDE; you do the writing.

## Storage format

Comments are stored INLINE in the `.md` file itself — there is no sidecar.

- Anchored spans are wrapped in paired HTML comments:
  `<!--mc:a:ID-->anchored text<!--mc:/a:ID-->` (ID = 1–12 char base36).
- A single block at the end of the file holds one `<!--mc:t {JSON}-->` line per thread, fenced by `<!--mc:threads:begin-->` and `<!--mc:threads:end-->`.
- Each thread JSON:
  `{"id":"<ID>","quote":"<original anchor text>","status":"open"|"resolved","comments":[Comment, …]}`.
- Each `Comment`:
  `{"id":"c<N>","parent"?:"c<N>","author":"<name>","ts":"<ISO-8601 UTC>","body":"<markdown>","editedTs"?:"<ISO-8601 UTC>","deleted"?:true}`.

**Detection:** the `.md` file contains the literal string `<!--mc:threads:begin-->`. A file without that block simply has no comments yet.

If a named file has no threads region:
- If the user is asking you to **address** comments, there are none — tell the user and stop.
- If the user is asking you to **initiate** a thread (opt-in, see Phase 5), create the inline threads region.

## Workflow

### Phase 1 — Discover

1. Read the `.md` file.
2. Locate the threads region: everything between `<!--mc:threads:begin-->` and `<!--mc:threads:end-->`. Each `<!--mc:t {JSON}-->` line is one thread.
3. Filter to **actionable** threads only:
   - `status === "open"` AND
   - The last non-deleted entry in `comments` has `author !== "claude"` (and is not an AI alias you chose previously).
4. For each actionable thread, locate the anchored prose with a regex search for `<!--mc:a:<thread-id>-->`. The text between the open and close marker is the passage the reviewer is talking about. If the open or close marker is missing, the thread is **unanchored** — fall back to the `quote` field as the locator.

### Phase 2 — Plan

Group by file. Within a file, order edits by anchor position (earlier first). For each thread, write down: the reviewer's intent, the concrete edit, and whether the anchored passage will be rewritten in place (marker pair must move with it) or removed (markers go away, thread orphans).

### Phase 3 — Edit & reply

For each thread, in order, do everything in **one Edit call per concern** against the `.md` file:

1. **Make the prose change.** Use the Edit tool. **The anchor markers MUST travel with their text. Dropping a marker silently orphans the reviewer's comment — this is the single most common way this workflow breaks, so handle it deliberately.** Three cases:

   - **Rewrite in place (you change the anchored text):** the marker pair moves with the text and keeps the SAME id. The reliable way is to put the markers *inside* your Edit — `old_string` = open marker + old passage + close marker; `new_string` = the same open marker + the NEW passage + the same close marker. Do NOT Edit the bare visible text: the markers sit flush against it, so a bare-text `old_string` either fails to match or drops a marker. Example — renaming an anchored heading from "Main business flows" to "Core business processes":
       - `old_string`: `### <!--mc:a:aopzy-->Main business flows<!--mc:/a:aopzy-->`
       - `new_string`: `### <!--mc:a:aopzy-->Core business processes<!--mc:/a:aopzy-->`

     Same `aopzy` id, both markers kept, only the wrapped text changed. When the anchored text changes this way, also update that thread's `quote` field to the new text in step 2 (the quote is the fallback locator). Never leave the rewritten text un-wrapped; never duplicate or split a marker.
   - **Remove the passage:** delete the open marker, the passage, and the close marker together. The thread will orphan and surface in the UI as "broken anchor". That is the correct outcome — do NOT re-anchor to nearby unrelated text.
   - **Touch surrounding prose without touching the anchored span:** the markers stay exactly where they were.

2. **Append a reply to the thread.** Locate the matching `<!--mc:t {…}-->` line by its `"id":"<thread-id>"`, then Edit only that single line:
   - Append a new comment object at the END of the thread's `comments` array.
   - The new comment must have:
     - `"id"`: the next sequential `c<N>` for that thread (find the highest existing N including deleted entries; new id = N+1).
     - `"parent"`: the id of the LAST non-deleted comment in the thread (the one you are replying to).
     - `"author"`: `"claude"` unless the user has told you to use a different name.
     - `"ts"`: current UTC timestamp in ISO-8601, e.g. `"2026-05-13T14:32:11Z"` (omit sub-second precision).
     - `"body"`: one or two sentences quoting the new wording, naming the section, or naming the file/function you changed. Be specific. Don't say "done".
   - **Do NOT change `status`.** The human reviewer marks threads resolved. Leave `"status":"open"`.
   - **Do NOT mutate any existing comment.** Only append. (One exception: if you rewrote the anchored text in step 1, update this thread's `quote` field to the new text in the same Edit — `quote` is a thread-level field, not a comment, and keeping it current makes the comment recoverable if a marker is ever lost.)
   - Preserve the JSON exactly otherwise: same key order, same escaping, same trailing `-->`. The line stays on a single line; do not introduce newlines inside the JSON.

3. **For threads you cannot fully address** (ambiguous request, missing info, conflicting with another thread), still append a reply explaining what you tried and what you need. Do not pretend it's done.

### Phase 4 — Deletion (opt-in)

You only delete or tombstone a thread when the human's body or trailing reply unambiguously asks for it ("delete this comment", "remove this thread", "drop this", "this comment is no longer relevant"):

- Remove the matching `<!--mc:t {…}-->` line outright AND remove the matching anchor marker pair from the prose. Both edits in one pass.
- Never delete to "clean up". Never delete just because you addressed a comment — the human resolves.

### Phase 5 — Initiate a new thread (opt-in)

You only **create** a new review thread when the human explicitly asks you to — "leave a comment on X", "add a review note about Y", "flag this section for follow-up", "drop a TODO comment here". Never initiate threads spontaneously while addressing existing ones, while doing maintenance edits, or to leave yourself a reminder.

Use it when:
- the target `.md` already contains `<!--mc:threads:begin-->`, OR
- the target `.md` has no threads region yet (a fresh file) — create one.

When asked to add a thread:

1. **Pick the passage to anchor.** It must:
   - Be a verbatim substring of the current `.md` text.
   - Be a meaningful span (at least a word) — markers store exact offsets, so there's no minimum length, but a one-character anchor is rarely useful.
   - Sit OUTSIDE fenced code blocks and inline code spans (markers inside code are deliberately ignored by the parser, so a thread anchored there would be invisible).
   - Occur in a location where adding the marker pair won't break neighbouring markdown syntax (don't split a link target, an image alt, a table cell delimiter, or a heading underline).

2. **Pick a thread id.** 5-char lowercase base36 (`[a-z0-9]{5}`). It MUST be unique across:
   - every `<!--mc:a:ID-->` and `<!--mc:/a:ID-->` marker already in the file, and
   - every `"id":"…"` in existing `<!--mc:t {…}-->` lines.
   Generate a random id; if it collides, retry.

3. **Wrap the passage in paired markers.** Use the Edit tool. `old_string` = the passage, `new_string` = `<!--mc:a:ID-->` + passage + `<!--mc:/a:ID-->`. The markers must hug the passage with no extra whitespace inserted.

4. **Append a thread JSON line to the threads region.** If `<!--mc:threads:begin-->` already exists, Edit to insert a new line just before the matching `<!--mc:threads:end-->` line. If neither fence exists yet, append a fresh region at the end of the file:
   ```

   <!--mc:threads:begin-->
   <!--mc:t {"id":"ID","quote":"<anchored text>","status":"open","comments":[{"id":"c1","author":"claude","ts":"<ISO-8601 UTC>","body":"<your note>"}]}-->
   <!--mc:threads:end-->
   ```
   The thread JSON must be on a single line. `quote` is the verbatim anchored text. `status` is always `"open"` — never seed a thread as resolved. The first `comments` entry is your note (`id`: `c1`; `author`: `"claude"` unless the user gave you a different alias; `ts`: current UTC ISO-8601, sub-second precision stripped; `body`: the note itself, markdown allowed).

5. **Verify.** Re-read the file. Confirm: (a) exactly one open marker and one close marker exist for the new id, wrapping the chosen passage; (b) exactly one `<!--mc:t …-->` line carries that id; (c) the JSON parses and matches the schema in section "Inline format" above.

If you need to add **multiple** threads in one turn, do them one at a time, re-reading after each to make sure earlier marker offsets weren't invalidated by intervening prose edits.

### Phase 6 — Invariants (inline mode)

You MUST NOT:
- Change any thread's `status` field. Only the human resolves.
- Edit any comment object other than to APPEND new entries.
- Re-anchor an orphaned thread to nearby unrelated text. Let it orphan.
- Move existing anchor markers to a new location unless you also moved the passage they wrap.
- Change `thread.id`, `thread.quote`, existing comment `id` / `author` / `ts` / `body`, or any other historical field.
- Introduce comment ids that don't follow the `c<N>` sequence within a thread (`c1` for the first comment, `c2` next, etc.).
- Initiate a new thread (Phase 5) unless the human explicitly asked. The Review Mode trigger ("review this doc", "leave your thoughts on X", "do a review pass") counts as an explicit ask and unlocks one or more thread initiations — see the Review Mode section below.
- Reformat the threads region (drop newlines, merge lines, reorder threads). Only line-level edits to one thread JSON at a time.
- Edit prose in Review Mode. In review mode you OPEN threads, you do not modify the doc text. Even obvious typos go in a thread unless the human said "fix as you go".

### Review Mode (inline) — Claude as the reviewer

When the human's request matches **Review Mode** trigger phrases — "review this doc", "leave your thoughts on X", "do a review pass on Y", "second pair of eyes on README", "what would you flag in this file", or the Markdown Collab extension's "Ask Claude to Review This Doc" command — you switch from addressing existing comments to **initiating** new review threads. The human will triage them in the sidebar.

The mechanics are the same as Phase 5: pick a passage, allocate an id, insert paired markers, append a `<!--mc:t {…}-->` line with a single `c1` comment authored by `"claude"`, verify. Read Phase 5 first if you have not — it carries the invariants you must respect when wrapping passages.

#### Focus directive

The prompt may include a `Focus:` line — a free-form instruction from the human (e.g. *"check API examples for correctness," "find marketing-y tone," "look for contradictions with the architecture doc"*). When a focus directive is present:

- It is the **primary filter** for what counts as a concern worth a thread. Only flag things that match the focus.
- A general-quality issue that doesn't match the focus does **not** warrant a thread unless it's a hard error (e.g. broken example, factually wrong claim).
- If no concerns match the focus after a careful read, reply (via the send channel, not via a thread) saying so. **Do not fabricate threads to feel productive.**

Without a focus directive, do a general review against the rubric below.

#### What warrants a thread

- Factual error or claim that's wrong.
- Unclear claim that a reader could plausibly misinterpret.
- Missing context the reader will need (e.g. an undefined term used in passing).
- Broken example: code that won't run, a command with a wrong flag, a link to a nonexistent file.
- Contradiction between this doc and another section / file the human has scoped in.
- Structural issue: section out of order, heading hierarchy broken, key info buried.
- Anything matching the focus directive when one was given.

#### What does NOT warrant a thread by default

- Pure typos (commas, articles, capitalization). Skip unless the focus is "copy-edit".
- Style preferences (Oxford comma, sentence length, voice). Skip unless the focus is "tone" / "style".
- Generic "could be clearer" / "this section feels long" without naming the specific problem. If you can't name it, you can't anchor it.
- Restating the anchored text. The body must add something the human doesn't already see.

#### Anchor sizing in Review Mode

- The anchor should be the **smallest passage that makes the comment make sense**. Prefer one sentence over a paragraph. Prefer one phrase over a sentence when the issue is local.
- Avoid wrapping a whole section. If the issue is structural ("this section is in the wrong place"), anchor the section heading line, not the body.
- Anchors must still satisfy Phase 5 constraints: a meaningful span, outside code spans, marker-safe location.

#### Thread body — specificity rule

Every `c1` body must name the concern concretely.

- **Good:** *"The claim that `X` implies `Y` skips intermediate step `Z`. Either justify the jump or add the step."*
- **Good:** *"Example uses `--all` but the CLI flag is `--include-deleted` per `cli.ts` line 142. Update the flag or update the CLI."*
- **Bad:** *"This could be clearer."*
- **Bad:** *"The whole section needs work."*
- **Bad:** *Restating the anchored text with no analysis.*

The body should fit in 1–3 sentences. If you need more, split into separate threads on different anchors.

#### Worked examples — good vs bad

These calibrate the rubric. Mirror the *shape* of the good examples; avoid the failure modes in the bad ones.

**Good — concrete factual correction.** Doc says: *"The CLI accepts `--all` to include resolved comments."* Code says the flag is `--include-resolved`. Anchor the literal `--all` token only (smallest meaningful span). Body: *"CLI flag is `--include-resolved` per `cli.ts:142`, not `--all`. Either rename the doc or update the CLI."*

**Good — unclear claim with a named ambiguity.** Doc says: *"The skill triggers on review-mode phrases."* Anchor the sentence. Body: *"\'Review-mode phrases\' isn't defined here — the rubric for what counts as one is in Phase 5+. Either inline a one-line definition or link to the Review Mode section."*

**Good — contradiction across sections.** Doc's `Quick start` says `Send to Claude` is in the right-click menu; doc's `Commands` table says it's palette-only. Anchor the quick-start claim (because it's the one that's likely wrong). Body: *"Conflicts with the Commands table, which marks this palette-only as of v0.28. Update one or the other to match reality."*

**Good — structural issue, anchored at a heading.** Doc has a `## Settings` heading before `## Storage layout`, but Storage explains terms used in Settings. Anchor the `## Settings` heading. Body: *"Settings references the `<!--mc:threads:begin-->` marker introduced in Storage layout below. Move Storage layout above Settings, or forward-link explicitly."*

**Bad — vague.** *"This could be clearer."* No anchored specifics, no named problem, nothing the human can act on without re-deriving the concern. Either name the specific issue or skip.

**Bad — anchor too wide.** Anchoring an entire 8-paragraph section because *"the whole section needs work."* The human can't tell which sentence drove the comment. Pick the single sentence (or heading) that crystallizes the issue.

**Bad — restating the anchor.** Anchored: *"Channels need MCP."* Body: *"This sentence is about channels needing MCP."* Adds nothing the reader doesn't see. Either explain *why* the claim is problematic (it's incomplete? wrong? unclear in this context?) or skip.

**Bad — opinion presented as fact.** *"This intro is too marketing-y."* — only valid if the focus directive explicitly asks for tone. Without that, style preferences aren't a substantive concern.

**Bad — fix dressed as a comment.** Body: *"I changed this to X."* You don't edit prose in Review Mode. Open a thread proposing the change in the body; let the human accept it.

#### No upper bound on thread count

There is **no maximum number of threads** per review pass. Leave a thread for every substantive concern that fits the focus directive (or the general rubric, if no focus was given). If you find 30 issues, leave 30 threads. The human triages with the sidebar UI; your job is signal, not curation.

Do not "leave the top N" — dropping findings to hit a count target risks suppressing the one that matters most.

#### Honest empty result

If you read the doc carefully and find no concerns that match the focus (or no general-rubric concerns if no focus was given), say so explicitly via the send channel. Do **not** open a thread to comment "looks good" — threads are for actionable concerns. A short reply of *"Reviewed `<path>` against focus `<focus>`. No concerns found."* is the correct outcome.

#### Workflow — Review Mode pass

1. **Read the doc end to end** before opening any threads. Cross-referencing the focus directive against the whole doc avoids redundant or contradictory threads.
2. **List concerns mentally** with anchor candidate, severity (in your head — do not encode it in JSON), and one-sentence body. Discard anything that fails the specificity rule.
3. **Initiate threads one at a time**, in document order (earlier anchors first). Use the Phase 5 mechanics:
   - Verbatim anchor passage (a meaningful span, outside code fences).
   - 5-char lowercase base36 id, unique against existing markers and `<!--mc:t …-->` ids.
   - Paired markers wrap the passage; `<!--mc:t {…}-->` line appended in the threads region (create the region if absent).
   - `c1` comment: `author:"claude"`, current UTC ISO-8601 `ts`, body following the specificity rule.
4. **Re-read after each Edit.** Anchor offsets may shift; the next thread's anchor must still be a unique substring.
5. **Do not edit prose.** Even if the fix is obvious. Open a thread; the human decides.
6. **Verify.** Re-read the file. Confirm every new thread has a paired marker, a `<!--mc:t …-->` line with valid JSON, `status:"open"`, and a single `c1` from `"claude"`. Confirm no existing thread or prose was disturbed.

### Phase 7 — Verify

Before reporting done:
- Re-read the threads region. Confirm each addressed thread now ends with a comment authored by you and `"status":"open"`.
- For each thread whose passage you rewrote: confirm the file still contains exactly one matched marker pair for that id, wrapping the new wording.
- For each thread whose passage you removed: confirm both markers are gone and the `<!--mc:t …-->` line is unchanged (it will orphan in the UI).
- For each deletion (opt-in): confirm the `<!--mc:t …-->` line is gone AND the marker pair is gone.
- For each thread you initiated (opt-in): confirm a paired marker exists, the new `<!--mc:t …-->` line parses as valid JSON with `status:"open"` and a single `c1` comment, and the id is unique in the file.

If any check fails, fix it before reporting.

## When this skill applies

Invoke when:
- The user names one or more `.md` files and asks you to act on review comments / feedback / notes.
- The user says "address the markdown collab comments" without naming files (operate workspace-wide).
- The user references a specific comment thread or quote and asks you to apply / respond.
- The user asks you to "watch for review batches" or to wait for the VS Code "Send to Claude" button (use the channel watch loop or MCP channel mode below).

## Anchor maintenance applies on EVERY `.md` edit, not just comment-driven ones

Whenever you modify a `.md` file in a Markdown Collab workspace — for any reason, not only when addressing review comments — you MUST also reconcile that file's anchors after the edit. Rewording a sentence, refactoring a heading, fixing a typo: any of these can break an existing anchor.

1. After your Edit, search the `.md` text for `<!--mc:a:` and `<!--mc:/a:` markers. Each opener must have a matching closer with the same id; mismatched, dropped, or duplicated markers are a bug you just introduced.
2. For each thread id whose markers are still paired, confirm the wrapped text still reflects the same idea the reviewer commented on:
   - **You rewrote the passage in place** → keep the markers wrapping the new wording (this should already be the case if you used surgical Edits).
   - **You removed the passage** → both markers should now be gone; the thread will surface as unanchored in the UI. That is the correct outcome. Do NOT re-add markers to wrap unrelated nearby text.
3. Do NOT change any `<!--mc:t {…}-->` line during maintenance — only the human reviewer and the inline-mode reply workflow append to threads.

The maintenance pass applies in addition to the comment-driven workflows above; do not skip it just because no review batch was active.

## MCP channel mode (preferred when supported)

Claude Code v2.1.80+ supports first-party MCP channels: events arrive natively as `<channel source="markdown-collab" file="..." count="N" id="evt_…">` tags in your context with no streaming-tool dependency.

**Setup (one-time):**

1. Run the **Markdown Collab: Install Claude Skill** command in VS Code. This drops `mdc-channel.mjs` into `~/.claude/skills/vs-markdown-collab/`.
2. Add the server to `~/.claude.json` (user-level) or the workspace's `.mcp.json` (project-level):
   ```json
   {
     "mcpServers": {
       "markdown-collab": {
         "command": "node",
         "args": ["~/.claude/skills/vs-markdown-collab/mdc-channel.mjs"]
       }
     }
   }
   ```
3. Start Claude with the development flag (channels are still research preview):
   ```
   claude --dangerously-load-development-channels server:markdown-collab
   ```
4. Set `markdownCollab.sendMode` to `mcp-channel` in VS Code, or pick it from the quick-pick.

**Runtime:**
The button click POSTs to the running channel server, which fires `notifications/claude/channel`. The body of the `<channel>` tag is the same JSON payload `{prompt, file, unresolvedCount, comments}`. The `prompt` field tells you to follow this skill. Address each comment per the phases above, then append `{"id": "<id-from-tag>"}` to `<workspace>/.markdown-collab/.events.acked.jsonl` so the tailer stops re-surfacing that batch on restart.

**Caveats:** channels require claude.ai login (no API keys / Console), and the protocol is research preview — Anthropic warns it may change. If channels aren't supported in your harness or version, fall back to one of the modes below.

## Channel watch loop (button-driven)

The VS Code extension exposes a "Send to Claude" button in the Inline Comments View. When configured for channel mode it appends one JSON line per click to `<workspace>/.markdown-collab/.events.jsonl`. To watch for the next click:

1. **Start the tailer in background** using the Bash tool with `run_in_background: true`:
   ```
   node ~/.claude/skills/vs-markdown-collab/mdc-tail.mjs --workspace <workspace>
   ```
   Use the absolute workspace path. Do NOT use `tail -f` directly — when its stdout is a pipe (which it is for background bash), most platforms switch `tail` to block-buffered output and Monitor sees nothing until ~4 KB accumulates. `mdc-tail.mjs` flushes per line.

2. **Subscribe to the bash's stdout stream.** Look for a tool whose contract is "each stdout line of a long-running process surfaces as a model notification" — typically `Monitor` or `BashOutput`. NOT `TaskOutput`: `TaskOutput` waits for the task to *complete*, and `mdc-tail.mjs` runs forever by design.

   **If neither `Monitor` nor `BashOutput` is in your tool list**, the channel transport cannot run reactively in this harness. Options:
   - Stop the tailer (kill the background bash) and tell the user to switch the VS Code setting `markdownCollab.sendMode` to `terminal` — that mode bracketed-pastes each click directly into your REPL, no watch loop required.
   - Or fall back to polling: call `TaskOutput block=false` on the bash periodically, diff against the last-seen offset of stdout, process any new JSON lines. Functional but consumes one iteration per poll.
   - Or skip the tailer entirely and `Read` `.markdown-collab/.events.jsonl` directly each turn, tracking the highest line you've already addressed.

3. **Per notification**, parse the JSON line as `{prompt, file, unresolvedCount, comments, ts}`. Address the batch using the phases above, then return to the Monitor stream for the next event.

4. **Stopping**: the user ends the session, or you exit the watch when they say "stop watching." Kill the background tailer process when done.

Skip / abort if:
- The user is asking for a general edit unrelated to review comments.
- The target `.md` file contains no `<!--mc:threads:begin-->` block — there is nothing to act on.


## Reporting

Tell the user, per file:
- Threads addressed (id + one-line summary of each change).
- Threads initiated on explicit request (id + anchored passage + the note you left).
- Threads deleted on explicit request (id).
- Threads left unanchored / orphaned because their target was removed (id + why).
- Threads answered without a prose change (id + the question / clarification you replied with).
- Anything you skipped and why.

Use the thread id so the human can find each thread in VS Code (thread IDs are 1–12 char base36).

## Anti-patterns

- Don't change any thread's `"status"` field. Only the human resolves.
- Don't mutate or reorder existing comment objects. Append only.
- Don't move or duplicate anchor markers without moving the passage they wrap.
- Don't re-add markers to wrap unrelated nearby text after a deletion.
- Don't reformat the threads region (newlines, key order, escaping).
- Don't reply with vague "applied" — say what you applied, quoting the new wording.
- Don't fabricate that you handled a comment you couldn't actually address.
- Don't re-anchor a deleted passage to nearby unrelated text. Deletions become orphans by design.
- Don't delete a thread the human didn't explicitly tell you to delete.
- Don't initiate a new thread the human didn't explicitly ask for. The skill is reply-driven by default.
- Don't operate on a file with no `<!--mc:threads:begin-->` block — surface this rather than invent state.
