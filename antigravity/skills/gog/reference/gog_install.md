# gog (Google Workspace CLI) 詳細安裝與設定指南

`gog` 是由 OpenClaw 社群開發的 Google Workspace 命令行工具（CLI）。它能讓您的 AI Agent（如 Gemini IDE、OpenClaw 等）或本地指令碼直接讀寫 Gmail、Google Calendar、Google Drive、Google Sheets、Google Docs 等服務。

本指南專為 **Windows** 使用者設計，說明如何從零開始安裝、設定 Google Cloud 憑證並完成本地授權。

---

## 🛠️ 前置作業與安裝步驟

整個安裝設定流程分為三大階段：
1. **下載與安裝 gog 主程式**
2. **在 Google Cloud 申請 API 憑證 (client_secret.json)**
3. **在本地終端機完成授權與測試**

---

## 📅 第一階段：下載與安裝 gog 主程式

由於 `gog` 是 Go 語言編譯的獨立執行檔（Binary），您不需要安裝複雜的依賴庫，只需下載並設定路徑即可：

1. **下載執行檔**：
   * 前往 [gogcli GitHub Releases](https://github.com/openclaw/gogcli/releases)。
   * 下載適合 Windows 的壓縮檔，例如：`gogcli_x.y.z_windows_amd64.zip`（請選擇最新版本）。
2. **解壓縮**：
   * 將下載的 ZIP 檔解壓縮，您會得到一個名為 `gog.exe` 的檔案。
3. **放置與設定環境變數 PATH**：
   * 在您的電腦上建立一個固定資料夾，例如 `C:\Tools\gog\`，並將 `gog.exe` 移入。
   * 將該路徑（如 `C:\Tools\gog\`）加入到 Windows 的 **系統環境變數 `Path`** 中。
     > **💡 如何加入 Path？**
     > 1. 按下 `Win + S` 輸入「編輯系統環境變數」並開啟。
     > 2. 點擊「環境變數」按鈕。
     > 3. 在「系統變數」或「使用者變數」中找到 `Path`，點選「編輯」。
     > 4. 點擊「新增」，輸入 `C:\Tools\gog\`（或您存放 `gog.exe` 的路徑），最後一路按「確定」存檔。
4. **驗證安裝**：
   * 開啟一個新的 PowerShell 或 CMD 視窗，輸入：
     ```powershell
     gog version
     ```
   * 如果能正確顯示版本號，代表安裝成功！

---

## 🔑 第二階段：申請 Google Cloud API 憑證 (OAuth)

為確保資料安全性，`gog` 必須使用您專屬的 Google Cloud 憑證來存取您的 Google 服務。

1. **建立專案**：
   * 登入 [Google Cloud Console](https://console.cloud.google.com/)。
   * 在左上角專案下拉選單中，點選「新增專案」，輸入專案名稱（例如 `My-Workspace-CLI`），點擊「建立」。
2. **啟用相關 API**：
   * 在主選單中選擇 **「API 和服務」 > 「庫 (Library)」**。
   * 搜尋並**啟用**您需要用到的服務 API：
     * `Gmail API`
     * `Google Calendar API`
     * `Google Drive API`
     * `Google Sheets API`
     * `Google Docs API`
     * `People API` (用於 Contacts 聯絡人)
3. **設定 OAuth 同意畫面**：
   * 在左側選單中，選擇 **「OAuth 同意畫面 (OAuth Consent Screen)」**。
   * 使用者類型選擇 **「外部 (External)」**（如果您的帳號是一般 Gmail），點擊「建立」。
   * **填寫基本資訊**：
     * 應用程式名稱：`gog-cli`
     * 使用者支援電子郵件：填寫您的 Gmail 帳號
     * 開發聯絡人資訊：填寫您的 Gmail 帳號
   * 點選「儲存並繼續」，其餘範圍（Scopes）先保持預設。
   * **加入測試使用者 (Test Users)**：
     * **[重要]** 在「測試使用者」步驟中，點選「Add Users」，**輸入您準備要讓 gog 存取的 Gmail 帳號**。如果不加，後續授權會失敗。
   * 點選「儲存並繼續」，回到資訊主頁。
4. **建立憑證並下載 JSON**：
   * 在左側選單選擇 **「憑證 (Credentials)」**。
   * 點擊上方 **「+ 建立憑證」**，選擇 **「OAuth 用戶端 ID (OAuth client ID)」**。
   * 應用程式類型選擇 **「桌面應用程式 (Desktop App)」**，名稱可設定為 `gog-desktop`，點選「建立」。
   * 建立完成後，在彈出視窗或憑證列表中，點選該用戶端右側的 **「下載 JSON」** 按鈕（向下箭頭）。
   * 將下載的 JSON 檔案儲存至安全的目錄，並重新命名為 `client_secret.json`。

---

## 🔐 第三階段：在本地進行帳號授權

現在，您將使用剛剛下載的憑證來讓 `gog` 連接您的 Google 帳號。

1. **載入 Google 憑證**：
   * 開啟 PowerShell 視窗，執行以下指令（請將路徑替換成您存放 JSON 的實際路徑）：
     ```powershell
     gog auth credentials "C:\path\to\your\client_secret.json"
     ```
2. **新增並授權 Google 帳號**：
   * 執行以下指令開始授權流程：
     ```powershell
     gog auth add 您的帳號@gmail.com --services gmail,calendar,drive,contacts,docs,sheets
     ```
   * 終端機會顯示一個連結，並**自動開啟您的預設瀏覽器**。
   * 在瀏覽器中選擇剛才設定的 Gmail 帳號。
   * **若看到「Google 尚未驗證此應用程式」的警告畫面，請點選「進階」->「前往 gog-cli (安全)」繼續。**
   * 點選「允許」授予相關權限。
   * 授權完成後，網頁會顯示 `Success!`。您可以關閉網頁回到終端機。

3. **檢查授權列表**：
   * 輸入以下指令確認您的帳號已成功加入：
     ```powershell
     gog auth list
     ```

---

## ⚙️ 系統環境變數設定 (建議)

為了讓您（以及 AI Agent）在使用時免去繁瑣的輸入，建議在 Windows 設定以下環境變數：

1. **`GOG_KEYRING_PASSWORD`** (必填)：
   * `gog` 在儲存授權 Token 時會使用系統 Keyring 進行加密。在 Windows 下，您必須設定此環境變數作為解密密碼（可輸入自訂的任意密碼，例如 `mysecretpwd`）。
2. **`GOG_ACCOUNT`** (選填)：
   * 設定您的預設 Gmail 帳號（例如 `yourname@gmail.com`），之後下指令時就不用每次加 `--account yourname@gmail.com`。

### 🔧 如何在系統中永久設定這兩個變數？
1. 開啟「編輯系統環境變數」對話框。
2. 點擊「環境變數」。
3. 在「使用者變數」下，點擊「新增」：
   * 變數名稱：`GOG_KEYRING_PASSWORD`
   * 變數值：`您的密碼`
4. 再次點擊「新增」：
   * 變數名稱：`GOG_ACCOUNT`
   * 變數值：`您的帳號@gmail.com`
5. 設定完成後，**必須重啟**編輯器或終端機才會生效。

---

## 🧪 測試您的 gog 工具

設定完成後，您可以試著在終端機輸入以下命令來確認一切運作正常：

* **搜尋最近的 Gmail 信件**：
  ```powershell
  gog gmail search "newer_than:1d" --max 5
  ```
* **查看日曆顏色**：
  ```powershell
  gog calendar colors
  ```
* **搜尋雲端硬碟檔案**：
  ```powershell
  gog drive search "test" --max 3
  ```

---

## 🤖 結合 Gemini IDE 或是 OpenClaw

在 `gog` 設定成功後，當您在本地 Gemini IDE 中對 AI 說：
> 🗣️ *「幫我搜尋一下我最近一天內有沒有來自 Google 的信件」*
> 🗣️ *「幫我把今天的行程列出來」*

Gemini IDE 會自動觸發 `gog` 技能，並在背景調用例如 `gog gmail search "from:google newer_than:1d"` 等指令，快速把結果呈現在編輯器中供您參考。
