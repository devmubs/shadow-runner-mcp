# Shadow-Runner MCP Server

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version: 1.0.0](https://img.shields.io/badge/Version-1.0.0-green.svg)

Shadow-Runner MCP Server is a Model Context Protocol (MCP) compatible backend that securely wraps the core comparison engine of the `shadow-runner` library. It exposes an HTTP API for AI agents and external clients to evaluate experimental code changes silently and without user risk.

---

## 📖 Table of Contents
1. [Overview & Architecture](#overview--architecture)
2. [Step-by-Step Installation](#step-by-step-installation)
3. [Configuration](#configuration)
4. [Usage Guide](#usage-guide)
5. [Deep Dive: How It Works](#deep-dive-how-it-works)
6. [License](#license)

---

## 🔍 Overview & Architecture

The architecture consists of two primary layers:
1. **The Transport Layer (Express.js)**: A lightweight, fast Node.js HTTP server mapping `POST /mcp/compare` endpoints.
2. **The Diff Engine (`mcp/tools.js`)**: A deeply ported diffing algorithm that breaks down structural differences in returned execution outputs.

This system guarantees that untested changes ("newOutput") can be sent securely over the wire alongside current canonical outputs ("oldOutput") and diffed. Any mismatches are detected and reported structurally.

---

## 🚀 Step-by-Step Installation

Follow these steps to set up the server locally or prepare it for production.

### Step 1: Clone the Repository
Clone this directory into your secure environment. Since this handles internal system evaluations, keep this codebase inside a private repository or secure networking boundaries.

```bash
git clone https://github.com/devmubs/shadow-runner-mcp.git
cd shadow-runner-mcp
```

### Step 2: Install Node Dependencies
Ensure you have Node.js (v16.0.0 or higher) installed on your system.
```bash
npm install
```
*This installs Express (for routing) and dotenv (for secret injection).*

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory. **Never commit this file to version control.**

```bash
touch .env
```

Populate the `.env` file with your specific configuration:
```env
PORT=3000
API_KEY=your_highly_secure_token_here
```

### Step 4: Boot the Server
Start the server process.

```bash
node server.js
```
The console will confirm that it's listening:
`Shadow-Runner MCP Server listening on port 3000`

---

## 🛠 Usage Guide

The exposed API is simple and stateless.

### Single Endpoint `POST /mcp/compare`

Send a JSON payload containing the old known-good output and the new experimental output.

**Example Request:**
```bash
curl -X POST http://localhost:3000/mcp/compare \
  -H "Authorization: Bearer your_highly_secure_token_here" \
  -H "Content-Type: application/json" \
  -d '{
        "oldOutput": {
          "status": "success",
          "data": { "id": 1, "active": true }
        },
        "newOutput": {
          "status": "success",
          "data": { "id": "1", "active": true }
        }
      }'
```

**Example Response:**
```json
{
  "match": false,
  "diffCount": 1,
  "diffs": [
    {
      "path": "$.data.id",
      "oldValue": 1,
      "newValue": "1"
    }
  ]
}
```

---

## 🧠 Deep Dive: How It Works

The Shadow-Runner MCP Server consists of two main pillars underneath the hood: `server.js` and `mcp/tools.js`.

### 1. The HTTP Layer (`server.js`)
- **Express Instantiation**: The server uses Express with `express.json({ limit: '10mb' })` to safely parse incoming highly-nested payload comparisons without crashing.
- **Authentication Guard**: A custom middleware inspects the `Authorization` header. Requests lacking a valid `Bearer <API_KEY>` receive an immediate `401 Unauthorized`, keeping internal application states safe from public probing.
- **Payload Validation**: The `/mcp/compare` controller asserts that both `oldOutput` and `newOutput` explicitly exist in `req.body` to prevent unnecessary processing or false-positive matching on `undefined` values.

### 2. The Diff Engine (`mcp/tools.js`)
The core functionality is driven by a recursive `deepDiff(oldVal, newVal, path)` mechanism:
- **Reference Equality**: Evaluates trivial identical object structures instantly via `Object.is()`.
- **Type Guarding**: Short-circuits comparisons if primitive data types mismatch outright (e.g., `Number` vs `String`).
- **Dates & Regex**: Custom parsers inspect strictly formatted instances. Date matching occurs via epoch timing `getTime()`, and RegEx via `.toString()`.
- **Arrays**: Evaluates both collections incrementally index-by-index. It inherently supports variable-length arrays and emits diffs mapping strictly to missing bounds, identifying `undefined` values for boundary mismatches `$[4]`.
- **Nested Objects**: Builds unified sets of keys mapped against both inputs. It traverses the tree recursively by concatenating string paths (`$.user.profile.age`). Any key missing from either domain explicitly results in a detected discrepancy.

All recursively identified structural inconsistencies are bubbled back up sequentially and bound to `compareOutputs`, wrapped with `try/catch` safety logic to ensure the Node process never crashes during arbitrary tree serialization.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
