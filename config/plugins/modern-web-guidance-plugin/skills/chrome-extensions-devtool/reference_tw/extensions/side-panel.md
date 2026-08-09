# 側邊欄 (Side Panel)

## 設定

在 manifest.json 中新增：
```json
{
  "permissions": ["sidePanel"],
  "side_panel": {
    "default_path": "sidepanel/sidepanel.html"
  }
}
```

## 開啟側邊欄 — 必要步驟

**僅在 manifest 中定義側邊欄並不會讓它能夠被開啟。** 您必須提供一個明確的觸發器來開啟它。若沒有觸發器，使用者將完全無法存取您的側邊欄面板：

### 最常見做法：點擊擴充功能圖示時開啟

如果擴充功能的主要介面就是側邊欄，請移除 action 中的 `default_popup`，並在 Service Worker 中使用 `chrome.action.onClicked` 來開啟側邊欄：

```js
// service-worker.js
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});
```

⚠️ `chrome.action.onClicked` 僅在**沒有**設定 `default_popup` 時才會觸發。如果您同時需要彈出式視窗與側邊欄，請在彈出式視窗中放一個按鈕來開啟，或使用其他觸發方式。

### 其他觸發方式

```js
// 從快顯功能表項目開啟
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'open-panel') {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

// 透過鍵盤快速鍵開啟（在 manifest.json 的 commands 中定義）
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open-side-panel') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});
```

您也可以針對特定頁籤開啟側邊欄：
```js
await chrome.sidePanel.open({ tabId: tab.id });
```

### 最簡便做法：透過 setPanelBehavior 自動開啟

若希望使用者點擊擴充功能圖示時一律直接打開側邊欄，可以使用 `setPanelBehavior` 一行搞定，而不需要去監聽 `onClicked` 事件：

```js
// service-worker.js
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
```

⚠️ **屬性名稱是 `openPanelOnActionClick` — 而非 `openPanelOnActionIconClick`。**
寫錯屬性名稱會引發同步的 TypeError，進而默默中止 Service Worker 的執行。

使用 `setPanelBehavior` 時，請勿在 manifest 中定義 `default_popup` — 彈出式視窗的優先權較高。

## 針對不同頁籤設定不同側邊欄

```js
// 當網址符合 github.com 時載入不同的側邊欄內容
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tab.url?.includes('github.com')) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel/github-panel.html',
      enabled: true
    });
  }
});
```

## 與側邊欄通訊

側邊欄本質上是一個擴充功能網頁，因此它可以直接使用所有 chrome.* API，並能透過 `chrome.runtime.sendMessage` / `chrome.runtime.onMessage` 與 Service Worker 通訊。

若要從當前分頁的內容腳本（Content Script）中獲取資料：

```js
// 在側邊欄 JS 中
async function getPageContent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_CONTENT' });
  return response;
}
```

或是直接從側邊欄執行 `chrome.scripting.executeScript`（需要宣告 `scripting` 與 `activeTab` 權限）：

```js
const [{ result }] = await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => document.body.innerText
});
```

## 側邊欄 vs 彈出式視窗

| 功能特性 | 側邊欄 | 彈出式視窗 |
|---------|-----------|-------|
| 保持開啟 | 是 | 點擊外部會關閉 |
| 調整大小 | 支援（由使用者拖曳） | 固定尺寸 |
| 與網頁並存 | 支援（左右並排顯示） | 覆蓋在網頁之上 |
| 適用場景 | 需要長時間互動、閱讀資訊 | 快速操作、設定面板 |

## 重要提示

- 每個瀏覽器視窗僅共用一個側邊欄實體 — 開啟新內容會取代現有內容
- 使用 `chrome.sidePanel.setOptions({ enabled: false })` 可以停用特定頁籤的側邊欄
- 側邊欄 HTML 檔案具有完整的 chrome.* API 存取權限
- 側邊欄在切換同視窗內的分頁時會持續顯示（以視窗為單位）

### ⚠️ `activeTab` 在點擊側邊欄內的元素時無法運作

`activeTab` 僅在使用者直接操作擴充功能圖示、快顯功能表項目、快速鍵或網址列建議時才會暫時授予頁籤存取權。**點擊側邊欄內部的按鈕並不會觸發 `activeTab` 授權。**

如果您的側邊欄需要讀取或修改網頁內容（例如點擊「產生摘要」按鈕），請使用 `tabs` + `host_permissions` 代替：

```json
{
  "permissions": ["tabs", "scripting", "sidePanel"],
  "host_permissions": ["<all_urls>"]
}
```

切勿依賴 `activeTab` 權限來處理側邊欄的功能。
