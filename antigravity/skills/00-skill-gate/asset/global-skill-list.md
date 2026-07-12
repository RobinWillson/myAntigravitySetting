# Global Skills & MCPs

---

## mcp-chrome
[mcp-chrome](C:/Users/9910008/.gemini/antigravity/skills/mcp-chrome/SKILL.md)

* [功能簡介]:
  - 使用您的日常 Chrome 瀏覽器進行自動化操作與調試。
  - 保留使用者的登入狀態與配置，避免無痕視窗帶來的困擾。
* [User_Note]
  - 設定於 mcp_config.json 之中。
  - 用以替代原本 Graves/chrome-devtools。
* [觸發條件]:
  - "任何意圖執行 Chrome 瀏覽器相關的任務（如開啟網頁、點擊、輸入等）時。"

## gstack
[gstack](C:/Users/9910008/.gemini/antigravity/skills/gstack/SKILL.md)

* [功能簡介]:
  - GStack 虛擬工程團隊與 Playwright 瀏覽器測試工具。
  - 提供角色斜線指令（如 /office-hours, /plan-ceo-review, /review, /qa, /ship 等）。
  - 提供 headless 瀏覽器功能進行 E2E/QA 驗證。
* [User_Note]
  - 很複雜的 Skill, 還沒測試過
  - 文件中似乎也說了要安裝很多依賴, 有用到的時候再研究
* [觸發條件]:
  - "/office-hours"
  - "/plan-ceo-review"
  - "/plan-eng-review"
  - "/review"
  - "/qa"
  - "/ship"

## skill-creator
[skill-creator](C:/Users/9910008/.gemini/antigravity/skills/skill-creator/SKILL.md)

* [功能簡介]:
  - 建立新技能、修改與優化既有技能，並評估技能效能。
  - 適用於從頭建立技能、編輯或調整技能、執行評測、基準測試，或優化技能的觸發描述。
* [User_Note]
  - 任何建立技能的動作發生時, 務必觸發
* [觸發條件]:
  - "/skill-test"
  - "/skill-create"

## 00-skill-gate
[00-skill-gate](C:/Users/9910008/.gemini/antigravity/skills/00-skill-gate/SKILL.md)

* [功能簡介]:
  - 在所有對話的最開始執行。引導使用者選擇工具
  - 將其與所有已安裝的全局和專案技能/MCP 進行比對，判斷是否有適用的工具，並列出選項供使用者選擇。
  - 同時具有工具清單整理的功能
* [User_Note]
* [觸發條件]:
  - "/00-skill-gate"
  - "/gate"
  - "/skill-gate"

## chrome-devtools
[chrome-devtools](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md)

* [功能簡介]:
  - 使用 Chrome 開發者工具進行高效調試、故障排除與瀏覽器自動化。
  - 用於調試網頁、自動化網頁交互、效能分析或網絡請求審查。
* [User_Note]
  - 停用
  - 它永遠會開一個無痕視窗, 會導致登入狀態遺失
  - 以 MCP Chrome 替代
* [觸發條件]:
  - "需要執行自動化瀏覽器操作、網頁調試、前端效能分析或網路請求審查時。"

### a11y-debugging
[a11y-debugging](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/SKILL.md)

* [功能簡介]:
  - 使用 Chrome 開發者工具進行無障礙網頁（a11y）調試與審查。
  - 基於 web.dev 規範，用於測試語意化 HTML、ARIA 標籤、焦點狀態、鍵盤導航、色彩對比度。
* [User_Note]

* [觸發條件]:
  - "當需要測試或調試語意化 HTML、ARIA 標籤、焦點狀態、鍵盤導航、點擊目標大小（tap targets）或色彩對比度，進行無障礙網頁（a11y）審查時。"

### chrome-devtools-plugin
[chrome-devtools-plugin](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/plugin.json)

* [功能簡介]:
  - 使用 Chrome 開發者工具與 Puppeteer 實現 Chrome 瀏覽器的可靠自動化、深度調試與效能分析。
* [User_Note]
  - 停用
  - 無痕視窗的使用情況太少, 幾乎用不到, MCP Chrome 即可替代 
* [觸發條件]:
  - "調用 Chrome DevTools/Puppeteer 來自動化瀏覽器操作、深入調試網頁或分析效能時。"

### debug-optimize-lcp
[debug-optimize-lcp](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/debug-optimize-lcp/SKILL.md)

* [功能簡介]:
  - 使用 Chrome 開發者工具診斷與優化最大內容繪製（LCP）指標。
  - 用於分析網頁加載速度、核心網頁指標優化，或調試英雄圖/主內容加載緩慢原因。
