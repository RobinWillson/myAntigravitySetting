# Chrome Prompt API (LanguageModel) — 擴充功能專用指南

`LanguageModel` API (Prompt API) 可以在所有擴充功能環境中運作 — 包含 Service Worker、彈出式視窗、側邊欄以及其他的擴充功能網頁 — 且不需要宣告額外的 manifest 權限。

關於 Prompt API 的一般用法（可用性檢查、工作階段建立、序列串流、工作階段管理），請參閱 `modern-web-guidance` 技能。

## 已棄用的命名空間

曾使用過 Origin Trial（來源試用）的擴充功能可能仍在使用舊的 API 介面。請將其移除並更新：

```js
// ❌ 舊做法 — 已棄用
const session = await self.ai.languageModel.create();

// ✅ 新做法 (Chrome 138+)
const session = await LanguageModel.create({ ... });
```

同時也請從 manifest.json 中移除已過期的權限：
```json
"permissions": ["aiLanguageModelOriginTrial"]  // ❌ 移除此項
```

## 擴充功能專屬：`LanguageModel.params()`

擴充功能可存取 `LanguageModel.params()`，這會傳回在一般網頁端無法取得的模型限制參數：

```js
const params = await LanguageModel.params();
// { defaultTopK: 3, maxTopK: 128, defaultTemperature: 1, maxTemperature: 2 }

const session = await LanguageModel.create({
  temperature: 0.7,
  topK: 5
});
```

## 完整擴充功能範例：網頁摘要工具

這是一個整合了 manifest、Service Worker 以及側邊欄的完整串接範例。
注意，此處使用的是 `tabs` + `host_permissions` 而非 `activeTab` — 因為點擊側邊欄按鈕並**不會**啟用 `activeTab`（請參閱規則 12）。

### manifest.json
```json
{
  "manifest_version": 3,
  "name": "AI 網頁摘要工具",
  "version": "1.0",
  "permissions": ["sidePanel", "tabs", "scripting"],
  "host_permissions": ["<all_urls>"],
  "background": { "service_worker": "service-worker.js" },
  "side_panel": { "default_path": "sidepanel/sidepanel.html" },
  "action": { "default_title": "摘要此網頁" }
}
```

### service-worker.js
```js
chrome.action.onClicked.addListener(async (tab) => {
  await chrome.sidePanel.open({ windowId: tab.windowId });
});
```

### sidepanel/sidepanel.js
```js
const statusEl = document.getElementById('status');
const summaryEl = document.getElementById('summary');

document.getElementById('summarize').addEventListener('click', async () => {
  if (!globalThis.LanguageModel) {
    statusEl.textContent = '此瀏覽器不支援 Prompt API。';
    return;
  }

  const availability = await LanguageModel.availability({
    expectedInputs: [{ type: "text", languages: ["en"] }],
    expectedOutputs: [{ type: "text", languages: ["en"] }]
  });
  if (availability === 'unavailable') {
    statusEl.textContent = '此裝置上無法使用 AI 模型。';
    return;
  }

  // 需要 "tabs" + "host_permissions" 權限 — activeTab 在點擊側邊欄按鈕時無法作用
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result: pageText }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const body = document.body.cloneNode(true);
      body.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());
      return body.innerText.substring(0, 4000);
    }
  });

  const session = await LanguageModel.create({
    expectedInputs: [{ type: "text", languages: ["en"] }],
    expectedOutputs: [{ type: "text", languages: ["en"] }],
    initialPrompts: [{ role: 'system', content: '使用 3-5 個項目符號摘要網頁內容。' }],
    monitor(m) {
      m.addEventListener('downloadprogress', (e) => {
        const pct = e.total ? Math.floor((e.loaded / e.total) * 100) : 0;
        statusEl.textContent = `模型下載中：${pct}%`;
      });
    }
  });

  summaryEl.textContent = '';
  for await (const chunk of session.promptStreaming(`摘要以下內容：\n\n${pageText}`)) {
    summaryEl.textContent += chunk; // 附加（APPEND）— 不要直接覆蓋
  }
  session.destroy();
});
```
