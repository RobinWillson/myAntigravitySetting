const { spawn } = require('child_process');
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
        // initialized notification is optional but good practice
        child.stdin.write(JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized'
        }) + '\n');
        
        // Call get_windows_and_tabs
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
        // Output result
        console.log(JSON.stringify(res.result, null, 2));
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
}, 5000);
