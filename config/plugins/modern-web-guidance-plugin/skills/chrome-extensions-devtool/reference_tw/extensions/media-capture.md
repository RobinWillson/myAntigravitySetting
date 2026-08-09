# 媒體擷取 (頁籤與螢幕錄影)

## 選擇正確的 API

| 需求 | API |
|------|-----|
| 錄製作用中頁籤的音訊/視訊 | `chrome.tabCapture.getMediaStreamId()` |
| 讓使用者選擇要擷取的螢幕、視窗或頁籤 | `chrome.desktopCapture.chooseDesktopMedia()` |

當您只需要擷取目前頁籤時，優先使用 `tabCapture` — 它不需要使用者的選擇對話框，且不需要 `"tabs"` 權限。僅在使用者必須自行選取要擷取的內容時，才使用 `desktopCapture`。

## 頁籤擷取

### 權限

```json
{ "permissions": ["tabCapture"] }
```

### 模式

`chrome.tabCapture.getMediaStreamId()` 在 **Service Worker** 中執行並傳回串流 ID。
實際的 `getUserMedia()` 呼叫必須發生在**幕後網頁 (Offscreen Document)** 中（因為 SW 無法直接存取媒體串流）。

```js
// service-worker.js
chrome.action.onClicked.addListener(async (tab) => {
  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
  // 將 ID 傳送給幕後網頁以呼叫 getUserMedia
  await chrome.runtime.sendMessage({ type: 'START_CAPTURE', streamId });
});

// offscreen.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'START_CAPTURE') return;
  (async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: msg.streamId } },
      video: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: msg.streamId } }
    });
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    // ... 處理錄影機事件
  })();
});
```

## 螢幕錄影 (Desktop Capture)

### 權限

```json
{ "permissions": ["tabs", "desktopCapture"] }
```

`"tabs"` 是**必要**的 — `chooseDesktopMedia` 需要傳遞一個 `url` 欄位已被填充的 `targetTab` 物件，這需要 `"tabs"` 權限。

### 模式

```js
// service-worker.js
chrome.action.onClicked.addListener(async (tab) => {
  // ❌ 錯誤做法 — 沒有傳遞 targetTab
  // chrome.desktopCapture.chooseDesktopMedia(['screen', 'window'], cb);

  // ✅ 正確做法 — 傳遞作用中的頁籤
  chrome.desktopCapture.chooseDesktopMedia(['screen', 'window', 'tab'], tab, (streamId) => {
    if (!streamId) return; // 使用者已取消
    // 將 streamId 傳送至幕後網頁以進行 getUserMedia
    chrome.runtime.sendMessage({ type: 'START_DESKTOP_CAPTURE', streamId });
  });
});
```

## 狀態鎖定 — 防範重複啟動錯誤

如果在上一次錄影仍處於活動狀態時呼叫，這兩個 API 都會失敗：
- `tabCapture`：拋出 `"Cannot capture a tab with an active stream"`
- `desktopCapture`：在第一個選擇對話框上方又開啟第二個

請使用儲存在 `chrome.storage.session` 中的狀態機（可在 Service Worker 重啟時保留，且在瀏覽器關閉時清除）：

```js
// 狀態機：'idle' → 'starting' → 'recording' → 'stopping' → 'idle'
chrome.action.onClicked.addListener(async (tab) => {
  const { recordingState = 'idle' } = await chrome.storage.session.get('recordingState');

  // 忽略過渡狀態下的點擊
  if (recordingState === 'starting' || recordingState === 'stopping') return;

  if (recordingState === 'idle') {
    await chrome.storage.session.set({ recordingState: 'starting' });
    try {
      await startRecording(tab);
      await chrome.storage.session.set({ recordingState: 'recording' });
      await chrome.action.setBadgeText({ text: 'REC' });
      await chrome.action.setBadgeBackgroundColor({ color: '#FF0000' });
    } catch (err) {
      console.error('開始錄製失敗：', err);
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

此相同模式適用於 `chrome.offscreen.createDocument`（一次僅允許建立一個幕後網頁）以及任何其他管理獨佔資源的 API。

## 儲存錄製內容

幕後網頁無法直接呼叫 `chrome.downloads` — 需將 blob 資料傳回給 Service Worker：

```js
// offscreen.js — 當錄影停止時
recorder.ondataavailable = (e) => chunks.push(e.data);
recorder.onstop = async () => {
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  // Service Worker 負責下載
  await chrome.runtime.sendMessage({ type: 'SAVE_RECORDING', url });
};

// service-worker.js
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type !== 'SAVE_RECORDING') return;
  chrome.downloads.download({ url: msg.url, filename: 'recording.webm' });
});
```

詳細的幕後網頁訊息傳遞模式請參閱 `reference_tw/extensions/message-passing.md`。
