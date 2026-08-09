# Chrome Extension 架構標準定義 (Chrome Extension Architecture Standard)

本文件定義了一套適用於高效網頁自動化、數據採集與資料管理的 **輕量化 Chrome Extension 架構標準**。本標準汲取自 `202507_shoppee_keyword` 專案之成功實踐，旨在避免傳統 Extension 的過度設計（Over-engineering），提升程式的強健性與可維護性。

---

## 1. 核心設計哲學 (Design Philosophy)

### 1.1 輕量化動態注入 (Dynamic Script Injection)
* 捨棄在所有頁面自動載入大體積 Content Scripts 的作法。
* 僅在使用者主動點擊 Popup 按鈕時，透過 `chrome.scripting.executeScript` **動態注入**任務腳本到當前活動分頁（Active Tab）。
* **優點**：保持瀏覽器記憶體乾淨、無須複雜的跨端 message-passing、大幅降低 Manifest 的 host permissions 宣告與安全審查風險。

### 1.2 單一資料源儲存 (Storage-as-Database)
* 使用 `chrome.storage.local` 作為 Extension 的本地資料庫（例如以 `keyWordResult` 為主鍵的 Array）。
* 所有注入腳本、Popup 以及儀表板 Frontend 均直接讀寫此儲存庫，維持資料單一真理源（Single Source of Truth）。

### 1.3 職責分離的 UI 邊界 (UI Separation)
* **Popup (`src/popup`)**：僅作為**控制面板**與**狀態顯示器**。保持介面極簡，只擺放啟動按鈕（如抓取、匯出）、重設按鈕與系統運作進度。
* **Dashboard (`src/frontEnd`)**：獨立於 Popup 的**資料管理後台**。利用 `chrome.tabs.create({ url: "..." })` 開啟獨立 Full-page 網頁。使用大版面表格進行資料過濾（分類 Tags）、分頁（Pagination）、備註修改，並在最後一次性提交更新。

### 1.4 強健的自動化與防護機制 (Resilient Automation)
* **防護限流與斷點續傳**：爬取大量資料時（例如目標 20,000 筆以上），實作**批次寫入（Batch Saving）**（例如每爬完 20 筆寫入一次 Local Storage），避免每筆寫入造成 I/O 負擔過重及資料丟失。
* **狀態去重**：資料 Schema 包含 `lastUpdate`，程式在執行時自動跳過本日已更新的項目，以預防對目標網站發送重覆請求被 Ban。
* **DOM 事件模擬**：注入程式修改 input 欄位時，必須主動派發 `input` 事件以觸發網頁前端框架（如 React / Vue）的內部 state 綁定。
* **優雅輪詢 (Polling)**：使用基於 Promise-sleep 的輪詢機制等待 dynamic AJAX 表格渲染，並配置嚴格的 Timeout 限制防止執行緒永久卡死。

---

## 2. 標準目錄結構 (Folder Structure)

專案結構應維持一致性，區分靜態資源、本地庫、彈出視窗與背景流程：

```
├── manifest.json                    # MV3 配置宣告（極簡權限聲明）
├── readme.md                        # 專案任務與功能說明
├── libs/                            # 第三方工具庫本地備份（禁止引入外部 CDN）
│   ├── jquery/                      # jQuery 本地庫
│   ├── taiwindcss/                  # Tailwind 4.x JS 瀏覽器運行版
│   ├── daisyui/                     # DaisyUI CSS 樣式庫
│   └── HoldOn/                      # 遮罩加載特效庫（HoldOn.js）
├── src/
│   ├── background/
│   │   ├── background.js            # MV3 Service Worker (常為空檔或僅作生命週期監聽)
│   │   ├── shoppeeKeyWordFetch.js   # [動態注入] 網頁自動化/數據爬取邏輯
│   │   └── exportStorage.js         # [動態注入] 資料匯出 JSON 下載邏輯
│   ├── contentScripts/
│   │   └── contentScript.js         # [預留] 僅在必須隨頁面啟動載入的邏輯下使用
│   ├── popup/
│   │   ├── popup.html               # Popup 頁面結構
│   │   ├── popup.js                 # 監聽 Popup 按鈕並發起 script 注入與通訊
│   │   ├── css/                     # Popup 專用樣式
│   │   └── images/                  # 圖示資源
│   └── frontEnd/
│       ├── data-view.html           # 儀表板頁面
│       └── data-view.js             # 儀表板資料讀取、分頁、編輯與批次更新邏輯
```

