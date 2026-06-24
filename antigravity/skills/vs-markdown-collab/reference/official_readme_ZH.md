# Markdown Collab

[![VS Code Marketplace](https://img.shields.io/visual-studio-marketplace/v/markdown-collab.markdown-collab-plugin?label=VS%20Code%20Marketplace&color=4F46E5)](https://marketplace.visualstudio.com/items?itemName=markdown-collab.markdown-collab-plugin)
[![Open VSX](https://img.shields.io/open-vsx/v/markdown-collab/markdown-collab-plugin?label=Open%20VSX&color=4F46E5)](https://open-vsx.org/extension/markdown-collab/markdown-collab-plugin)

這是一個 VS Code 擴充套件，用於*與* Claude Code（以及其他代理型 AI）一起審閱 Markdown。註解會錨定在文字上，並**內聯儲存在 `.md` 檔案本身中**，因此審閱狀態會隨著文件移動 — 不需要提交額外的附帶檔案（sidecar）。

**三種使用方式：**

- **內聯註解 (Inline comments)** — 在渲染預覽中反白標示一段文字，留下審閱註解，點擊 **Send to Claude**。Claude 會讀取註解、編輯文件並回覆。重複此流程直到您解決該討論串。
- **即時編輯器 (Live editor)** — 一個所見即所得 (WYSIWYG) 的 Markdown 編輯器，讓您和 Claude 共同編輯同一個檔案：您打字，Claude 在磁碟上編輯檔案，雙方的變更都會即時顯示。在不離開編輯器的情況下進行註解、回覆、解決問題，並將討論串傳送給 Claude。
- **PR / MR 審閱 (PR / MR review)** — 審閱 GitHub Pull Request 或 GitLab Merge Request 中變更的 Markdown 檔案，在差異 (diff) 上加上註解，回覆現有的註解，並將結果發布回平台。

您也可以反轉方向，**要求 Claude 擔任審閱者**：在 `.md` 檔案上按一下右鍵 → **Markdown Collab: Ask Claude to Review This Doc**，可選擇性地告訴 Claude 關注的重點，然後 Claude 會為每個實質性問題開啟一個內聯註解討論串，供您在側邊欄進行分類處理 (triage)。

## 快速開始 (Quick start)

1. **安裝擴充套件。**
   - **VS Code** — 開啟 Extensions (`Cmd-Shift-X`)，搜尋 **Markdown Collab**，點擊 Install。或者從 [Marketplace 列表](https://marketplace.visualstudio.com/items?itemName=markdown-collab.markdown-collab-plugin)安裝，也可以使用 CLI：
     ```bash
     code --install-extension markdown-collab.markdown-collab-plugin
     ```
   - **Cursor / Windsurf / VSCodium / Gitpod** (Open VSX) — 在 Extensions 中搜尋 **Markdown Collab**，或從 [Open VSX 列表](https://open-vsx.org/extension/markdown-collab/markdown-collab-plugin)安裝。
   - **手動 / 備用方案** — 從 [GitHub Releases 頁面](https://github.com/ronicayu/markdown-collab-plugin/releases)獲取最新的 `.vsix` 檔案（`code --install-extension markdown-collab-plugin-*.vsix`），或從原始碼編譯（請參見 [Development](#development)）。
2. **安裝 Claude 技能 (每台機器一次性)。** 在 VS Code 中：`Cmd-Shift-P` → **Markdown Collab: Install Claude Skill**。這會將技能指令和內建輔助工具放入 `~/.claude/skills/vs-markdown-collab/`。
3. **在資料夾/工作區中開啟一個 Markdown 檔案**。在檔案上按一下右鍵 → **Markdown Collab: Open Inline Comments View**，或使用命令選擇區 (command palette)。
4. **在渲染檢視中反白標示一段文字** → 點擊彈出的 **Comment** 按鈕 → 寫下您的審閱筆記 → 提交。
5. **在註解側邊欄點擊 Send to Claude**。第一次時，系統會詢問您要使用哪種發送模式；您的回答將被記住。**對於大多數使用者，請選擇 `terminal`**（請參見 [選擇發送模式 (Choosing a send mode)](#choosing-a-send-mode)）。

> 註解會**內聯**儲存在 `.md` 檔案本身中 — 錨定的區段會被包裝在 `<!--mc:a:ID-->…<!--mc:/a:ID-->` 標記中，而討論串則存在於檔案末尾的單一 `<!--mc:threads:begin-->`…`<!--mc:threads:end-->` 區塊中。所有內容都與文件一起發布；不需要提交附帶檔案。

就是這樣 — Claude 讀取註解、編輯文件，並為每個討論串發布回覆。當您滿意時，可以切換為已解決 (resolved)。

## 如何在日常使用

### 新增註解 (Adding a comment)

開啟 **Inline Comments 檢視**（`Markdown Collab: Open Inline Comments View`，或在 `.md` 檔案上按一下右鍵），反白標示渲染後的文字，點擊浮動的 **Comment** 按鈕，輸入您的筆記，然後提交。討論串會作為內聯標記註解寫入 `.md` 檔案本身中 — 所有內容都隨文件移動。

任何選取範圍都有效 — 即使是單一個詞。只有空字串或純空白的選取範圍才會被忽略。

### 批次發送給 Claude (Sending the batch to Claude)

當您留下一個或多個未解決的註解後，點擊註解側邊欄頂部的 **Send N to Claude**（計數會即時更新）。如果沒有未解決的項目，該按鈕將會停用。

### 審閱回覆 (Reviewing replies)

Claude 會處理每個註解、就地編輯文件，並附加一個說明其變更內容的回覆。該回覆會作為討論串回覆出現在 VS Code 中。滿意時，請將討論串切換為 **Resolved（已解決）**；如果不滿意，請提出更多問題回覆。

### 要求 Claude 審閱 (Claude 發起的討論串)

上述流程是人類對 Claude：您留下註解，Claude 處理它們。v0.29 增加了反向功能 — **Markdown Collab: Ask Claude to Review This Doc**（在 `.md` 檔案上按一下右鍵或從命令選擇區執行）。

擴充套件會提示輸入一個可選的**關注指令 (focus directive)** — 告訴 Claude 要尋找什麼的自由形式句子，例如 *「檢查 API 範例的正確性」* 或 *「找出過於行銷化的語氣。」* 留白則進行一般審閱。您最近使用過的五個關注指令會在快速選擇 (quick-pick) 中提供，這樣您就不必重複輸入常用的指令。

Claude 讀取文件，並為其發現的每個實質性問題開啟一個內聯註解討論串。**討論串數量沒有上限** — 如果有 30 個地方需要討論串，Claude 就會留下 30 個。當存在 Claude 發起的討論串時，側邊欄會增加兩個操作介面：

- 摘要列：*「N new from Claude · M reviewed」*，帶有 **Next** 按鈕，可跳轉到下一個未讀的 Claude 討論串。
- **Collapse all（全部摺疊）/ Expand all（全部展開）** 切換按鈕，可摺疊每個未讀的 Claude 卡片，以便於瀏覽大量的審閱內容。

一旦您回覆或解決了一個討論串，它就被視為「已審閱」；指示器會自動清除。此偵測機制使用現有的內聯討論串 JSON — 不需要變更 schema，也不需要遷移。

大於 50 KB 的檔案在發送前會進行軟確認（Claude 的審閱在大型文件上可能會消耗大量上下文）。在審閱模式下，技能永遠不會編輯散文內容 — 每個問題都會被放入討論串中供您把關。如果 Claude 讀取文件並未發現符合關注指令的內容，預期會透過發送通道收到 *「Reviewed `<path>` — no concerns found」* 的訊息。

### 在文件編輯後存活的註解 (Comments that survive doc edits)

註解錨定在文字選取範圍上，而不是行號。當 Claude 重寫帶有註解的段落時，技能會指示它更新錨定文字以使其相符 — 因此註解在修改後依然可以存活。

如果重寫完全移除了錨定的段落，討論串的標記也會跟著消失，並且該討論串在 Inline Comments 檢視中會顯示為**未錨定 (unanchored)** — 您可以在渲染檢視中選取新的文字並再次留下筆記，來重新錨定它。

### 即時編輯器 (WYSIWYG + AI 共同編輯)

喜歡直接編輯渲染後的 Markdown？在 `.md` 檔案上按一下右鍵 → **Markdown Collab: Open Live Editor**（或 **Reopen with → Markdown Collab (live editor)**）。這是一個具有所見即所得 (WYSIWYG) 功能的編輯器，旁邊附有相同的註解面板。

它是為**同一個機器上的一個人類 + Claude** 所建立的 — 不是多使用者的網路同步：

- 您在編輯器中編輯；您的變更會自動儲存到磁碟上的 `.md` 檔案。
- Claude 使用其一般工具編輯同一個 `.md` 檔案；這些變更會即時回傳到編輯器中（此時會短暫出現 *「Updated from disk」* 的提示）。
- 保護機制可防止您與 Claude 在正常的回合制流程中覆寫彼此的內容。

註解面板與內聯檢視相同：摺疊討論串、常駐的回覆框、解決問題、刪除單一註解或整個討論串，以及**將單一討論串（或整個檔案）發送給 Claude**。

## 審閱 Pull Requests / Merge Requests

執行 **Markdown Collab: Review PR / MR**，透過 GitHub Pull Request 或 GitLab Merge Request 審閱變更的 Markdown 檔案。它使用您現有的 `gh` (GitHub) 或 `glab` (GitLab) CLI 認證 — 不需要設定額外的 token。

- 選擇 PR/MR；其變更的 `.md` 檔案會出現在檔案總管的 **PR Review** 樹狀檢視中。
- 開啟一個檔案，查看帶有內聯審閱註解的渲染檢視。
- 新增註解、**回覆**現有的討論串，並在發布前編輯或刪除您的草稿。
- 點擊註解的行號，可直接跳轉至審閱中的該行。
- 將您的註解發布回 PR/MR，或像處理任何其他討論串一樣將它們交給 Claude。

**需要** 安裝並登入 `gh` 或 `glab` CLI。

## 選擇發送模式 (Choosing a send mode)

**Send to Claude** 按鈕以四種方式之一傳遞註解有效載荷 (payload)。透過 `markdownCollab.sendMode` 選擇一次後，系統就不會再詢問。

> **懶人包 (TL;DR)：** 如果您的環境中沒有 MCP 且您的 Claude Code 執行環境沒有提供串流輸出工具（`Monitor` 或 `BashOutput`），**請使用 `terminal`**。它在任何地方都有效，而且零設定。

| 您的情況 | 建議模式 | 為什麼 |
|---|---|---|
| 只是想試試看，或不確定 | `terminal` | 零設定。將提示語使用 bracketed-paste 貼到 VS Code 終端機中正在執行的 `claude` REPL 內。 |
| 公司 / 組織停用了 MCP | **`terminal`** | 基於通道 (Channel) 的模式需要 MCP；終端機模式不需要。 |
| 執行環境缺少 `Monitor` / `BashOutput` | **`terminal`** | 通道模式的反應性取決於串流通知；如果沒有它們，您將需要輪詢，而終端機模式完全避開了這個問題。 |
| 執行環境有 `Monitor` / `BashOutput`，且允許使用 MCP | `channel` | 檔案觀察者模式 (File-watcher pattern)；支援長時間執行的觀察迴圈，無需每次點擊時重新設定。 |
| Claude Code v2.1.80+、使用 `claude.ai` 登入、且您的組織啟用了通道功能 | `mcp-channel` | 在 Claude 的下一回合產生原生的 `<channel>` 事件 — 在支援時提供最乾淨的語意。 |
| 每次都想手動複製/貼上 | `clipboard` | 最簡單的備用方案；完全不自動。 |

不知道該選哪一個？將 `markdownCollab.sendMode` 保持在 `ask`（預設值）。第一次點擊時會顯示快速選擇，並記住您的選擇。**Markdown Collab: Reset Send Mode** 可以在您稍後想切換時清除設定。

## 發送模式詳情

### `terminal` — 建議的預設選項

將提示語使用 bracketed-paste 貼到任何 VS Code 終端機中正在執行的 `claude` REPL 內。

- **偵測階層：** 擴充套件生成的終端機 → shell 整合證明有 `claude` 存在 → 名稱符合 `/claude/i` → 使用中的終端機（帶有確認提示）。
- **找不到偵測到的終端機？** 快速選擇清單會提議生成一個新的（`claude` 會在其中自動啟動）或退回到剪貼簿模式。
- **不需要 MCP、不需要串流工具、沒有協定限制** — 只是一個貼上 (`paste`) 到您的 REPL 的按鍵動作。

**設定：** 無。點擊時，只要在任何整合終端機中執行著 `claude` 即可。

### `channel` — 事件日誌 + tailer

每次點擊都會將一行 JSON 附加到 `<workspace>/.markdown-collab/.events.jsonl` 中。Claude 在背景 bash 中執行內建的 `mdc-tail.mjs`，並透過 `Monitor`（或您執行環境的同等串流輸出工具）進行訂閱；每次點擊都會顯示為模型通知。

- **自動確認 (Auto-ack)：** 當事件中的每個註解都已被處理（最後的回覆是 `ai`，或者註解被解決/刪除）時，擴充套件會將事件 ID 附加到 `.events.acked.jsonl`。Tailer 會在 `--from-start` 重播時抑制已確認的事件。
- **逐行刷新 (Per-line flush)：** Tailer 使用 `fs.writeSync(1, …)` 來繞過 Node 在 POSIX 管道上的 stdout 緩衝 — 每行附加的 JSON 都會立即浮現，絕不批次處理。

**設定：** 執行一次 **Markdown Collab: Install Claude Skill**。然後要求 Claude 啟動觀察迴圈：

> 在背景執行 `node ~/.claude/skills/vs-markdown-collab/mdc-tail.mjs --workspace <abs-path>`，然後使用 Monitor 工具訂閱返回的程序 ID。

**如果您的執行環境只有 `TaskOutput`（沒有串流基礎工具），此模式將無法運作。**在這種情況下，請使用 `terminal`。

### `mcp-channel` — 原生通道事件

將有效載荷推送到內建的 MCP 伺服器 (`mdc-channel.mjs`)，該伺服器會發出 `notifications/claude/channel`。Claude 在它的下一回合會收到這個作為原生 `<channel source="markdown-collab" file="…" id="evt_…">` 標籤的事件。

**需求：**
- Claude Code v2.1.80+
- 使用 `claude.ai` 登入（非 API key / Console / Bedrock）
- 您的組織已啟用通道功能 (`channelsEnabled`)
- 下方的 `.mcp.json` 一次性設定

**設定：**
1. 執行 **Markdown Collab: Install Claude Skill**。
2. 在 `~/.claude.json`（使用者層級）或 `<workspace>/.mcp.json` 中註冊伺服器：
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
3. 使用 research-preview 旗標啟動 Claude：
   ```bash
   claude --dangerously-load-development-channels server:markdown-collab
   ```
4. 將 `markdownCollab.sendMode` 設定為 `mcp-channel`。

如果您看到 `--channels ignored (server:markdown-collab) — Channels are not currently available`，表示您的環境未通過上述的某個限制。**請切換到 `terminal`** — 它不依賴任何這些條件。

### `clipboard` — 手動貼上

將提示語複製到剪貼簿。您可以用任何喜歡的方式貼到 Claude。

## 指令 (Commands)

| 指令 | 目的 |
|---|---|
| `Markdown Collab: Install Claude Skill` | 寫入 `~/.claude/skills/vs-markdown-collab/SKILL.md` 和內建的輔助工具（`mdc-tail.mjs`、`mdc-channel.mjs`）。 |
| `Markdown Collab: Initialize AGENTS.md` | 在 `<workspace>/AGENTS.md` 中附加一個慣例區塊（給非 Claude Code 的代理人）。 |
| `Markdown Collab: Open Inline Comments View` | 開啟具有內聯討論串側邊欄的渲染檢視。註解會儲存在 `.md` 檔案內部。這是 `.md` 檔案上的右鍵動作。 |
| `Markdown Collab: Open Live Editor` | 開啟具有註解面板的 WYSIWYG 即時編輯器 — 您和 Claude 共同編輯同一個 `.md` 檔案（單一人類 + Claude，無需中繼）。 |
| `Markdown Collab: Review PR / MR` | 透過 `gh` / `glab` CLI 審閱 GitHub PR 或 GitLab MR 中變更的 Markdown 檔案。 |
| `Markdown Collab: Ask Claude to Review This Doc` | 要求 Claude 擔任審閱者 (v0.29+)。提示輸入可選的關注指令，然後透過設定的發送模式發送「審閱模式有效載荷」(Review Mode payload)。Claude 會為每個問題開啟一個討論串；您在側邊欄進行分類處理。 |
| `Markdown Collab: Send Unresolved Comments to Claude` | 與 **Send to Claude** 按鈕相同 — 可從命令選擇區使用。 |
| `Markdown Collab: Start Claude Review Terminal` | 生成一個全新的整合終端機並啟動 `claude`。 |
| `Markdown Collab: Copy Claude Prompt` | 將一小段「處理此檔案上的註解」提示語複製到剪貼簿。 |
| `Markdown Collab: Reset Send Mode` | 清除目前工作區所記憶的 `ask` 選擇。 |

## 設定 (Settings)

| 設定 | 預設值 | 目的 |
|---|---|---|
| `markdownCollab.sendMode` | `ask` | `ask`、`terminal`、`channel`、`mcp-channel`、`clipboard` 之一。請參見 [選擇發送模式 (Choosing a send mode)](#choosing-a-send-mode)。 |

## 儲存佈局 (Storage layout)

**內聯檢視（預設）。** 討論串存在於 `.md` 檔案本身內部。錨定的段落會被成對的 HTML 註解包裝，而討論串則被序列化為 `<!--mc:t {JSON}-->` 行，位於檔案末尾被柵欄標示出的區域中：

```markdown
The <!--mc:a:k7q3p-->quick brown fox<!--mc:/a:k7q3p--> jumps…

<!--mc:threads:begin-->
<!--mc:t {"id":"k7q3p","quote":"quick brown fox","status":"open","comments":[{"id":"c1","author":"ronica","ts":"2026-05-13T12:00:00Z","body":"too cliched"}]}-->
<!--mc:threads:end-->
```

這些標記在任何渲染的預覽中都是不可見的（它們是 HTML 註解）。直接提交 `.md` 檔案即可 — 審閱狀態會與文件一起發布。

Markdown Collab 在 `.markdown-collab/` 目錄下寫入的唯一檔案是通道發送模式的執行階段狀態。將它們加入到 `.gitignore` 中：

```
<workspace>/
└── .markdown-collab/
    ├── .events.jsonl         ← channel 模式事件日誌 (gitignore)
    ├── .events.acked.jsonl   ← 已處理的事件 ID (gitignore)
    └── .channel.json         ← mcp-channel 端點描述檔 (gitignore)
```

```gitignore
.markdown-collab/
```

## 疑難排解 (Troubleshooting)

**點擊沒反應，沒有提示訊息。** 您的 `markdownCollab.sendMode` 被設定為一個過時的值（例如，來自 0.11 之前的 `ipc`）。v0.12.1+ 會退回 `ask` 並發出警告；如果您使用的是較舊的版本，請將設定變更為 `terminal`。

**Channel 模式：tailer 已啟動，但行資料沒有到達 Claude。**
- 請確認您的版本是 v0.13.1+（使用 `fs.writeSync` 逐行刷新）。
- 確認 Claude 確實透過 `Monitor` / `BashOutput` 進行了訂閱。`TaskOutput block=true` 會等待完成並且會永遠掛起 — 這是錯誤的工具。
- 如果您的執行環境只有 `TaskOutput`，請切換至 `terminal` 模式。Channel 模式需要串流基礎工具。

**`mcp-channel`：「Channels are not currently available.」** 可能原因之一：Claude Code 版本小於 v2.1.80、使用 API Key / Bedrock / Vertex 登入（非 `claude.ai`），或您的組織設定了 `channelsEnabled: false`。請透過 `claude /status` 和 `claude --version` 來進行診斷。如果都不行，請使用 `terminal`。

**討論串顯示為未錨定 (unanchored)。** 錨定的段落已被刪除或重寫到無法辨識，因此其標記已經消失。請在 Inline Comments 檢視中選取新的文字並再次留下筆記，來重新錨定它。

## 開發 (Development)

```bash
npm install
npm run compile
npm test
```

單元測試在 Vitest 下執行。純輔助工具的測試中，VS Code API 介面在 `src/test/vscode-stub.ts` 內被 stub（替換成假的實作）。

在 VS Code 中按 **F5** 啟動「延伸模組開發主機」(Extension Development Host) 以進行手動驗證。

產生 `.vsix` 供發布：
```bash
npx @vscode/vsce package
```

發布：在 `package.json` 中提升版本號，在 `CHANGELOG.md` 中前置一段 `## X.Y.Z — <date>` 的區塊，提交，然後標記 `vX.Y.Z` 並推送標籤。發布工作流程會檢查 CHANGELOG 項目的存在，並自動將該段落拉取到 GitHub Release notes 中。

## 不在規劃範圍內 (v1)

- 即時**多使用者**（多個人類）協作。Live editor 是單一人類 + Claude；這裡的「collab (協作)」指的是人類 ↔ AI，而不是多個人同時編輯。