* [User_Note]

* [觸發條件]:
  - "當涉及 LCP（最大內容繪製）效能優化、網頁載入速度慢、核心網頁指標（CWV）優化，或需要診斷首頁主內容/英雄圖載入緩慢原因時。"

### memory-leak-debugging
[memory-leak-debugging](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/memory-leak-debugging/SKILL.md)

* [功能簡介]:
  - 診斷與解決 JavaScript/Node.js 應用程式中的記憶體流失。
  - 用於記憶體佔用過高、記憶體溢出（OOM）錯誤分析、堆積快照（heap snapshot）比對。
* [User_Note]

* [觸發條件]:
  - "診斷 JavaScript/Node.js 應用程式的高記憶體佔用、溢出（OOM）錯誤，或使用堆積快照（heap snapshots）分析記憶體流失時。"

### troubleshooting
[troubleshooting](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/troubleshooting/SKILL.md)

* [功能簡介]:
  - 使用 Chrome 開發者工具調試與解決連線或目標問題。
  - 在 list_pages、new_page 或導航失敗時觸發。
* [User_Note]

* [觸發條件]:
  - "當 `list_pages`、`new_page`、`navigate_page` 失敗，或者 Chrome DevTools MCP 伺服器啟動/連線異常時時。"

## android-cli-plugin
[android-cli-plugin](C:/Users/9910008/.gemini/config/plugins/android-cli-plugin/plugin.json)

* [功能簡介]:
  - Android 開發所需的核心命令行工具與開發知識庫。
* [User_Note]

* [觸發條件]:
  - "當需要建立、編譯、部署 Android 專案，管理 Android SDK，或執行環境診斷與 `android` 命令行工具操作時。"

## chrome-extensions-devtool
[chrome-extensions-devtool](chrome-extensions-devtool/SKILL)

* [功能簡介]:
  - 基於 Manifest V3 最佳實踐的 Chrome 瀏覽器擴充功能開發指南。
  - 適用於開發、修改或調試 Content Scripts、Service Workers、Popup、Side Panel。
* [User_Note]

* [觸發條件]:
  - "建立、修改、調試或理解 Chrome 瀏覽器擴充功能（Chrome Extension）或 Chrome Extensions API 時。"
  - "當提及 'Chrome extension'、'browser extension'、'manifest.json'、'content script'、'service worker'、'popup'、'side panel'、'chrome.* API' 或發佈至 Chrome Web Store 等關鍵字時。"

## find-skills
[find-skills](C:/Users/9910008/.gemini/antigravity/skills/find-skills/SKILL.md)

* [功能簡介]:
  - 協助使用者發現與安裝 Agent 技能。
  - 當提出諸如「如何做 X」、「尋找 X 技能」、「是否有能做...的技能」時，使用此技能以尋找安裝選項。
* [User_Note]
  - 在此寫下您對 find-skills 的補充說明。
* [觸發條件]:
  - "當使用者提出「如何做 X」、「尋找 X 技能」、「是否有能做...的技能」以尋找或安裝 Agent 技能時。"

## firebase
[firebase](C:/Users/9910008/.gemini/config/plugins/firebase/plugin.json)

* [功能簡介]:
  - 提供 Firebase 命令行配置、數據庫管理與託管部署的 MCP 核心外掛。
* [User_Note]

* [觸發條件]:
  - "需要使用 Firebase 命令行工具（CLI）來設定、初始化、登入、管理 Firebase 專案，或是使用 Firebase 部署與資料庫指令時。"

### firebase-ai-logic-basics
[firebase-ai-logic-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_ai_logic_basics/SKILL.md)

* [功能簡介]:
  - 整合 Firebase AI Logic (Gemini API) 的官方技能。
  - 涵蓋設定、多模態推理、結構化輸出與安全性規範。
* [User_Note]

* [觸發條件]:
  - "需要將 Firebase AI Logic（Gemini API）整合到 Web 應用程式中，涉及設定、多模態推理、結構化輸出或安全規則時。"

### firebase-app-hosting-basics
[firebase-app-hosting-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_app_hosting_basics/SKILL.md)

* [功能簡介]:
  - 部署與管理採用 Firebase App Hosting 的 Web 應用程式。
  - 適用於部署 Next.js/Angular 等帶有後端的網頁專案。
* [User_Note]

* [觸發條件]:
  - "需要使用 Firebase App Hosting 部署與管理 Next.js、Angular 等帶有後端的現代 Web 應用程式時。"

