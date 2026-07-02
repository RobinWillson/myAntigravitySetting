# Chrome MCP Server 官方說明文件（翻譯自 hangwin/mcp-chrome）

> [!NOTE]
> 該專案仍處於早期階段，正在進行密集的開發。後續將推出更多功能、穩定性改進和其他增強功能。

---

## 🎯 什麼是 Chrome MCP Server？

Chrome MCP Server 是一個基於 Chrome 擴充功能（extension-based）的 **Model Context Protocol (MCP) 伺服器**，它向 AI 助手（如 Claude）開放您的 Chrome 瀏覽器功能，從而在使用者現有的 Chrome 環境中直接實現複雜的瀏覽器自動化、內容分析和語義搜尋。

與傳統的瀏覽器自動化工具（如 Playwright）不同，**Chrome MCP Server** 直接使用您日常使用的 Chrome 瀏覽器，利用現有的使用者習慣、配置和登入狀態，允許各種大模型或聊天機器人控制您的瀏覽器，並真正成為您的日常助手。

本地 IDE (如 Cursor) ➡️ 透過 stdio ➡️ 本地橋接程式 (Bridge) ➡️ 透過 WebSocket ➡️ Chrome 擴充功能 (Extension)

---

## ✨ 核心功能

* ⭐️ **使用您原本的瀏覽器（Use Your Original Browser）**：與您現有的瀏覽器環境（您的配置、登入狀態等）無縫整合。
* 💻 **完全本地（Fully Local）**：純本地 MCP 伺服器，確保使用者隱私。
* 🚄 **可串流 HTTP（Streamable HTTP）**：支援可串流 HTTP 連線方法。
* 🏎 **跨分頁（Cross-Tab）**：支援跨分頁上下文。
* 🧠 **語義搜尋（Semantic Search）**：內建向量資料庫，用於智慧搜尋瀏覽器分頁內容。
* 🔍 **智慧內容分析（Smart Content Analysis）**：AI 驅動的文本提取與相似度匹配。
* 🌐 **20+ 工具**：支援螢幕截圖、網路監控、互動式操作、書籤管理、瀏覽歷史記錄，以及其他 20 多個工具。
* 🚀 **SIMD 加速 AI**：自定義 WebAssembly SIMD 優化，使向量操作速度提升 4 到 8 倍。

---

## 🆚 與類似專案的比較

* **資源使用**
  * **基於 Playwright 的 MCP 伺服器**：❌ 需要啟動獨立的瀏覽器行程、安裝 Playwright 依賴項、下載瀏覽器二進位檔等。
  * **基於 Chrome 擴充功能的 MCP 伺服器**：✅ 無需啟動獨立的瀏覽器行程，直接利用使用者已經打開的 Chrome 瀏覽器。
* **用戶工作階段重用**
  * **基於 Playwright 的 MCP 伺服器**：❌ 需要重新登入。
  * **基於 Chrome 擴充功能的 MCP 伺服器**：✅ 自動使用現有的登入狀態。
* **瀏覽器環境**
  * **基於 Playwright 的 MCP 伺服器**：❌ 乾淨的環境，缺乏使用者設定。
  * **基於 Chrome 擴充功能的 MCP 伺服器**：✅ 完整保留使用者環境。
* **API 存取**
  * **基於 Playwright 的 MCP 伺服器**：⚠️ 僅限於 Playwright API。
  * **基於 Chrome 擴充功能的 MCP 伺服器**：✅ 完全存取 Chrome 原生 API。
* **啟動速度**
  * **基於 Playwright 的 MCP 伺服器**：❌ 需要啟動瀏覽器行程。
  * **基於 Chrome 擴充功能的 MCP 伺服器**：✅ 僅需啟用擴充功能。
* **回應速度**
  * **基於 Playwright 的 MCP 伺服器**：50-200ms 跨行程通訊。
  * **基於 Chrome 擴充功能的 MCP 伺服器**：✅ 更快。

---

## 🚀 快速開始

### 系統要求
* Node.js >= 20.0.0 和 pnpm/npm
* Chrome/Chromium 瀏覽器

### 安裝步驟

