---
name: chrome-extensions-devtool
description: >
  Build and publish Chrome Extensions using Manifest V3 best practices. Use this skill
  whenever the user asks to create, modify, debug, or understand Chrome browser extensions,
  add-ons, or anything involving the Chrome Extensions API. Trigger on mentions of: 'Chrome
  extension', 'browser extension', 'manifest.json', 'content script', 'service worker' (in
  browser context), 'popup' (in browser extension context), 'side panel', 'chrome.* API',
  'declarativeNetRequest', 'omnibox', 'context menu' (in extension context), or any request
  to build functionality that integrates with the Chrome browser UI. Also trigger for
  publishing to the Chrome Web Store: 'publish extension', preparing an extension for
  publishing, responding to a review rejection, writing permission justifications, or
  drafting a privacy policy.
---

# Chrome 擴充功能

使用 Manifest V3 開發達到生產環境品質的 Chrome 擴充功能，並將其發布至 Chrome 線上應用程式商店。

## 第一部分 — 開發擴充功能

### 強制性規則

這些規則解決了擴充功能毀損最常見的原因。違反其中任何一項都會導致建置出的擴充功能無法運作。

#### 1. 圖示（Icons）：僅引用您建立的檔案 — 或完全省略圖示

```
❌ 毀損 — 引用不存在的檔案，或在所有尺寸中重複使用同一個檔案：
   "icons": { "16": "icon.png", "48": "icon.png", "128": "icon.png" }

✅ 正確 — 每個尺寸都是獨立的檔案，且具有正確的像素維度：
   "icons": { "16": "icons/icon-16.png", "48": "icons/icon-48.png", "128": "icons/icon-128.png" }
   （其中 icon-16.png 為 16×16px，icon-48.png 為 48×48px，icon-128.png 為 128×128px）

✅ 亦正確 — 若無法產生真實的 PNG 檔案，請從 manifest 中省略圖示：
   （只需移除 "icons" 和 "default_icon" 欄位 — Chrome 將使用預設圖示）
```

**如果您包含圖示引用，您必須建立實際的影像檔案。** 使用指令碼產生它們（請參閱 `reference_tw/extensions/icons.md`）或將其排除。切勿引用不存在的檔案。

#### 2. 側邊欄（Side panel）：您必須提供一種開啟它的方式

僅定義 `"side_panel": {"default_path": "..."}` 並不會讓它能夠被開啟。請新增觸發器：

```js
// 在 service-worker.js 中 — 點擊擴充功能圖示時開啟側邊欄
// 重要提示：chrome.action.onClicked 僅在沒有 default_popup 時才會觸發
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});
```

如果擴充功能同時擁有彈出式視窗（Popup）和側邊欄，請在彈出式視窗中新增一個按鈕來呼叫 `chrome.sidePanel.open()`。或者，使用 `chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })` — 但屬性是 `openPanelOnActionClick`，而非 `openPanelOnActionIconClick`；帶有 "Icon" 的變體會引發同步的 TypeError，進而默默地中止 Service Worker 的執行。使用 `setPanelBehavior` 時請勿同時定義 `default_popup`。請參閱 `reference_tw/extensions/side-panel.md`。

#### 3. 程式碼執行：僅限沙盒化 iframe

擴充功能的內容安全政策（CSP）在所有擴充功能頁面中都會阻擋 `eval()`、`new Function()` 以及內聯 `<script>`。

```js
// ❌ 毀損 — 直接存取 iframe DOM 會拋出 SecurityError
iframe.contentDocument.write(html);

// ❌ 毀損 — 在擴充功能頁面中使用 eval
eval(userCode); // CSP 會阻擋此操作

// ✅ 選項 A：在 manifest 中使用沙盒（Sandbox）+ postMessage
// manifest.json: { "sandbox": { "pages": ["sandbox.html"] } }
iframe.contentWindow.postMessage({ html, css, js }, '*');
// sandbox.html 接收並運行：
window.addEventListener('message', (e) => { eval(e.data.js); /* 在沙盒中是被允許的 */ });

// ✅ 選項 B：Blob URL（建立獨立的來源，繞過擴充功能的 CSP）
iframe.src = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));

// ✅ 選項 C：srcdoc
iframe.srcdoc = `<style>${css}</style>${html}<script>${js}<\/script>`;
```

詳細資訊請參閱 `reference_tw/extensions/csp-sandbox.md`。

#### 4. `tab.url` 需要 `tabs` 權限

