const { spawn } = require('child_process');
const targetUrl = process.argv[2] || 'https://www.google.com';
let targetWindowId = process.argv[3] ? parseInt(process.argv[3], 10) : null;

const child = spawn('node', ['C:\\Users\\9910008\\.npm-global\\node_modules\\mcp-chrome-bridge\\dist\\mcp\\mcp-server-stdio.js']);
let out = '';

child.stdout.on('data', d => {
  out += d.toString();
  const lines = out.split('\n');
  out = lines.pop(); // Keep the partial line

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const res = JSON.parse(line);
      if (res.id === 1) {
        // initialized notification
        child.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized'
        }) + '\n');
        
        if (targetWindowId !== null) {
          // If windowId is provided directly, open the tab
          openTabInWindow(targetWindowId);
        } else {
          // Otherwise, query active windows first
          child.stdin.write(JSON.stringify({
            jsonrpc: '2.0',
            id: 2,
            method: 'tools/call',
            params: {
              name: 'get_windows_and_tabs',
              arguments: {}
            }
          }) + '\n');
        }
      } else if (res.id === 2) {
        // Parse windowId from active windows
        const data = JSON.parse(res.result.content[0].text);
        if (data && data.windows && data.windows.length > 0) {
          const windowId = data.windows[0].windowId;
          openTabInWindow(windowId);
        } else {
          console.error("No active window found.");
          process.exit(1);
        }
      } else if (res.id === 3) {
        // Output final result of tab creation
        console.log(JSON.stringify(res.result, null, 2));
        process.exit(0);
      }
    } catch (e) {
      // not complete JSON
    }
  }
});

function openTabInWindow(windowId) {
  child.stdin.write(JSON.stringify({
    jsonrpc: '2.0',
    id: 3,
    method: 'tools/call',
    params: {
      name: 'chrome_navigate',
      arguments: {
        url: targetUrl,
        windowId: windowId
      }
    }
  }) + '\n');
}

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
}, 5000);