1. **從 GitHub 下載最新的 Chrome 擴充功能**
   * 下載連結：[https://github.com/hangwin/mcp-chrome/releases](https://github.com/hangwin/mcp-chrome/releases)

2. **全域安裝 `mcp-chrome-bridge`**
   * **使用 npm 安裝：**
     ```bash
     npm install -g mcp-chrome-bridge
     ```
   * **使用 pnpm 安裝：**
     ```bash
     # 方法一：全域啟用指令碼（推薦）
     pnpm config set enable-pre-post-scripts true
     pnpm install -g mcp-chrome-bridge

     # 方法二：手動註冊（若 postinstall 未執行）
     pnpm install -g mcp-chrome-bridge
     mcp-chrome-bridge register
     ```
     > [!NOTE]
     > 出於安全考量，pnpm v7+ 預設停用了 postinstall 指令碼。`enable-pre-post-scripts` 設定控制是否執行 pre/post 安裝指令碼。如果自動註冊失敗，請使用上述的手動註冊指令。

3. **載入 Chrome 擴充功能**
   * 開啟 Chrome 並前往 `chrome://extensions/`
   * 啟用「開發人員模式」（Developer mode）
   * 點擊「載入未封裝項目」（Load unpacked）並選擇您下載的擴充功能資料夾
   * 點擊擴充功能圖示開啟外掛，然後點擊連接以查看 MCP 配置。

---

## 🔌 與 MCP 協定用戶端搭配使用

### 使用 Streamable HTTP 連線（👍🏻 推薦）
將以下配置新增至您的 MCP 用戶端設定檔中（以 CherryStudio 為例）：
> [!TIP]
> 推薦使用 Streamable HTTP 連線方式。

```json
{
  "mcpServers": {
    "chrome-mcp-server": {
      "type": "streamableHttp",
      "url": "http://127.0.0.1:12306/mcp"
    }
  }
}
```

### 使用 STDIO 連線（備用選項）
如果您的用戶端僅支援 stdio 連線方式，請使用以下方法：

1. 首先，檢查您剛剛安裝的 npm 套件的安裝位置：
   ```bash
   # npm 檢查方法
   npm list -g mcp-chrome-bridge
   # pnpm 檢查方法
   pnpm list -g mcp-chrome-bridge
   ```
   假設上述指令輸出的路徑為：`/Users/xxx/Library/pnpm/global/5`
   那麼您最終的路徑將是：`/Users/xxx/Library/pnpm/global/5/node_modules/mcp-chrome-bridge/dist/mcp/mcp-server-stdio.js`

2. 用您剛剛獲取的最終路徑替換下方配置中的路徑：
   ```json
   {
     "mcpServers": {
       "chrome-mcp-stdio": {
         "command": "npx",
         "args": [
           "node",
           "/Users/xxx/Library/pnpm/global/5/node_modules/mcp-chrome-bridge/dist/mcp/mcp-server-stdio.js"
         ]
       }
     }
   }
   ```

---

## 🛠️ 可用工具

完整工具清單：[Complete Tool List](docs/TOOLS.md)

* **📊 瀏覽器管理 (Browser Management) - 6 個工具**
  * `get_windows_and_tabs` - 列出所有瀏覽器視窗與分頁。
  * `chrome_navigate` - 導覽至 URL 並控制視口（viewport）。
  * `chrome_switch_tab` - 切換目前的活動分頁。
  * `chrome_close_tabs` - 關閉特定的分頁或視窗。
  * `chrome_go_back_or_forward` - 瀏覽器導覽控制（上一頁/下一頁）。
  * `chrome_inject_script` - 向網頁注入內容指令碼（content scripts）。
  * `chrome_send_command_to_inject_script` - 發送指令給注入的內容指令碼。

* **📸 螢幕截圖與視覺化 (Screenshots & Visual) - 1 個工具**
  * `chrome_screenshot` - 進階螢幕截圖，支援目標元素、整頁截圖以及自定義尺寸。

* **🌐 網路監控 (Network Monitoring) - 4 個工具**
  * `chrome_network_capture_start/stop` - 使用 webRequest API 擷取網路封包。
  * `chrome_network_debugger_start/stop` - 使用 Debugger API 獲取包含回應主體（response bodies）的網路封包。
  * `chrome_network_request` - 發送自定義 HTTP 請求。

* **🔍 內容分析 (Content Analysis) - 4 個工具**
  * `search_tabs_content` - 對瀏覽器分頁內容進行 AI 驅動的語義搜尋。
  * `chrome_get_web_content` - 從網頁中提取 HTML/文本內容。
  * `chrome_get_interactive_elements` - 尋找可點擊的互動式元素。
  * `chrome_console` - 擷取並獲取瀏覽器分頁的控制台（console）輸出。

* **🎯 互動 (Interaction) - 3 個工具**
  * `chrome_click_element` - 使用 CSS 選擇器點擊元素。
  * `chrome_fill_or_select` - 填寫表單並選擇選項。
  * `chrome_keyboard` - 模擬鍵盤輸入和快捷鍵。

* **📚 數據管理 (Data Management) - 5 個工具**
  * `chrome_history` - 使用時間篩選器搜尋瀏覽器歷史記錄。
  * `chrome_bookmark_search` - 透過關鍵字搜尋書籤。
  * `chrome_bookmark_add` - 新增書籤，支援資料夾功能。
  * `chrome_bookmark_delete` - 刪除書籤。

---

## 🧪 使用範例

### 1. AI 幫您總結網頁內容並自動控制 Excalidraw 進行繪圖
* **提示詞：** [excalidraw-prompt](excalidraw-prompt)
* **指令：** 幫我總結當前頁面內容，然後繪製一張圖表以輔助我理解。
* **影片連結：** [https://www.youtube.com/watch?v=3fBPdUBWVz0](https://www.youtube.com/watch?v=3fBPdUBWVz0)

### 2. 分析圖片內容後，LLM 自動控制 Excalidraw 複製該圖片
* **提示詞：** [excalidraw-prompt](prompt/excalidraw-prompt.md) \| [content-analize](prompt/content-analize.md)
* **指令：** 首先分析圖片的內容，然後結合分析與圖片內容複製該圖片。
* **影片連結：** [https://www.youtube.com/watch?v=tEPdHZBzbZk](https://www.youtube.com/watch?v=tEPdHZBzbZk)

### 3. AI 自動注入指令碼並修改網頁樣式
* **提示詞：** [modify-web-prompt](prompt/modify-web-prompt.md)
* **指令：** 幫我修改當前頁面的樣式並移除廣告。
* **影片連結：** [https://youtu.be/twI6apRKHsk](https://youtu.be/twI6apRKHsk)

### 4. AI 自動為您擷取網路請求
* **查詢：** 我想知道小紅書的搜尋 API 是什麼，以及它的回應結構看起來像什麼。
* **影片連結：** [https://youtu.be/1hHKr7XKqnQ](https://youtu.be/1hHKr7XKqnQ)

### 5. AI 幫助分析您的瀏覽歷史記錄
* **查詢：** 分析我過去一個月的瀏覽歷史記錄。
* **影片連結：** [https://youtu.be/jf2UZfrR2Vk](https://youtu.be/jf2UZfrR2Vk)

### 6. 網頁對話
* **查詢：** 翻譯並總結當前的網頁。
* **影片連結：** [https://youtu.be/FlJKS9UQyC8](https://youtu.be/FlJKS9UQyC8)

### 7. AI 自動為您截圖（網頁截圖）
* **查詢：** 對 Hugging Face 的首頁進行截圖。
* **影片連結：** [https://youtu.be/7ycK6iksWi4](https://youtu.be/7ycK6iksWi4)

### 8. AI 自動為您截圖（元素截圖）
* **查詢：** 擷取 Hugging Face 首頁上的圖示。
* **影片連結：** [https://youtu.be/ev8VivANIrk](https://youtu.be/ev8VivANIrk)

### 9. AI 幫助管理書籤
* **查詢：** 將當前頁面加入書籤，並放入合適的資料夾中。
* **影片連結：** [https://youtu.be/R_83arKmFTo](https://youtu.be/R_83arKmFTo)

### 10. 自動關閉網頁
* **查詢：** 關閉所有與 shadcn 相關的網頁。
* **影片連結：** [https://youtu.be/2wzUT6eNVg4](https://youtu.be/2wzUT6eNVg4)

---

## 🤝 貢獻（Contributing）

我們歡迎貢獻！請參閱 [CONTRIBUTING.md](docs/CONTRIBUTING.md) 獲取詳細的指南。

---

## 🚧 未來路線圖（Future Roadmap）

我們對 Chrome MCP Server 的未來發展有令人興奮的計劃：

- [ ] 身分驗證 (Authentication)
- [ ] 錄製與回放 (Recording and Playback)
- [ ] 工作流自動化 (Workflow Automation)
- [ ] 增強的瀏覽器支援 (Firefox 擴充功能) (Enhanced Browser Support - Firefox Extension)

想要為這些功能中的任何一項做出貢獻嗎？請查看我們的 [貢獻指南](docs/CONTRIBUTING.md) 並加入我們的開發社群！

---

## 📄 授權條款（License）

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案。

---

## 📚 更多文件（More Documentation）

* [架構設計 (Architecture Design)](docs/ARCHITECTURE.md) - 詳細的技術架構文件
* [工具 API (TOOLS API)](docs/TOOLS.md) - 完整的工具 API 文件
* [疑難排解 (Troubleshooting)](docs/TROUBLESHOOTING.md) - 常見問題的解決方案
