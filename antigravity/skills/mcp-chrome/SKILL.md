---
name: mcp-chrome
description: |
  使用 MCP Chrome 進行瀏覽器自動化與調試（取代舊版 chrome-devtools，保留登入狀態）。
---

# MCP Chrome

這是一個指向 `mcp-chrome-bridge` 的全域技能定義。因為它是一個純 MCP 伺服器，透過這個檔案讓 `00-skill-gate` 能夠辨識並將其列入 `global-skill-list.md`。

## 功能簡介
- 使用您的日常 Chrome 瀏覽器進行自動化操作與調試。
- 保留使用者的登入狀態與配置，避免無痕視窗帶來的困擾。

## 觸發條件
- 呼叫 Chrome 相關指令時，將會自動觸發。

## 查詢目前開啟網頁
- 執行 `./scripts/get_open_tabs.js`
- 如需更多詳細資訊，請參考：[get_open_tabs.md](./reference/get_open_tabs.md)

## 開啟新視窗
- 執行 `./scripts/open_new_window.js`
- 如需更多詳細資訊，請參考：[open_new_window.md](./reference/open_new_window.md)

## 開啟新分頁
- 執行 `./scripts/open_new_tab.js`
- 如需更多詳細資訊，請參考：[open_new_tab.md](./reference/open_new_tab.md)
