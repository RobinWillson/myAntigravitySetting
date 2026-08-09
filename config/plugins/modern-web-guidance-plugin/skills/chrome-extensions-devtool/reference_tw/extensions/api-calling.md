# 從擴充功能中呼叫外部 API

## 權限

通常情況下，擴充功能所發出的 fetch 請求會遵循一般的 CORS 規則。

要確定這樣是否足夠，可以使用 `curl` 並帶有測試來源（Origin）來呼叫 API。例如：

```
curl -H "Origin: https://example.com" -I https://api.openweathermap.org/data/2.5/weather?q=London&appid=KEY`
```

如果回應中包含 `*` 或將 `https://example.com` 做為 `Access-Control-Allow-Origin` 標頭的值，則代表該 API 支援 CORS。

如果 API 不支援 CORS，則需要請求主機權限（Host Permissions）以繞過這些限制：

```json
{
  "host_permissions": [
    "https://no-cors-api.example.com/*"
  ]
}
```

**切勿僅為了 API 呼叫而使用 `<all_urls>`。** 請將範圍限制在特定的 API 網域。

## 在何處進行 API 呼叫

API 呼叫可在任何擴充功能環境中運作（Service Worker、彈出式視窗、側邊欄、內容腳本）：

```js
// 從彈出式視窗或 Service Worker 發出
const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=London&appid=KEY');
const data = await response.json();
```

**內容腳本（Content scripts）** 也可以發出 fetch 呼叫，但它們會遵循該網頁的 CORS 規則。

## 錯誤處理模式

```js
async function callAPI(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      // 網路錯誤（離線、DNS 失敗等）
      console.error('網路錯誤：', err.message);
    } else {
      console.error('API 錯誤：', err.message);
    }
    return null;
  }
}
```

## API 金鑰

- 切勿在發布的擴充功能中寫死（Hardcode）API 金鑰
- 對於使用者自行提供的金鑰，請使用 `chrome.storage.local` 儲存
- 對於您自己的後端，請使用 `chrome.identity` 進行身分驗證，而非嵌入金鑰
- 清楚標示預留位置金鑰：`const API_KEY = 'YOUR_API_KEY_HERE';`

## Service Worker 考量事項

如果從 Service Worker 進行 API 呼叫，請記得它可能會隨時終止。對於長時間輪詢（Long-polling）或 webhook 樣式的模式，請使用 `chrome.offscreen` 建立一個保持運作的幕後網頁，或者使用 `chrome.alarms` 進行定期輪詢。
