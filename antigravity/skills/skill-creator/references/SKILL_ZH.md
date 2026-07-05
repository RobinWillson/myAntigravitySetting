---
name: skill-creator
description: 建立新 skill、修改及改善現有 skill，並評估 skill 的效能。當使用者想要從頭開始建立 skill、編輯或最佳化現有 skill、執行 eval 來測試 skill、透過變異數分析來基準測試 (benchmark) skill 效能，或最佳化 skill 的 description 以提升觸發準確度時，請使用此 skill。
---

# Skill Creator (Skill 建立器)

一個用於建立新 skill 並反覆進行改善的 skill。

在高層次上，建立 skill 的流程如下：

- 決定您希望 skill 執行的工作以及大致的實作方式。
- 撰寫 skill 的草稿。
- 建立幾個測試 prompt，並在這些 prompt 上執行擁有該 skill 存取權限的 claude (claude-with-access-to-the-skill)。
- 協助使用者對結果進行定性 (qualitative) 與定量 (quantitative) 的評估。
  - 當執行在背景進行時，如果還沒有任何定量 eval，請先草擬一些（如果已有，可以直接使用或在您認為需要調整時進行修改），然後向使用者說明這些評估（如果已經存在，則說明現有的評估）。
  - 使用 `eval-viewer/generate_review.py` 腳本向使用者展示結果供其審查，同時讓他們查看定量指標。
- 根據使用者評估結果所提供的回饋（以及從定量基準測試中發現的任何明顯缺陷）重寫 skill。
- 重複此過程，直到您滿意為止。
- 擴大測試集，並在更大的規模上再次嘗試。

在使用此 skill 時，您的職責是找出使用者目前處於該流程的哪一個階段，然後介入並協助他們推進。例如，如果他們說「我想做一個用於 X 的 skill」，您可以協助釐清他們的意思、撰寫草稿、撰寫測試案例、找出他們想要如何評估、執行所有 prompt 並重複。

另一方面，如果他們已經有了 skill 的草稿，您可以直接進入迴圈中的 評估/迭代 階段。

當然，您應該隨時保持彈性。如果使用者表示「我不需要執行一大堆評估，陪我憑感覺試試就好」，您也可以配合這樣做。

在 skill 完成後（順序可視情況調整），您還可以執行 skill description 最佳化工具（我們有另外的專用腳本），以最佳化 skill 的觸發準確度。

好嗎？沒問題。

## 與使用者溝通 (Communicating with the user)

使用 Skill 建立器的使用者，對程式開發術語的熟悉程度可能落差極大。如果您還沒聽說（這也是最近才開始的趨勢），現在正掀起一股熱潮：Claude 的強大功能吸引了水電工打開終端機，也讓父母和祖父母上網搜尋「如何安裝 npm」。但另一方面，大部分的使用者可能都具備相當程度的電腦素養。

因此，請特別注意上下文線索，以理解如何拿捏您的溝通措辭！在預設情況下，以下原則供您參考：

- 「評估 (evaluation)」和「基準測試 (benchmark)」勉強可以使用，但還算 OK。
- 對於「JSON」和「斷言 (assertion)」，在使用前，您需要先從使用者那裡看到明確的線索，確定他們知道這些是什麼，否則請不要在未解釋的情況下直接使用。

如果存疑，簡短地解釋術語是沒問題的，如果您不確定使用者是否能理解，歡迎提供簡短的定義來釐清。

---

## 建立 skill (Creating a skill)

### 擷取意圖 (Capture Intent)

首先要理解使用者的意圖。當前的對話可能已經包含了使用者想要擷取的流程（例如，他們說「把這個做成一個 skill」）。如果是這樣，請先從對話歷史紀錄中提取答案 —— 所使用的工具、步驟順序、使用者做出的修正，以及觀察到的輸入/輸出格式。使用者可能需要填補空白，並在進入下一步之前進行確認。

1. 這個 skill 應該讓 Claude 能夠做到什麼？
2. 這個 skill 應該在什麼時候觸發？（使用者使用了哪些詞彙/上下文）
3. 預期的輸出格式是什麼？
4. 我們是否應該設定測試案例來驗證 skill 是否能正常運作？具有客觀可驗證輸出（檔案轉換、資料提取、程式碼生成、固定工作流程步驟）的 skill 會從測試案例中受益。而具有主觀輸出（寫作風格、藝術創作）的 skill 通常不需要。請根據 skill 類型建議合適的預設選項，但讓使用者自行決定。

