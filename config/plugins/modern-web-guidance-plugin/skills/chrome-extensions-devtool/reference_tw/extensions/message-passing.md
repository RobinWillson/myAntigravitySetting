# 訊息傳遞

## 基本模式

### 單向訊息（發送後不理）

```js
// 發送端（彈出式視窗、內容腳本等）
chrome.runtime.sendMessage({ type: 'LOG', data: 'hello' });

// 接收端（Service Worker）
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'LOG') console.log(message.data);
});
```

### 請求/回應 — IIFE + return true (相容性最佳)

```js
// 發送端
const response = await chrome.runtime.sendMessage({ type: 'GET_DATA' });
console.log(response.data);

// 接收端 — 使用 IIFE 可保持通道開啟，直到呼叫 sendResponse 為止
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_DATA') {
    (async () => {
      const data = await chrome.storage.local.get('key');
      sendResponse({ data });
    })();
    return true; // 必要項目 — 告知 Chrome 保持通訊通道開啟
  }
});
```

### 請求/回應 — 傳回 Promise (Chrome 99+)

現在支援直接從接聽程式（Listener）傳回 Promise，這比 IIFE 模式更為簡潔：

```js
chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === 'GET_DATA') {
    return chrome.storage.local.get('key'); // 傳回的 promise 將解析為回應內容
  }
  // 對於此接聽程式不處理的訊息，傳回 nothing (或 undefined)
});
```

**注意：** 這需要 Chrome 99+。僅在最低支援的 Chrome 版本設定為 99 或以上時使用。
**注意：** 請勿混用這兩種風格。如果您傳回了 Promise，就**不要**再呼叫 `sendResponse` 或傳回 `return true`。

## 內容腳本 ↔ Service Worker

```js
// 內容腳本 → Service Worker
const result = await chrome.runtime.sendMessage({ type: 'FETCH_DATA', url: location.href });

// Service Worker → 特定頁籤的內容腳本
await chrome.tabs.sendMessage(tabId, { type: 'HIGHLIGHT', selector: '.important' });
```

## Service Worker → 內容腳本 (指定頁籤)

務必先檢查該頁籤是否存在且內容腳本是否已完成插入：

```js
async function sendToContentScript(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch (err) {
    // 內容腳本尚未插入，或該頁籤已經跳轉離開
    console.warn('無法連線到內容腳本：', err.message);
    return null;
  }
}
```

## 長期連線 (Ports)

當您需要一個持久的通訊管道時，請使用 Port（例如：串流資料、DevTools 面板）：

```js
// 發起端（彈出式視窗或內容腳本）
const port = chrome.runtime.connect({ name: 'my-channel' });
port.postMessage({ type: 'START' });
port.onMessage.addListener((msg) => console.log('收到：', msg));
port.onDisconnect.addListener(() => console.log('連線已中斷'));

// 接收端 (Service Worker)
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== 'my-channel') return;
  port.onMessage.addListener((msg) => {
    if (msg.type === 'START') {
      port.postMessage({ status: 'ok' });
    }
  });
});
```

## 常見錯誤

### 缺少 `return true` 導致回應永遠無法送達

```js
// ❌ 錯誤做法 — 非同步工作完成了，但通道已經關閉
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  fetchSomething().then(data => sendResponse(data)); // 太遲了
  // 缺少：return true
});

// ✅ 正確做法
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  fetchSomething().then(data => sendResponse(data));
  return true;
});
```

### 在內容腳本準備就緒前發送訊息

內容腳本是在網頁加載完成後才會插入的。如果 Service Worker 在 `tabs.onUpdated` 觸發時立刻發送訊息，內容腳本可能還沒有開始監聽。請使用握手（Handshake）或重試機制：

```js
// 內容腳本 — 宣告已準備就緒
chrome.runtime.sendMessage({ type: 'CONTENT_READY' });

// Service Worker — 等待 CONTENT_READY 訊息後再發送資料
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'CONTENT_READY' && sender.tab) {
    chrome.tabs.sendMessage(sender.tab.id, { type: 'INIT_DATA', ... });
  }
});
```

### 多個監聽器同時回應

對於特定的訊息類型，應該只有一個接聽程式負責回應。如果有多個接聽程式都呼叫了 `sendResponse`，只有第一個呼叫的會獲勝，其餘的都會被默默忽略。
