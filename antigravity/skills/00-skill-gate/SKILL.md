---
name: 00-skill-gate
description: "技能守門員。必須在所有對話的最開始執行。它會攔截使用者的初始輸入，並將其與所有已安裝的全局和專案技能/MCP 進行比對，判斷是否有適用的工具，並列出選項供使用者選擇。在每次對話中請務必最先執行此技能，以防止重複任務並引導工具選擇。同時處理 /00-skill-gate 與 /00 命令選單。"
---

# 00-Skill-Gate (技能守門員)

此技能作為智能守門員，在每個對話會話開始時執行，以識別相關工具、防止重複工作，並提供用於掃描技能的管理選單。

---

## 🛡️ 流程 1：對話攔截與過濾 (Interception Flow)

在**每一次對話的最開始**，執行 Agent 必須在執行 any other task 之前先執行此邏輯。

### 步驟與邏輯

1. **讀取已安裝的技能與 MCP**：
   - 讀取全局技能清單：[global-skill-list.md](file:///c:/Users/9910008/.gemini/antigravity/skills/00-skill-gate/asset/global-skill-list.md) (或本地路徑 `asset/global-skill-list.md`)。
   - 若在非全局的專案工作區中，讀取專案清單：`asset/project-skill-list.md` 或 [project-skill-list.md](file:///project-folder/.agent/skills/00-skill-gate/asset/project-skill-list.md)。

2. **分析使用者輸入**：
   - 將使用者的意圖與所有列出的技能及 MCP 的描述和關鍵字進行比對。
   - 如果**沒有明確匹配**，則靜默跳過此技能，直接執行使用者的原始請求。

3. **向使用者呈現選擇**：
   - 如果發現一個或多個可能匹配的技能或 MCP，將它們清晰地列在結構化選單中，並請使用者選擇。
   - **關鍵**：務必在列表最後加上一個選項：`"不使用技能"`。

### 攔截呈現範本

發現技能匹配時，請使用以下完全相同的格式呈現：

```markdown
🎯 **偵測到可能適用的 Antigravity 技能或 MCP 工具：**

請選擇您想啟動的技能，或選擇不使用：

1. 🛠️ **[技能名稱 A]**：[150字簡短說明]
2. 🔌 **[MCP名稱 B]**：[150字簡短說明]
3. ❌ **不使用技能** (直接依原句執行)

請直接輸入選項編號（例如 `1`）或點擊選項。
```

- 如果使用者選擇了某個技能/MCP，立即載入並切換至該技能執行。
- 如果使用者選擇了「不使用技能」或拒絕使用，則直接依照使用者原始請求執行，不觸發任何特定技能。

---

## 🛠️ 流程 2：指令功能選單 (`/00-skill-gate` 或 `/00`)

當使用者輸入 `/00-skill-gate` 或 `/00` 時，觸發交互式主選單。

### 步驟

1. 呼叫 `ask_question` 工具：
   - **問題 (Question)**: "您好！我是 00-skill-gate 技能守門員，請問您想進行什麼操作？"
   - **選項 (Options)**:
     - `"List all skills (列出所有技能)"`
     - `"Update global skills (更新全域技能)"`
     - `"Update project skills (更新專案技能)"`

2. **操作：List all skills (列出所有技能)**：
   - 顯示指向完整清單的直接點擊連結：
     - 👉 **[全域技能清單 (global-skill-list.md)](file:///c:/Users/9910008/.gemini/antigravity/skills/00-skill-gate/asset/global-skill-list.md)**
     - 👉 **[專案技能清單 (project-skill-list.md)](file:///project-folder/.agent/skills/00-skill-gate/asset/project-skill-list.md)**
   - 保持回應極度乾淨輕量，不要在對話框中渲染完整表格。

3. **操作：Update global skills (更新全域技能)**：
   - 呼叫 `ask_question` 工具：
     - **問題 (Question)**: "請選擇更新模式："
     - **選項 (Options)**:
       - `"Force (強制重新整理：全面掃描與語意重寫)"`
       - `"Quick (快速更新：只掃描增量技能)"`
   - 執行掃描腳本：
     - Force 模式：`node scripts/scan-gate-skills.js --mode force`
     - Quick 模式：`node scripts/scan-gate-skills.js --mode quick`
   - **關鍵輸出格式**：讀取生成的原始 JSON 檔案，進行優雅的繁體中文翻譯與語意分析，**產出完全符合 `skill-list-template.md` 格式與排版的繁體中文 `global-skill-list.md` 檔案**。同時更新 `global-skill-list.json`（其中此 JSON 檔不包含描述欄位，僅保留名稱、路徑與 MCP 標記）。

4. **操作：Update project skills (更新專案技能)**：
   - **注意**：如果工作區路徑位於 `C:\Users\9910008\.gemini\antigravity` 等全局配置資料夾中，應自動排除並跳過專案技能的生成，以防止目錄污染。
   - 執行掃描腳本：
     - `node scripts/scan-gate-skills.js --mode force --workspace <當前工作區路徑>`
   - **關鍵輸出格式**：進行繁體中文翻譯與語意分析，並將產出的專案技能檔案**依照 `skill-list-template.md` 樣板格式**以繁體中文寫入專案目錄下的 `project-skill-list.md`，同時更新 `project-skill-list.json`。