### firebase-auth-basics
[firebase-auth-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_auth_basics/SKILL.md)

* [功能簡介]:
  - Firebase 身分驗證（Firebase Authentication）的設定與使用指引。
  - 適用於登入系統、用戶管理或搭配安全規則的安全數據存取。
* [User_Note]

* [觸發條件]:
  - "應用程式需要設定 Firebase Authentication 進行用戶登入、用戶管理，或使用驗證規則（auth rules）進行安全數據存取時。"

### firebase-basics
[firebase-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_basics/SKILL.md)

* [功能簡介]:
  - 提供 Firebase CLI 的基礎設定、身分驗證與專案管理工作流。
  - 適用於初始化 Firebase 環境、專案綁定與設定 google-services 檔案。
* [User_Note]

* [觸發條件]:
  - "檢查 Firebase CLI 版本、初始化 Firebase 環境、登入驗證、設定作用中專案，或配置 google-services.json、GoogleService-Info.plist 檔案時。"

### firebase-crashlytics
[firebase-crashlytics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_crashlytics/SKILL.md)

* [功能簡介]:
  - Firebase 崩潰分析（Firebase Crashlytics）的佈署與 SDK 使用指南。
  - 用於整合崩潰回報與分析應用程式異常。
* [User_Note]

* [觸發條件]:
  - "設定 Firebase Crashlytics、整合崩潰回報 SDK 或分析 iOS/Android 應用程式的異常崩潰報告時。"

### firebase-data-connect
[firebase-data-connect](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_data_connect_basics/SKILL.md)

* [功能簡介]:
  - 使用 PostgreSQL 安全地構建與部署 Firebase SQL Connect。
  - 用於設計關聯式資料庫結構、撰寫查詢與變更、配置即時同步與型別安全 SDK。
* [User_Note]

* [觸發條件]:
  - "設計 Firebase Data Connect (SQL Connect) 的 PostgreSQL 關聯式資料庫綱要、撰寫授權的 GraphQL 查詢與變更，或生成型別安全 SDK 時。"

### firebase-firestore
[firebase-firestore](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_firestore/SKILL.md)

* [功能簡介]:
  - 設定、管理並查詢 Cloud Firestore 數據庫。
  - 凡涉及 Cloud Firestore 數據庫的使用、安全規則配置或資料模型設計，必須無條件使用此技能。
* [User_Note]

* [觸發條件]:
  - "列出或建立 Cloud Firestore 數據庫、配置 Firestore 安全規則、設計資料模型、撰寫客戶端 SDK 查詢或檢查索引時。"

### firebase-hosting-basics
[firebase-hosting-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_hosting_basics/SKILL.md)

* [功能簡介]:
  - Firebase 經典託管（Hosting）的配置指南。
  - 適用於託管靜態網頁、單頁應用（SPA）或輕量微服務。
* [User_Note]

* [觸發條件]:
  - "部署靜態網頁、單頁應用程式（SPA），或使用經典的 Firebase Hosting 部署輕量微服務時。"

### firebase-remote-config-basics
[firebase-remote-config-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_remote_config_basics/SKILL.md)

* [功能簡介]:
  - Firebase 遠端配置（Remote Config）的模版管理與 SDK 使用手冊。
  - 用於動態變更應用程式行為與管理功能開關（Feature Flags）。
* [User_Note]

* [觸發條件]:
  - "設定 Firebase Remote Config、管理 Feature Flags（功能開關），或動態變更應用程式行為時。"

### firebase-security-rules-auditor
[firebase-security-rules-auditor](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_security_rules_auditor/SKILL.md)

* [功能簡介]:
  - 評估 Firestore 安全規則安全性的專屬技能。
  - 更新安全規則時，必須使用此技能以確保無安全漏洞。
* [User_Note]

* [觸發條件]:
  - "更新、審查或評估 Cloud Firestore 安全規則的安全性以防止漏洞時。"

### xcode-project-setup
[xcode-project-setup](C:/Users/9910008/.gemini/config/plugins/firebase/skills/xcode_project_setup/SKILL.md)

* [功能簡介]:
  - 安全修改 Xcode 專案結構（.pbxproj）。
  - 用於添加 Swift 套件依賴、連結檔案（如導入 Firebase、Alamofire 等）。
* [User_Note]

* [觸發條件]:
  - "修改 Xcode 專案結構、添加 Swift Packages 依賴或連結專案檔案（如導入 Firebase、Alamofire 等）時。"

## gog
[gog](C:/Users/9910008/.gemini/antigravity/skills/gog/SKILL.md)