### 訪談與研究 (Interview and Research)

主動詢問有關邊界案例 (edge cases)、輸入/輸出格式、範例檔案、成功標準和依賴項的問題。在把這些部分釐清之前，請先不要撰寫測試 prompt。

檢查可用的 MCP —— 如果對研究有幫助（搜尋文件、尋找類似的 skill、查閱最佳實踐），如果子代理 (subagent) 可用，請透過子代理並行進行研究，否則就直接在對話中進行。請做好準備，攜帶上下文以減輕使用者的負擔。

### 撰寫 SKILL.md (Write the SKILL.md)

根據使用者訪談，填寫以下部分：

- **name**：skill 的識別名稱。
- **description**：何時觸發、做些什麼。這是主要的觸發機制 —— 必須同時包含 skill 的用途，以及**何時使用它的具體上下文**。所有「何時使用」的資訊都寫在這裡，不要寫在正文中。注意：目前 Claude 傾向於「低機率觸發 (undertrigger)」skill —— 也就是在 skill 明明有用時卻不使用它。為了避免這種情況，請讓 skill 的描述顯得稍微「強勢 (pushy)」一些。例如，不要寫「如何建立一個簡單快速的儀表板來顯示 Anthropic 的內部數據。」，您可以寫：「如何建立一個簡單快速的儀表板來顯示 Anthropic 的內部數據。請確保只要使用者提到儀表板、資料視覺化、內部指標，或者想要顯示任何種類的公司數據時，即使他們沒有明確要求『儀表板』，也務必使用此 skill。」
- **compatibility**：所需的工具、依賴項（選填，極少需要）。
- **skill 的其餘部分 :)**

### Skill 撰寫指南 (Skill Writing Guide)

#### Skill 的結構 (Anatomy of a Skill)

```
skill-name/
├── SKILL.md (必要)
│   ├── YAML frontmatter (必須包含 name 和 description)
│   └── Markdown 說明指令
└── Bundled Resources (必要，如無內容則僅建立資料夾)
    ├── scripts/    - 用於確定性/重複性任務的可執行程式碼
    ├── references/ - 根據需要載入到上下文中的文件
    └── assets/     - 輸出中使用的檔案（範本、圖示、字型）
```

#### 漸進式揭露 (Progressive Disclosure)

Skill 使用三層載入系統：
1. **中繼資料 (Metadata)** (name + description) - 永遠存在於上下文中（約 100 字）。
2. **SKILL.md 正文** - 只要 skill 被觸發，就會載入到上下文中（理想情況下小於 500 行）。
3. **隨附資源 (Bundled resources)** - 根據需要載入（無限制，指令碼可以不用載入直接執行）。

這些字數僅為估計，如果需要，您可以寫得更長。

**關鍵模式：**
- 保持 SKILL.md 在 500 行以內；如果您接近這個限制，請增加額外的階層結構，並提供清晰的指引，告訴使用該 skill 的模型下一步應該去哪裡查看。
- 在 SKILL.md 中清楚地引用檔案，並指導何時該讀取它們。
- 對於大型參考檔案（>300 行），請包含目錄 (Table of Contents)。

**領域組織 (Domain organization)**：當一個 skill 支援多個領域/框架時，請按變體 (variant) 進行組織：
```
cloud-deploy/
├── SKILL.md (工作流程 + 選擇)
└── references/
    ├── aws.md
    ├── gcp.md
    └── azure.md
```
Claude 只會讀取相關的參考檔案。

#### 無驚喜原則 (Principle of Lack of Surprise)

不用說，skill 絕對不能包含惡意軟體、漏洞利用程式碼或任何可能危害系統安全的內容。skill 的內容在被描述時，其意圖不應讓使用者感到驚訝。請拒絕建立具有誤導性、或旨在促進未授權存取、資料外洩或其他惡意活動的 skill。不過，像「角色扮演為 XYZ」這類型的需求是沒問題的。

#### 撰寫模式 (Writing Patterns)

在指示說明中，請優先使用祈使句（命令語氣）。

**定義輸出格式** - 您可以這樣做：
```markdown
## Report structure (報告結構)
ALWAYS use this exact template: (務必使用此精確範本：)
# [Title]
## Executive summary
## Key findings
## Recommendations
```

**範例模式** - 包含範例非常有用。您可以像這樣格式化它們（但如果範例中包含 "Input" 和 "Output"，您可以稍微調整）：
```markdown
## Commit message format (提交訊息格式)
**Example 1:**
Input: Added user authentication with JWT tokens
Output: feat(auth): implement JWT-based authentication
```

