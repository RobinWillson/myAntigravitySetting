# 我在使用 Antigravity IDE 時, 常常會看到 AI 去找 function 的說明, 當它搜尋一整個很大的資料夾時, 有時候會造成檔案總管整個當機, 電腦必須長按電源鍵強制關機再啟動; 是否應該讓AI在有 "search" 動作時, 呼叫一個 sub Agent

這確實是一個非常痛、也很讓人崩潰的體驗（寫程式寫到一半要拔電源線真的會讓人心臟漏一拍）。

你直覺非常敏銳，**「讓 AI 在需要搜尋時呼叫一個專職的 sub-Agent（子代理）」確實是一個非常標準且優雅的架構解法。**

在 AI 代理架構（Agentic Workflow）中，這種設計被稱為 **路由與工具分工（Routing and Tool Utilization）** 或 **主從架構（Manager-Worker Architecture）**。

以下為你分析為什麼這個方法可行，以及它如何解決你目前遇到的當機地獄：

---

### 為什麼現在會造成「檔案總管當機」？

當你讓一個通用的主 AI 直接去掃描整個超大資料夾時，通常會發生以下幾件事：

1. **I/O 阻塞（I/O Blocking）：** AI 可能使用了最暴力的遞迴掃描，把成千上萬個檔案同時讀進記憶體，導致作業系統（特別是 Windows Explorer 檔案總管）的 I/O 被完全佔滿。
2. **記憶體溢位（OOM）：** 大型專案的 AST（抽象語法樹）或文字量極大，主 AI 試圖一次性消化，直接把 IDE 或系統記憶體吃光。
3. **缺乏防禦性程式碼：** 通用 AI 不知道什麼該讀、什麼不該讀（例如它可能連 `node_modules`、`.git` 或者是好幾 GB 的 build 暫存檔都一起掃進去了）。

---

### 引進 Sub-Agent（搜尋專門戶）的四大優勢

如果我們把搜尋工作外包給一個專門的 Sub-Agent，並賦予它正確的工具，狀況會完全不同：

| 改善面向       | 傳統主 AI 直接搜尋               | 引入 Sub-Agent 架構                                               |
| -------------- | -------------------------------- | ----------------------------------------------------------------- |
| **工作界線**   | 邊思考邊撈資料，容易失控。       | **單一職責原則**（Single Responsibility），只負責「精準檢索」。   |
| **搜尋效率**   | 暴力掃描文字（Greedy Scan）。    | 使用高效工具（如內嵌向量資料庫、`ripgrep` 或 `git grep`）。       |
| **系統安全性** | 容易引發死鎖（Deadlock）或 OOM。 | 即使搜尋超時或崩潰，也只會死在子程序，**主 IDE 與系統不會當機**。 |
| **過濾機制**   | 照單全收。                       | 會自動遵循 `.gitignore`，自動跳過二進位大型檔案。                 |

---

### 理想的 Sub-Agent 工作流程（Workflow）

當你想找某個 function 的說明時，架構應該長這樣：

```
[使用者提問] 
   │
   ▼
[主 Agent (Manager)] ── 發現需要深度搜尋 ──> [呼叫 Search Sub-Agent (Worker)]
                                                       │
                                                       ├─ 1. 先用 AST 尋找定義定位
                                                       ├─ 2. 使用 ripgrep 進行關鍵字高速過濾
                                                       └─ 3. 限制回傳最大 Token 數 (例如只拿前50行)
                                                       │
                                   [精簡後的 context] ◄─┘
   │
   ▼
[主 Agent 整合回答] -> [呈現給使用者]

```

### 你可以如何優化與調整？

既然你使用的是 Antigravity IDE（或是類似支援自訂 Agent 提示詞/工具的環境），你可以嘗試以下方向：

1. **限縮 search 的工具權限：** 檢查 IDE 設定，不要讓 AI 擁有「直接讀取硬碟所有檔案」的權限，而是綁定高效的搜尋 CLI 工具（例如 `rg`）。
2. **在 System Prompt 加上限制（防禦性提示）：**
在 AI 的設定或自訂指令中加上：
> "When searching for functions, ALWAYS use specific index tools. DO NOT scan directories recursively if the directory size exceeds 100MB or contains node_modules."


