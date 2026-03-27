const express = require('express');
const config = require('./mcp/config');
const { compareOutputs } = require('./mcp/tools');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// A simple authentication middleware using API_KEY
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${config.API_KEY}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// The main MCP endpoint for comparing outputs
app.post('/mcp/compare', authenticate, (req, res) => {
  const { oldOutput, newOutput } = req.body;

  if (oldOutput === undefined || newOutput === undefined) {
    return res.status(400).json({
      error: 'Missing oldOutput or newOutput in request body.',
    });
  }

  const result = compareOutputs(oldOutput, newOutput);

  // Return the result
  res.json(result);
});

// Start the server
app.listen(config.PORT, () => {
  console.log(`Shadow-Runner MCP Server listening on port ${config.PORT}`);
  console.log(`Requires Authorization Header: Bearer <API_KEY>`);
});