### 寫作風格 (Writing Style)

與其使用強硬、命令式的「MUST (必須)」，不如試著向模型解釋**為什麼**這些事情很重要。利用心智理論 (theory of mind)，試著讓 skill 具有通用性，而不要過度侷限於特定的例子。先寫出草稿，然後用全新的視角去審視並改進它。

### 測試案例 (Test Cases)

寫完 skill 草稿後，想出 2-3 個真實的測試 prompt —— 也就是真實使用者實際會說的話。與使用者分享：「這裡有幾個我想嘗試的測試案例。這些看起來合適嗎？還是您想再增加一些？」然後執行它們。

將測試案例儲存到 `evals/evals.json`。此時先不要寫斷言 (assertions) —— 只要寫 prompt。您將在下一步執行過程中草擬斷言。

```json
{
  "skill_name": "example-skill",
  "evals": [
    {
      "id": 1,
      "prompt": "使用者任務的 prompt",
      "expected_output": "預期結果的描述",
      "files": []
    }
  ]
}
```

請參閱 `references/schemas.md` 以取得完整結構（包含您稍後會加入的 `assertions` 欄位）。

## 執行與評估測試案例 (Running and evaluating test cases)

本節是一個連續的步驟 —— 請不要中途停止。請**不要**使用 `/skill-test` 或任何其他測試 skill。

將結果放在與 skill 目錄同層級的 `<skill-name>-workspace/` 中。在 workspace 內，按迭代次數組織結果（`iteration-1/`、`iteration-2/` 等），在每次迭代中，每個測試案例各有一個目錄（`eval-0/`、`eval-1/` 等）。不要一開始就建立好所有的目錄 —— 只要在執行過程中建立即可。

### 步驟 1：在同一次對話中啟動所有執行（with-skill 與 baseline）

對於每個測試案例，在同一次對話中啟動兩個子代理 (subagent) —— 一個啟用 skill，另一個不啟用。這點很重要：不要先執行啟用 skill 的部分，稍後再回來執行 baseline。請一次啟動所有執行，這樣它們就能在差不多相同的時間完成。

**啟用 skill 的執行 (With-skill run)：**

```
Execute this task:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- Outputs to save: <使用者在乎的輸出物 —— 例如 "the .docx file"、"the final CSV">
```

**基準執行 (Baseline run)**（使用相同的 prompt，但 baseline 取決於上下文）：
- **建立新 skill**：完全不使用任何 skill。相同的 prompt，沒有 skill 路徑，存檔至 `without_skill/outputs/`。
- **改善現有 skill**：舊版 skill。在編輯前，先為 skill 建立快照 (`cp -r <skill-path> <workspace>/skill-snapshot/`)，然後將 baseline 子代理指向該快照。存檔至 `old_skill/outputs/`。

為每個測試案例撰寫 `eval_metadata.json`（斷言暫時可以留空）。根據測試的內容為每個 eval 取一個具描述性的名稱 —— 不要只叫 "eval-0"。該目錄也使用此名稱。如果本次迭代使用了新或修改過的 eval prompt，請為每個新 eval 目錄建立這些檔案 —— 不要假設它們會從之前的迭代直接延用。

```json
{
  "eval_id": 0,
  "eval_name": "描述性名稱",
  "prompt": "使用者的任務 prompt",
  "assertions": []
}
```

### 步驟 2：在執行進行的同時草擬斷言 (assertions)

不要只是在那裡等待執行結束 —— 您可以生產性地利用這段時間。為每個測試案例草擬定量斷言 (quantitative assertions) 並向使用者解釋。如果 `evals/evals.json` 中已經存在斷言，請審查它們並解釋它們在檢查什麼。

好的斷言應該是客觀可驗證的，且具有描述性的名稱 —— 它們在基準測試檢視器中應該要能被清楚地閱讀，以便讓人一眼就能看懂每項斷言在檢查什麼。主觀的 skill（寫作風格、設計品質）最好進行定性評估 —— 不要強行將斷言套用在需要人類主觀判斷的事情上。

草擬完成後，更新 `eval_metadata.json` 檔案和 `evals/evals.json` 的斷言。同時向使用者解釋他們將在檢視器中看到什麼 —— 包含定性輸出和定量基準測試。

### 步驟 3：在執行完成時擷取時間與 Token 數據

