---
name: chrome-extension-standard
description: Guideline and instructions for building Chrome Extensions in this workspace following the user's dynamic scripting injection, storage DB, and UI separation architecture.
---
# Chrome Extension Standard Skill

This skill guides the design, implementation, and modification of Chrome Extensions in this workspace.

## Core Rules

1. **Manifest V3**: All extensions must target Manifest V3.
2. **Minimal Permissions**: Declare only essential permissions in `manifest.json` (`storage`, `scripting`, `activeTab`, `tabs`).
3. **No Automatic Persistent Content Scripts**:
   - Avoid injecting content scripts into every matching domain by default.
   - Use `chrome.scripting.executeScript` from the popup context to dynamically inject automation scripts only when requested by the user.
4. **Data Management via `chrome.storage.local`**:
   - Use a single database key (e.g., `keyWordResult`) storing an array of structured items.
   - Items must follow the time-series model:
     ```typescript
     interface Record {
       keyword: string;
       data: Array<{ searchVolume: number | string; createDate: string }>;
       tag: string;
       lastUpdate: string;
       note: string;
     }
     ```
5. **Batch Saving (Queue Management)**:
   - For high-volume scraping, implement batch saving (every 20 items) to limit local storage writes and prevent I/O blocking.
6. **Task & Automation Polling**:
   - Simulated input elements must dispatch `'input'` events: `el.dispatchEvent(new Event('input', { bubbles: true }))`.
   - Implement polling with a max timeout limit to wait for dynamic elements.
7. **UX Rules**:
   - Clean up audio interference on startup (automatically mute/stop other tabs).
   - Use a full-tab dashboard (`src/frontEnd/data-view.html`) for large data tables, filters, pagination, and settings instead of overloading the popup window.

Refer to [extension_architecture_standard.md](./reference/extension_architecture_standard.md) for full implementation details.
