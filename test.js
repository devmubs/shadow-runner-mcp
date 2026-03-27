const oldOutput = { user: "Alice", value: 100, active: true };
const newOutput = { user: "Alice", value: "100", active: true };

async function runTest() {
  try {
    console.log('Sending test request to MCP server...');
    const response = await fetch('http://localhost:3000/mcp/compare', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer my-super-secret-mcp-key'
      },
      body: JSON.stringify({ oldOutput, newOutput })
    });

    const data = await response.json();
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));

    if (data.match === false && data.diffCount === 1) {
      console.log('Test PASSED: Correctly identified the type difference in "value".');
    } else {
      console.error('Test FAILED: Output did not match expectations.');
    }
  } catch (err) {
    console.error('Test FAILED due to network/fetch error:', err);
  }
}

runTest();
