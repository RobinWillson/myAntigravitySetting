# 使用 chrome.identity 進行身分驗證

## 設定

```json
{
  "permissions": ["identity"],
  "oauth2": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  }
}
```

## 取得 OAuth 權杖（Token）

```js
async function signIn() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(token);
      }
    });
  });
}
```

或者使用以 Promise 為基礎的 API (Chrome 116+)：
```js
const { token } = await chrome.identity.getAuthToken({ interactive: true });
```

## 擷取使用者個人資料

```js
async function getUserProfile(token) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('無法擷取個人資料');
  return response.json();
  // 傳回：{ sub, name, given_name, family_name, picture, email, email_verified }
}
```

## 登出

```js
async function signOut(token) {
  // 移除快取的權杖
  await chrome.identity.removeCachedAuthToken({ token });

  // （選用）在伺服器端撤銷權杖
  await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`);
}
```

## 錯誤處理

```js
try {
  const { token } = await chrome.identity.getAuthToken({ interactive: true });
  const profile = await getUserProfile(token);
  displayProfile(profile);
} catch (err) {
  if (err.message.includes('canceled')) {
    showMessage('登入已被取消');
  } else if (err.message.includes('not granted')) {
    showMessage('權限被拒絕');
  } else {
    showMessage('登入失敗：' + err.message);
  }
}
```

## 設定 Google Cloud Console

1. 前往 console.cloud.google.com
2. 建立專案（或選取現有專案）
3. 啟用 "Google People API" 或 "Google OAuth2 API"
4. 建立 OAuth 2.0 憑證 → 選擇「Chrome 擴充功能（Chrome Extension）」類型
5. 將應用程式 ID（Application ID）設定為您的擴充功能 ID
6. 將 client_id 複製到您的 manifest.json

### 擴充功能 ID：開發環境 vs 生產環境

**這點至關重要且常被忽略。** OAuth `client_id` 是與特定的擴充功能 ID 綁定的。
擴充功能 ID 會根據您載入擴充功能的方式而改變：

| 環境 | ID 的決定方式 |
|---------|---------------------|
| 未打包（開發中） | 衍生自擴充功能的資料夾路徑 — 如果移動資料夾，ID 就會改變 |
| 已打包（.crx） | 衍生自打包時使用的私鑰 |
| Chrome 線上應用程式商店 | 由商店分配，永久不變 |

**為了在開發期間取得穩定的 ID**，請在 manifest.json 中新增一個 `"key"` 欄位。
這可確保無論資料夾路徑如何變化，ID 都能保持不變：

1. 打包擴充功能一次（`chrome://extensions` → 打包擴充功能）
2. 將產生的 `.crx` 檔案當作 ZIP 開啟，並從其 manifest 中擷取 `key` 內容
3. 將該 key 新增到您的開發 manifest 中：

```json
{
  "key": "MIIBIjANBgkqhk...您的公鑰放在這裡...",
  "manifest_version": 3,
  "name": "My Extension"
}
```

或者，也可以記下 `chrome://extensions` 中未打包擴充功能的 ID，並針對該特定 ID 設定 OAuth 用戶端。但請注意，一旦資料夾移動，該 ID 就會改變。

**務必提醒使用者：**「將擴充功能發布至 Chrome 線上應用程式商店後，請使用商店分配的擴充功能 ID 更新您的 OAuth 用戶端設定。」

## 非 Google OAuth（launchWebAuthFlow）

對於第三方 OAuth 供應商（例如 GitHub、Twitter 等）：

```js
const redirectUrl = chrome.identity.getRedirectURL();
// 傳回：https://<extension-id>.chromiumapp.org/

const authUrl = `https://github.com/login/oauth/authorize?client_id=XXX&redirect_uri=${redirectUrl}`;

const responseUrl = await chrome.identity.launchWebAuthFlow({
  url: authUrl,
  interactive: true
});

// 從 responseUrl 中解析權杖
const url = new URL(responseUrl);
const code = url.searchParams.get('code');
```
