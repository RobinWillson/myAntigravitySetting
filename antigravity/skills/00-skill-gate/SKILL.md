---
name: 00-skill-gate
description: "技能守門員。必須在所有對話的最開始執行。它會攔截使用者的初始輸入，並將其與所有已安裝的全局和專案技能/MCP 進行比對，判斷是否有適用的工具，並列出選項供使用者選擇。在每次對話中請務必最先執行此技能，以防止重複任務並引導工具選擇。同時處理 /00-skill-gate 與 /gate 命令選單。"
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

## 🛠️ 流程 2：指令功能選單 (`/00-skill-gate` 或 `/gate`)

當使用者輸入 `/00-skill-gate` 或 `/gate` 時，觸發交互式主選單。

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
   - 讀取 `cache-task.json`
   - **User_Note 載入與保護機制 (重要！)**：
     - 讀取獨立的備份檔案 `asset/user-notes.md`（若存在），解析出各技能對應的 `User_Note` 手寫內容。
     - 讀取現存的 `global-skill-list.md`（若存在），解析出各技能對應的 `### [User_Note]` 底下內容。
     - 將上述兩處讀取到的筆記進行合併（以 `user-notes.md` 內容優先），建立筆記映射表。
   - **關鍵輸出格式**：
     - 讀取 `cache-task.json` 檔案。如果此 JSON 陣列為空 `[]`，表示無新技能。Agent 需將提取的舊筆記與現有 MD 重新確認，並同步寫回/更新 `asset/user-notes.md` 進行備份，然後向使用者回報更新完成。
     - 如果陣列不為空，Agent 僅對列在 `cache-task.json` 中的技能，讀取其對應的 `SKILL.md` / `plugin.json` 進行翻譯與描述編寫。
     - **Force 模式**：重新翻譯所有技能，重組時填入對應的 `User_Note` 內容。將最終產出依 `skill-list-template.md` 格式完整覆寫寫入 `global-skill-list.md`。
     - **Quick 模式**：讀取現有的 `global-skill-list.md`，將新增技能的翻譯描述增量併入 Markdown 中，其餘舊技能描述與對應 `User_Note` 完整保留。
     - **孤兒備忘保留**：檢查筆記映射表中，是否有未配對到任何目前技能的筆記。若有，必須在 `global-skill-list.md` 最底部追加 `## ⚠️ 孤兒備忘錄 (Orphan Notes)` 區塊將其安全保留，防止遺失。
     - **雙向備份同步**：最後，Agent 應自動將合併後完整的筆記映射表更新並寫回 `asset/user-notes.md` 中，確保使用者手寫的內容隨時都有實體檔案安全備份。

4. **操作：Update project skills (更新專案技能)**：
   - **注意**：如果工作區路徑位於 `C:\Users\9910008\.gemini\antigravity` 等全局配置資料夾中，應自動排除並跳過專案技能的生成，以防止目錄污染。
   - 呼叫 `ask_question` 工具：
     - **問題 (Question)**: "請選擇更新模式："
     - **選項 (Options)**:
       - `"Force (強制重新整理：全面掃描與語意重寫)"`
       - `"Quick (快速更新：只掃描增量技能)"`
   - 執行掃描腳本：
     - Force 模式：`node scripts/scan-gate-skills.js --mode force --workspace <當前工作區路徑>`
     - Quick 模式：`node scripts/scan-gate-skills.js --mode quick --workspace <當前工作區路徑>`
   - 讀取 `project-cache-task.json`
   - **User_Note 載入與保護機制 (重要！)**：
     - 讀取專案下的獨立備份檔案 `.agent/skills/00-skill-gate/asset/project-user-notes.md`（若存在）。
     - 讀取現有的 `project-skill-list.md`（若存在），提取 `### [User_Note]` 的內容並建立映射表（獨立備份優先）。
   - **關鍵輸出格式**：
     - 讀取 `project-cache-task.json` 檔案。如果為空 `[]`，表示無新專案技能，Agent 同步備份筆記後回報完成。
     - 如果不為空，僅對列在 JSON 中的技能讀取檔案進行翻譯描述。
     - **Force 模式**：重新翻譯所有專案技能，回填 `User_Note` 筆記，完整覆寫專案目錄下的 `project-skill-list.md`。
     - **Quick 模式**：讀取現有的 `project-skill-list.md`，將新增技能的翻譯描述增量併入 Markdown 中，其餘舊有描述與筆記保留。
     - **孤兒備忘與雙向備份**：比對後剩餘的未配對筆記寫入 Markdown 尾部的 `## ⚠️ 孤兒備忘錄 (Orphan Notes)`。最後，將完整合併的專案筆記寫回 `.agent/skills/00-skill-gate/asset/project-user-notes.md` 進行備份。
