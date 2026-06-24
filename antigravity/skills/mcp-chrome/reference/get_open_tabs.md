# 查詢目前開啟網頁的流程
當使用者或 Agent 需要查詢目前 Chrome 瀏覽器中開啟的所有視窗與分頁（Tabs）時，可以依循以下流程執行：

1. **執行查詢腳本**
   - 執行 [get_open_tabs.js](file:///c:/Users/9910008/.gemini/antigravity/skills/mcp-chrome/scripts/get_open_tabs.js) 腳本。該腳本會透過 stdio 與 `mcp-chrome-bridge` 的 MCP 伺服器建立 JSON-RPC 連線，並發送 `get_windows_and_tabs` 請求。
   - 指令範例：
     ```powershell
     # for windows 11
     node C:\Users\9910008\.gemini\antigravity\skills\mcp-chrome\scripts\get_open_tabs.js
     ```
2. **解析與呈現結果**
   - 腳本執行完成後會輸出包含 `windowCount`、`tabCount` 與 `windows` 陣列的 JSON 結構。
   - 應將結果整理成 Markdown 表格，呈現各分頁的標題（Title）、網址（URL）及是否為當前焦點分頁（Active），以便使用者閱讀。
