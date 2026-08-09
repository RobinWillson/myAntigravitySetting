# 網址列 (Omnibox) 整合

## 設定

```json
{
  "omnibox": { "keyword": "wiki" }
}
```

使用者在網址列輸入 `wiki` + 空白鍵即可啟用。

## 提供建議選項 (Suggestions)

```js
chrome.omnibox.onInputChanged.addListener(async (text, suggest) => {
  if (text.length < 2) return;

  try {
    const response = await fetch(
      `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(text)}&limit=5&format=json`
    );
    const [, titles, , urls] = await response.json();

    const suggestions = titles.map((title, i) => ({
      content: urls[i],
      description: `${title} - <url>${urls[i]}</url>`
    }));

    suggest(suggestions);
  } catch (err) {
    console.error('搜尋失敗：', err);
  }
});
```

## 處理選取動作

```js
chrome.omnibox.onInputEntered.addListener((text, disposition) => {
  const url = text.startsWith('http') ? text
    : `https://en.wikipedia.org/wiki/${encodeURIComponent(text)}`;

  switch (disposition) {
    case 'currentTab':
      chrome.tabs.update({ url });
      break;
    case 'newForegroundTab':
      chrome.tabs.create({ url });
      break;
    case 'newBackgroundTab':
      chrome.tabs.create({ url, active: false });
      break;
  }
});
```

## 說明欄的格式設定 (Description Formatting)

建議選項的說明支援類似 XML 的格式設定：
- `<url>文字</url>` — 呈現為 URL 樣式
- `<match>文字</match>` — 粗體反白比對到的字詞
- `<dim>文字</dim>` — 變灰/次要文字

## 預設建議選項

```js
chrome.omnibox.onInputChanged.addListener((text, suggest) => {
  chrome.omnibox.setDefaultSuggestion({
    description: `在維基百科中搜尋「<match>${text}</match>」`
  });
  // ... 獲取資料並提供建議選項
});
```

## 必要的主機權限 (host_permissions)

如果需要從 API 獲取建議選項，請在 manifest 中宣告：
```json
{
  "host_permissions": ["https://en.wikipedia.org/*"]
}
```
