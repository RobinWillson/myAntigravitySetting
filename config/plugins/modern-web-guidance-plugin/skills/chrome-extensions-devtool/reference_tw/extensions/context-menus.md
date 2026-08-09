# 快顯功能表（Context Menus）

## 設定

```json
{ "permissions": ["contextMenus"] }
```

## 建立功能表

在 Service Worker 中建立，通常是在 `onInstalled` 中（功能表會持續存在，但重複建立具有等冪性，即不會重複建立）：

```js
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-link',
    title: '儲存至閱讀清單',
    contexts: ['link']        // 僅在右鍵點擊連結時顯示
  });

  chrome.contextMenus.create({
    id: 'translate-selection',
    title: '翻譯「%s」',   // %s = 選取的文字
    contexts: ['selection']
  });
});
```

## 處理點擊事件

```js
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'save-link':
      saveLink(info.linkUrl, info.selectionText || info.linkUrl);
      break;
    case 'translate-selection':
      translateText(info.selectionText, tab.id);
      break;
  }
});
```

## 上下文類型（Context Types）

`all`, `page`, `frame`, `selection`, `link`, `editable`, `image`, `video`, `audio`, `launcher`, `browser_action`, `action`

## 子功能表

```js
chrome.contextMenus.create({ id: 'parent', title: '我的擴充功能', contexts: ['page'] });
chrome.contextMenus.create({ id: 'child1', parentId: 'parent', title: '選項 1', contexts: ['page'] });
chrome.contextMenus.create({ id: 'child2', parentId: 'parent', title: '選項 2', contexts: ['page'] });
```

## 動態更新

```js
chrome.contextMenus.update('save-link', { title: '新標題' });
chrome.contextMenus.remove('save-link');
chrome.contextMenus.removeAll();
```
