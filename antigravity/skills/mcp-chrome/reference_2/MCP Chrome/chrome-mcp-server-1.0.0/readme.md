# Chrome MCP Server Extension

這是一個基於 Chrome 擴充功能架構的 Model Context Protocol (MCP) 伺服器介面。透過與本地 Node.js 橋接器 (`mcp-chrome-bridge`) 通訊，它能讓 AI 代理程式（如 Antigravity 或 Claude）直接控制與讀取您的 Chrome 瀏覽器。

## 🌟 主要功能與介面 (Features)

根據目前的擴充功能結構與設定檔分析，本擴充功能提供以下核心介面與功能供您使用：

### 1. 快速面板 AI 聊天 (Quick Panel AI Chat)
- **快捷鍵**：`Ctrl + Shift + U` (Mac 為 `Cmd + Shift + U`)
- **說明**：透過 `quick-panel.js` 腳本注入到您正在瀏覽的網頁中。這允許您在不離開當前網頁的情況下，直接呼叫出一個 AI 聊天面板，針對當前網頁內容進行快速提問或下達指令。

### 2. 網頁編輯器模式 (Web Editor Mode)
- **快捷鍵**：`Ctrl + Shift + O` (Mac 為 `Cmd + Shift + O`)
- **說明**：載入了 `web-editor-v2.js`，提供了一個網頁編輯器介面。這可能用於讓 AI 直接即時修改網頁的 HTML/CSS/JS，或是讓您檢視與編輯 AI 生成的程式碼片段。

### 3. 網頁元素選擇器 (Element Picker)
- **說明**：載入 `element-picker.js`。這是一個視覺化的工具，允許使用者或 AI 互動式地「點選」網頁上的特定 DOM 元素（例如某個按鈕或文字區塊），並將該元素的結構與內容精準地傳遞給模型，以執行更精確的自動化操作。

### 4. 側邊欄工作流管理 (Side Panel)
- **介面**：Chrome 側邊欄 (`sidepanel.html`)，內部標題為「工作流管理」。
- **說明**：您可以透過 Chrome 右上角的「側邊面板」按鈕打開它。它提供了一個持久化的介面，用於管理 MCP 的連線狀態、查看可用的工具 (Tools) 數量、或是管理進階的自動化工作流 (Workflows) 與 Agent 聊天對話。

### 5. 後台 MCP 伺服器核心 (Background Server)
- **說明**：`background.js` 作為 Service Worker 常駐運行，擁有非常強大的權限（包括 `debugger`, `scripting`, `tabs`, `downloads`, `webRequest` 等）。它負責接收 MCP 工具調用，轉換為實際的 Chrome API 執行，並透過 Native Messaging 將結果回傳。

---

## 🛠 支援的底層權限 (Capabilities)

該擴充功能向 AI 開放了以下深度的瀏覽器控制能力：
- **分頁與導航控制 (`tabs`, `webNavigation`)**：新建、切換、關閉分頁，以及控制網頁跳轉。
- **腳本注入 (`scripting`)**：能夠在任何網頁中動態注入並執行 JavaScript 程式碼。
- **網路攔截與分析 (`webRequest`, `declarativeNetRequest`)**：監控網路請求、修改 Header 或是攔截特定流量。
- **深度除錯 (`debugger`)**：連接 Chrome DevTools Protocol，進行效能分析、網路模擬或進階的 DOM 提取與操作。
- **書籤與歷史紀錄 (`bookmarks`, `history`)**：讀取與搜尋您的瀏覽紀錄與書籤內容。

## 📖 如何存取這些介面
- **擴充功能圖示 (Popup)**：點擊網址列右側的擴充功能圖示，可進行最基礎的 MCP 連線狀態確認與設定。
- **快捷鍵操作**：使用上述的 `Ctrl+Shift+U` 或 `Ctrl+Shift+O` 在網頁上呼叫出互動面板與編輯器。
- **Chrome 側邊欄**：點擊 Chrome 右上角的「側邊面板」按鈕，並在下拉選單選擇此擴充功能，即可打開「工作流管理」介面。
