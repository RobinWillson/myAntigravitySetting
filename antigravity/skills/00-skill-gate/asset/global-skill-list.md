# Global Skills & MCPs

---

## 00-skill-gate
* [00-skill-gate](C:/Users/9910008/.gemini/antigravity/skills/00-skill-gate/SKILL.md)
* 功能簡介:
  - 在所有對話的最開始執行。引導使用者選擇工具
  - 將其與所有已安裝的全局和專案技能/MCP 進行比對，判斷是否有適用的工具，並列出選項供使用者選擇。
  - 同時具有工具清單整理的功能
* 觸發條件:
  - "/00-skill-gate"
  - "/00"

## find-skills
* [find-skills](C:/Users/9910008/.gemini/antigravity/skills/find-skills/SKILL.md)
* 功能簡介:
  - 協助使用者發現與安裝 Agent 技能。
  - 當提出諸如「如何做 X」、「尋找 X 技能」、「是否有能做...的技能」時，使用此技能以尋找安裝選項。
* 觸發條件:
  - "依照意圖匹配觸發"

## gstack
* [gstack](C:/Users/9910008/.gemini/antigravity/skills/gstack/SKILL.md)
* 功能簡介:
  - GStack 虛擬工程團隊與 Playwright 瀏覽器測試工具。
  - 提供角色斜線指令（如 /office-hours, /plan-ceo-review, /review, /qa, /ship 等）。
  - 提供 headless 瀏覽器功能進行 E2E/QA 驗證。
* 觸發條件:
  - "/office-hours"
  - "/plan-ceo-review"
  - "/plan-eng-review"
  - "/review"
  - "/qa"
  - "/ship"

## skill-creator
* [skill-creator](C:/Users/9910008/.gemini/antigravity/skills/skill-creator/SKILL.md)
* 功能簡介:
  - 建立新技能、修改與優化既有技能，並評估技能效能。
  - 適用於從頭建立技能、編輯或調整技能、執行評測、基準測試，或優化技能的觸發描述。
* 觸發條件:
  - "/skill-test"

## skill-manager
* [skill-manager](C:/Users/9910008/.gemini/antigravity/skills/skill-manager/SKILL.md)
* 功能簡介:
  - 管理所有本機安裝的 Antigravity Agent 技能與工作流。
  - 提供 /skill-manager 指令進行目錄掃描與清單列表呈現。
* 觸發條件:
  - "/ship"
  - "/qa"
  - "/slash"

## skill-security-scan
* [skill-security-scan](C:/Users/9910008/.gemini/antigravity/skills/skill-security-scan/SKILL.md)
* 功能簡介:
  - 掃描與檢驗其他 Agent 技能的安全風險（例如網絡請求、任意指令執行、文件系統存取）。
  - 適用於審查、檢查或驗證本機或第三方技能的安全性。
* 觸發條件:
  - "依照意圖匹配觸發"

## a11y-debugging
* [a11y-debugging](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/a11y-debugging/SKILL.md)
* 功能簡介:
  - 使用 Chrome 開發者工具進行無障礙網頁（a11y）調試與審查。
  - 基於 web.dev 規範，用於測試語意化 HTML、ARIA 標籤、焦點狀態、鍵盤導航、色彩對比度。
* 觸發條件:
  - "依照意圖匹配觸發"

## chrome-devtools
* [chrome-devtools](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/chrome-devtools/SKILL.md)
* 功能簡介:
  - 使用 Chrome 開發者工具進行高效調試、故障排除與瀏覽器自動化。
  - 用於調試網頁、自動化網頁交互、效能分析或網絡請求審查。
* 觸發條件:
  - "依照意圖匹配觸發"

## debug-optimize-lcp
* [debug-optimize-lcp](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/debug-optimize-lcp/SKILL.md)
* 功能簡介:
  - 使用 Chrome 開發者工具診斷與優化最大內容繪製（LCP）指標。
  - 用於分析網頁加載速度、核心網頁指標優化，或調試英雄圖/主內容加載緩慢原因。
* 觸發條件:
  - "依照意圖匹配觸發"

## memory-leak-debugging
* [memory-leak-debugging](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/memory-leak-debugging/SKILL.md)
* 功能簡介:
  - 診斷與解決 JavaScript/Node.js 應用程式中的記憶體流失。
  - 用於記憶體佔用過高、記憶體溢出（OOM）錯誤分析、堆積快照（heap snapshot）比對。
* 觸發條件:
  - "依照意圖匹配觸發"

## troubleshooting
* [troubleshooting](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/skills/troubleshooting/SKILL.md)
* 功能簡介:
  - 使用 Chrome 開發者工具調試與解決連線或目標問題。
  - 在 list_pages、new_page 或導航失敗時觸發。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-ai-logic-basics
* [firebase-ai-logic-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_ai_logic_basics/SKILL.md)
* 功能簡介:
  - 整合 Firebase AI Logic (Gemini API) 的官方技能。
  - 涵蓋設定、多模態推理、結構化輸出與安全性規範。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-app-hosting-basics
* [firebase-app-hosting-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_app_hosting_basics/SKILL.md)
* 功能簡介:
  - 部署與管理採用 Firebase App Hosting 的 Web 應用程式。
  - 適用於部署 Next.js/Angular 等帶有後端的網頁專案。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-auth-basics
* [firebase-auth-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_auth_basics/SKILL.md)
* 功能簡介:
  - Firebase 身分驗證（Firebase Authentication）的設定與使用指引。
  - 適用於登入系統、用戶管理或搭配安全規則的安全數據存取。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-basics