當每個子代理任務完成時，您會收到一個包含 `total_tokens` 和 `duration_ms` 的通知。請立即將此數據儲存到執行目錄下的 `timing.json` 中：

```json
{
  "total_tokens": 84852,
  "duration_ms": 23332,
  "total_duration_seconds": 23.3
}
```

這是擷取此數據的唯一機會 —— 它只會透過任務通知傳送，不會保存在其他任何地方。請在通知到達時立即處理，而不要試圖批次處理。

### 步驟 4：評分、彙整並啟動檢視器 (Grade, aggregate, and launch the viewer)

當所有執行完成後：

1. **為每個執行評分** —— 啟動一個評分 (grader) 子代理（或在對話中直接評分），該子代理會讀取 `agents/grader.md` 並根據輸出評估每項斷言。將結果儲存到每個執行目錄下的 `grading.json` 中。`grading.json` 的 expectations 陣列必須使用 `text`、`passed` 和 `evidence` 欄位（而不是 `name`/`met`/`details` 或其他變體） —— 檢視器依賴於這些確切的欄位名稱。對於可以透過程式檢查的斷言，請撰寫並執行腳本，而不是用肉眼觀察 —— 腳本更快、更可靠，而且可以在多次迭代中重複使用。

2. **彙整至基準測試 (benchmark)** —— 從 skill-creator 目錄執行彙整腳本：
   ```bash
   python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>
   ```
   這會產生 `benchmark.json` 和 `benchmark.md`，其中包含每個配置的 pass_rate、時間和 token，並附帶 平均值 ± 標準差 (mean ± stddev) 以及 delta 差異。如果是手動產生 `benchmark.json`，請參閱 `references/schemas.md` 以取得檢視器所預期的確切 schema。
   請將 `with_skill` 版本放在其對應的 baseline 版本之前。

3. **進行分析師分析 (analyst pass)** —— 讀取基準測試數據，並找出可能被彙總統計數據隱藏的模式。請參閱 `agents/analyzer.md`（「Analyzing Benchmark Results」章節），了解要尋找的內容 —— 例如，無論是否啟用 skill 都總是通過的斷言（無鑑別度）、高變異數的 eval（可能不穩定），以及時間/token 之間的權衡。

4. **啟動檢視器**，同時載入定性輸出和定量數據：
   ```bash
   nohup python <skill-creator-path>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "my-skill" \
     --benchmark <workspace>/iteration-N/benchmark.json \
     > /dev/null 2>&1 &
   VIEWER_PID=$!
   ```
   如果是迭代 2 以上，還需要傳入 `--previous-workspace <workspace>/iteration-<N-1>`。

   **共同開發 (Cowork) / 無頭 (headless) 環境：** 如果 `webbrowser.open()` 無法使用，或環境沒有顯示器，請使用 `--static <output_path>` 寫入一個獨立的 HTML 檔案，而不是啟動伺服器。當使用者點擊「Submit All Reviews」時，回饋將下載為 `feedback.json` 檔案。下載後，請將 `feedback.json` 複製到 workspace 目錄中，以便下一次迭代讀取。

   注意：請使用 `generate_review.py` 來建立檢視器；不需要自行撰寫客製化的 HTML。

5. **告訴使用者** 類似這樣的話：「我已經在您的瀏覽器中開啟了結果。這裡有兩個分頁 ——『Outputs』可以讓您點擊查看每個測試案例並留下回饋，『Benchmark』則顯示定量的對比。完成後，請回到這裡告訴我。」

### 使用者在檢視器中會看到什麼

「Outputs」分頁一次顯示一個測試案例：
- **Prompt**：指派的任務
- **Output**：skill 產生的檔案（儘可能在頁面內嵌呈現）
- **Previous Output**（迭代 2 以上）：摺疊區塊，顯示上一次迭代的輸出
- **Formal Grades**（如果已執行評分）：摺疊區塊，顯示斷言的通過/失敗狀態
- **Feedback**：輸入文字框，在使用者輸入時會自動儲存
- **Previous Feedback**（迭代 2 以上）：他們上一次的評論，顯示在文字框下方

「Benchmark」分頁顯示統計摘要：每個配置的通過率 (pass rates)、執行時間和 token 使用情況，並附有每個 eval 的詳細分析和分析師的觀察。

透過 prev/next 按鈕或方向鍵進行導覽。完成後，他們點擊「Submit All Reviews」，這會將所有回饋儲存到 `feedback.json`。

### 步驟 5：讀取回饋