3. **手動建立索引（Index）：** 確保你的專案有被 IDE 的 Vector Index（向量索引）完整掃描過。通常當機是因為 AI **「現場即時硬幹搜尋」**，而不是去讀取已經建好的索引。

**總結來說：** 你的想法完全正確。把粗重、危險的 I/O 工作交給一個受限制的 Sub-Agent（甚至它只是個單純的 Python 指令碼工具），才是保護你電腦電源鍵的長久之計。


# 我知道 user\.gemini\GEMINI.md 是 Antigravity IDE 的全域設定檔,我想要在全域呼叫一個 sub-agent, 並把搜尋的限制寫在 sub-agent 底下, 應該如何作呢?

### 解決方案：利用 Antigravity 全域被動技能（Global Skills）建立搜尋 Sub-Agent

在 Antigravity 系統中，**「全域 Sub-Agent」的最佳實作方式就是建立一個「全域被動技能（Global Skill）」**。

主 Agent 在偵測到搜尋意圖時，會自動加載這個技能的 Prompt。我們可以藉由在全域技能中定義限制，並在全域規則檔 [GEMINI.md](file:///c:/Users/9910008/.gemini/GEMINI.md) 中強制主 Agent 將搜尋工作委派給它。

以下是具體的實作步驟與設定檔範例：

---

### 步驟 1：建立全域 Sub-Agent 資料夾與 `SKILL.md`

在 Windows 系統中，於你的家目錄下建立以下路徑的資料夾：
`C:\Users\9910008\.gemini\antigravity\skills\safe-searcher\`

並在該資料夾下建立 `SKILL.md` 檔案，其完整內容如下：

```yaml
---
name: safe-searcher
description: "當主 Agent 需要搜尋專案中的 function、類別、檔案或進行關鍵字搜尋（grep/ripgrep）時，自動觸發此子代理技能，以防禦性、高效能的方式安全地檢索程式碼。"
---

# Safe Searcher (安全搜尋子代理)

你是專職於程式碼檢索的子代理（Sub-Agent）。為了避免造成主 IDE 與作業系統 I/O 阻塞當機，你必須嚴格遵守以下搜尋防禦機制：

## 🛡️ 搜尋防禦規則 (Mandatory Search Rules)

1. **嚴禁遞迴暴力掃描**：
   - 絕對不要使用全目錄遞迴讀取或逐檔遍歷（如 `cat` 所有檔案）。
   - 優先使用系統已安裝的高效搜尋工具如 `ripgrep` (`rg`) 或 `git grep`。
2. **強制排除無關與大型目錄**：
   - 搜尋時必須明確加上排除參數，跳過 `node_modules`、`.git`、`dist`、`build`、`venv`、`.venv`、`target`、`.antigravity-ide`、`.gemini` 等暫存或依賴資料夾。
3. **專案大小限制**：
   - 在搜尋前，若發現專案目錄大於 100MB 且無內建索引，必須改用精確關鍵字，或是要求使用者提供具體的檔案路徑。
4. **輸出與 Token 限制**：
   - 搜尋結果僅回傳最相關的前 10~20 筆匹配項，且每筆匹配僅回傳其上下文的前後 5 行。
   - 嚴禁一次將整個檔案的原始碼全部撈回。
```

---

### 步驟 2：在全域規則 `GEMINI.md` 設定強制作業規範

為了讓主 Agent 在進行任何搜尋動作前，都先「意識到」並「遵守」這個子代理的限制，我們必須修改全域規則檔 [GEMINI.md](file:///c:/Users/9910008/.gemini/GEMINI.md)。

請在 [GEMINI.md](file:///c:/Users/9910008/.gemini/GEMINI.md) 的最後加入以下段落：

```markdown
---
## 🔍 全域搜尋與安全檢索限制 (Delegated Search Policy)
- 當使用者要求尋找程式碼、function 說明或搜尋整個資料夾時，你**必須**以 `safe-searcher` 子代理的身份進行。
- 嚴禁使用暴力遞迴讀取檔案。你必須自動在搜尋指令中排除 `node_modules/`、`dist/`、`.git/` 等無關目錄。
- 搜尋時請使用精確的 `ripgrep` 或是 `grep_search` 工具，並將回傳的結果行數限制在最小範圍內。
```

---

### 步驟 3：在 Chat 視窗重新載入技能

完成上述檔案的建立與修改後，在 Antigravity 的 Chat 視窗中輸入以下斜線指令以重新載入設定：
```text
/skills reload
```
載入成功後，主 Agent 將會成功加載 `safe-searcher` 技能，並在後續的搜尋工作中遵循這套安全檢索流程。

---

## 方案二：透過 MCP 伺服器實現進程隔離（硬體防禦方案）

如果上述的被動技能 (Skill) 提示詞限制依然無法阻止 Agent 的不安全搜尋，或是搜尋工具在極端專案下仍會跑滿 CPU 卡死系統，那麼最徹底的解決方法是**建立一個獨立的 MCP (Model Context Protocol) 伺服器**。

### 為什麼這能徹底解決當機問題？
*   **進程隔離 (Process Isolation)**：MCP 伺服器是以一個獨立的 OS 子進程（例如 `node` 或 `python` 行程）在背景運作。即便該進程在掃描大資料夾時陷入無限迴圈或 CPU 100%，主 IDE 也只會因為逾時 (Timeout) 而回報錯誤，**絕對不會卡死 IDE 與作業系統**。
*   **可控的 Tool 暴露**：你可以只在 MCP 中提供一個安全的 `safe_grep` 工具，並在程式碼中寫死排除規則，主 Agent 除了調用此工具外，完全無法以其他方式接觸硬碟。

### 實作步驟：

#### 步驟 1：建立輕量級 MCP 搜尋伺服器
您可以建立一個專門包裝 `ripgrep` 或是特定安全搜尋演算法的 MCP 伺服器。
例如，在 `C:\Users\9910008\.gemini\antigravity\mcp\safe-search-server\` 目錄中建置一個簡單的 `index.js`（Node.js），其內建搜尋排除名單：
```javascript
// 偽程式碼：安全搜尋 Tool 的核心邏輯
function safeSearch(query, path) {
  // 1. 強制過濾並排除 node_modules, .git 等
  const excludes = ['node_modules', '.git', 'dist', 'build', '.gemini'];
  // 2. 呼叫本地的 ripgrep (rg.exe) 進行高速搜尋，限制最多只回傳 20 筆結果
  // 3. 超過 10 秒自動超時終止進程
}
```

#### 步驟 2：在全域 MCP 設定檔註冊此伺服器
修改全域 MCP 設定檔 [mcp_config.json](file:///c:/Users/9910008/.gemini/config/mcp_config.json)，在 `mcpServers` 區塊中加入自訂的安全搜尋伺服器：

```json
{
  "mcpServers": {
    "safe-searcher-mcp": {
      "command": "node",
      "args": [
        "C:/Users/9910008/.gemini/antigravity/mcp/safe-search-server/index.js"
      ],
      "env": {}
    }
  }
}
```

#### 步驟 3：在全域規則 [GEMINI.md](file:///c:/Users/9910008/.gemini/GEMINI.md) 限縮工具調用
在 [GEMINI.md](file:///c:/Users/9910008/.gemini/GEMINI.md) 中限制主 Agent **只能使用註冊好的 MCP 工具進行程式碼檢索**，禁用一切未經隔離的直接檔案讀寫命令：

```markdown
## 🛡️ 搜尋工具限制規範
- 當需要跨檔案搜尋與定位 function 時，**禁止**自行執行 `grep` 或讀取整棵目錄樹。
- 你**必須**調用 MCP 伺服器提供的 `safe-searcher-mcp` 旗下工具來完成檢索。
```

透過這種方式，您就為您的作業系統建立了第二道物理性的防火牆，任何因搜尋造成的崩潰都會被限制在該 MCP 的獨立進程中。
