# Fastify Chrome Native Messaging 服務

這是一個基於 Fastify 的 TypeScript 專案，用於與 Chrome 擴充功能進行原生通訊（Native Messaging）。

## 功能特性

- 透過 Chrome Native Messaging 協定與 Chrome 擴充功能進行雙向通訊
- **支援多瀏覽器**: Chrome 和 Chromium (包括 Linux、macOS 和 Windows)
- 提供 RESTful API 服務
- 完全使用 TypeScript 開發
- 包含完整的測試套件
- 遵循程式碼品質最佳實踐

## 開發環境設定

### 前置條件

- Node.js 20+
- npm 8+ 或 pnpm 8+

### 安裝

```bash
git clone https://github.com/your-username/fastify-chrome-native.git
cd fastify-chrome-native
npm install
```

### 開發

1. 本地建置並註冊 native server

```bash
cd app/native-server
npm run dev
```

2. 啟動 chrome extension

```bash
cd app/chrome-extension
npm run dev
```

### 建置

```bash
npm run build
```

### 註冊 Native Messaging 主機

#### 自動偵測並註冊所有已安裝的瀏覽器

```bash
mcp-chrome-bridge register --detect
```

#### 註冊特定瀏覽器

```bash
# 僅註冊 Chrome
mcp-chrome-bridge register --browser chrome

# 僅註冊 Chromium
mcp-chrome-bridge register --browser chromium

# 註冊所有支援的瀏覽器
mcp-chrome-bridge register --browser all
```

#### 全域安裝（會自動註冊偵測到的瀏覽器）

```bash
npm i -g mcp-chrome-bridge
```

#### 瀏覽器支援

| 瀏覽器        | Linux | macOS | Windows |
| ------------- | ----- | ----- | ------- |
| Google Chrome | ✓     | ✓     | ✓       |
| Chromium      | ✓     | ✓     | ✓       |

註冊位置：

- **Linux**: `~/.config/[browser-name]/NativeMessagingHosts/`
- **macOS**: `~/Library/Application Support/[Browser]/NativeMessagingHosts/`
- **Windows**: `%APPDATA%\[Browser]\NativeMessagingHosts\`

### 與 Chrome 擴充功能整合

以下是 Chrome 擴充功能中如何使用此服務的簡單範例：

```javascript
// background.js
let nativePort = null;
let serverRunning = false;

// 啟動 Native Messaging 服務
function startServer() {
  if (nativePort) {
    console.log('已連線到 Native Messaging 主機');
    return;
  }

  try {
    nativePort = chrome.runtime.connectNative('com.yourcompany.fastify_native_host');

    nativePort.onMessage.addListener((message) => {
      console.log('收到 Native 訊息:', message);

      if (message.type === 'started') {
        serverRunning = true;
        console.log(`服務已啟動，連接埠: ${message.payload.port}`);
      } else if (message.type === 'stopped') {
        serverRunning = false;
        console.log('服務已停止');
      } else if (message.type === 'error') {
        console.error('Native 錯誤:', message.payload.message);
      }
    });

    nativePort.onDisconnect.addListener(() => {
      console.log('Native 連線斷開:', chrome.runtime.lastError);
      nativePort = null;
      serverRunning = false;
    });

    // 啟動伺服器
    nativePort.postMessage({ type: 'start', payload: { port: 3000 } });
  } catch (error) {
    console.error('啟動 Native Messaging 時出錯:', error);
  }
}

// 停止伺服器
function stopServer() {
  if (nativePort && serverRunning) {
    nativePort.postMessage({ type: 'stop' });
  }
}

// 測試與伺服器的通訊
async function testPing() {
  try {
    const response = await fetch('http://localhost:3000/ping');
    const data = await response.json();
    console.log('Ping 回應:', data);
    return data;
  } catch (error) {
    console.error('Ping 失敗:', error);
    return null;
  }
}

// 在擴充功能啟動時連線 Native 主機
chrome.runtime.onStartup.addListener(startServer);

// 匯出供 popup 或內容指令碼使用的 API
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startServer') {
    startServer();
    sendResponse({ success: true });
  } else if (message.action === 'stopServer') {
    stopServer();
    sendResponse({ success: true });
  } else if (message.action === 'testPing') {
    testPing().then(sendResponse);
    return true; // 指示我們將非同步傳送回應
  }
});
```

### 測試

```bash
npm run test
```

### 授權條款

MIT
