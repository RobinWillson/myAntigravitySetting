---
name: skill-security-scan
description: Scans other agent skills for security risks (e.g., unauthorized network access, arbitrary command execution, file system access). Use this skill whenever the user wants to audit, inspect, scan, or verify the security of any local or third-party skill.
---

# Skill Security Scan (安全掃描工具)

本 Skill 使 Agent 能夠使用 `skill-security-scan` 工具對其他 Agent 技能進行靜態安全審查，確保其在本地環境中執行的安全性。

## 🎯 核心功能

- **安全風險檢測**：對指定的 Skill 目錄進行掃描，偵測如外部網路請求、敏感檔案訪問（如 SSH 密鑰、`.env` 檔案）、危險命令執行（如 `rm -rf`）、程式碼注入或後門等風險。
- **風險評分與報告**：提供自動化風險評估分數，並生成易讀的 HTML、JSON 或終端機報告。

## 🛠️ 使用說明與步驟

當使用者要求對某個 Skill 進行安全審查或掃描時，請遵循以下步驟：

### 1. 確保環境與沙盒已就緒
本工具已安全安裝於您的全局 Python 虛擬沙盒環境中（路徑為 `~/.gemini/skills_py_env`）。
如果未來需要重新安裝或更新，請在 `~/.gemini/antigravity/skills/skill-security-scan` 目錄下，使用該沙盒的 pip 執行本地開發安裝：
```bash
~/.gemini/skills_py_env/bin/pip install -e .
```

### 2. 執行安全掃描
Agent 必須調用該沙盒環境內的 `skill-security-scan` 可執行檔，對指定的 Skill 資料夾路徑執行靜態掃描：
```bash
# 呼叫沙盒執行檔，掃描指定路徑並輸出彩色終端機摘要
~/.gemini/skills_py_env/bin/skill-security-scan scan /path/to/target/skill --format console
```

### 3. 生成詳細 HTML 報告
若需要詳細的圖形化安全分析報告，可以執行：
```bash
~/.gemini/skills_py_env/bin/skill-security-scan scan /path/to/target/skill --format html --output /path/to/report.html
```

### 4. 向使用者匯報結果
分析掃描結果中的 **Risk Level (風險等級)** 與具體的問題項目（CRITICAL/WARNING），向使用者給出是否推薦使用的安全評估建議。

