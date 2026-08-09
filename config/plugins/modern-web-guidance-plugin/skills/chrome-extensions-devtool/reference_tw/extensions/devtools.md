# DevTools 面板

## 設定

```json
{
  "devtools_page": "devtools/devtools.html"
}
```

devtools 頁面**僅**在 DevTools 開啟時運作。它是不可見的 — 它的工作是建立面板（Panels）。

## 建立面板

`devtools/devtools.html`：
```html
<!DOCTYPE html>
<html>
<body>
  <script src="devtools.js"></script>
</body>
</html>
```

`devtools/devtools.js`：
```js
chrome.devtools.panels.create(
  'My Panel',                    // 在 DevTools 標籤中顯示的標題
  'icons/icon-16.png',           // 圖示（選用，可為空字串）
  'devtools/panel/panel.html',   // 面板的內容網頁 — 相對於擴充功能根目錄
  (panel) => {
    // panel.onShown.addListener((window) => { ... });
    // panel.onHidden.addListener(() => { ... });
  }
);
```

**至關重要：面板路徑是相對於擴充功能根目錄**，而**非**相對於 devtools.js 檔案。這是 DevTools 擴充功能最常出現的錯誤。

```js
// ❌ 錯誤做法 — 會解析為 <ext-root>/panel/panel.html（找不到檔案）
chrome.devtools.panels.create("My Panel", "", "panel/panel.html");

// ✅ 正確做法 — 會解析為 <ext-root>/devtools/panel/panel.html
chrome.devtools.panels.create("My Panel", "", "devtools/panel/panel.html");
```

## 面板內容

`devtools/panel/panel.html` 是一個一般的擴充功能網頁，具有完整的 chrome.* API 存取權限。

## 存取 DevTools API

僅在 devtools 網頁和面板中可用：

```js
// 取得被檢視視窗的頁籤 ID
const tabId = chrome.devtools.inspectedWindow.tabId;

// 在被檢視的網頁中執行 JS
chrome.devtools.inspectedWindow.eval('document.title', (result, isException) => {
  console.log('網頁標題：', result);
});

// 監控網路請求
chrome.devtools.network.onRequestFinished.addListener((request) => {
  // request.request.url, request.response.status 等
  // 格式為 HAR 記錄項目
});

// 取得所有擷取到的請求
chrome.devtools.network.getHAR((harLog) => {
  harLog.entries.forEach((entry) => { /* 處理 */ });
});
```

## 通訊架構

DevTools 網頁/面板在某些情況下無法直接透過 `chrome.runtime.sendMessage` 與 Service Worker 通訊。請使用連線（Port）模式：

```js
// 在面板 JS 中 — 連線到 Service Worker
const port = chrome.runtime.connect({ name: 'devtools-panel' });
port.postMessage({ type: 'INIT', tabId: chrome.devtools.inspectedWindow.tabId });
port.onMessage.addListener((msg) => { /* 處理 */ });

// 在 Service Worker 中
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === 'devtools-panel') {
    port.onMessage.addListener((msg) => { /* 處理 */ });
  }
});
```

## 重要提示

- 每個 DevTools 視窗都會有一個 DevTools 網頁實體（每個被檢視的頁籤一個）
- 它聯會在 DevTools 關閉時被銷毀
- `chrome.devtools.*` API **僅**在 devtools 網頁的環境中可用，在 Service Worker 中不可使用
- 面板可以透過 `chrome.devtools.inspectedWindow.eval()` 將腳本插入到被檢視的網頁中