* [firebase-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_basics/SKILL.md)
* 功能簡介:
  - 提供 Firebase CLI 的基礎設定、身分驗證與專案管理工作流。
  - 適用於初始化 Firebase 環境、專案綁定與設定 google-services 檔案。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-crashlytics
* [firebase-crashlytics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_crashlytics/SKILL.md)
* 功能簡介:
  - Firebase 崩潰分析（Firebase Crashlytics）的佈署與 SDK 使用指南。
  - 用於整合崩潰回報與分析應用程式異常。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-data-connect
* [firebase-data-connect](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_data_connect_basics/SKILL.md)
* 功能簡介:
  - 使用 PostgreSQL 安全地構建與部署 Firebase SQL Connect。
  - 用於設計關聯式資料庫結構、撰寫查詢與變更、配置即時同步與型別安全 SDK。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-firestore
* [firebase-firestore](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_firestore/SKILL.md)
* 功能簡介:
  - 設定、管理並查詢 Cloud Firestore 數據庫。
  - 凡涉及 Cloud Firestore 數據庫的使用、安全規則配置或資料模型設計，必須無條件使用此技能。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-hosting-basics
* [firebase-hosting-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_hosting_basics/SKILL.md)
* 功能簡介:
  - Firebase 經典託管（Hosting）的配置指南。
  - 適用於託管靜態網頁、單頁應用（SPA）或輕量微服務。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-remote-config-basics
* [firebase-remote-config-basics](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_remote_config_basics/SKILL.md)
* 功能簡介:
  - Firebase 遠端配置（Remote Config）的模版管理與 SDK 使用手冊。
  - 用於動態變更應用程式行為與管理功能開關（Feature Flags）。
* 觸發條件:
  - "依照意圖匹配觸發"

## firebase-security-rules-auditor
* [firebase-security-rules-auditor](C:/Users/9910008/.gemini/config/plugins/firebase/skills/firebase_security_rules_auditor/SKILL.md)
* 功能簡介:
  - 評估 Firestore 安全規則安全性的專屬技能。
  - 更新安全規則時，必須使用此技能以確保無安全漏洞。
* 觸發條件:
  - "依照意圖匹配觸發"

## xcode-project-setup
* [xcode-project-setup](C:/Users/9910008/.gemini/config/plugins/firebase/skills/xcode_project_setup/SKILL.md)
* 功能簡介:
  - 安全修改 Xcode 專案結構（.pbxproj）。
  - 用於添加 Swift 套件依賴、連結檔案（如導入 Firebase、Alamofire 等）。
* 觸發條件:
  - "依照意圖匹配觸發"

## google-antigravity-sdk
* [google-antigravity-sdk](C:/Users/9910008/.gemini/config/plugins/google-antigravity-sdk/skills/google-antigravity-sdk/SKILL.md)
* 功能簡介:
  - 設計、實作並調試自主 AI Agent 與多 Agent 系統的官方 SDK 指引。
  - 在需要創建或編排 Antigravity Agent 時使用。
* 觸發條件:
  - "依照意圖匹配觸發"

## chrome-extensions
* [chrome-extensions](C:/Users/9910008/.gemini/config/plugins/modern-web-guidance-plugin/skills/chrome-extensions/SKILL.md)
* 功能簡介:
  - 基於 Manifest V3 最佳實踐的 Chrome 瀏覽器擴充功能開發指南。
  - 適用於開發、修改或調試 Content Scripts、Service Workers、Popup、Side Panel。
* 觸發條件:
  - "依照意圖匹配觸發"

## modern-web-guidance
* [modern-web-guidance](C:/Users/9910008/.gemini/config/plugins/modern-web-guidance-plugin/skills/modern-web-guidance/SKILL.md)
* 功能簡介:
  - 現代前端開發最佳實踐搜尋與優化指南。
  - 涉及 UI/佈局（如彈窗、玻璃擬態）、滾動與動畫、前端效能（INP）、瀏覽器 API（如文件系統、WebUSB）時優先使用。
* 觸發條件:
  - "依照意圖匹配觸發"

## android-cli-plugin
* [android-cli-plugin](C:/Users/9910008/.gemini/config/plugins/android-cli-plugin/plugin.json)
* 功能簡介:
  - Android 開發所需的核心命令行工具與開發知識庫。
* 觸發條件:
  - "藉由呼叫 MCP 工具或 API 執行"

## chrome-devtools-plugin
* [chrome-devtools-plugin](C:/Users/9910008/.gemini/config/plugins/chrome-devtools-plugin/plugin.json)
* 功能簡介:
  - 使用 Chrome 開發者工具與 Puppeteer 實現 Chrome 瀏覽器的可靠自動化、深度調試與效能分析。
* 觸發條件:
  - "藉由呼叫 MCP 工具或 API 執行"

## firebase
* [firebase](C:/Users/9910008/.gemini/config/plugins/firebase/plugin.json)
* 功能簡介:
  - 提供 Firebase 命令行配置、數據庫管理與託管部署的 MCP 核心外掛。
* 觸發條件:
  - "藉由呼叫 MCP 工具或 API 執行"

## modern-web-guidance-plugin
* [modern-web-guidance-plugin](C:/Users/9910008/.gemini/config/plugins/modern-web-guidance-plugin/plugin.json)
* 功能簡介:
  - 專為現代前端網頁開發設計的 Agent 技能精選集合外掛。
* 觸發條件:
  - "藉由呼叫 MCP 工具或 API 執行"

