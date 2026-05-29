#!/usr/bin/env node
/**
 * scan-skills.js
 * Scans all Antigravity skill directories, parses SKILL.md frontmatter,
 * and writes the result to skills_cache.json in the skill-manager folder.
 *
 * Usage:
 *   node scan-skills.js [--workspace <path>]
 *
 * Options:
 *   --workspace <path>   Path to a workspace root to also scan <workspace>/.agents/skills/
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Config ──────────────────────────────────────────────────────────────────

const HOME = os.homedir();

/** Directories to scan. Each entry describes a source label and a base path.
 *  For plugin paths, set `isPluginRoot: true` so we walk one level deeper
 *  looking for a `skills/` subdirectory inside each plugin folder.
 */
const SCAN_SOURCES = [
  {
    source: 'user',
    label: 'User Skills',
    basePath: path.join(HOME, '.gemini', 'antigravity', 'skills'),
  },
  {
    source: 'plugin',
    label: 'Plugin Skills',
    basePath: path.join(HOME, '.gemini', 'config', 'plugins'),
    isPluginRoot: true,   // walk plugin/<name>/skills/ and plugin/<name>/skills/<name>/
  },
];

// Output file — lives next to this script's parent SKILL.md
const OUTPUT_PATH = path.join(__dirname, '..', 'skills_cache.json');

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Parse YAML frontmatter block (between --- delimiters) into a plain object.
 *  Supports simple scalars, block scalars (|, |-, >, >-), and simple lists.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const raw = match[1];
  const result = {};
  const lines = raw.split('\n');
  let i = 0;

  /** Collect indented block lines starting at current i; advances i past them. */
  function collectBlock(foldSpaces) {
    const blockLines = [];
    while (i < lines.length && (lines[i].startsWith('  ') || lines[i].trim() === '')) {
      blockLines.push(lines[i].replace(/^  /, ''));
      i++;
    }
    if (foldSpaces) {
      // folded (>) style: join with spaces, paragraph breaks on blank lines
      return blockLines
        .join('\n')
        .replace(/([^\n])\n([^\n])/g, '$1 $2')
        .replace(/\n+/g, '\n')
        .trim();
    }
    // literal (|) style: keep newlines
    return blockLines.join('\n').trim();
  }

  while (i < lines.length) {
    const line = lines[i];

    // Key: |  or  Key: |-  (literal block scalar)
    const literalMatch = line.match(/^(\w[\w-]*):\s*\|[-]?\s*$/);
    if (literalMatch) {
      i++;
      result[literalMatch[1]] = collectBlock(false);
      continue;
    }

    // Key: >  or  Key: >-  (folded block scalar)
    const foldedMatch = line.match(/^(\w[\w-]*):\s*>[-]?\s*$/);
    if (foldedMatch) {
      i++;
      result[foldedMatch[1]] = collectBlock(true);
      continue;
    }

    // Key: value  (simple scalar — must come after block-scalar checks)
    const simpleMatch = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (simpleMatch) {
      result[simpleMatch[1]] = simpleMatch[2].trim().replace(/^["']|["']$/g, '');
      i++;
      continue;
    }

    // Key:  (empty value — could be a list that follows)
    const emptyMatch = line.match(/^(\w[\w-]*):\s*$/);
    if (emptyMatch) {
      const key = emptyMatch[1];
      const items = [];
      i++;
      while (i < lines.length && lines[i].match(/^\s+-\s/)) {
        items.push(lines[i].replace(/^\s+-\s/, '').trim());
        i++;
      }
      result[key] = items.length ? items : '';
      continue;
    }

    i++;
  }

  return result;
}

/** Given a directory, check if it contains SKILL.md and return parsed data. */
function readSkill(dirPath, source, label) {
  const skillFile = path.join(dirPath, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return null;

  try {
    const content = fs.readFileSync(skillFile, 'utf8');
    const front = parseFrontmatter(content);

    if (!front.name) return null;   // Not a valid skill

    // Extract slash commands from body (e.g. `/ship`, `/qa`)
    const body = content.replace(/^---[\s\S]*?---/, '');
    const slashCommands = [...new Set((body.match(/`\/[\w-]+`/g) || [])
      .map(s => s.replace(/`/g, '')))];

    return {
      name: front.name,
      description: (front.description || '').replace(/\n+/g, ' ').trim(),
      slashCommands,
      path: dirPath,
      source,
      sourceLabel: label,
    };
  } catch (e) {
    console.warn(`  ⚠️  Could not read ${skillFile}: ${e.message}`);
    return null;
  }
}

/** Collect skill entries from a flat skills directory (one subfolder = one skill). */
function scanFlatDir(basePath, source, label) {
  const results = [];
  if (!fs.existsSync(basePath)) return results;

  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;

    const skillDir = path.join(basePath, entry.name);
    const skill = readSkill(skillDir, source, label);
    if (skill) results.push(skill);
  }
  return results;
}

/** Collect skill entries from a plugin root directory.
 *  Structure: plugins/<plugin-name>/skills/<skill-name>/SKILL.md
 *  But also handles: plugins/<plugin-name>/skills/SKILL.md (single-skill plugin)
 */
function scanPluginRoot(basePath) {
  const results = [];
  if (!fs.existsSync(basePath)) return results;

  const plugins = fs.readdirSync(basePath, { withFileTypes: true });
  for (const plugin of plugins) {
    if (!plugin.isDirectory() || plugin.name.startsWith('.')) continue;

    const skillsDir = path.join(basePath, plugin.name, 'skills');
    if (!fs.existsSync(skillsDir)) continue;

    const label = `Plugin: ${plugin.name}`;

    // Check if skills/ itself has a SKILL.md (single-skill plugin)
    const directSkill = readSkill(skillsDir, 'plugin', label);
    if (directSkill) {
      results.push(directSkill);
      continue;
    }

    // Otherwise walk subdirs inside skills/
    const subEntries = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const sub of subEntries) {
      if (!sub.isDirectory() || sub.name.startsWith('.')) continue;
      const subDir = path.join(skillsDir, sub.name);
      const skill = readSkill(subDir, 'plugin', label);
      if (skill) results.push(skill);
    }
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  const wsIndex = args.indexOf('--workspace');
  const workspacePath = wsIndex !== -1 ? args[wsIndex + 1] : null;

  const allSkills = [];

  for (const src of SCAN_SOURCES) {
    if (src.isPluginRoot) {
      console.log(`🔌 Scanning plugin skills: ${src.basePath}`);
      const found = scanPluginRoot(src.basePath);
      console.log(`   Found ${found.length} skill(s)`);
      allSkills.push(...found);
    } else {
      console.log(`📁 Scanning ${src.label}: ${src.basePath}`);
      const found = scanFlatDir(src.basePath, src.source, src.label);
      console.log(`   Found ${found.length} skill(s)`);
      allSkills.push(...found);
    }
  }

  // Optional: workspace-local skills
  if (workspacePath) {
    const wsSkillsDir = path.join(workspacePath, '.agents', 'skills');
    console.log(`📂 Scanning workspace skills: ${wsSkillsDir}`);
    const found = scanFlatDir(wsSkillsDir, 'workspace', 'Workspace Skills');
    console.log(`   Found ${found.length} skill(s)`);
    allSkills.push(...found);
  }

  // Remove duplicates (same name from same path)
  const seen = new Set();
  const unique = allSkills.filter(s => {
    const key = s.path;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const output = {
    scanned_at: new Date().toISOString(),
    total: unique.length,
    skills: unique,
  };

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf8');

  console.log(`\n✅ Scan complete — ${unique.length} skill(s) saved to:`);
  console.log(`   ${OUTPUT_PATH}`);
}

main();
