const { spawn } = require('child_process');
const path = require('path');

const userProfile = process.env.USERPROFILE || process.env.HOME;
const bridgePath = path.join(userProfile, '.npm-global', 'node_modules', 'mcp-chrome-bridge', 'dist', 'mcp', 'mcp-server-stdio.js');
const scriptsPath = path.join(userProfile, '.gemini', 'antigravity', 'skills', 'mcp-chrome', 'scripts');

const child = spawn('node', [bridgePath], {
  cwd: scriptsPath
});
let out = '';

// JavaScript code to execute inside the browser
const scrapeCode = `
  if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props) {
    try {
      const pageProps = window.__NEXT_DATA__.props.pageProps;
      if (pageProps && pageProps.products) {
        return { source: 'next_data_products', data: pageProps.products.map(p => ({
          title: p.title || p.name,
          data: p.dataAmount || p.data,
          validity: p.validity,
          price: p.price,
          carrier: p.carrier || p.network
        })) };
      }
      if (pageProps && pageProps.dehydratedState && pageProps.dehydratedState.queries) {
        // Find products from dehydrated state
        for (const query of pageProps.dehydratedState.queries) {
          if (query.state && query.state.data && query.state.data.products) {
            return { source: 'dehydrated_products', data: query.state.data.products.map(p => ({
              title: p.title || p.name || p.displayName,
              data: p.dataAmount || p.data || p.packageSize,
              validity: p.validity || p.duration,
              price: p.price || p.cost,
              carrier: p.carrier || p.network || p.operatorName
            })) };
          }
        }
      }
    } catch (e) {}
  }
  // DOM Fallback
  const cards = [];
  const processed = new Set();
  document.querySelectorAll('div').forEach(el => {
    const text = el.innerText || '';
    if (text.includes('$') && (text.includes('GB') || text.toLowerCase().includes('unlimited')) && text.length < 500) {
      let isSmallest = true;
      el.querySelectorAll('*').forEach(child => {
        const childText = child.innerText || '';
        if (childText.includes('$') && (childText.includes('GB') || childText.toLowerCase().includes('unlimited'))) {
          isSmallest = false;
        }
      });
      if (isSmallest && !processed.has(text)) {
        processed.add(text);
        cards.push({ rawText: text.replace(/\\n+/g, ' | ') });
      }
    }
  });
  return { source: 'dom_fallback', data: cards };
`;

child.stdout.on('data', d => {
  out += d.toString();
  const lines = out.split('\n');
  out = lines.pop(); // Keep the partial line

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const res = JSON.parse(line);
      if (res.id === 1) {
        // Step 1: Request active windows and tabs to find the correct tabId dynamically
        child.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized'
        }) + '\n');
        
        child.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'tools/call',
          params: {
            name: 'get_windows_and_tabs',
            arguments: {}
          }
        }) + '\n');
      } else if (res.id === 2) {
        // Step 2: Parse tab list to find MobiMatter tabId
        let mobiTabId = null;
        try {
          const data = JSON.parse(res.result.content[0].text);
          if (data && data.windows) {
            for (const win of data.windows) {
              if (win.tabs) {
                for (const tab of win.tabs) {
                  if (tab.url && tab.url.includes('mobimatter.com')) {
                    mobiTabId = tab.tabId;
                    break;
                  }
                }
              }
              if (mobiTabId) break;
            }
          }
        } catch (e) {
          console.error("Failed to parse get_windows_and_tabs result:", e);
        }

        if (!mobiTabId) {
          console.error("Error: Could not find any active MobiMatter tab.");
          process.exit(1);
        }

        // Step 3: Run the scraper in the found tab
        child.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'chrome_javascript',
            arguments: {
              code: scrapeCode,
              tabId: mobiTabId
            }
          }
        }) + '\n');
      } else if (res.id === 3) {
        // Step 4: Save and output the result
        console.log(JSON.stringify(res.result, null, 2));
        try {
          const fs = require('fs');
          fs.writeFileSync('C:\\Users\\9910008\\.gemini\\antigravity-ide\\brain\\a70ce0e3-35a5-4732-be1a-955e37a38557\\scratch\\scrape_result.json', JSON.stringify(res.result, null, 2));
          console.log("Successfully wrote output to scrape_result.json");
        } catch (e) {
          console.error("Failed to write result file:", e);
        }
        process.exit(0);
      }
    } catch (e) {
      // not complete JSON
    }
  }
});

child.stderr.on('data', d => {
  console.error("STDERR:", d.toString());
});

// Start the sequence
child.stdin.write(JSON.stringify({
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: {
      name: 'antigravity-custom',
      version: '1.0.0'
    }
  }
}) + '\n');

// Timeout fallback
setTimeout(() => {
  console.error("Timeout waiting for response");
  process.exit(1);
}, 10000);
