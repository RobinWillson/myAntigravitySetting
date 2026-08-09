# Chrome Storage (儲存空間) API

## 儲存區域

| 儲存區域 | 瀏覽器重啟後保留 | 跨裝置同步 | 容量配額 | 主要用途 |
|------|----------|-------|-------|---------|
| `chrome.storage.local` | 是 | 否 | 10 MB | 大部分擴充功能資料 |
| `chrome.storage.sync` | 是 | 是 | 總共 100 KB，每項 8 KB | 使用者偏好設定、小量設定資料 |
| `chrome.storage.session` | 否（關閉瀏覽器時清除） | 否 | 10 MB | 臨時狀態，可在 SW 重啟時保留 |

需要宣告的權限：`"storage"`

## 基本操作

```js
// 寫入資料
await chrome.storage.local.set({ key: 'value', count: 42, items: [1,2,3] });

// 讀取資料 (可帶有預設值)
const { key = 'default', count = 0 } = await chrome.storage.local.get(['key', 'count']);

// 讀取所有資料
const allData = await chrome.storage.local.get(null);

// 刪除資料
await chrome.storage.local.remove('key');
await chrome.storage.local.remove(['key1', 'key2']);

// 清除所有資料
await chrome.storage.local.clear();
```

## 變更監聽器（適用於所有擴充功能環境）

```js
chrome.storage.onChanged.addListener((changes, areaName) => {
  for (const [key, { oldValue, newValue }] of Object.entries(changes)) {
    console.log(`${areaName}.${key}：${oldValue} → ${newValue}`);
  }
});
```

## storage.sync 的限制配額

使用 sync 同步功能時請注意限制：
- `QUOTA_BYTES_PER_ITEM`：每個鍵值對最高為 8,192 位元組
- `MAX_ITEMS`：最多 512 個項目
- `QUOTA_BYTES`：總計最大 102,400 位元組
- `MAX_WRITE_OPERATIONS_PER_HOUR`：每小時最多 1,800 次寫入
- `MAX_WRITE_OPERATIONS_PER_MINUTE`：每分鐘最多 120 次寫入

對於較大的資料，請將其拆分存放在多個鍵值中，或者改用 `chrome.storage.local`。

## storage.session 提示

- 僅在 MV3 (Manifest V3) 中可用
- 在整個瀏覽器關閉時清除（不單只是在 SW 終止時）
- 可在 Service Worker、彈出式視窗、側邊欄等處存取
- 適用於：身分驗證權杖（Tokens）、臨時快取、進行中的操作狀態

## 為什麼不用 localStorage？

`localStorage` 雖然可在彈出式視窗和擴充功能網頁中運作，但**無法**在 Service Worker 中使用。
而 `chrome.storage` 可以在所有環境中運作，且支援跨環境的變更監聽器（onChanged）。
因此，請一律優先選用 `chrome.storage`。