若沒有此權限，`tab.url` 會默默返回 `undefined` — 且不會拋出錯誤。

```json
// manifest.json — 如果您在 any 地方讀取 tab.url 或 tab.title，則為必要項目：
{ "permissions": ["tabs"] }
```

請參閱 `reference_tw/extensions/tab-management.md`。

#### 5. 一律使用 async/await — 切勿使用 `.then()` 鏈式呼叫

```js
// ❌ 錯誤做法
chrome.tabs.query({active: true, currentWindow: true}).then(tabs => {
  chrome.scripting.executeScript({target: {tabId: tabs[0].id}, files: ['content.js']}).then(() => {});
});

// ✅ 正確做法
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
```

對於執行非同步操作的 `runtime.onMessage` 接聽程式：

```js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    const data = await chrome.storage.local.get('key');
    sendResponse({ data });
  })();
  return true; // 保持通道開啟
});
```

#### 6. 內容腳本（Content scripts）：不要阻塞主執行緒

修改多個 DOM 元素時，請使用 `requestAnimationFrame` 進行批次處理，並在批次之間讓出控制權：

```js
async function highlightAll(elements) {
  const BATCH = 20;
  for (let i = 0; i < elements.length; i += BATCH) {
    await new Promise(r => requestAnimationFrame(() => {
      elements.slice(i, i + BATCH).forEach(el => el.style.backgroundColor = 'yellow');
      r();
    }));
    if (globalThis.scheduler?.yield) await scheduler.yield();
  }
}
```

請參閱 `reference_tw/extensions/content-scripts.md`。

#### 7. Service Worker 是暫時性的 — 切勿將狀態儲存在變數中

```js
// ❌ 毀損 — 當 SW 終止時狀態會丟失（約閒置 30 秒後）
let count = 0;
chrome.tabs.onUpdated.addListener(() => { count++; });

// ✅ 正確 — 持久化保存在 chrome.storage 中，並在每個事件觸發時讀取
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status !== 'complete') return;
  const { count = 0 } = await chrome.storage.local.get('count');
  await chrome.storage.local.set({ count: count + 1 });
  await chrome.action.setBadgeText({ text: String(count + 1) });
});
```

使用 `chrome.alarms` 取代 `setTimeout`/`setInterval`。請參閱 `reference_tw/extensions/service-worker.md`。

#### 8. chrome.identity：開發環境與生產環境的擴充功能 ID 不同

使用 Google 登入時，OAuth 的 `client_id` 會與特定的擴充功能 ID 綁定。未打包開發版與 Chrome 線上應用程式商店版之間的 ID 會有所不同。

若要在開發期間固定 ID，請在 manifest.json 中新增 `"key"` 欄位：
1. 打包擴充功能一次（chrome://extensions → 打包擴充功能）
2. 從產生的 .crx 檔案中擷取公鑰
3. 將 `"key": "MIIBIjANBgkqh..."` 新增至 manifest.json

務必記錄說明：「將擴充功能發布至 Chrome 線上應用程式商店後，請使用商店分配的擴充功能 ID 更新 OAuth 用戶端。」請參閱 `reference_tw/extensions/auth-identity.md`。

#### 9. 快顯功能表（Context menus）：在執行動作後向使用者顯示回饋

當快顯功能表項目執行某個動作（儲存、複製等）時，請向使用者確認該動作。使用通知、徽章閃爍或插入的 Toast 提示 — 不要讓動作在背景默默發生。請參閱 `reference_tw/extensions/context-menus.md` 以獲取完整的 Toast 實作。

#### 10. Prompt API：可在 Service Worker、彈出式視窗和側邊欄中使用

`LanguageModel` API 可在所有擴充功能環境中運作 — 包含 Service Worker、彈出式視窗和側邊欄 — 且無需額外的 manifest 權限。擴充功能還可使用網頁端無法使用的 `LanguageModel.params()`：

```js
const params = await LanguageModel.params();
// { defaultTopK: 3, maxTopK: 128, defaultTemperature: 1, maxTemperature: 2 }
```

對於一般的 Prompt API 模式（可用性檢查、工作階段建立、序列串流），請使用 `modern-web-guidance` 技能。擴充功能特定的串接範例請參閱 `reference_tw/extensions/prompt-api.md`。

#### 11. `chrome.action` API 需要在 manifest 中宣告 `action`

使用 `chrome.action.setBadgeText`、`chrome.action.setIcon` 或 `chrome.action.onClicked` 需要在 manifest.json 中宣告 `"action"` 鍵 — 即使它是空物件。若未宣告，`chrome.action` 將為 `undefined`。

