# mcp-chrome-bridge 程式碼安全分析報告

**審查目標**：分析 `mcp-chrome-bridge` 的核心架構，盤點主要功能，並著重審查是否有資料外洩（Data Exfiltration）或接收第三方未授權指令（Command Injection/RCE）的風險。

## 1. 核心模組與功能說明

經檢視 `dist/` 目錄下的編譯後程式碼，此橋接器主要由以下幾個核心模組構成：

### `cli.js` (命令列工具介面)
- **功能**：提供使用者安裝、註冊 Native Messaging Host、執行環境診斷 (`doctor`) 的進入點。
- **分析**：主要執行 `mcp-chrome-bridge register` 等指令，並將 Node.js 的執行路徑寫入設定檔中，本身不負責常駐的通訊邏輯。

### `native-messaging-host.js` (Chrome 原生訊息通訊宿主)
- **功能**：負責透過標準輸入/輸出 (`stdin`/`stdout`) 與 Chrome Extension 進行基於 Native Messaging 協定的通訊。
- **分析**：當 Chrome Extension 啟動時，會透過作業系統喚醒此模組。它接收來自 Chrome 的 JSON 訊息（包含指令如 `START`, `STOP`, `file_operation`），並回傳處理結果。

### `server/index.js` (本地 Fastify HTTP 伺服器)
- **功能**：負責啟動一個本地端（預設監聽 `127.0.0.1:12306`）的 HTTP API 伺服器。提供 `/mcp` (供 Cursor/Claude Code 連線) 與 `/ask-extension` (將請求轉發給 Chrome) 的 API 接口。
- **分析**：這是代理連線的核心，使用 SSE (Server-Sent Events) 與 HTTP POST 實現 MCP (Model Context Protocol) 規範。

### `mcp-server-stdio.js` (MCP Stdio 伺服器)
- **功能**：實作了透過標準輸入輸出 (`stdio`) 運作的 MCP 伺服器介面。
- **分析**：它會讀取本地設定，並作為 Cursor/Claude Code 等 IDE 工具與 HTTP 伺服器之間的轉接層。

### `file-handler.js` (檔案處理模組)
- **功能**：處理來自 Chrome Extension 的檔案操作請求，例如將 Extension 截取的網頁資料、Trace 檔案寫入暫存目錄（`os.tmpdir()` 底下）。
- **分析**：負責處理檔案下載、Base64 寫入與讀取。

---

## 2. 安全性與隱私風險審查

針對您最關心的「後門、資料外流、第三方命令執行」問題，經過原始碼靜態分析後，結論如下：

### 🟢 1. 是否有資料外洩到第三方的行為？ (Data Exfiltration)
**結論：未發現惡意向外部傳送資料的後門。**
- **對外連線**：檢視網路請求（如 `node-fetch` 的使用），僅在 `file-handler.js` 中的 `downloadFile` 函式有使用到。該函式是用來下載 Chrome Extension 明確要求處理的檔案（`fileUrl`），並沒有將使用者的對話或本地資料偷偷 POST 到未知的遠端伺服器。
- **監聽範圍**：本地 Fastify 伺服器被寫死監聽在 `127.0.0.1`（`constant/index.js` 中的 `SERVER_CONFIG.HOST`），這代表外部網路（甚至同一個區網的其他電腦）預設無法直接連線到此服務。

### 🟡 2. 是否會接收第三方指令？ (未授權命令執行風險)
**結論：無直接的 RCE 後門，但在本地環境下存在「信任同機其他應用」的潛在風險。**
- **CORS 設定**：伺服器的 CORS（跨來源資源共用）設定允許 `http://127.0.0.1` 以及所有 `chrome-extension://` 開頭的來源（`constant/index.js`）。這意味著如果您電腦上安裝了*其他惡意的 Chrome 擴充功能*，它們理論上也能發送請求給這個本地伺服器。
- **任意檔案讀取風險 (Path Traversal)**：在 `file-handler.js` 中的 `readBase64File(filePath)` 功能，程式碼直接使用 `fs.readFileSync(filePath)`，並未對路徑進行強制限制（沙盒隔離）。若 Chrome Extension 端被攻破，或是有惡意指令傳入，它有能力讀取本機的任何檔案並回傳。不過，刪除檔案的功能 (`cleanupFile`) 有防護機制，僅允許刪除其專屬的暫存目錄 (`tempDir`) 內的檔案，無法刪除您的系統檔案。

### 🟢 3. 程式碼混淆與惡意依賴
**結論：無惡意混淆。**
- 所有的編譯後檔案 (`.js` 與 `.js.map`) 都是標準的 TypeScript 轉譯結果，並沒有使用像是 Webpack 惡意壓縮或字串混淆（Obfuscation）來隱藏邏輯。
- 依賴套件（如 `fastify`, `commander`, `node-fetch`, `better-sqlite3`）皆為主流知名開源套件，目前並未發現含有可疑後門的拼字錯誤包 (Typosquatting)。

---

## 3. 總結與建議

這份 `mcp-chrome-bridge` 程式碼在架構設計上是**正當的工具軟體**，它的複雜度來自於需要同時處理 Native Messaging (與 Chrome 溝通)、HTTP SSE (與 MCP Client 溝通) 以及 Node.js 本地檔案系統。**目前並沒有發現刻意植入的後門或竊取隱私的行為**。

**安全建議：**
1. **僅安裝可信的 Chrome 擴充功能**：因為此伺服器對所有 `chrome-extension://` 放行，請確保您瀏覽器內沒有安裝來路不明的擴充功能，以免遭到利用。
2. **本機使用為限**：這套工具不應暴露於公網，目前預設綁定 `127.0.0.1` 已是正確的安全作法，請勿嘗試手動修改使其監聽 `0.0.0.0`。