當使用者告訴您他們已經完成時，請讀取 `feedback.json`：

```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "圖表缺少軸標籤", "timestamp": "..."},
    {"run_id": "eval-1-with_skill", "feedback": "", "timestamp": "..."},
    {"run_id": "eval-2-with_skill", "feedback": "太完美了，我很喜歡", "timestamp": "..."}
  ],
  "status": "complete"
}
```

空白的回饋表示使用者認為該項目沒有問題。請將您的改進重點放在使用者有具體抱怨的測試案例上。

完成後請關閉檢視器伺服器：

```bash
kill $VIEWER_PID 2>/dev/null
```

---

## 改善 skill (Improving the skill)

這是整個迴圈的核心。您已經執行了測試案例，使用者也審查了結果，現在您需要根據他們的回饋來讓 skill 變得更好。

### 如何思考改進方向

1. **從回饋中進行歸納 (Generalize from the feedback)**：這裡的大局觀在於，我們正試圖建立能夠在許多不同 prompt 中被使用成千上萬次（甚至更多）的 skill。在此，您和使用者僅針對少數幾個範例進行反覆迭代，這是因為這樣做可以進行得更快。使用者對這些範例瞭如指掌，能快速評估新輸出。但如果我們共同開發的 skill 只能處理這幾個特定範例，那它就毫無用處了。與其加入一些瑣碎的過度擬合 (overfitty) 修改或壓迫性且僵硬的 "MUST (必須)"，如果在某些問題上遇到瓶頸，不妨嘗試多方探索並使用不同的比喻，或者推薦不同的工作模式。嘗試的成本非常低，也許您會因此找到極佳的方案。

2. **保持 prompt 精簡 (Keep the prompt lean)**：移除沒有發揮作用的部分。務必閱讀執行歷程 (transcripts)，而不僅僅是看最終輸出 —— 如果看起來 skill 讓模型浪費了大量時間做一些無效率的事，您可以嘗試移除讓它這麼做的指令，然後看看結果如何。

3. **解釋為什麼 (Explain the why)**：盡力向模型解釋**為什麼**您要求它做的事情很重要。現在的 LLM 非常聰明，它們具有很好的心智理論，在給予合適的引導下，能夠超越生硬的指令，真正發揮作用。即使使用者的回饋非常簡短或帶有情緒，也要試著去理解任務的本質，以及使用者寫下那些內容的真正原因，然後將這種理解融入到 skill 指令中。如果您發現自己使用了全大寫的 ALWAYS (務必) 或 NEVER (絕不)，或者使用了超級死板的結構，這是一個黃色警訊 —— 如果可能的話，請重新包裝語句並解釋其背後的道理，以便讓模型明白為什麼您要求的這件事如此重要。這是一個更人性化、強大且有效的方法。

4. **尋找跨測試案例的重複工作 (Look for repeated work)**：閱讀測試執行的歷程，注意子代理是否都獨立撰寫了類似的輔助腳本，或者採取了相同的多步驟方法。如果 3 個測試案例都導致子代理撰寫了 `create_docx.py` 或 `build_chart.py`，這是一個強烈的訊號，表示該 skill 應該直接隨附該腳本。撰寫一次，放進 `scripts/` 中，並告訴 skill 如何使用它。這可以避免未來的每次呼叫都要重新發明輪子。

這項任務非常重要（我們正試圖在此創造巨大的經濟價值！），您的思考時間並不是瓶頸，請花點時間仔細琢磨。我建議先寫出一版改進草稿，然後以全新的視角重新審視並加以改良。真正努力進入使用者的思維，去理解他們想要和需要什麼。

### 迭代迴圈 (The iteration loop)

改進 skill 後：

1. 將您的改進套用到 skill 中。
2. 將所有測試案例重新執行到新的 `iteration-<N+1>/` 目錄中，包含 baseline 執行。如果您是建立新 skill，baseline 永遠是 `without_skill`（無 skill） —— 這在迭代中保持不變。如果您是改善現有 skill，請根據您的判斷來決定什麼適合作為 baseline：使用者最初帶來的版本，或是前一次迭代的版本。
3. 啟動檢視器，並將 `--previous-workspace` 指向前一次迭代。
4. 等待使用者審查並告訴您他們已經完成。
5. 讀取新的回饋，再次改進，如此重複。

持續進行直到：
- 使用者表示滿意。
- 回饋全部為空（一切看起來都很棒）。
- 您沒有取得實質進展。

---

## 進階：盲測對比 (Advanced: Blind comparison)