---

## 3. 資料 Schema 標準 (Data Schema)

以時間序列 (Time-Series) 結構儲存，確保一筆 Key 對應多筆歷史量能記錄：

```typescript
interface KeywordRecord {
  keyword: string;                     // 關鍵字 (Primary Key)
  data: Array<{
    searchVolume: number | string;     // 歷史量能 (如搜尋量、曝光數)
    createDate: string;                // 採集日期 (YYYY-MM-DD)
  }>;
  tag: 'new' | 'favorite' | 'large' | 'medium' | 'small' | 'ignore'; // 篩選標籤
  lastUpdate: string;                  // 上次更新日期 (YYYY-MM-DD)
  note: string;                        // 使用者自訂備註
}
```

---

## 4. 關鍵技術實作範本 (Core Code Snippets)

### 4.1 從 Popup 動態注入 Script 到 Tab
```javascript
// src/popup/popup.js
async function injectScraper() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 注入核心自動化腳本
  chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    files: ['/src/background/shoppeeKeyWordFetch.js']
  });
}
```

### 4.2 模擬真實輸入與觸發 React/Vue 綁定
```javascript
// src/background/shoppeeKeyWordFetch.js 內部
const inputElement = document.querySelector("input#target-id");
if (inputElement) {
  inputElement.value = "搜尋關鍵字";
  
  // 核心：必須派發 input 事件，否則 Modern UI Framework 不會更新綁定的 State
  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
  await sleep(100);
  
  // 點擊搜尋按鈕
  const searchBtn = document.querySelector("button#search-btn");
  if (searchBtn) searchBtn.click();
}
```

### 4.3 異步 DOM 載入輪詢 (Polling Mechanism)
```javascript
// 輪詢等待目標 DOM 出現，逾時則跳出避免執行緒掛起
async function waitForElementToRender(selector, containText, maxWaitTimeMs = 15000) {
  const pollInterval = 500;
  let elapsed = 0;
  
  while (elapsed < maxWaitTimeMs) {
    const el = document.querySelector(selector);
    if (el && el.innerText.includes(containText)) {
      return el;
    }
    await sleep(pollInterval);
    elapsed += pollInterval;
  }
  throw new Error(`Timeout: 找不到符合 '${containText}' 的元素 ${selector}`);
}
```

### 4.4 批次更新 Local Storage 防止阻塞
```javascript
// 每爬取 N 筆資料後，批次合併並更新回 local storage
async function updateStorageBatch(newFetchedItems) {
  const { keyWordResult: currentData = [] } = await getStorageData("keyWordResult");
  
  for (const newItem of newFetchedItems) {
    const idx = currentData.findIndex(item => item.keyword === newItem.keyword);
    const today = new Date().toISOString().slice(0, 10);
    
    if (idx === -1) {
      newItem.lastUpdate = today;
      currentData.push(newItem);
    } else {
      currentData[idx].lastUpdate = today;
      // 檢查是否已有今日的歷史數據，無則插入
      const exists = currentData[idx].data.some(d => d.createDate === today);
      if (!exists) {
        currentData[idx].data.push(newItem.data[0]);
        // 依日期升序排序
        currentData[idx].data.sort((a, b) => new Date(a.createDate) - new Date(b.createDate));
      }
    }
  }
  await setStorageData("keyWordResult", currentData);
}
```

### 4.5 自動暫停背景分頁音訊 (UX 貼心設計)
```javascript
// 開啟 Popup 時自動呼叫，防止背景音訊干擾工作
function stopAudioInAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      if (tab.url && tab.url.startsWith('http')) {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            document.querySelectorAll('audio, video').forEach(media => {
              if (!media.paused) media.pause();
            });
          }
        }).catch(err => console.log(`跳過無權限注入的分頁: ${tab.url}`));
      }
    });
  });
}
```
