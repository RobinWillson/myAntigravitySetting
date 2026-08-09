# Service Worker 生命週期與狀態管理

## 核心問題

Chrome 會在約 30 秒的閒置時間後終止擴充功能的 Service Worker。這與 Manifest V2 具有持續運作的背景網頁（Background Page）不同，您**切勿**依賴記憶體中的狀態。

## 規則

1. **切勿將狀態儲存在全域變數中** — 將每個事件處理常式視為 Service Worker 剛啟動時的狀態來處理。
2. **使用 chrome.storage 儲存所有持久化狀態** — 隨時讀取、並在變更後立刻寫入。
3. **使用 chrome.alarms 處理計時器** — 不要使用 `setTimeout`/`setInterval`（它們會隨著 SW 終止而失效）。
4. **使用 chrome.storage.session 處理暫時性的工作階段狀態** — 這可以在 SW 重啟時保留，但瀏覽器重啟時會被清除。

## 儲存空間分級選用指南

| 需求 | 儲存區域 | 限制與配額 | 主要用途 |
|------|-----|-------|---------|
| 跨裝置同步、瀏覽器重啟後保留 | `chrome.storage.sync` | 每個項目 8KB，總共 100KB | 使用者偏好設定、小量資料 |
| 僅限本機、瀏覽器重啟後保留 | `chrome.storage.local` | 預設為 10MB | 大部分擴充功能資料 |
| 僅在 SW 重啟時保留，瀏覽器關閉時清除 | `chrome.storage.session` | 預設為 10MB | 暫時性狀態、進行中的操作快取 |
| 避免使用 | 全域變數 ❌ | 隨時會丟失 | 無持久化需求的最臨時變數 |

## 模式：隨選讀取狀態 (Read-on-Demand)

```js
// ❌ 錯誤做法：狀態存在記憶體中
let count = 0;
chrome.webNavigation.onCompleted.addListener(() => {
  count++;
  chrome.action.setBadgeText({ text: String(count) });
});

// ✅ 正確做法：狀態存在儲存空間中
chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return; // 僅限主框架 (Main Frame)
  const data = await chrome.storage.local.get({ visitCount: 0 });
  data.visitCount++;
  await chrome.storage.local.set(data);
  chrome.action.setBadgeText({ text: String(data.visitCount) });
});
```

## 模式：使用 Alarms 代替 Timers

```js
// ❌ 錯誤做法：當 SW 終止時，計時器會隨之失效
setInterval(() => checkForUpdates(), 60000);

// ✅ 正確做法：使用 Alarm 可跨終止狀態保留
chrome.alarms.create('check-updates', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'check-updates') {
    checkForUpdates();
  }
});
```

Alarm 的最小時間間隔為 0.5 分鐘（30 秒）。

## 模式：單次初始化 (One-Time Initialization)

```js
// 在安裝時設定預設值與建立快顯功能表
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await chrome.storage.local.set({ settings: defaultSettings });
  }
  // 快顯功能表必須重新建立（雖然功能表會持續存在，但重新建立具備等冪性）
  chrome.contextMenus.create({
    id: 'myItem',
    title: '我的快顯功能表項目',
    contexts: ['selection']
  });
});
```

## 模式：維持 Service Worker 存活 (僅在必要時)

有時您會需要 Service Worker 在執行長時間操作時保持運作。請使用以下方式之一：

1. **chrome.offscreen** — 建立幕後網頁來處理耗時任務
2. **定期寫入儲存空間** — 每次呼叫 `chrome.storage` 都會重設 idle 閒置計時器
3. **保持連接埠 (Port) 連線** — 保持開啟的連接埠會維持 SW 存活

```js
// 從彈出式視窗/側邊欄進行 Port-based keepalive 連線
const port = chrome.runtime.connect({ name: 'keepalive' });
// 只要此連接埠保持開啟，SW 就會維持存活狀態
```

⚠️ 切勿濫用維持存活（keepalive）的模式。Chrome 可能會在未來的版本中強制執行更嚴格的限制。

## 模式：事件監聽器註冊

所有的事件監聽器**必須**在 Service Worker 的最頂層（Top-level）進行同步註冊。
當事件觸發而重新啟動 SW 時，Chrome 只會將事件傳遞給那些被同步註冊的監聽器。

```js
// ✅ 正確做法：最頂層同步註冊
chrome.runtime.onMessage.addListener(handleMessage);
chrome.tabs.onUpdated.addListener(handleTabUpdate);
chrome.webNavigation.onCompleted.addListener(handleNavigation);

// ❌ 錯誤做法：條件式或非同步註冊
async function setup() {
  const { enabled } = await chrome.storage.local.get('enabled');
  if (enabled) {
    chrome.tabs.onUpdated.addListener(handleTabUpdate); // 太遲了！
  }
}
setup();
```

正確做法是在監聽器內部再去判斷條件：

```js
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  const { enabled } = await chrome.storage.local.get('enabled');
  if (!enabled) return;
  // 執行處理邏輯...
});
```

## 以日期為基準的重設

對於每日的計數統計，請將日期與計數一同儲存：

```js
function getToday() {
  return new Date().toISOString().split('T')[0]; // 例如 "2025-01-15"
}

async function incrementDailyCount() {
  const { dailyCount = 0, countDate = '' } = await chrome.storage.local.get(['dailyCount', 'countDate']);
  const today = getToday();

  if (countDate !== today) {
    // 新的一天 — 重設計數
    await chrome.storage.local.set({ dailyCount: 1, countDate: today });
    return 1;
  } else {
    const newCount = dailyCount + 1;
    await chrome.storage.local.set({ dailyCount: newCount });
    return newCount;
  }
}
```