在您想要對 skill 的兩個版本進行更嚴格的對比時（例如，使用者詢問「新版本真的比較好嗎？」），我們提供了盲測對比系統。詳情請參閱 `agents/comparator.md` 和 `agents/analyzer.md`。基本概念是：將兩個輸出提供給獨立的代理，而不告訴它哪個是哪個，讓它來評判品質，然後分析贏家獲勝的原因。

這是選填的，需要子代理，且大多數使用者不需要。人類審查迴圈通常就足夠了。

---

## Description 最佳化 (Description Optimization)

SKILL.md frontmatter 中的 description 欄位是決定 Claude 是否調用 skill 的主要機制。在建立或改善 skill 後，請主動提供 description 最佳化服務，以提升觸發準確度。

### 步驟 1：產生觸發評估查詢 (Generate trigger eval queries)

建立 20 個評估查詢 —— 包含應觸發 (should-trigger) 和不應觸發 (should-not-trigger) 的混合。儲存為 JSON：

```json
[
  {"query": "使用者 prompt", "should_trigger": true},
  {"query": "另一個 prompt", "should_trigger": false}
]
```

這些查詢必須是真實的，且是 Claude Code 或 Claude.ai 使用者實際會輸入的內容。不要使用抽象的請求，而是具體、特定且包含足夠細節的請求。例如，檔案路徑、關於使用者工作或處境的個人上下文、欄位名稱和數值、公司名稱、URL 等，甚至帶有一些背景故事。有些可能使用全小寫、包含縮寫、錯字或口語化表達。使用不同的長度混合，並著重於邊界案例，而不是使其一目了然（使用者將有機會對其進行審查確認）。

不好：`"格式化此資料"`, `"從 PDF 提取文字"`, `"建立圖表"`

好：`"好，我老闆剛把這個 xlsx 檔案傳給我（它在我的下載資料夾，名字大概像 'Q4 sales final FINAL v2.xlsx'），她要我加一欄以百分比顯示利潤率。營收在 C 欄，成本我記得在 D 欄"`

對於**應觸發 (should-trigger)** 的查詢 (8-10 個)，請考慮覆蓋範圍。您需要針對相同意圖使用不同的表達方式 —— 有些正式，有些口語。包含使用者沒有明確指明 skill 或檔案類型，但顯然需要該 skill 的情況。加入一些罕見的使用情境，以及此 skill 與另一個 skill 競爭但此 skill 應該勝出的情況。

對於**不應觸發 (should-not-trigger)** 的查詢 (8-10 個)，最具有價值的是「擦邊球 (near-misses)」 —— 那些與該 skill 共享關鍵字或概念，但實際上需要其他處理方式的查詢。例如，相鄰領域、模糊的語句（如果用單純的關鍵字匹配會觸發，但實際上不該觸發的情況），以及查詢觸及了該 skill 的功能，但在當前上下文中，使用其他工具更合適的情況。

關鍵在於：不要讓不應觸發的查詢顯得太過無關。例如，將 "撰寫費氏數列函式" 作為 PDF 處理 skill 的負面測試就太簡單了 —— 這無法測試出任何東西。負面案例應該要是真正具有混淆性的。

### 步驟 2：與使用者進行審查 (Review with user)

使用 HTML 範本向使用者展示評估集以供審查：

1. 從 `assets/eval_review.html` 讀取範本。
2. 替換預留位置：
   - `__EVAL_DATA_PLACEHOLDER__` → 評估項目的 JSON 陣列（不加引號 —— 這是一個 JS 變數賦值）
   - `__SKILL_NAME_PLACEHOLDER__` → skill 的名稱
   - `__SKILL_DESCRIPTION_PLACEHOLDER__` → skill 的當前描述
3. 寫入到暫存檔案中（例如 `/tmp/eval_review_<skill-name>.html`）並開啟它：`open /tmp/eval_review_<skill-name>.html`
4. 使用者可以編輯查詢、切換 should-trigger、新增/刪除項目，然後點擊「Export Eval Set」。
5. 檔案會下載到 `~/Downloads/eval_set.json` —— 檢查 Downloads 資料夾以獲取最新版本，以防有多個同名檔案（例如 `eval_set (1).json`）。

這一步非常關鍵 —— 糟糕的評估查詢會導致糟糕的描述最佳化結果。

### 步驟 3：執行最佳化迴圈 (Run the optimization loop)

告訴使用者：「這會需要一些時間 —— 我會在背景執行最佳化迴圈，並定期檢查進度。」