* [功能簡介]:
  - 使用 gog 命令行工具管理 Google Workspace 服務（Gmail, Calendar, Drive, Contacts, Sheets, Docs）。
  - 能發送或搜尋郵件、管理行事曆行程、查詢或更新試算表、匯出 Google 文件。
* [User_Note]
  - Windows 桌面環境下，若已登入，Windows 憑證管理員會自動處理憑證解密，一般免去設定 GOG_KEYRING_PASSWORD 環境變數。
* [觸發條件]:
  - "需要存取、搜尋、發送 Gmail 郵件，或管理日曆行程時。"
  - "需要讀寫 Google Sheets 試算表或讀取 Google Docs 文件時。"
  - "涉及任何 Google Workspace 服務自動化操作時。"

## google-antigravity-sdk
[google-antigravity-sdk](C:/Users/9910008/.gemini/config/plugins/google-antigravity-sdk/skills/google-antigravity-sdk/SKILL.md)

* [功能簡介]:
  - 設計、實作並調試自主 AI Agent 與多 Agent 系統 of 官方 SDK 指引。
  - 在需要創建或編排 Antigravity Agent 時使用。
* [User_Note]

* [觸發條件]:
  - "使用 Google Antigravity (AGY) SDK 設計、實作、配置或編排多 Agent 與自主 AI 代理系統時。"

## markdown-rule
[markdown-rule](C:/Users/9910008/.gemini/antigravity/skills/markdown-rule/SKILL.md)

* [功能簡介]:
  - 在建立或修改任何 Markdown 文件時執行。
  - 嚴格禁止在 Markdown 內寫入 API 金鑰（API Key）、帳號密碼，以及本機絕對路徑，確保資訊安全。
* [User_Note]

* [觸發條件]:
  - "在任何建立、寫入或修改 Markdown 檔案（如 .md 檔案）時觸發。"

## modern-web-guidance
[modern-web-guidance](C:/Users/9910008/.gemini/config/plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md)

* [功能簡介]:
  - 現代前端開發最佳實踐搜尋與優化指南。
  - 涉及 UI/佈局（如彈窗、玻璃擬態）、滾動與動畫、前端效能（INP）、瀏覽器 API（如文件系統、WebUSB）時優先使用。
* [User_Note]

* [觸發條件]:
  - "涉及現代前端 UI 佈局（彈窗、玻璃擬態、錨點定位）、滾動與動畫、前端效能（INP/LCP）、瀏覽器 API（文件系統存取、WebUSB、WebAssembly）或框架佈局整合時。"

## modern-web-guidance-plugin
[modern-web-guidance-plugin](C:/Users/9910008/.gemini/config/plugins/modern-web-guidance-plugin/plugin.json)

* [功能簡介]:
  - 專為現代前端網頁開發設計 of Agent 技能精選集合外掛。
* [User_Note]

* [觸發條件]:
  - "需要調用現代前端最佳實踐外掛的相關功能時。"

## safe-searcher
[safe-searcher](C:/Users/9910008/.gemini/antigravity/skills/safe-searcher/SKILL.md)

* [功能簡介]:
  - 專職於程式碼檢索的子代理（Sub-Agent），以防禦性、高效能的方式安全地檢索程式碼。
* [User_Note]

* [觸發條件]:
  - "當主 Agent 需要在專案中搜尋 function、類別、檔案或進行關鍵字搜尋（grep/ripgrep）時。"

## skill-security-scan
[skill-security-scan](C:/Users/9910008/.gemini/antigravity/skills/skill-security-scan/SKILL.md)

* [功能簡介]:
  - 掃描與檢驗其他 Agent 技能的安全風險（例如網絡請求、任意指令執行、文件系統存取）。
  - 適用於審查、檢查或验证本機或第三方技能的安全性。
* [User_Note]
  - "當使用 npm 或其它第三方工具拉取網路上的 Skill Package 安裝之後自動執行。"
* [觸發條件]:
  - "當使用者要求對本地或第三方 Skill 進行安全審查、靜態安全掃描或驗證安全性時。"

## vs-markdown-collab
[vs-markdown-collab](C:/Users/9910008/.gemini/antigravity/skills/vs-markdown-collab/SKILL.md)

* [功能簡介]:
  - 協助進行 Markdown 文件與程式碼的協同編輯、格式化、自動摘要與語法修正。
* [User_Note]

* [觸發條件]:
  - "當使用者要求處理、回應、採納 Markdown 文件的審查意見（review comments），或要求您對 Markdown 文件進行審查、留下審查意見時。"
