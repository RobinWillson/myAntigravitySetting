# CSP 與沙盒化程式碼執行

## 擴充功能 CSP 限制

Chrome 擴充功能強制執行嚴格的內容安全政策（Content Security Policy），且擴充功能頁面（包含彈出式視窗、側邊欄、設定頁、新分頁等）的 CSP 無法被放寬。

預設阻擋的項目：
- `eval()`, `new Function()`, `setTimeout("字串程式碼")`
- 內聯 `<script>` 標籤
- 內聯事件處理常式（例如 `onclick="..."`, `onload="..."` 等）
- `javascript:` 網址

## HTML 最佳實踐

```html
<!-- ❌ 錯誤做法：內聯腳本 -->
<script>
  document.getElementById('btn').onclick = () => alert('hi');
</script>

<!-- ❌ 錯誤做法：內聯事件處理常式 -->
<button onclick="doThing()">Click</button>

<!-- ✅ 正確做法：外部腳本檔案 -->
<script src="popup.js"></script>
```

 In `popup.js`:
```js
document.getElementById('btn').addEventListener('click', () => {
  // 處理點擊事件
});
```

## 執行使用者程式碼（程式碼遊樂場模式）

如果您需要執行任意程式碼（例如類似 CodePen 的遊樂場），您必須使用以下方法之一。**擴充功能的 CSP 在一般的擴充功能頁面中會完全阻擋 `eval()`、`new Function()` 以及內聯腳本。** 這是沒有捷徑的 — 您必須使用沙盒（Sandboxing）。

### 選項 1：在 Manifest 中設定沙盒網頁（推薦）

在 manifest.json 中宣告沙盒網頁。沙盒網頁具有較寬鬆的 CSP，允許 `eval()` 和內聯腳本，但它們無法存取任何 chrome.* API。

```json
{
  "sandbox": {
    "pages": ["sandbox.html"]
  }
}
```

在您的擴充功能頁面中使用 iframe 來嵌入此沙盒：

```html
<!-- playground.html (擴充功能頁面) -->
<iframe id="preview" src="sandbox.html"></iframe>
```

**至關重要：** 擴充功能頁面與沙盒化 iframe 之間的通訊必須使用 `postMessage`。您**無法**直接存取 `iframe.contentDocument` 或 `iframe.contentWindow.document` — 這會拋出以下錯誤：

```
SecurityError: Blocked a frame with origin "chrome-extension://..." from accessing a cross-origin frame.
```

正確模式：

```js
// playground.js — 將程式碼傳送給沙盒
const iframe = document.getElementById('preview');
iframe.contentWindow.postMessage({
  html: htmlCode,
  css: cssCode,
  js: jsCode
}, '*');

// sandbox.js — 接收並執行
window.addEventListener('message', (event) => {
  const { html, css, js } = event.data;
  // 清除先前的內容
  document.body.innerHTML = '';
  document.head.querySelectorAll('style.user-style').forEach(s => s.remove());

  // 套用 HTML
  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  // 套用 CSS
  const style = document.createElement('style');
  style.className = 'user-style';
  style.textContent = css;
  document.head.appendChild(style);

  // 執行 JS（在沙盒中是允許使用 eval 的！）
  try {
    eval(js);
  } catch (e) {
    const errEl = document.createElement('pre');
    errEl.style.color = 'red';
    errEl.textContent = e.message;
    document.body.appendChild(errEl);
  }
});
```

### 選項 2：在 iframe 中使用 Blob URL

透過 Blob URL 建立一個獨立的 HTML 文件：

```js
function updatePreview(htmlCode, cssCode, jsCode) {
  const html = `
<!DOCTYPE html>
<html>
<head><style>${cssCode}</style></head>
<body>
  ${htmlCode}
  <script>${jsCode}<\/script>
</body>
</html>
`;
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const iframe = document.getElementById('preview');
  // 撤銷先前的 URL
  if (iframe.dataset.blobUrl) URL.revokeObjectURL(iframe.dataset.blobUrl);
  iframe.dataset.blobUrl = url;
  iframe.src = url;
}
```

### 選項 3：使用 srcdoc 屬性

```js
const iframe = document.getElementById('preview');
iframe.srcdoc = `
  <!DOCTYPE html>
  <style>${cssCode}</style>
  ${htmlCode}
  <script>${jsCode}<\/script>
`;
```

Blob URL 和 srcdoc 都會建立一個獨立的來源（Origin），因此它們會繞過擴充功能的 CSP。
然而，它們同樣無法存取 chrome.* API，且您無法直接從擴充功能頁面存取它們的 DOM（與沙盒具有相同的跨來源限制）。

### 不應該做的事

```js
// ❌ 會失敗：試圖直接設定 iframe 的內容
iframe.contentDocument.open();
iframe.contentDocument.write(html);
iframe.contentDocument.close();

// ❌ 會失敗：存取跨來源沙盒的 DOM
const doc = iframe.contentWindow.document;
doc.body.innerHTML = html;

// ❌ 會失敗：在一般的擴充功能頁面中使用 eval
eval(userCode); // CSP 會阻擋此操作
```

## 遠端資源的 CSP

擴充功能頁面預設無法載入遠端腳本。如果您需要使用外部程式庫：

1. **打包（Bundle）它們** — 下載並將其包含在您的擴充功能中
2. **使用 chrome.scripting 插入到網頁中** — 網頁具有其自身的 CSP

對於插入到網頁中的內容腳本，網頁本身的 CSP 並不適用於內容腳本自身的程式碼。內容腳本是在隔離世界中執行的。