```js
// ❌ 毀損 — manifest 中沒有 "action" 鍵
await chrome.action.setBadgeText({ text: '5' });
// TypeError: Cannot read properties of undefined (reading 'setBadgeText')

// ✅ 修正 — 將 "action" 新增至 manifest.json（最少需為空物件）
{ "action": {} }
// 或帶有彈出式視窗：
{ "action": { "default_popup": "popup/popup.html" } }
```

#### 12. `activeTab` 僅在直接的使用者手勢下作用 — 不能從側邊欄觸發

`activeTab` 僅在下列情況觸發時，才授予對目前標籤頁的暫時存取權限：
- 點擊擴充功能動作圖示
- 快顯功能表項目
- 來自 `commands` API 的鍵盤快速鍵
- 接受網址列（Omnibox）的建議

點擊側邊欄中的按鈕、稍後開啟的彈出式視窗按鈕或任何程式化觸發，都**不會**授予存取權限。

```js
// ❌ 毀損 — activeTab 在點擊側邊欄按鈕時無法作用
document.getElementById('summarize').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => document.body.innerText });
});

// ✅ 修正 — 改為使用 "tabs" 權限 + 專屬的 host_permissions
// manifest.json: { "permissions": ["tabs", "scripting"], "host_permissions": ["<all_urls>"] }
```

請參閱 `reference_tw/extensions/side-panel.md`。

#### 13. DevTools 面板的 URL 是相對於擴充功能根目錄

建立 DevTools 面板時，面板 HTML 的路徑是相對於**擴充功能根目錄**，而**非**相對於呼叫 `chrome.devtools.panels.create()` 的 devtools 頁面。

```js
// ❌ 毀損 — 相對於 devtools/ 目錄的路徑
chrome.devtools.panels.create("My Panel", "", "panel/panel.html");

// ✅ 正確 — 來自擴充功能根目錄的完整路徑
chrome.devtools.panels.create("My Panel", "", "devtools/panel/panel.html");
```

請參閱 `reference_tw/extensions/devtools.md`。

#### 14. 幕後網頁（Offscreen documents）無法存取大部分的 chrome.* API

幕後網頁（`chrome.offscreen`）受到**嚴格限制**。大部分的 `chrome.*` API 都無法使用，包含 `chrome.downloads`、`chrome.tabs`、`chrome.action` 等。

```js
// ❌ 毀損 — chrome.downloads 在幕後網頁中為 undefined
chrome.downloads.download({ url, filename: 'recording.webm' }); // TypeError

// ❌ 毀損 — chrome.action 在幕後網頁中為 undefined
chrome.action.setBadgeText({ text: 'REC' }); // TypeError
```

**幕後網頁中唯一可用的 API 為：**
- `chrome.runtime.sendMessage` / `chrome.runtime.onMessage`
- `chrome.runtime.getURL`
- 標準 Web API（DOM、fetch、MediaRecorder、Canvas、Web Audio 等）

**經驗法則：** 幕後網頁負責處理 Web API 的工作（錄音、解析、音訊）。Service Worker 負責處理所有 chrome.* API 的工作（下載、徽章更新、通知）。使用 `chrome.runtime.sendMessage` 來進行兩者之間的通訊。請參閱 `reference_tw/extensions/message-passing.md`。

#### 15. 通知和徽章圖示必須引用真實的影像檔案

`chrome.notifications.create()` 需要一個指向實際影像檔案的有效 `iconUrl`。如果該檔案不存在或路徑錯誤，呼叫將會失敗並顯示 `"Unable to download all specified images."`

```js
// ❌ 毀損 — 圖示檔案不存在
chrome.notifications.create('reminder', {
  type: 'basic',
  iconUrl: 'icons/icon-128.png', // 檔案不在擴充功能中！
  title: 'Reminder',
  message: 'Time is up!'
});

// ✅ 在執行階段透過 OffscreenCanvas 產生 Data URL — 不需要實體檔案。
// 實作參考請參閱 `reference_tw/extensions/icons.md`。
const iconUrl = await getIconDataUrl();
chrome.notifications.create('reminder', { type: 'basic', iconUrl, title: 'Reminder', message: 'Time is up!' });
```

這適用於 chrome.* API 中所有的影像引用 — 通知、`chrome.action.setIcon`、快顯功能表圖示等。**如果您引用了某個檔案，該檔案必須存在。**

