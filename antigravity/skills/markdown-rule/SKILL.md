---
name: markdown-rule
description: "建立或修改 markdown 文件時觸發。嚴禁 agent 在 markdown 內寫入 api-key, 帳號密碼, 本機絕對路徑。"
---

# Markdown Rule (Markdown 寫入與修改安全規範)
此技能在建立、寫入或修改任何 Markdown 文件（`.md` 檔案）時觸發。其核心宗旨是防止敏感資訊外洩與保護本機環境隱私。

  ## 🛡️ 嚴格禁止寫入的內容 (Strictly Prohibited Contents)

  當您建立或修改 Markdown 檔案時，**絕對禁止**在檔案內寫入以下三類資訊：

    ### API 金鑰與密鑰 (API Keys & Secrets)

    * 任何平台或服務的 API 金鑰（例如：Google Gemini API key, OpenAI API key, Anthropic API key, AWS Access Key, GitHub Token 等）。
    * 任何看起來像金鑰或加密憑證的亂數字串（例如以 `AIzaSy` 開頭的字串）。
    * 替代方案：如果必須說明設定方式，請使用預留佔位符（如 `YOUR_API_KEY` 或 `<API_KEY>`）。

    ### 帳號密碼與登入憑證 (Credentials & Passwords)
    
    * 任何系統、資料庫或服務的帳號與密碼組合。
    * 任何含有密碼的連接字串（例如：`mongodb://username:password@host`）。
    * 替代方案：請使用佔位符（如 `YOUR_PASSWORD` 或 `<PASSWORD>`）。

    ### 本機絕對路徑的個人資訊 (Local Absolute Paths Personal Information)
    
    * 優先使用相對於專案或工作區根目錄的相對路徑（如：`./docs/readme.md`），
    * 如必要使用絕對路徑，請排除個人化資訊，
    * 在 windows 寫成 `C:\Users\<username>`
    * 在 mac 寫成 `/Users/<username>`

  ---

  ## 🛠️ 執行與檢查流程 (Execution & Verification Flow)

   在執行任何會寫入或修改 Markdown 檔案的工具（如 `write_to_file`、`replace_file_content`、`multi_replace_file_content`）之前，請務必執行以下步驟：

   * 內容審查 (Content Scan)：
      - 仔細檢查即將寫入的內容，確認是否包含本機絕對路徑（特別注意 `C:\Users\9910008` 或 `c:\`）。
      - 檢查是否無意中夾帶了 API 金鑰（如暫存的測試金鑰）或明文帳號密碼。

   * 禁止自動替換 (Auto-Sanitization)：
      - 不可擅自將所有檢測到的敏感內容，自動替換為對應的相對路徑或通用佔位符
      - 請先詢問使用者是否同意替換

# Markdown 通用格式要求

* 這裡規範一般 markdown 文件格式
* 如有範本, 請以範本為主
* markdown 寫作請以 .md 檔容易閱讀為主要要求, Html 渲染後的結果為次要考量

  ## Header 規範

  * 優先使用 `#` 符號開頭, 每個 `#` 後方空一格
  * 文字與 `#` 之間不要有空格
  * "H1" & "H2" 不做縮排
  * "H3" 以後的階層使用2個空白縮排
  * 範例:
    ```markdown
    # header 1
    ## header 2
      ### header 3
      #### header 4
      ##### header 5
    ```
  * 嚴禁使用 Bold 標記作為標題, 以下範例為錯誤示範
    ```markdown
    ## **header**
    1. **header**
    * **header**
    ```
 
  ## Icon 規範

  * 僅在 `# H1` 第一階層可使用 icon, 其他階層禁止, 避免過度使用
  * 優先使用 emoji 表達

  ## Description 結構

  * 接續在 Header 下方的文字稱之為 Description
  * 少於兩句話的情況才使用 Description, 否則應使用 List
  * 請勿空一行, 直接接續在 Header 下方
  * 範例:
    ```markdown
    # Markdown 通用格式要求
    這裡規範一般 markdown 文件格式
    如有範本, 請以範本為主
    ```

  ## List 說明

  * 在一般文字描述時, 優先使用List表達, 
  * 每個斷句都作為一個 list, 每個 List 字數小於100字
  * 優先使用星號`*`而非數字`1.`建立列表
  * 避免在清單中使用 bold 標記強調
  * 如 list 在 header 下方, 請空一行, 與上一階層的 header 對齊, 無需縮排
  * 範例:
    ```markdown
    ## Header 2
    
    * description-1
    * description-2
    * ...

      ### Header 3

      * sub-list-1
      * sub-list-2
      * ...
    ```
  
  ## sub-List 說明
  
  * sub-list 為 `*` list 的下一層
  * 優先使用 `-` 建立 sub-list
  * 視情況可使用數字`1.`建立 sub-list
  * sub-list 前方無空行, 直接接續在 `*` list 下方
  * 必須使用2個空白縮排
  * 範例:
    ```markdown
    * list-1
      - sub-list-1
      - sub-list-2
    ```

  ## List 架構說明

  * 每一個 `*` list 底下不超過兩層的 sub-list, 
  * 如超過兩層請重構語句, 產生一個新的 `*` List
  * 當說明一個流程, 是一連串的動作, 沒有選擇性的選項時, 則不應使用 sub-list
    - 錯誤示範 :
    ```markdown
    * 當使用者輸入 `更新 [技能名稱] 技能`、`skill gate 更新 [技能名稱] skill` 等指定特定技能的指令時：
      - 直接執行掃描腳本並限定該技能名稱，例如：`node scripts/scan-gate-skills.js --mode quick --only [技能名稱]`
      - 這會強制將指定的技能作為唯一的變更項目寫入 cache-task.json 檔案
    ```
    - 正確範例 :  
    ```markdown
    * 當使用者輸入 `更新 [技能名稱] 技能`、`skill gate 更新 [技能名稱] skill` 等指定特定技能的指令時：
    * 直接執行掃描腳本並限定該技能名稱，例如：`node scripts/scan-gate-skills.js --mode quick --only [技能名稱]`
    * 這會強制將指定的技能作為唯一的變更項目寫入 cache-task.json 檔案
    ```
  * 當一個 list 包含 sub-list 超過 4 行, 則下一個 list 需要空行
  * 範例:
    ```markdown
    * list-1
    * list-2
      - sub-list-2.1
      - sub-list-2.2
    * list-3
      - sub-list-3.1
      - sub-list-3.2
      - sub-list-3.3

    * list-4
    * list-5
    ```

  ## Table 說明
  
  * 儘量不要使用 table, 用 list 替代