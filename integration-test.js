const { spawn } = require('child_process');
const http = require('http');

const serverProc = spawn('node', ['server.js'], { stdio: 'pipe' });

serverProc.stdout.on('data', data => {
  const msg = data.toString();
  console.log('[Server]', msg.trim());
  if (msg.includes('listening on port')) {
    runTest();
  }
});

serverProc.stderr.on('data', data => {
  console.error('[Server Error]', data.toString().trim());
});

async function runTest() {
  const oldOutput = { user: "Alice", value: 100, active: true };
  const newOutput = { user: "Alice", value: "100", active: true };
  
  const payload = JSON.stringify({ oldOutput, newOutput });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/mcp/compare',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer my-super-secret-mcp-key',
      'Content-Length': payload.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('[Test] Response Status:', res.statusCode);
      console.log('[Test] Response Body:', data);
      
      const json = JSON.parse(data);
      if (res.statusCode === 200 && json.match === false && json.diffCount === 1) {
        console.log('[Test] Integration test PASSED.');
      } else {
        console.error('[Test] Integration test FAILED. Unexpected outcome.');
      }
      serverProc.kill();
    });
  });

  req.on('error', (e) => {
    console.error(`[Test] problem with request: ${e.message}`);
    serverProc.kill();
  });

  req.write(payload);
  req.end();
}