#### 16. 頁籤錄影：使用狀態鎖定防範重複啟動

如果在上一次錄製仍在作用時呼叫 `chrome.tabCapture.getMediaStreamId()`，會失敗並顯示 `"Cannot capture a tab with an active stream"`。快速重複點擊擴充功能圖示很容易觸發此錯誤。請使用明確的狀態鎖定：

```js
// ❌ 毀損 — 沒有針對快速點擊進行防護
let isRecording = false;
chrome.action.onClicked.addListener(async (tab) => {
  if (isRecording) { stopRecording(); isRecording = false; }
  else { isRecording = true; startRecording(tab); } // 第二次點擊 = "active stream" 錯誤
});

// ✅ 正確 — 使用過渡狀態來鎖定並排操作
// 狀態機：'idle' → 'starting' → 'recording' → 'stopping' → 'idle'
// 將狀態儲存在 chrome.storage.session 中（可在 SW 重啟時保留，並在瀏覽器關閉時清除）
chrome.action.onClicked.addListener(async (tab) => {
  const { recordingState = 'idle' } = await chrome.storage.session.get('recordingState');

  if (recordingState === 'starting' || recordingState === 'stopping') return;

  if (recordingState === 'idle') {
    await chrome.storage.session.set({ recordingState: 'starting' });
    try {
      await startRecording(tab);
      await chrome.storage.session.set({ recordingState: 'recording' });
      await chrome.action.setBadgeText({ text: 'REC' });
      await chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    } catch (err) {
      console.error('無法開始錄製：', err);
      await chrome.storage.session.set({ recordingState: 'idle' });
    }
  } else if (recordingState === 'recording') {
    await chrome.storage.session.set({ recordingState: 'stopping' });
    try { await stopRecording(); }
    finally {
      await chrome.storage.session.set({ recordingState: 'idle' });
      await chrome.action.setBadgeText({ text: '' });
    }
  }
});
```

此模式適用於 any 管理獨佔資源的 chrome API：
`chrome.tabCapture`、`chrome.desktopCapture`、`chrome.offscreen.createDocument`（一次僅允許建立一個幕後網頁）。請參閱 `reference_tw/extensions/media-capture.md`。

#### 17. `chrome.desktopCapture` 需要具有網址存取權限的目標頁籤

從 Service Worker 呼叫 `chrome.desktopCapture.chooseDesktopMedia()` 時，您必須將作用中的頁籤做為 `targetTab` 參數傳遞。該頁籤物件必須已填充其 `url` 欄位，這需要 `"tabs"` 權限。

```js
// ❌ 毀損 — 從 Service Worker 呼叫時未傳遞 targetTab
chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], (streamId) => { ... });
// Error: "A target tab is required when called from a service worker context."

// ❌ 毀損 — 頁籤沒有 url 欄位（缺少 "tabs" 權限）
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], tab, (streamId) => { ... });
// Error: "targetTab doesn't have URL field set."

// ✅ 正確 — 在 manifest 中宣告 "tabs" 權限 + 傳遞頁籤物件
// manifest.json: { "permissions": ["tabs", "desktopCapture"] }
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], tab, (streamId) => {
  if (!streamId) return; // 使用者已取消
});
```

**提示：** 對於僅限頁籤的錄影，優先使用 `chrome.tabCapture.getMediaStreamId()`。僅在使用者需要選擇要擷取的螢幕/視窗時，才使用 `chrome.desktopCapture`。請參閱 `reference_tw/extensions/media-capture.md`。

#### 18. `chrome.windows` 沒有 `.query()` 方法 — 請使用 `getAll`、`getLastFocused` 或 `getCurrent`

與 `chrome.tabs.query()` 不同，`chrome.windows` API 並**沒有** `.query()` 方法。

```js
// ❌ 毀損 — chrome.windows.query 不存在
const windows = await chrome.windows.query({ focused: true });
// TypeError: chrome.windows.query is not a function

// ✅ 正確 — 根據您的需求使用正確的方法
const focused = await chrome.windows.getLastFocused({ populate: true });
const current = await chrome.windows.getCurrent({ populate: true });
const all     = await chrome.windows.getAll({ populate: true });
```

**`chrome.windows` 方法：** `getAll`、`getLastFocused`、`getCurrent`、`get(windowId)`、`create`、`update`、`remove`。請參閱 `reference_tw/extensions/tab-management.md`。

### 務必使用 Manifest V3

