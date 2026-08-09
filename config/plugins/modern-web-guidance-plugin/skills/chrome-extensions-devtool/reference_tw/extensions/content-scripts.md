# 內容腳本與 DOM 操作

## 兩種插入方式

### 1. 靜態插入（在 manifest 中宣告）
```json
{
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content/content.js"],
    "css": ["content/content.css"],
    "run_at": "document_idle"
  }]
}
```

### 2. 程式化插入（從 Service Worker 或彈出式視窗）
```js
// 需要 "scripting" 權限與主機存取權限
chrome.scripting.executeScript({
  target: { tabId: tabId },
  files: ['content/content.js']
});

// 或者直接插入一個函式
chrome.scripting.executeScript({
  target: { tabId: tabId },
  func: (param) => {
    document.body.style.backgroundColor = param;
  },
  args: ['yellow']
});
```

點擊時的插入可使用 `activeTab` 權限（不需要宣告 host_permissions）：
```json
{
  "permissions": ["activeTab", "scripting"]
}
```

## 隔離世界（Isolated World）

內容腳本運行於隔離的世界中：
- 它們與網頁共享 DOM，但不共享 JavaScript 變數
- 它們可以存取 chrome.runtime 訊息 API
- 網頁的 CSP 不會限制內容腳本的程式碼
- `window` 指的是內容腳本's 隔離世界

## 內容腳本的訊息傳遞

```js
// content.js → service worker
chrome.runtime.sendMessage({ type: 'DATA', payload: data }, (response) => {
  console.log('收到回應：', response);
});

// service worker → 特定頁籤中的內容腳本
chrome.tabs.sendMessage(tabId, { type: 'UPDATE', data: newData });

// content.js：監聽訊息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_CONTENT') {
    const text = document.body.innerText;
    sendResponse({ text });
  }
  return true; // 保持通道開啟以進行非同步 sendResponse
});
```

## DOM 操作最佳實踐

- **避免在修改大量 DOM 元素時阻塞主執行緒**。使用 `requestAnimationFrame` 來進行批次視覺更新，並使用 `scheduler.yield()` 來拆分長時間執行的工作：

```js
// ❌ 錯誤做法：在處理數百個元素時阻塞了主執行緒
const emails = document.body.innerText.match(/[\w.+-]+@[\w-]+\.[\w.]+/g);
emails.forEach(email => {
  // ... 搜尋並反白標示每個電子郵件（可能會導致頁面凍結）
});

// ✅ 正確做法：使用 requestAnimationFrame 進行分批處理
async function highlightEmails(elements) {
  const BATCH_SIZE = 20;
  for (let i = 0; i < elements.length; i += BATCH_SIZE) {
    const batch = elements.slice(i, i + BATCH_SIZE);
    await new Promise(resolve => requestAnimationFrame(() => {
      batch.forEach(el => el.style.backgroundColor = 'yellow');
      resolve();
    }));
    // 在批次處理之間讓出控制權給主執行緒
    if (typeof scheduler !== 'undefined' && scheduler.yield) {
      await scheduler.yield();
    }
  }
}
```

- 對於動態頁面（SPA、無限捲動），使用 `MutationObserver`
- 為您的 CSS 類別（Class）設定命名空間以避免衝突（例如 `myext-highlight`）
- 對於插入到頁面中的複雜 UI，使用 Shadow DOM
- 移除時的清理：`chrome.runtime.onMessage` 監聽器會一直保留，直到內容腳本環境被銷毀為止
- 在 DOM 中尋找文字時，使用 `TreeWalker` 或 `document.createNodeIterator` 來代替在 `innerHTML` 上使用正規表達式 — 這更為可靠，且不會破壞現有的事件監聽器

## `run_at` 插入時機

| 設定值 | 插入時間點 |
|-------|------|
| `document_start` | 在建構 DOM 之前（常用於阻擋或攔截） |
| `document_idle` | DOM 準備就緒但所有資源加載完成之前（預設值，推薦使用） |
| `document_end` | DOM 建構完成但影像/子框架加載完成之前 |
