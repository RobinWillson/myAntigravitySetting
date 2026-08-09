# 宣告式網路請求 (內容過濾)

## 設定

```json
{
  "permissions": ["declarativeNetRequest"],
  "declarative_net_request": {
    "rule_resources": [{
      "id": "ruleset_1",
      "enabled": true,
      "path": "rules/rules.json"
    }]
  }
}
```

新增 `"declarativeNetRequestFeedback"` 權限可以使用 `onRuleMatchedDebug`（僅限開發環境）。

## 規則格式

`rules/rules.json`：
```json
[
  {
    "id": 1,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
      "urlFilter": "doubleclick.net",
      "resourceTypes": ["script", "image", "xmlhttprequest", "sub_frame"]
    }
  },
  {
    "id": 2,
    "priority": 1,
    "action": { "type": "block" },
    "condition": {
      "urlFilter": "google-analytics.com",
      "resourceTypes": ["script", "xmlhttprequest"]
    }
  }
]
```

### 規則欄位

- `id`：每條規則唯一的整數
- `priority`：當規則發生衝突時，優先級較高的規則獲勝
- `action.type`：`"block"`, `"redirect"`, `"allow"`, `"modifyHeaders"`, `"allowAllRequests"`, `"upgradeScheme"`
- `condition.urlFilter`：模式比對（支援 `*`, `||`, `|`, `^`）
- `condition.resourceTypes`：要比對的資源類型陣列

### URL 過濾模式

| 模式 | 比對對象 |
|---------|---------|
| `"doubleclick.net"` | 任何包含 "doubleclick.net" 的 URL |
| `"||doubleclick.net"` | 網域以 doubleclick.net 開頭 |
| `"||example.com/ads/*"` | 特定的路徑模式 |
| `*://*.tracking.com/*` | 子網域比對 |

### 資源類型 (Resource Types)

`main_frame`, `sub_frame`, `stylesheet`, `script`, `image`, `font`, `object`, `xmlhttprequest`,
`ping`, `csp_report`, `media`, `websocket`, `webtransport`, `webbundle`, `other`

## 動態規則 (執行階段)

```js
// 在執行階段新增規則
await chrome.declarativeNetRequest.updateDynamicRules({
  addRules: [{
    id: 1000,
    priority: 1,
    action: { type: 'block' },
    condition: { urlFilter: 'ads.example.com' }
  }],
  removeRuleIds: [] // 要移除的 ID 列表
});
```

## 追蹤遭阻擋的請求

`onRuleMatchedDebug` 僅在開發環境（未打包）下運作，且需要 `"declarativeNetRequestFeedback"` 權限：

```js
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  // info.request, info.rule
});
```

在生產環境中，請透過 `webRequest` 進行統計（僅供觀察），或利用 `webNavigation` 來維持統計次數：

```js
// 替代方案：使用 webRequest 進行觀察（需要宣告 host_permissions）
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // 統計指向已知追蹤網域的請求
    if (isTrackerDomain(new URL(details.url).hostname)) {
      incrementBlockCount(details.tabId);
    }
  },
  { urls: ["<all_urls>"] }
);
```

## 限制

- 靜態規則：每個擴充功能保證可使用 30,000 條，另外還可以從所有擴充功能共用的規則池中額外申請最多 300,000 條規則
- 動態規則：30,000 條
- 工作階段規則 (Session rules)：5,000 條