將評估集儲存到 workspace，然後在背景執行：

```bash
python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id-powering-this-session> \
  --max-iterations 5 \
  --verbose
```

請使用您系統 prompt 中的 model ID（即為當前工作階段提供支援的模型），以便觸發測試與使用者的實際體驗相符。

在執行過程中，定期追蹤 (tail) 輸出，向使用者報告目前是第幾次迭代，以及分數表現如何。

這會自動處理完整的最佳化迴圈。它會將評估集分成 60% 訓練集和 40% 保留測試集，評估目前的描述（將每個查詢執行 3 次以獲得穩定的觸發率），然後呼叫 Claude 根據失敗的案例提出改進建議。它會在訓練集和測試集上重新評估每個新描述，最多迭代 5 次。完成後，它會在瀏覽器中開啟 HTML 報告，顯示每次迭代的結果，並返回包含 `best_description` 的 JSON —— 這是根據測試集分數而非訓練集分數選出的，以避免過度擬合。

### Skill 觸發的運作方式 (How skill triggering works)

理解觸發機制有助於設計更好的評估查詢。Skill 會隨其 name + description 出現在 Claude 的 `available_skills` 清單中，而 Claude 會根據該描述決定是否調用 skill。最重要的一點是，Claude 只會在無法輕鬆自行處理的工作上諮詢 skill —— 對於像「讀取此 PDF」這類簡單、單一步驟的查詢，即使描述完全符合，Claude 也可能不會觸發 skill，因為它可以使用基本工具直接處理。而複雜、多步驟或高度專業的查詢，在描述匹配時能更可靠地觸發 skill。

這意味著您的評估查詢應該足夠充實，使得 Claude 確實能從諮詢 skill 中獲益。簡單的查詢（例如 "讀取檔案 X"）是不好的測試案例 —— 無論描述品質如何，它們都不會觸發 skill。

### 步驟 4：套用結果 (Apply the result)

從 JSON 輸出中取出 `best_description`，並更新 skill 的 SKILL.md frontmatter。向使用者展示修改前後的對比，並報告評分。

---

### 打包與呈現 (Package and Present) (僅在 `present_files` 工具可用時)

檢查您是否有存取 `present_files` 工具的權限。如果沒有，請跳過此步驟。如果有，請打包該 skill 並將 `.skill` 檔案呈現給使用者：

```bash
python -m scripts.package_skill <path/to/skill-folder>
```

打包後，引導使用者前往產生的 `.skill` 檔案路徑以供其安裝。

---

## Claude.ai 專屬說明 (Claude.ai-specific instructions)

在 Claude.ai 中，核心工作流程是相同的（草稿 → 測試 → 審查 → 改進 → 重複），但由於 Claude.ai 沒有子代理，部分機制需要進行調整：

**執行測試案例**：沒有子代理意味著無法進行並行執行。對於每個測試案例，請讀取 skill 的 SKILL.md，然後自行按照其指示完成測試 prompt 的工作。一次做一個。這比獨立的子代理缺乏一些客觀嚴謹度（因為是您寫了 skill 且又是您在執行它，您擁有完整的上下文），但這仍是一個有用的合理性檢查 (sanity check) —— 且人類審查步驟可以進行彌補。請跳過 baseline 執行 —— 直接使用 skill 按要求完成任務。

**審查結果**：如果您無法開啟瀏覽器（例如 Claude.ai 的 VM 沒有顯示器，或者您在遠端伺服器上），請完全跳過瀏覽器檢視器。改為直接在對話中呈現結果。對於每個測試案例，展示其 prompt 和輸出。如果輸出是使用者需要查看的檔案（例如 .docx 或 .xlsx），請將其儲存到檔案系統中，並告訴他們路徑，以便他們下載並檢查。在對話中詢問回饋：「這看起來如何？有什麼需要修改的嗎？」

**基準測試**：跳過定量基準測試 —— 它依賴於 baseline 對比，而在沒有子代理的情況下，這沒有太大意義。請專注於使用者提供的定性回饋。

**迭代迴圈**：與之前相同 —— 改善 skill、重新執行測試案例、詢問回饋 —— 只是中間少了瀏覽器檢視器。如果您有存取檔案系統的權限，您仍然可以將結果整理到迭代目錄中。

**Description 最佳化**：此部分需要 `claude` CLI 工具（特別是 `claude -p`），該工具僅在 Claude Code 中可用。如果您使用的是 Claude.ai，請跳過此步驟。