切勿產生 Manifest V2 程式碼。
- 使用 `background.service_worker` 而非 `background.scripts`
- 使用 `chrome.action` 而非 `chrome.browserAction`
- 使用 `chrome.scripting.executeScript` 而非 `chrome.tabs.executeScript`
- `host_permissions` 與 `permissions` 是分開的
- HTML 中不可有內聯腳本 — 使用 `<script src="file.js">`
- 不可有內聯事件處理常式 — 使用 `addEventListener`

---

## 第二部分 — 發布至 Chrome 線上應用程式商店

管理 `CHROMEWEBSTORE.md` — 作為 Chrome 擴充功能專案中所有商店資訊中繼資料、權限聲明、隱私權揭露、版本歷程記錄以及發布就緒狀態的唯一事實來源。

### 核心工作流程

每當您修改會影響擴充功能商店呈現的項目時，請更新（或建立）專案根目錄中的 `CHROMEWEBSTORE.md`。該檔案記錄了開發人員在 Chrome 開發人員後台中所需要填寫的所有內容，以便他們在發布時可以直接複製貼上，而不需要臨時到處翻找。

#### 何時建立 CHROMEWEBSTORE.md

當以下任何情況發生時，請立即建立它：
- 使用者表示想要發布擴充功能
- 使用者要求「為商店做準備」或「準備發布」
- 您正在開發一個很明顯最終會上架商店的新擴充功能
- 使用者詢問商店上架的相關要求

使用 `reference_tw/webstore/chromewebstore-template.md` 中的範本做為起點。在產生檔案之前，請先閱讀該範本。

#### 何時更新 CHROMEWEBSTORE.md

每當發生以下情況時請更新：
- **面向使用者的變更**：更新「最後更新」日期、更新說明中的功能清單，並在版本歷程記錄中新增一筆記錄。
- **manifest.json 變更**：如果權限（permissions）、主機權限（host_permissions）或內容腳本（content_scripts）有變更，請更新權限聲明部分 — 每個權限都需要審查團隊能夠理解的白話文理由。
- **新版本發布**：在版本歷程記錄中新增一筆記錄，包含版本號、日期與摘要。
- **隱私相關變更**：如果資料收集、儲存或傳輸方式有變更，請更新隱私與資料使用部分以及隱私權政策。
- **素材變更**：如果圖示或 UI 有所變更，請標註哪些螢幕截圖需要更新。
- **審查遭到拒絕的回應**：如果使用者回報 CWS 審查被拒，請在檔案中更新修正方式，並在版本歷程記錄中新增備註。

#### 如何填寫它

針對每個區段，從實際的專案檔案中擷取資訊：
1. 閱讀 `manifest.json` 以擷取名稱、版本、說明、權限、主機權限
2. 掃描程式碼庫以尋找資料收集（儲存空間、fetch 呼叫、分析數據）
3. 檢查圖示檔案及其維度
4. 查看擴充功能的 UI 以瞭解說明中所需要列出的功能

使用具體、誠實且以利益為導向的語氣撰寫商店呈現文案。Chrome 線上應用程式商店審查團隊會拒絕含糊的說明。像是「讓您的生活更輕鬆」這種寫法會被拒絕。「在任何網頁上反白標示搜尋結果，並可將反白內容儲存至本機列表」則會通過。

### CHROMEWEBSTORE.md 的區段

在產生檔案前請閱讀 `reference_tw/webstore/chromewebstore-template.md` — 它定義了每個區段的涵蓋範圍以及如何填寫。風險最高的區段是權限聲明：為每個權限和每個主機權限寫下具體的白話文理由。像是「擴充功能運作所需」會被拒絕。請閱讀 `reference_tw/webstore/privacy-policy.md` 以獲取產生隱私權政策的指引。

### 發布前檢查清單

在送審之前，請逐一檢查 `reference_tw/webstore/review-checklist.md`。首次送審最常失敗的原因：
- 每個權限和主機權限都必須有具體的理由（不可寫「運作所需」）
- 隱私權政策的網址必須是公開可連線的，且必須與資料使用聲明表單一致
- 至少需有 1 張 1280×800 或 640×400 的螢幕截圖
- ZIP 壓縮檔必須排除 `.git/`、`node_modules/`、`.env`、`CHROMEWEBSTORE.md`

### 商店上架文案指引

有關文案指引與常見被拒原因，請參閱 `reference_tw/webstore/store-listing.md`。關鍵規則：以功能面開頭（「在任何網頁上反白標示搜尋詞」），而非以感受面開頭（「再次享受搜尋的樂趣」）。

