# 開啟新視窗的流程
當使用者或 Agent 需要在 Chrome 瀏覽器中開啟新視窗並導向特定 URL 時，可以依循以下流程執行：

1. **執行開啟新視窗腳本**
   - 執行 [open_new_window.js](file:///c:/Users/9910008/.gemini/antigravity/skills/mcp-chrome/scripts/open_new_window.js) 腳本。該腳本會呼叫 `chrome_navigate` 工具，傳入目標 URL，並啟用 `newWindow: true` 參數。可於後面帶入 URL 參數（選填，預設為 Google 首頁）。
   - 指令範例：
     ```powershell
     # for windows 11
     node C:\Users\9910008\.gemini\antigravity\skills\mcp-chrome\scripts\open_new_window.js "https://www.google.com"
     ```
2. **解析與呈現結果**
   - 腳本執行成功後會輸出如下的 JSON 回應，代表視窗與分頁已順利建立：
     ```json
     {
       "content": [
         {
           "type": "text",
           "text": "{\"success\":true,\"message\":\"Opened URL in new window\",\"windowId\":717691098,\"tabs\":[{\"tabId\":717691099,\"url\":\"\"}]}"
         }
       ],
       "isError": false
     }
     ```
