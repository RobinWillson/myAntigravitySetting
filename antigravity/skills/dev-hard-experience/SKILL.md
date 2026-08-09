---
name: dev-hard-experience
description: "開發困難點與除錯經驗庫。在開發中遇到連續三次無法解決的問題時，紀錄現象、環境、嘗試失敗做法與最終有效解決方案，以便日後遭遇類似問題時直接檢索與套用。"
---

# Dev Hard Experience (開發困難經驗庫)

本技能用於記錄與檢索在專案開發過程中遇到的高難度 Bug、跨領域技術坑以及經過反覆驗證的最終解決方案。

  ## 觸發條件與呼叫方式

  * 觸發關鍵字：`紀錄困難點`、`查看困難`、`開發困難`、`參考困難文檔`
  * 斜線指令：`/hard dev`、`/dev hard`
  * 呼叫後將主動詢問使用者欲執行的動作：
    - 紀錄困難：將目前解決的重大疑難雜症整理入經驗庫
    - 搜尋困難：搜尋已記錄的歷史開發難題與解決方案

---

## 已記錄困難現象索引

  * Next.js 15 + Firebase OAuth Popup 認證後無法自動重定向與視窗白屏
    - 現象：點擊 Google 登入後，視窗呈現白色一片或認證完成自動關閉後依然停留在 `/login` 頁面，需手動按 F5 重新整理才進入 Dashboard
    - 詳細文件：[nextjs-firebase-auth-coop-redirect.md](file:///Users/<username>/.gemini/antigravity/skills/dev-hard-experience/references/nextjs-firebase-auth-coop-redirect.md)
