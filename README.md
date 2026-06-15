# SharpFlow AI
### The Unified Incentives API for the Agentic Web

[![NPM Version](https://img.shields.io/npm/v/@sharpflow/sdk?color=blue&style=flat-square)](https://www.npmjs.com/)
[![EVM Compatibility](https://img.shields.io/badge/EVM-Polygon--Amoy-8247e5?style=flat-square)](https://polygon.technology/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)]()
[![Security Audited](https://img.shields.io/badge/security-HMAC--SHA256-blueviolet?style=flat-square)]()
[![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)]()

**SharpFlow AI is a high-throughput, Web3-powered token settlement engine that allows developers to programmatically distribute, track, and redeem loyalty incentives (`SHARP` tokens) across AI agents and SaaS pipelines using simple developer APIs, webhooks, and client SDKs.**

---

## ⚡ The Problem

Modern applications lack a native, programmable value-exchange layer. Building user loyalty incentives, API gamification, or AI-agent micro-monetization today requires navigating three major roadblocks:

1. **No Developer-Friendly Incentive Layer:** Tradional loyalty programs rely on closed, database-locked points systems that lack real-world liquidity or cross-platform utility.
2. **Fragile Web3 Integration:** Interacting directly with blockchain smart contracts requires managing complex private keys, gas fees, RPC gateway fallbacks, and chain reorganizations in frontend code.
3. **No Automation Infrastructure for AI Agents:** As autonomous AI agents begin executing API requests on behalf of users, there is no standardized protocol to sponsor, rate-limit, or settle micro-transactions programmatically in real-time.

---

## 💡 The Solution: Stripe for Web3 Rewards

SharpFlow AI decouples the complexity of Web3 from your core business logic. By wrapping EVM-compatible ledger actions into a clean, developer-grade REST API, we allow you to spawn sponsored on-chain actions in seconds. 

Whether you are rewarding a user for a signup, billing an AI agent for token usage, or syncing event triggers through signed webhooks, SharpFlow AI handles the plumbing: gas sponsorship, RPC consensus, key rotation, and cryptographic signature validation.

---

## 🚀 Key Features

* **⚡ Gasless Token Payouts:** Distribute `SHARP` ERC-20 utility tokens directly to user wallets. Gas is sponsored by Polygon relayer nodes under the hood.
* **🔐 Enterprise-Grade Security:** All requests are secured using HMAC SHA-256 signatures, cryptographic nonces, and timestamp validation to prevent replay attacks.
* **📡 Real-Time Consensus Monitor:** Multi-node RPC consensus resolver monitors block finality and detects network divergences or chain reorganizations dynamically.
* **🧾 Resilient Webhook Engine:** Event-driven architecture dispatches `reward.success` and `spend.success` webhooks with automatic jittered exponential backoff retries.
* **⚛️ React `useSharp` Hook:** Lightweight frontend hooks for triggering micro-transactions and monitoring RPC finality state from client-side code.
* **📊 Multi-Language Client SDKs:** Production-ready packages available for TypeScript/JavaScript, with spec-compliant wrappers for Python and Go.

---

## 🧠 System Architecture

SharpFlow AI operates as a middleware engine between your application, user directories, and the blockchain layer:

```
    +-------------------------------------------------------+
    |                 Developer Application                 |
    +-------------------------------------------------------+
        | (API Call)                       ^ (Webhook Event)
        v                                  |
+-----------------------------------------------------------+
|                      SHARPFLOW ENGINE                     |
|                                                           |
|  +--------------------+          +---------------------+  |
|  |   API Gateway      |          |   Webhook Engine    |  |
|  |   (HMAC Signed)    |          |   (Jittered Retry)  |  |
|  +--------------------+          +---------------------+  |
|           |                                 ^             |
|           v                                 |             |
|  +-----------------------------------------------------+  |
|  |               Consensus RPC Resolver                |  |
|  |           (Alchemy / Infura / Polygon Node)         |  |
|  +-----------------------------------------------------+  |
|           |                                 ^             |
+-----------|---------------------------------|-------------+
            v                                 |
    +-------------------------------------------------------+
    |                     Polygon Ledger                    |
    |               (SHARP ERC-20 Settlement)               |
    +-------------------------------------------------------+
```

1. **Dashboard & Console (Next.js):** Developer interface to generate API keys, track telemetry, review logs, and manage webhook endpoints.
2. **Core API Engine (Node.js/Express):** Handles authentication scopes, checks rate limits, and structures cryptographic payloads.
3. **Consensus Resolver:** Queries multiple Amoy RPC endpoints to establish high-confidence block heights and guard against network latency.
4. **On-Chain Settlement (Polygon Amoy):** Deploys gasless mint/transfer commands to our audited smart contracts.

---

## ⚙️ How It Works (Developer Flow)

```
[Create Key] ----> [Install SDK] ----> [Trigger API] ----> [Ledger Mint] ----> [Webhook Event]
```

1. **Generate Credentials:** Create a secure Sandbox (`sf_sandbox_...`) or Production (`sf_live_...`) API key on the Developer Dashboard.
2. **Initialize SDK:** Load the SDK client library into your backend service.
3. **Trigger Reward:** Dispatch a reward action inside your route controller (e.g., on successful user checkout or referral).
4. **Relay Transaction:** The engine signs and pushes a gas-sponsored EVM transaction to the network ledger.
5. **Acknowledge Webhook:** Your server receives a signed webhook payload confirming the transaction has been safely mined on-chain.

---

## 📦 Installation & SDK Usage

Install the official client package into your Node.js or React repository:

```bash
npm install @sharpflow/sdk
```

### 1. Backend Payout Integration (Node.js)

```javascript
import { SharpFlow } from '@sharpflow/sdk';

// Initialize with your secret API key
const sharpflow = new SharpFlow({
  apiKey: process.env.SHARPFLOW_SECRET_KEY,
  environment: 'sandbox' // Use 'production' for live mainnet settlements
});

async function handleUserSignup(userId, walletAddress) {
  try {
    // Dispatch gas-sponsored reward on the ledger
    const response = await sharpflow.reward({
      wallet: walletAddress,
      amount: 50 // Settle 50 SHARP tokens
    });

    console.log(`✓ Settle initiated. Transaction Hash: ${response.data.txHash}`);
  } catch (error) {
    console.error(`✗ Reward settlement failed: ${error.message}`);
  }
}
```

### 2. Frontend Claims (React)

```jsx
import { useSharp } from '@sharpflow/react';

export default function ClaimRewardButton({ walletAddress }) {
  const { triggerReward, loading } = useSharp({
    onSuccess: (tx) => console.log('Settle confirmed on-chain:', tx.txHash),
    onError: (err) => console.error('Consensus check failed:', err.message),
    telemetry: true // Enables real-time RPC checking
  });

  return (
    <button 
      disabled={loading}
      onClick={() => triggerReward({ wallet: walletAddress, amount: 100 })}
      className="btn-primary"
    >
      {loading ? 'Confirming...' : 'Claim 100 SHARP'}
    </button>
  );
}
```

---

## 🔐 Security Specifications

SharpFlow AI is engineered to resist common API hijacking and transaction injection exploits:

### Cryptographic Signature Verification
All inbound requests require signature headers. The payload hash is computed using `HMAC-SHA256` using your secret key over a combined payload string containing a timestamp, a secure random nonce, and the request body:

```
Signature = HMAC-SHA256(SecretKey, timestamp + "." + nonce + "." + JSON.stringify(body))
```

* **Timestamp Verification:** Requests are rejected if the timestamp drift exceeds 5 minutes (300 seconds) to prevent delayed replay interception.
* **Nonce Deduplication:** Used nonces are logged to a high-speed Redis cache. Reusing a nonce within the validity window triggers an instant security alert.
* **Rate Limits:** Gateway routes are rate-limited to 60 requests per minute per IP to prevent spamming.

---

## 📡 API Reference

### 1. Settle Gasless Reward
Award tokens to a user's wallet address.
* **Method:** `POST`
* **Route:** `/v1/api/reward`
* **Headers:** `x-api-key: <sf_live_...>`
* **Payload:**
```json
{
  "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "amount": 100
}
```
* **Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": 100,
    "txHash": "0x9e3f162db8ea58252277d3bf67b848c9df4101e4a116cfc981a81a1795db2f4a",
    "timestamp": "2026-06-15T15:00:00Z"
  }
}
```

### 2. Settle Token Spend
Deduct tokens from a user's balance for upgrades or premium features.
* **Method:** `POST`
* **Route:** `/v1/api/spend`
* **Payload:**
```json
{
  "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "amount": 25
}
```

### 3. Engine Health & Status
Retrieve uptime telemetry and RPC block numbers.
* **Method:** `GET`
* **Route:** `/v1/health`
* **Response (200 OK):**
```json
{
  "status": "healthy",
  "uptime": "99.98%",
  "services": {
    "database": "connected",
    "consensus": "3/3 active"
  },
  "block_height": 131217910,
  "latency_ms": 14
}
```

---

## 🌍 Real-World Use Cases

* **🤖 AI Agent Micro-payments:** Settle token charges for recursive LLM agent executions on the fly.
* **🎮 Web3 Gaming Pipelines:** Settle in-game item rewards instantly as transactions are completed.
* **⚙️ Developer SaaS Loyalty:** Reward developers for building custom API integrations or reporting bugs.
* **🔐 Ad-Network Attributions:** Pay micro-incentives to users who successfully complete and verify conversion actions.

---

## 🏆 Why SharpFlow Wins Hackathons

1. **Working Code vs. Slide Deck:** Unlike conceptual plans, SharpFlow AI features a fully operational visual dashboard, simulated and testnet network fallback solvers, and copyable SDK snips.
2. **Clear Startup Potential:** Solves a major developer pain point: bridging Web2 SaaS backends to EVM Web3 rails seamlessly.
3. **Stripe-grade Developer Experience:** Prioritizes developer ergonomics with ready-to-copy code snippets, real-time logging, and interactive testing consoles.

---

## 🔮 Future Roadmap

* **🤖 AI-driven Attuned Reward Scoring:** Auto-adjust token awards based on user interaction frequency and retention potential.
* **🌉 Multi-Chain Bridging:** Enable instant liquidity cross-settlement on Base, Arbitrum, and Ethereum Mainnet.
* **🔌 Plugin Hub:** Pre-built triggers for GitHub, Slack, and Discord integrations.
* **📊 Analytics Pro Suite:** Deep wallet retention analytics and custom campaign builders.

---

## 👨‍💻 Get Started

Build with SharpFlow AI:
* **Demo Portal:** [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
* **Developer Docs:** [http://localhost:3000/docs](http://localhost:3000/docs)
* **Sandbox Shop:** [http://localhost:3000/shop](http://localhost:3000/shop)

Created by the team at **SharpFlow AI**. MIT Licensed.
