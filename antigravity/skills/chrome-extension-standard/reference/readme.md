# Goal
- 我要對 chrome Extension 進行標準化架構定義, 並做出一個 SKILL, 
- 有別於一般網路上對 extension 的作法, 我有一套對 extension 的設計理念

# Extension 架構標準

```
├── manifest.json                    # MV3 配置宣告（極簡權限聲明）
├── readme.md                        # 專案任務與功能說明
├── libs/                            # 第三方工具庫本地備份（禁止引入外部 CDN）
├── src/
│   ├── background/
│   │   ├── background.js            # MV3 Service Worker (常為空檔或僅作生命週期監聽)
│   │   ├── /project1/
│   │   │   ├── dedicate_script_1_1.js   
│   │   │   └── dedicate_script_1_2.js   
│   │   └── /project2/
│   │        ├── dedicate_script_2_1.js   
│   │        └── dedicate_script_2_2.js   
│   ├── contentScripts/
│   │   └── contentScript.js         # [預留] 僅在必須隨頁面啟動載入的邏輯下使用
│   ├── popup/
│   │   ├── popup.html               # Popup 頁面結構
│   │   ├── popup.js                 # 監聽 Popup 按鈕並發起 script 注入與通訊
│   │   ├── css/                     # Popup 專用樣式
│   │   └── images/                  # 圖示資源
│   └── frontEnd/
│       ├── /project1/
│       │   ├── css/
│       │   │     ├── common.css
│       │   │     ├── frontEndPage1.css
│       │   │     └── frontEndPage2.css
│       │   ├── js/
│       │     ├── common.js
│       │     ├── frontEndPage1.js
│       │     └── frontEndPage2.js
│       │   ├── images/
│       │     ├── image1.png
│       │     └── image2.png
│       │   ├── frontEndPage1.html           
│       │   ├── frontEndPage2.html           
│       │   └── ...
│       ├── /project2/
│       │   ├── css/
│       │   ├── js/
│       │   ├── images/
│       │   ├── frontEndPage1.html           
│       │   ├── frontEndPage2.html           
│       │   └── ...
```

## contentScript.js
- contentScript 是設給在網頁讀取時自動執行的
- 我的設計概念是禁止在未知的狀態下對網頁進行任何動作
- 基本上不使用 contentScript, 預設空白內容

## background.js
- 基本上不使用 background.js, 預設空白內容
- 專案需建立一個自訂 folder 如 src/background/projectX/
- 所有的功能的 js file 必須建立在 projectX folder 內。
- 

## /frontEnd/js
- 即時(non-async)的 js function 寫在 frontEnd
- 讀寫 local storage or database 也寫在 frontEnd

## /background/projectX/file.js
- async 的 js function 寫在 background
- 需要 loop 的操作也寫在 background


# 關鍵技術實作範本 (Core Code Snippets)

### 1. frontEnd button 注入 Background Script 的做法
```javascript
// src/popup/popup.js
async function injectScraper() {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // 注入核心自動化腳本
  chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    files: ['/src/background/some_action.js']
  });
}
```
