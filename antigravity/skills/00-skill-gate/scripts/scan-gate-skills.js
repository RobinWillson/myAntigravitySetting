#!/usr/bin/env node
/**
 * scan-gate-skills.js
 * Scans Antigravity skills and MCP plugins to produce skill path lists.
 * Super lightweight and token-efficient: only exports names and filesystem paths.
 *
 * Usage:
 *   node scan-gate-skills.js [--workspace <path>] [--output <dir>]
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// ── Config ──────────────────────────────────────────────────────────────────
const HOME = os.homedir();

const GLOBAL_SKILLS_PATH = path.join(HOME, '.gemini', 'antigravity', 'skills');
const GLOBAL_PLUGINS_PATH = path.join(HOME, '.gemini', 'config', 'plugins');

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};
  const raw = match[1];
  const result = {};
  const lines = raw.split('\n');
  for (const line of lines) {
    const simpleMatch = line.match(/^(\w[\w-]*):\s*(.+)/);
    if (simpleMatch) {
      result[simpleMatch[1]] = simpleMatch[2].trim().replace(/^["']|["']$/g, '');
    }
  }
  return result;
}

function readSkill(dirPath, type) {
  const skillFile = path.join(dirPath, 'SKILL.md');
  if (!fs.existsSync(skillFile)) return null;

  try {
    const content = fs.readFileSync(skillFile, 'utf8');
    const front = parseFrontmatter(content);
    if (!front.name) return null;

    return {
      name: front.name,
      path: skillFile,
      type: type,
      isMCP: false
    };
  } catch (e) {
    return null;
  }
}

function scanSkillsDir(basePath, type, cacheMap) {
  const results = [];
  if (!fs.existsSync(basePath)) return results;

  const entries = fs.readdirSync(basePath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const skillDir = path.join(basePath, entry.name);
    
    const skillFile = path.join(skillDir, 'SKILL.md');
    const normSkillPath = skillFile.replace(/\\/g, '/').toLowerCase();
    
    let skill = null;
    if (cacheMap && cacheMap.has(normSkillPath)) {
      const cached = cacheMap.get(normSkillPath);
      skill = {
        name: cached.name,
        path: skillFile,
        type: type,
        isMCP: !!cached.isMCP
      };
    } else {
      skill = readSkill(skillDir, type);
    }

    if (skill) {
      results.push(skill);
    } else {
      try {
        const subEntries = fs.readdirSync(skillDir, { withFileTypes: true });
        for (const sub of subEntries) {
          if (sub.isDirectory() && !sub.name.startsWith('.')) {
            const subSkillDir = path.join(skillDir, sub.name);
            const subSkillFile = path.join(subSkillDir, 'SKILL.md');
            const normSubPath = subSkillFile.replace(/\\/g, '/').toLowerCase();
            
            let subSkill = null;
            if (cacheMap && cacheMap.has(normSubPath)) {
              const cached = cacheMap.get(normSubPath);
              subSkill = {
                name: cached.name,
                path: subSkillFile,
                type: type,
                isMCP: !!cached.isMCP
              };
            } else {
              subSkill = readSkill(subSkillDir, type);
            }
            if (subSkill) results.push(subSkill);
          }
        }
      } catch (e) {
        // Ignored
      }
    }
  }
  return results;
}

function scanMCPs(pluginsPath, cacheMap) {
  const results = [];
  if (!fs.existsSync(pluginsPath)) return results;

  const entries = fs.readdirSync(pluginsPath, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const pluginDir = path.join(pluginsPath, entry.name);
    const pluginJsonPath = path.join(pluginDir, 'plugin.json');
    const normPath = pluginJsonPath.replace(/\\/g, '/').toLowerCase();

    if (fs.existsSync(pluginJsonPath)) {
      if (cacheMap && cacheMap.has(normPath)) {
        const cached = cacheMap.get(normPath);
        results.push({
          name: cached.name,
          path: pluginJsonPath,
          type: 'global',
          isMCP: true
        });
      } else {
        try {
          const info = JSON.parse(fs.readFileSync(pluginJsonPath, 'utf8'));
          results.push({
            name: info.name || entry.name,
            path: pluginJsonPath,
            type: 'global',
            isMCP: true
          });
        } catch (e) {
          // Ignored
        }
      }
    }
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  
  const wsIndex = args.indexOf('--workspace');
  const workspacePath = wsIndex !== -1 ? args[wsIndex + 1] : null;

  const outIndex = args.indexOf('--output');
  const outputDir = outIndex !== -1 ? args[outIndex + 1] : __dirname;

  const modeIndex = args.indexOf('--mode');
  const mode = modeIndex !== -1 ? args[modeIndex + 1] : 'force';

  console.log(`Starting token-efficient skill scan (Mode: ${mode})...`);

  // Load existing global skills cache if in quick mode
  let existingGlobalMap = new Map();
  let existingProjectMap = new Map();
  if (mode === 'quick') {
    const globalListJsonPath = path.join(outputDir, 'asset', 'global-skill-list.json');
    if (fs.existsSync(globalListJsonPath)) {
      try {
        const existingList = JSON.parse(fs.readFileSync(globalListJsonPath, 'utf8'));
        for (const item of existingList) {
          if (item.path) {
            existingGlobalMap.set(item.path.replace(/\\/g, '/').toLowerCase(), item);
          }
        }
        console.log(`Loaded ${existingGlobalMap.size} existing global items for incremental comparison.`);
      } catch (e) {
        console.log('Failed to parse existing global-skill-list.json, falling back to full scan.');
      }
    }
  }

  let skills = [];
  let mcps = [];

  // 1. Scan Global Skills
  if (fs.existsSync(GLOBAL_SKILLS_PATH)) {
    console.log(`Scanning global skills: ${GLOBAL_SKILLS_PATH}`);
    skills.push(...scanSkillsDir(GLOBAL_SKILLS_PATH, 'global', existingGlobalMap));
  }

  // 2. Scan Global Plugins (Plugin skills & MCPs)
  if (fs.existsSync(GLOBAL_PLUGINS_PATH)) {
    console.log(`Scanning global plugins: ${GLOBAL_PLUGINS_PATH}`);
    mcps.push(...scanMCPs(GLOBAL_PLUGINS_PATH, existingGlobalMap));
    
    const pluginFolders = fs.readdirSync(GLOBAL_PLUGINS_PATH, { withFileTypes: true });
    for (const folder of pluginFolders) {
      if (folder.isDirectory() && !folder.name.startsWith('.')) {
        const skillsSubdir = path.join(GLOBAL_PLUGINS_PATH, folder.name, 'skills');
        if (fs.existsSync(skillsSubdir)) {
          skills.push(...scanSkillsDir(skillsSubdir, 'global', existingGlobalMap));
        }
      }
    }
  }

  // 3. Scan Workspace/Project Skills
  let projectSkills = [];
  let skipProjectScan = false;

  if (workspacePath) {
    const normalizedWorkspace = path.resolve(workspacePath).replace(/\\/g, '/');
    const normalizedGlobalBase = path.resolve(GLOBAL_SKILLS_PATH, '..').replace(/\\/g, '/');

    if (normalizedWorkspace === normalizedGlobalBase || normalizedWorkspace.startsWith(normalizedGlobalBase + '/')) {
      console.log(`⚠️ Workspace is within the global setting directory (${normalizedGlobalBase}). Skipping project skill scanning.`);
      skipProjectScan = true;
    } else {
      // Load existing project skills cache if in quick mode
      if (mode === 'quick') {
        const projAssetDir = path.join(workspacePath, '.agent', 'skills', '00-skill-gate', 'asset');
        const projListJsonPath = path.join(projAssetDir, 'project-skill-list.json');
        if (fs.existsSync(projListJsonPath)) {
          try {
            const existingList = JSON.parse(fs.readFileSync(projListJsonPath, 'utf8'));
            for (const item of existingList) {
              if (item.path) {
                existingProjectMap.set(item.path.replace(/\\/g, '/').toLowerCase(), item);
              }
            }
            console.log(`Loaded ${existingProjectMap.size} existing project items for incremental comparison.`);
          } catch (e) {
            // Ignored
          }
        }
      }

      const wsDirs = [
        path.join(workspacePath, '.agents', 'skills'),
        path.join(workspacePath, 'skills-project')
      ];
      for (const wsDir of wsDirs) {
        if (fs.existsSync(wsDir)) {
          console.log(`Scanning project skills: ${wsDir}`);
          projectSkills.push(...scanSkillsDir(wsDir, 'project', existingProjectMap));
        }
      }
    }
  }

  // Deduplicate items by name
  const seenNames = new Set();
  const uniqueGlobalSkills = [];
  for (const s of skills) {
    if (!seenNames.has(s.name)) {
      seenNames.add(s.name);
      uniqueGlobalSkills.push(s);
    }
  }

  const uniqueMCPs = [];
  for (const m of mcps) {
    if (!seenNames.has(m.name)) {
      seenNames.add(m.name);
      uniqueMCPs.push(m);
    }
  }

  const uniqueProjectSkills = [];
  const seenProj = new Set();
  for (const s of projectSkills) {
    if (!seenProj.has(s.name)) {
      seenProj.add(s.name);
      uniqueProjectSkills.push(s);
    }
  }

  // Determine output asset folder path
  const assetDir = path.join(outputDir, 'asset');
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
  }

  // Compile global items
  const globalItems = [...uniqueGlobalSkills, ...uniqueMCPs];
  const globalItemsMapped = globalItems.map(item => ({
    name: item.name,
    isMCP: item.isMCP,
    path: item.path.replace(/\\/g, '/')
  }));

  // Identify new global items for cache-task.json
  let newGlobalItems = [];
  if (mode === 'quick') {
    newGlobalItems = globalItemsMapped.filter(item => {
      const normPath = item.path.toLowerCase();
      return !existingGlobalMap.has(normPath);
    });
  } else {
    newGlobalItems = globalItemsMapped;
  }

  // Output global JSON file containing paths only
  const globalListJsonPath = path.join(assetDir, 'global-skill-list.json');
  fs.writeFileSync(globalListJsonPath, JSON.stringify(globalItemsMapped, null, 2), 'utf8');
  console.log(`Global paths exported to: ${globalListJsonPath}`);

  // Output cache-task.json
  const cacheTaskPath = path.join(assetDir, 'cache-task.json');
  fs.writeFileSync(cacheTaskPath, JSON.stringify(newGlobalItems, null, 2), 'utf8');
  console.log(`Cache task exported to: ${cacheTaskPath}`);

  // Generate project/workspace outputs if workspace is provided and not skipped
  if (workspacePath && !skipProjectScan) {
    const projAssetDir = path.join(workspacePath, '.agent', 'skills', '00-skill-gate', 'asset');
    if (!fs.existsSync(projAssetDir)) {
      fs.mkdirSync(projAssetDir, { recursive: true });
    }

    const projectItemsMapped = uniqueProjectSkills.map(item => ({
      name: item.name,
      path: item.path.replace(/\\/g, '/')
    }));

    // Identify new project items for project-cache-task.json
    let newProjectItems = [];
    if (mode === 'quick') {
      newProjectItems = projectItemsMapped.filter(item => {
        const normPath = item.path.toLowerCase();
        return !existingProjectMap.has(normPath);
      });
    } else {
      newProjectItems = projectItemsMapped;
    }

    const projListJsonPath = path.join(projAssetDir, 'project-skill-list.json');
    fs.writeFileSync(projListJsonPath, JSON.stringify(projectItemsMapped, null, 2), 'utf8');
    console.log(`Project paths exported to: ${projListJsonPath}`);

    const projCacheTaskPath = path.join(projAssetDir, 'project-cache-task.json');
    fs.writeFileSync(projCacheTaskPath, JSON.stringify(newProjectItems, null, 2), 'utf8');
    console.log(`Project cache task exported to: ${projCacheTaskPath}`);
  }

  console.log('✅ Scan successfully completed!');
}

main();
