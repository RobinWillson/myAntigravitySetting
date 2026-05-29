---
name: skill-manager
description: >
  Manages all locally installed Antigravity agent skills.
  Use this skill when the user says "list my skills", "show my skills", "what skills do I have?",
  "what can you do?", or asks about trigger commands for a skill.
  Also use when the user says "scan my skills", "refresh skills", or "update skills cache"
  to re-scan the filesystem and rebuild the cache.
---

# Skill Manager

Provides two commands for managing your installed skills:

| Command | What it does |
|---------|-------------|
| **"scan my skills"** | Runs the JS scan script → saves results to `skills_cache.json` |
| **"list my skills"** | Reads `skills_cache.json` and prints a formatted table |

---

## Command 1 — `scan my skills`

**Trigger phrases:** "scan my skills", "refresh skills cache", "update skills", "rebuild skills list"

### Steps

1. Run the scan script using Node.js:

```bash
node ~/.gemini/antigravity/skills/skill-manager/scripts/scan-skills.js
```

To also include a workspace's local skills, pass the workspace root:

```bash
node ~/.gemini/antigravity/skills/skill-manager/scripts/scan-skills.js --workspace /path/to/workspace
```

2. The script will:
   - Scan `~/.gemini/antigravity/skills/` (user skills)
   - Scan `~/.gemini/config/plugins/*/skills/` (plugin skills)
   - Optionally scan `<workspace>/.agents/skills/` (workspace skills)
   - Parse each `SKILL.md` frontmatter for `name` and `description`
   - Detect any slash commands (e.g. `/ship`, `/qa`) mentioned in the skill body
   - Write results to `~/.gemini/antigravity/skills/skill-manager/skills_cache.json`

3. After the script finishes, confirm to the user:
   - How many skills were found
   - When the scan was done (`scanned_at` from the JSON)
   - That they can now say "list my skills" to see the results

---

## Command 2 — `list my skills`

**Trigger phrases:** "list my skills", "show my skills", "what skills do I have?", "what can you do?", "skill list"

### Steps

1. Read the cache file:

```
~/.gemini/antigravity/skills/skill-manager/skills_cache.json
```

2. If the file **does not exist**, tell the user:
   > "No skills cache found. Say **'scan my skills'** first so I can build the list."

3. If the file exists, parse it and render a **markdown table grouped by `sourceLabel`**:

```
## 🧰 My Installed Skills
_Last scanned: <scanned_at>  •  Total: <total>_

### 📁 User Skills
| Skill | Description | Triggers / Slash Commands |
|-------|-------------|--------------------------|
| skill-name | Brief description (1–2 sentences) | "phrase 1", "phrase 2", `/slash` |
...

### 🔌 Plugin: <plugin-name>
| Skill | Description | Triggers / Slash Commands |
|-------|-------------|--------------------------|
...
```

4. **Formatting rules:**
   - Truncate `description` to ≤ 120 characters if needed, ending with `…`
   - For triggers, extract the **top 3–5 most distinctive phrases** from the description (look for quoted strings like `"do X"`, action verbs, slash commands)
   - List slash commands from `slashCommands` array if present
   - Group sections in this order: user → plugin → workspace
   - Omit a group if it has no skills

5. After the table, print the tip block:

```
💡 **Tip**
- **Rescan:** say "scan my skills" (or pass --workspace to include a project's local skills)
- **Find more:** `npx skills find <query>` or https://skills.sh/
- **Install:** `npx skills add <owner/repo@skill> -g -y`
- **Create your own:** ask me to use the `skill-creator` skill
- **Security-check before installing:** ask me to use the `skill-security-scan` skill
```

---

## Cache File Format

The `skills_cache.json` written by the scan script has this structure:

```json
{
  "scanned_at": "2026-05-28T11:00:00.000Z",
  "total": 22,
  "skills": [
    {
      "name": "skill-name",
      "description": "Full description from frontmatter",
      "slashCommands": ["/ship", "/qa"],
      "path": "/absolute/path/to/skill/directory",
      "source": "user | plugin | workspace",
      "sourceLabel": "User Skills | Plugin: chrome-devtools-plugin | Workspace Skills"
    }
  ]
}
```