---

## 參考檔案

若要瞭解詳細的 API 模式與發布指引，請在撰寫程式碼或內容之前先閱讀相關檔案：

| 主題 | 參考文件 |
|-------|-----------|
| 側邊欄 | `reference_tw/extensions/side-panel.md` |
| 內容腳本與 DOM | `reference_tw/extensions/content-scripts.md` |
| 彈出式視窗 | `reference_tw/extensions/popup-ui.md` |
| Service Worker 生命週期 | `reference_tw/extensions/service-worker.md` |
| 程式碼執行與 CSP | `reference_tw/extensions/csp-sandbox.md` |
| API 呼叫 | `reference_tw/extensions/api-calling.md` |
| 宣告式網路請求 | `reference_tw/extensions/declarative-net-request.md` |
| Chrome Prompt API | `reference_tw/extensions/prompt-api.md` |
| DevTools 面板 | `reference_tw/extensions/devtools.md` |
| 身分驗證 | `reference_tw/extensions/auth-identity.md` |
| 快顯功能表 | `reference_tw/extensions/context-menus.md` |
| 網址列（Omnibox） | `reference_tw/extensions/omnibox.md` |
| 儲存空間 | `reference_tw/extensions/storage.md` |
| 頁籤與視窗管理 | `reference_tw/extensions/tab-management.md` |
| 頁籤/螢幕錄影 | `reference_tw/extensions/media-capture.md` |
| 訊息傳遞 | `reference_tw/extensions/message-passing.md` |
| 圖示 | `reference_tw/extensions/icons.md` |
| CHROMEWEBSTORE.md 範本 | `reference_tw/webstore/chromewebstore-template.md` |
| 隱私權政策指引 | `reference_tw/webstore/privacy-policy.md` |
| 發布前審查檢查清單 | `reference_tw/webstore/review-checklist.md` |
| 商店資訊技巧與退件原因 | `reference_tw/webstore/store-listing.md` |

## 產出檢查清單

在交付前，請驗證每一項：

- [ ] `manifest_version: 3` — 任何地方都不能有 V2 API
- [ ] manifest 中引用的所有圖示檔案都必須存在，且具有正確的尺寸 — 或省略圖示
- [ ] 側邊欄有明確的開啟觸發器（不能僅有 manifest 宣告）
- [ ] 程式碼執行使用 sandbox/blob/srcdoc — 在擴充功能頁面中不可使用 `eval()`
- [ ] 若有存取 `tab.url` 或 `tab.title`，需在 manifest 宣告 `tabs` 權限
- [ ] 所有程式碼皆使用 `async`/`await` — 不可有 `.then()` 鏈式呼叫
- [ ] 內容腳本使用 `requestAnimationFrame` 批次更新 DOM
- [ ] Service Worker 不要在全域變數中儲存任何狀態 — 使用 `chrome.storage`
- [ ] HTML 中不可有內聯腳本或事件處理常式
- [ ] 快顯功能表動作需顯示使用者確認
- [ ] 若使用 `chrome.action.*` API，需要在 manifest 中包含 `"action": {}`（或更多）
- [ ] 如果從側邊欄讀取或在頁籤中插入腳本：改用 `tabs` + `host_permissions`（不可用 `activeTab`）
- [ ] `chrome.devtools.panels.create()` 中的 DevTools 面板路徑必須相對於擴充功能根目錄
- [ ] 幕後網頁僅能使用 `chrome.runtime` 通訊 — 不可使用 `chrome.downloads`、`chrome.action` 等
- [ ] 在 `chrome.notifications`、`chrome.action.setIcon` 等處的所有影像引用均需指向真實檔案（或使用 data URL）
- [ ] 頁籤/螢幕錄影使用狀態鎖定以避免重複啟動錯誤
- [ ] `chrome.desktopCapture.chooseDesktopMedia` 傳遞 `targetTab` 且需宣告 `tabs` 權限
- [ ] `chrome.windows` 呼叫使用 `getAll`/`getLastFocused`/`getCurrent` — 切勿用 `.query()`（它並不存在）
- [ ] `sidePanel.setPanelBehavior` 使用 `openPanelOnActionClick` — 切勿使用 `openPanelOnActionIconClick`
- [ ] 在所有非同步操作上都有進行錯誤處理
- [ ] `host_permissions` 限制在特定的網域範圍（除非必要，否則不要使用 `<all_urls>`）
- [ ] 在具有非同步回應的 `onMessage` 接聽程式中返回 `return true`