**盲測對比**：需要子代理。請跳過。

**打包**：`package_skill.py` 腳本可以在任何有 Python 和檔案系統的地方運作。在 Claude.ai 上，您可以執行它，使用者可以下載產生的 `.skill` 檔案。

**更新現有 skill**：使用者可能是要求您更新現有的 skill，而不是建立新 skill。在這種情況下：
- **保留原始名稱**。請注意 skill 的目錄名稱和 `name` frontmatter 欄位 —— 請保持原樣，不要修改。例如，若已安裝的 skill 名稱為 `research-helper`，請輸出 `research-helper.skill`（而不是 `research-helper-v2`）。
- **在編輯前複製到可寫入位置**。已安裝的 skill 路徑可能是唯讀的。請複製到 `/tmp/skill-name/`，在該處編輯，並從該複本進行打包。
- **若是手動打包，請先在 `/tmp/` 中進行準備**，然後複製到輸出目錄 —— 直接寫入可能會因為權限問題而失敗。

---

## 共同開發 (Cowork) 專屬說明 (Cowork-Specific Instructions)

如果您處於 Cowork 環境中，主要需要注意以下幾點：

- 您擁有子代理，因此主要的工作流程（並行啟動測試案例、執行 baseline、評分等）皆可正常運作。（但是，如果遇到嚴重的逾時問題，可以改為序列而非並行執行測試 prompt。）
- 您沒有瀏覽器或顯示器，因此在產生評估檢視器時，請使用 `--static <output_path>` 寫入獨立的 HTML 檔案，而不是啟動伺服器。接著提供一個連結，讓使用者可以點擊並在他們的瀏覽器中開啟該 HTML。
- 基於某些原因，Cowork 設定似乎會使 Claude 在執行測試後不太傾向於產生評估檢視器。在此特別重申：無論您是在 Cowork 還是在 Claude Code，執行測試後，您都**必須**先產生評估檢視器，讓人類在您修改 skill 並嘗試做修正之前查看範例，請使用 `generate_review.py`（不要自行撰寫客製化的 HTML）。先跟您說聲抱歉，但我必須在此使用全大寫強調：在您自己評估輸入之前，務必**先產生評估檢視器 (GENERATE THE EVAL VIEWER)**。您需要儘快讓人類看到這些內容！
- 回饋的運作方式不同：由於沒有執行的伺服器，檢視器的「Submit All Reviews」按鈕將會下載 `feedback.json` 作為檔案。您可以接著從那裡讀取它（您可能需要先申請權限）。
- 打包可以正常運作 —— `package_skill.py` 只需要 Python 和檔案系統。
- Description 最佳化 (`run_loop.py` / `run_eval.py`) 在 Cowork 中應該可以正常執行，因為它是透過 subprocess 執行 `claude -p`，而不是瀏覽器。但請保留到您完全完成 skill 的製作且使用者同意其處於良好狀態之後再執行。
- **更新現有 skill**：使用者可能是要求您更新現有的 skill，而不是建立新 skill。請遵循上述 claude.ai 章節中的更新指南。

---

## 參考檔案 (Reference files)

`agents/` 目錄包含專門子代理的說明。在需要啟動相關子代理時，請閱讀它們：

- `agents/grader.md` —— 如何根據輸出評估斷言
- `agents/comparator.md` —— 如何在兩個輸出之間進行盲測 A/B 對比
- `agents/analyzer.md` —— 如何分析某個版本勝出的原因

`references/` 目錄包含其他文件：
- `references/schemas.md` —— `evals.json`、`grading.json` 等的 JSON 結構

---

再次強調核心迴圈，以加深印象：

- 弄清楚 skill 的主要內容。
- 起草或編輯 skill。
- 針對測試 prompt 執行 claude-with-access-to-the-skill。
- 與使用者一起評估輸出：
  - 建立 `benchmark.json` 並執行 `eval-viewer/generate_review.py` 以協助使用者進行審查。
  - 執行定量評估 (quantitative evals)。
- 重複進行，直到您和使用者皆滿意為止。
- 打包最終的 skill 並將其返回給使用者。

如果您有待辦清單 (TodoList) 之類的東西，請務必將這些步驟加入其中，以確保您不會遺忘。如果您在 Cowork 中，請務必特別將「建立 evals JSON 並執行 `eval-viewer/generate_review.py` 以便人類審查測試案例」加入您的 TodoList 中，以確保這項工作得以執行。

祝你好運！
