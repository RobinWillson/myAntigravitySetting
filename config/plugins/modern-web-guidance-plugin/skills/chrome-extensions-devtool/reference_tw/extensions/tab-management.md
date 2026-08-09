# 頁籤 (Tab) 與視窗管理及群組

## 權限設定

```json
{
  "permissions": ["tabs", "tabGroups"]
}
```

注意：`"tabs"` 權限可讓您讀取頁籤物件上的 `url`、`title` 以及 `favIconUrl`。
若不宣告此權限，您仍然可以使用 `chrome.tabs` API，但無法取得這些具敏感性的頁籤屬性。

## 查詢頁籤

```js
// 取得所有頁籤
const allTabs = await chrome.tabs.query({});

// 取得目前視窗中的活動分頁（作用中的頁籤）
const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

// 查詢符合特定 URL 模式的頁籤
const gmailTabs = await chrome.tabs.query({ url: '*://mail.google.com/*' });
```

## 頁籤操作

```js
// 建立新頁籤
const tab = await chrome.tabs.create({ url: 'https://example.com', active: true });

// 更新頁籤屬性
await chrome.tabs.update(tabId, { url: 'https://new-url.com', pinned: true });

// 關閉頁籤
await chrome.tabs.remove(tabId);
await chrome.tabs.remove([tabId1, tabId2]); // 批次關閉

// 移動頁籤
await chrome.tabs.move(tabId, { index: 0 }); // 移動到最前面

// 重新整理
await chrome.tabs.reload(tabId);
```

## 頁籤群組 (Tab Groups)

```js
// 將指定頁籤建立為新群組
const groupId = await chrome.tabs.group({ tabIds: [tabId1, tabId2] });

// 自訂群組設定
await chrome.tabGroups.update(groupId, {
  title: '工作',
  color: 'blue',     // 可用顏色：grey, blue, red, yellow, green, pink, purple, cyan, orange
  collapsed: false
});

// 將頁籤移入現有的群組
await chrome.tabs.group({ tabIds: [newTabId], groupId: existingGroupId });

// 將頁籤退出群組
await chrome.tabs.ungroup(tabId);
```

## 依網域自動建立群組

```js
async function groupByDomain() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const byDomain = {};

  for (const tab of tabs) {
    try {
      const domain = new URL(tab.url).hostname;
      (byDomain[domain] ??= []).push(tab.id);
    } catch { /* 忽略沒有 URL 的頁籤 */ }
  }

  for (const [domain, tabIds] of Object.entries(byDomain)) {
    if (tabIds.length > 1) {
      const groupId = await chrome.tabs.group({ tabIds });
      await chrome.tabGroups.update(groupId, {
        title: domain.replace('www.', ''),
        color: 'blue'
      });
    }
  }
}
```

## 事件監聽

```js
chrome.tabs.onCreated.addListener((tab) => { /* 建立新頁籤 */ });
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => { /* 頁籤更新 */ });
chrome.tabs.onRemoved.addListener((tabId, removeInfo) => { /* 關閉頁籤 */ });
chrome.tabs.onActivated.addListener(({ tabId, windowId }) => { /* 聚焦在特定頁籤 */ });
chrome.tabGroups.onUpdated.addListener((group) => { /* 頁籤群組更新 */ });
```

## 視窗 (Windows) 管理

⚠️ **`chrome.windows` 並沒有 `.query()` 方法。** 這與 `chrome.tabs.query()` 不同，`chrome.windows.query()` 並不存在。請根據您的需求使用正確的方法：

```js
// ❌ 毀損做法
const windows = await chrome.windows.query({ focused: true });
// TypeError: chrome.windows.query is not a function

// ✅ 正確做法
const focused = await chrome.windows.getLastFocused({ populate: true }); // 會包含分頁陣列 (tabs array)
const current = await chrome.windows.getCurrent({ populate: true });
const all     = await chrome.windows.getAll({ populate: true });
const single  = await chrome.windows.get(windowId, { populate: true });
```

完整的 API 方法：`getAll`, `getLastFocused`, `getCurrent`, `get(windowId)`, `create`, `update`, `remove`。
傳遞 `{ populate: true }` 來在回傳的視窗物件中包含 `tabs` 陣列。

```js
// 建立一個包含特定分頁的新視窗
const win = await chrome.windows.create({ url: 'https://example.com', focused: true });

// 移動目前視窗或調整尺寸
await chrome.windows.update(windowId, { left: 0, top: 0, width: 800, height: 600 });

// 最小化 / 最大化
await chrome.windows.update(windowId, { state: 'minimized' }); // 支援狀態：'normal' | 'minimized' | 'maximized' | 'fullscreen'
```
