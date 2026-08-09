# 彈出式視窗 (Popup) UI

## 設定

```json
{
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    },
    "default_title": "My Extension"
  }
}
```

## 關鍵限制

- 當使用者點擊彈出式視窗外部時，它就會關閉 — 切勿依賴它保持開啟狀態
- 預設最大尺寸：800x600 px。請在 body/html 上透過 CSS 設定尺寸
- 所有腳本必須為外部檔案（CSP 限制 — 不可有內聯腳本）
- 所有事件接聽程式必須使用 `addEventListener`（不可有內聯事件處理常式）

## 彈出式視窗 HTML 範本

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { width: 350px; min-height: 200px; padding: 16px; font-family: system-ui; }
  </style>
</head>
<body>
  <h1>My Extension</h1>
  <div id="content"></div>
  <script src="popup.js"></script>
</body>
</html>
```

## 狀態持久化 (Persistence)

彈出式視窗關閉時其狀態會丟失。請使用 `chrome.storage` 進行狀態持久化：

```js
// 變更時儲存
document.getElementById('input').addEventListener('input', (e) => {
  chrome.storage.local.set({ savedInput: e.target.value });
});

// 開啟時還原
document.addEventListener('DOMContentLoaded', async () => {
  const { savedInput = '' } = await chrome.storage.local.get('savedInput');
  document.getElementById('input').value = savedInput;
});
```

提示：雖然 `localStorage` 在彈出式視窗中技術上可行（因為它們有持久的網域來源），但強烈建議使用 `chrome.storage`，因為它可在所有的擴充功能環境中運作，且支援多裝置同步（Sync）。

## 與 Service Worker 通訊

```js
// 從彈出式視窗發送
const response = await chrome.runtime.sendMessage({ type: 'GET_STATUS' });

// 長期連線 (Port)
const port = chrome.runtime.connect({ name: 'popup' });
port.postMessage({ type: 'INIT' });
port.onMessage.addListener((msg) => { /* 處理 */ });
```

## 動態彈出式視窗 vs 無彈出式視窗

如果您希望點擊擴充功能圖示時執行特定動作，而非顯示彈出式視窗，請移除 `default_popup` 並使用 `chrome.action.onClicked`：

```js
// 在 Service Worker 中 — 僅在未設定 default_popup 時觸發
chrome.action.onClicked.addListener((tab) => {
  // 開啟側邊欄、插入腳本等
});
```

您可以在執行階段動態切換彈出式視窗的啟用與禁用：
```js
chrome.action.setPopup({ popup: 'popup/popup.html' }); // 啟用彈出式視窗
chrome.action.setPopup({ popup: '' }); // 停用彈出式視窗（這會啟用 onClicked 監聽器）
```
