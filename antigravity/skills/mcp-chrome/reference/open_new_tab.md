# 開啟新分頁的流程
當使用者或 Agent 需要在現有的 Chrome 瀏覽器視窗中開啟新分頁並導向特定 URL 時，可以依循以下流程執行：

1. **執行開啟新分頁腳本**
   - 執行 [open_new_tab.js](file:///c:/Users/9910008/.gemini/antigravity/skills/mcp-chrome/scripts/open_new_tab.js) 腳本。該腳本會先查詢活動視窗的 `windowId`，然後呼叫 `chrome_navigate` 工具，傳入目標 URL 與 `windowId`（不指定 `tabId`），即會在現有視窗中建立新分頁。可於後面帶入 URL 參數（選填，預設為 Google 首頁）。
   - 指令範例：
     ```powershell
     # for windows 11
     node C:\Users\9910008\.gemini\antigravity\skills\mcp-chrome\scripts\open_new_tab.js "https://www.google.com"
     ```
2. **解析與呈現結果**
   - 腳本執行成功後會輸出如下的 JSON 回應，代表分頁已在現有視窗中順利建立：
     ```json
     {
       "content": [
         {
           "type": "text",
           "text": "{\"success\":true,\"message\":\"Opened URL in new tab in existing window\",\"tabId\":717691109,\"windowId\":717690780,\"url\":\"\"}"
         }
       ],
       "isError": false
     }
     ```
