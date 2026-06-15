'use client';

import React, { useState } from 'react';
import { 
  BookOpen, Key, Gift, CreditCard, Code, ShieldAlert, Terminal, 
  Copy, Check, ShieldCheck, Zap, Globe, Radio 
} from 'lucide-react';
import toast from 'react-hot-toast';

type SectionType = 
  | 'getting-started'
  | 'developer-onboarding'
  | 'api-foundation'
  | 'authentication'
  | 'reward-api'
  | 'spend-api'
  | 'sdk-guides'
  | 'webhooks'
  | 'webhook-retry'
  | 'examples'
  | 'error-codes'
  | 'error-recovery'
  | 'rate-limiting'
  | 'pagination'
  | 'api-status'
  | 'security-specs'
  | 'use-sharp-hook'
  | 'openapi-spec';

interface CodeSnippetProps {
  code: string;
  inline?: boolean;
}

function CodeSnippet({ code, inline = false }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (inline) {
    return (
      <code
        onClick={handleCopy}
        className="relative inline-flex items-center gap-1 bg-zinc-900 hover:bg-zinc-800 border border-white/[0.06] px-1.5 py-0.5 rounded font-mono text-[11px] text-blue-400 cursor-pointer transition-colors select-all group"
        title="Click to copy"
      >
        {copied ? (
          <span className="text-emerald-400 font-extrabold flex items-center gap-1">
            Copied ✓
          </span>
        ) : (
          <>
            {code}
            <Copy className="h-2.5 w-2.5 opacity-60 group-hover:opacity-100 transition-opacity ml-1 inline-block" />
          </>
        )}
      </code>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2 bg-zinc-950/80 border border-white/[0.06] rounded-xl px-4 py-3 font-mono text-xs text-zinc-300 select-text my-2.5 w-full overflow-hidden">
      <code className="text-blue-400 whitespace-pre-wrap break-all min-w-0 flex-1">{code}</code>
      <button 
        onClick={handleCopy} 
        className="flex items-center gap-1 text-zinc-500 hover:text-white hover:bg-white/[0.04] px-2 py-1.5 rounded-lg transition-all shrink-0 mt-0.5 text-[10px] font-bold"
        title="Copy code"
      >
        {copied ? (
          <span className="text-emerald-400 flex items-center gap-1 font-black">
            <Check className="h-3 w-3" />
            <span>Copied ✓</span>
          </span>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
}

interface BadgeProps {
  type: 'required' | 'sandbox' | 'production' | 'optional' | 'security';
}

function Badge({ type }: BadgeProps) {
  switch (type) {
    case 'required':
      return (
        <span className="inline-flex items-center text-[9px] font-black tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded ml-1.5">
          Required
        </span>
      );
    case 'sandbox':
      return (
        <span className="inline-flex items-center text-[9px] font-black tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded ml-1.5">
          Sandbox
        </span>
      );
    case 'production':
      return (
        <span className="inline-flex items-center text-[9px] font-black tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded ml-1.5">
          Production
        </span>
      );
    case 'optional':
      return (
        <span className="inline-flex items-center text-[9px] font-black tracking-wider uppercase bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-1.5 py-0.5 rounded ml-1.5">
          Optional
        </span>
      );
    case 'security':
      return (
        <span className="inline-flex items-center text-[9px] font-black tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded ml-1.5">
          Security
        </span>
      );
    default:
      return null;
  }
}

interface WarningCardProps {
  title: string;
  children: React.ReactNode;
}

function WarningCard({ title, children }: WarningCardProps) {
  return (
    <div className="flex gap-3 border border-amber-500/20 bg-amber-500/[0.03] p-4 rounded-xl text-xs text-amber-400 font-bold leading-normal my-4">
      <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400 animate-pulse" />
      <div>
        <span className="block font-black text-amber-300 uppercase tracking-wide text-[10px] mb-1">
          ⚠️ {title}
        </span>
        {children}
      </div>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  children: React.ReactNode;
}

function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div className="flex gap-3 border border-indigo-500/20 bg-indigo-500/[0.03] p-4 rounded-xl text-xs text-indigo-400 font-bold leading-normal my-4">
      <ShieldCheck className="h-5 w-5 shrink-0 text-indigo-400" />
      <div>
        <span className="block font-black text-indigo-300 uppercase tracking-wide text-[10px] mb-1">
          {title}
        </span>
        {children}
      </div>
    </div>
  );
}

export default function DocsViewer() {
  const [activeSection, setActiveSection] = useState<SectionType>('getting-started');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const navItems = [
    { id: 'getting-started', label: '⚡ Quickstart', icon: BookOpen },
    { id: 'developer-onboarding', label: '🚀 Onboarding Flow', icon: Code },
    { id: 'api-foundation', label: 'API Base Config', icon: Globe },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'reward-api', label: 'Reward API', icon: Gift },
    { id: 'spend-api', label: 'Spend API', icon: CreditCard },
    { id: 'sdk-guides', label: 'SDK Guides', icon: BookOpen },
    { id: 'webhooks', label: 'Webhook Events', icon: Radio },
    { id: 'webhook-retry', label: '🔄 Webhook Guarantees', icon: Radio },
    { id: 'examples', label: 'Examples & Flows', icon: Code },
    { id: 'error-codes', label: 'Error Codes', icon: ShieldAlert },
    { id: 'error-recovery', label: '⚠️ Error Recovery', icon: ShieldAlert },
    { id: 'rate-limiting', label: '📊 Rate Limit Strategy', icon: ShieldAlert },
    { id: 'pagination', label: 'Pagination & Scaling', icon: Globe },
    { id: 'api-status', label: 'Status & Health', icon: ShieldCheck },
    { id: 'security-specs', label: 'Security Specs', icon: ShieldCheck },
    { id: 'use-sharp-hook', label: 'useSharp Hook', icon: Zap },
    { id: 'openapi-spec', label: 'OpenAPI Spec', icon: Terminal },
  ];

  const generatedCodes: Record<SectionType, string> = {
    'getting-started': `// Step 1: Install @sharpflow/sdk
npm install @sharpflow/sdk

// Step 2: Initialize Client
import { SharpFlow } from "@sharpflow/sdk";

const client = new SharpFlow({
  apiKey: "sf_live_xxx",
  environment: "sandbox"
});

// Step 3: First Reward Call
const res = await client.reward({
  wallet: "0x123...",
  amount: 50
});
console.log("On-Chain Mint confirmed. Hash:", res.data.txHash);

// Step 4: Verify Webhook
// When finalized on-chain, webhook receives a "reward.success" event.`,

    'developer-onboarding': `// Step-by-Step Checklist for Launching to Production:
// 1. [ ] Create project and retrieve secret API Key on Dashboard
// 2. [ ] client.reward() verified in Sandbox mode
// 3. [ ] Configure webhook listener URL on dashboard settings
// 4. [ ] HMAC webhook signature verified on your receiver server
// 5. [ ] Switched environment initialization variable to 'production'`,

    'api-foundation': `// Core TypeScript Definitions
export type WalletAddress = string;

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    code: number;
    message: string;
    details?: string;
  };
};`,

    'authentication': `// Node.js Signature Verification Code
const crypto = require('crypto');

function generateSignature(secretKey, body, timestamp, nonce) {
  const payload = \`\${timestamp}.\${nonce}.\${JSON.stringify(body)}\`;
  return crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');
}`,

    'reward-api': `// TypeScript Definition
type RewardRequest = {
  wallet: string;
  amount: number;
};

// POST Payload Example
{
  "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "amount": 100
}

// 200 OK Response Payload
{
  "success": true,
  "data": {
    "wallet": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": 100,
    "txHash": "0x9e3f162db8ea58252277d3bf67b848c9df4101e4a116cfc981a81a1795db2f4a",
    "timestamp": "2026-06-15T12:00:00Z"
  }
}`,

    'spend-api': `// Express Node.js Payout Integration
app.post('/api/checkout', async (req, res) => {
  const { userWallet, price } = req.body;
  
  try {
    const response = await fetch('https://api.sharpflow.ai/v1/api/spend', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.SHARPFLOW_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        wallet: userWallet,
        amount: price
      })
    });
    const result = await response.json();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`,

    'webhooks': `// Webhook Deduplication and Verification (Node.js)
const crypto = require('crypto');
const processedEvents = new Set(); // In production, use Redis

app.post('/webhooks/sharpflow', async (req, res) => {
  const event = req.body;
  
  // 1. Webhook Deduplication Check
  if (processedEvents.has(event.id)) {
    return res.status(200).send('Duplicate Event Ignored');
  }

  // 2. Signature Validation (HMAC SHA-256)
  const signature = req.headers['x-sharpflow-signature'];
  const timestamp = req.headers['x-sharpflow-timestamp'];
  const nonce = req.headers['x-sharpflow-nonce'];
  
  const drift = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
  if (drift > 300) {
    return res.status(400).send('Timestamp Drift Exceeded');
  }

  const payload = \`\${timestamp}.\${nonce}.\${JSON.stringify(req.body)}\`;
  const computed = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
    
  if (signature !== computed) {
    return res.status(401).send('Invalid Signature');
  }

  // Process event...
  processedEvents.add(event.id);
  res.status(200).send('Event Acknowledged');
});`,

    'webhook-retry': `// Webhook Deduplication and Verification (Node.js)
const processedEvents = new Set(); // In production, use Redis or Database

function handleWebhook(event) {
  // Always deduplicate using eventId to ensure idempotency
  if (processedEvents.has(event.id)) {
    console.log("Duplicate Event Ignored:", event.id);
    return;
  }

  // Handle transaction confirmation event (e.g. reward.success)
  console.log("Confirmed Transaction payload:", event.data);

  processedEvents.add(event.id);
}`,

    'examples': `// End-to-End Node.js Signup → Reward flow
const { SharpFlow } = require('@sharpflow/sdk');
const sharpflow = new SharpFlow({ apiKey: 'sf_live_***' });

// 1. User signs up on your site
app.post('/register', async (req, res) => {
  const { email, walletAddress } = req.body;
  const user = await db.saveUser({ email, walletAddress });
  
  // 2. Trigger off-chain gasless token payout
  const tx = await sharpflow.reward(walletAddress, 50);
  res.json({ status: 'success', txHash: tx.txHash });
});`,

    'pagination': `// GET /v1/api/transactions?limit=10&starting_after=tx_123
{
  "object": "list",
  "data": [
    {
      "id": "tx_123",
      "wallet": "0xf39Fd6e51aad88F6F4ce...",
      "amount": 100,
      "type": "reward",
      "timestamp": "2026-06-15T12:00:00Z"
    }
  ],
  "has_more": true,
  "cursor": {
    "starting_after": "tx_123",
    "ending_before": "tx_122"
  }
}`,

    'api-status': `// GET /v1/health Response
{
  "status": "healthy",
  "uptime": "99.98%",
  "services": {
    "database": "connected",
    "relayer_nodes": "synced",
    "consensus": "3/3 active"
  },
  "block_height": 131217910,
  "latency_ms": 14
}`,

    'security-specs': `// Rate Limit Headers returned on API routes
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1781504915`,

    'use-sharp-hook': `import { useSharp } from '@sharpflow/react';

export default function ClaimButton() {
  const { triggerReward, loading } = useSharp({
    onSuccess: (tx) => {
      console.log('On-chain confirmed hash:', tx.txHash);
    },
    onError: (err) => {
      console.error('Relay error captured:', err.message);
    },
    telemetry: true // Enables real-time RPC consensus checking
  });

  return (
    <button 
      disabled={loading}
      onClick={() => triggerReward({ wallet: '0x...', amount: 100 })}
    >
      {loading ? 'Processing...' : 'Claim 100 SHARP'}
    </button>
  );
}`,

    'sdk-guides': `// JavaScript / TypeScript NPM Client SDK Initialization
import { SharpFlow } from '@sharpflow/sdk';

// 1. Initialize the client using API key
const client = new SharpFlow({
  apiKey: 'sf_live_4f89d81a92e...',
  environment: 'production', // or 'sandbox'
  timeout: 5000
});

// 2. Dispatch gas-sponsored reward (Async + Typed response)
try {
  const res = await client.reward({
    wallet: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    amount: 100
  });
  console.log("Confirmed Transaction Hash:", res.data.txHash);
} catch (err) {
  console.error("Error rewarding tokens:", err.message);
}

// 3. Dispatch spend deduction (Error-safe execution)
try {
  await client.spend({
    wallet: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    amount: 15
  });
} catch (err) {
  console.error("Error spending tokens:", err.message);
}`,

    'error-codes': `// Jittered Exponential Backoff Jitter Pattern
async function retry(fn, retries = 3, delay = 1000) {
  try {
    return await fn();
  } catch (err) {
    if (err.code === 429 && retries > 0) {
      // Respect Retry-After header & add randomized jitter
      const retryAfter = err.headers ? Number(err.headers['retry-after']) : 1;
      const waitTime = (retryAfter * 1000) + (Math.random() * 500);
      await new Promise(r => setTimeout(r, waitTime));
      return retry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

// API rate limit response schema (429)
{
  "error": {
    "code": 429,
    "message": "Too Many Requests",
    "details": "API rate limit exceeded. Retry after 5 seconds."
  }
}`,

    'error-recovery': `// Exponential Backoff with Jitter Example
async function retry(fn, retries = 3) {
  try {
    return await fn();
  } catch (err) {
    if (err.code === 429 && retries > 0) {
      // Respect Retry-After header & add randomized jitter to delay
      const retryAfter = err.headers && err.headers['retry-after'] 
        ? Number(err.headers['retry-after']) 
        : 1;
      const waitTime = (retryAfter * 1000) + (Math.random() * 500);
      await new Promise(r => setTimeout(r, waitTime));
      return retry(fn, retries - 1);
    }
    throw err;
  }
}`,

    'rate-limiting': `// Client-safe Rate Limit Handling Pattern
const response = await fetch("https://api.sharpflow.ai/v1/api/reward", {
  method: "POST",
  headers: {
    "x-api-key": "sf_live_xxx",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ wallet: "0x123...", amount: 50 })
});

if (response.status === 429) {
  const retryAfter = response.headers.get("Retry-After") || 5;
  console.log("Rate limited. Retrying after delay...", retryAfter);
}`,

    'openapi-spec': `{
  "openapi": "3.0.0",
  "info": {
    "title": "SharpFlow Core Web3 Engine API",
    "description": "Enterprise-grade gas-sponsored loyalty token settlement engine.",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.sharpflow.ai/v1",
      "description": "Production Engine"
    },
    {
      "url": "https://sandbox.sharpflow.ai/v1",
      "description": "Sandbox / Testing Engine"
    }
  ],
  "paths": {
    "/api/reward": {
      "post": {
        "summary": "Dispatch Gasless Reward",
        "description": "Mints/transfers SHARP tokens into user wallets.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["wallet", "amount"],
                "properties": {
                  "wallet": { "type": "string" },
                  "amount": { "type": "integer" }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "Mined transaction confirmation",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": { "type": "boolean" },
                    "data": { "type": "object" }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}`
  };

  return (
    <div className="flex flex-col text-left h-auto md:h-full min-h-0">
      {/* Mobile Swipeable Docs Navigation */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto px-3 py-2.5 border-b border-white/[0.06] shrink-0 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as SectionType)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                  : 'bg-white/[0.02] text-zinc-400 border-white/[0.06] backdrop-blur-md'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── DUAL-PANE: LEFT nav + RIGHT content — each independently scrollable ── */}
      <div className="min-w-0 flex flex-col md:flex-row h-auto md:h-full overflow-visible md:overflow-hidden flex-1 min-h-0">

        {/* LEFT PANEL — independent navigation scroll (desktop only) */}
        <div className="hidden md:flex flex-col w-52 xl:w-60 shrink-0 border-r border-white/[0.06] layout-scroll-panel min-h-0">
          <div className="p-4 pt-5">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 mb-3">
              Documentation
            </div>
            <div className="space-y-0.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isSelected = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as SectionType)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL — independent content + code scroll */}
        <div className="layout-scroll-panel min-w-0 flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-5 lg:p-8 items-start">
            {/* Left Column - Content Description */}
            <div className="lg:col-span-7 space-y-8 animate-fade-in min-w-0 overflow-x-hidden">
          
          {/* Section: Getting Started (⚡ 5-Minute Quickstart) */}
          {activeSection === 'getting-started' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">⚡ 5-Minute Quickstart</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Welcome to the SharpFlow API Reference. SharpFlow provides developers with scalable, off-chain REST endpoints and lightweight frontend hooks to deploy gasless on-chain developer rewards (`SHARP` loyalty tokens) in minutes.
              </p>

              <InfoCard title="Prerequisite">
                You must have a developer wallet address to deploy contract permissions and a project API Key to validate client calls.
              </InfoCard>

              {/* Quickstart step sequence */}
              <div className="space-y-6 pt-2">
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-2 w-full">
                    <span className="text-xs font-extrabold text-white block">Install SDK</span>
                    <p className="text-[11px] text-zinc-400">Install the official client package into your Node.js or React repository using npm:</p>
                    <CodeSnippet code="npm install @sharpflow/sdk" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-2 w-full">
                    <span className="text-xs font-extrabold text-white block">Initialize Client</span>
                    <p className="text-[11px] text-zinc-400">Import the library and instantiate it using your secret API key credentials. Specify the target environment:</p>
                    <CodeSnippet code={`import { SharpFlow } from "@sharpflow/sdk";
 
const client = new SharpFlow({
  apiKey: "sf_live_xxx",
  environment: "sandbox"
});`} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-2 w-full">
                    <span className="text-xs font-extrabold text-white block">First Reward Call</span>
                    <p className="text-[11px] text-zinc-400">Trigger on-chain gasless payments to user wallets with a single async call:</p>
                    <CodeSnippet code={`await client.reward({
  wallet: "0x123...",
  amount: 50
});`} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center shrink-0">4</div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-extrabold text-white block">Verify Webhook</span>
                    <p className="text-[11px] text-zinc-400">
                      Set up a webhook endpoint to capture the expected <CodeSnippet code="reward.success" inline={true} /> event flow. This asynchronous event confirms that the reward transaction has been mined in a block on-chain, triggering profile updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Developer Onboarding Flow */}
          {activeSection === 'developer-onboarding' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">🚀 Onboarding Flow</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Follow this step-by-step developer checklist to safely set up your keys, install dependencies, verify your local integration, and go live.
              </p>

              <InfoCard title="Developer Sandbox Notice">
                By default, new developer workspaces are set up in sandbox mode. Test transactions settle instantly on mock testnets with zero real token gas requirements.
              </InfoCard>

              <div className="space-y-6 pt-2">
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-extrabold text-white block">API Key Creation</span>
                    <p className="text-[11px] text-zinc-400">
                      Navigate to the developer dashboard and generate your unique API Keys. Use <Badge type="sandbox" /> keys for testing and <Badge type="production" /> keys for real user settlements. Remember to keep keys starting with <code className="bg-rose-950/20 px-1 rounded font-mono text-rose-300">sf_live_</code> confidential.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-extrabold text-white block">SDK Installation</span>
                    <p className="text-[11px] text-zinc-400">
                      Install the official SDK package for your specific project environment using the standard node package loader:
                    </p>
                    <CodeSnippet code="npm install @sharpflow/sdk" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs font-bold flex items-center justify-center shrink-0">3</div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-extrabold text-white block">Sandbox Testing</span>
                    <p className="text-[11px] text-zinc-400">
                      Instantiate the client with sandbox mode enabled. Make your first trial reward mint to test response parsing:
                    </p>
                    <CodeSnippet code={`const client = new SharpFlow({
  apiKey: "sf_sandbox_xxx",
  environment: "sandbox"
});`} />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold flex items-center justify-center shrink-0">4</div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-extrabold text-white block">Webhook Setup & Verification</span>
                    <p className="text-[11px] text-zinc-400">
                      Register a secure listener webhook URL on the developer portal. Verify the HMAC signature on your endpoint to block forged events.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold flex items-center justify-center shrink-0">5</div>
                  <div className="space-y-1 w-full">
                    <span className="text-xs font-extrabold text-white block">Production Deployment</span>
                    <p className="text-[11px] text-zinc-400">
                      Swap environment variables to live mode, load your production private key, and set initialization variables to <Badge type="production" />.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Base Configuration */}
          {activeSection === 'api-foundation' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">🌐 API Base Configuration</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                All requests to the SharpFlow API gateways must use the base URLs below and specify the target API version.
              </p>

              <div className="bg-white/[0.01] border border-white/[0.04] rounded-xl overflow-hidden text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.04] px-4 py-3">
                  <span className="font-bold text-zinc-500 font-mono shrink-0">Sandbox Base URL:</span>
                  <div className="flex items-center gap-2 font-mono min-w-0">
                    <span className="text-blue-400 truncate">https://sandbox.sharpflow.ai/v1</span>
                    <span className="text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">Sandbox</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-white/[0.04] px-4 py-3">
                  <span className="font-bold text-zinc-500 font-mono shrink-0">Production Base URL:</span>
                  <div className="flex items-center gap-2 font-mono min-w-0">
                    <span className="text-emerald-400 truncate">https://api.sharpflow.ai/v1</span>
                    <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">Production</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3">
                  <span className="font-bold text-zinc-500 font-mono shrink-0">Required Content-Type:</span>
                  <span className="font-mono text-purple-400">application/json</span>
                </div>
              </div>

              <h3 className="text-sm font-extrabold text-white pt-2">Endpoint Versioning Rules</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                SharpFlow API versions are locked via prefix namespaces. The current stable version is `/v1`. Major version updates will be announced in release manifests.
              </p>
            </div>
          )}

          {/* Section: Authentication */}
          {activeSection === 'authentication' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">Authentication & Cryptographics</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                API calls must include private API keys inside HTTP headers. Additionally, sensitive transactions can be signed with HMAC signatures.
              </p>

              <WarningCard title="Security Warning">
                Private API keys starting with <code className="bg-amber-950/30 px-1 rounded font-mono text-amber-300">sf_live_</code> must be kept strictly confidential. Execute calls exclusively inside backend servers, and never expose keys inside frontend files or client repositories.
              </WarningCard>

              <h3 className="text-sm font-extrabold text-white pt-2">Authentication Headers</h3>
              <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">Header Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Constraint / Rules</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-400">
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-400">
                        x-api-key 
                        <Badge type="required" />
                      </td>
                      <td className="py-3 px-4 font-mono">string</td>
                      <td className="py-3 px-4">Your private credential matching `sf_live_***`.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-400">x-signature</td>
                      <td className="py-3 px-4 font-mono">string</td>
                      <td className="py-3 px-4">HMAC SHA-256 validation code. (Required on secure mode)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-400">x-timestamp</td>
                      <td className="py-3 px-4 font-mono">integer</td>
                      <td className="py-3 px-4">UNIX timestamp. Must fit +/- 300s window.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-400">x-nonce</td>
                      <td className="py-3 px-4 font-mono">string</td>
                      <td className="py-3 px-4">Unique random string to block request replay attacks.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Reward API */}
          {activeSection === 'reward-api' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold px-2 py-0.5 rounded text-[10px]">POST</span>
                <span className="text-xs font-mono font-bold text-white">/v1/api/reward</span>
              </div>
              <h2 className="text-2xl font-black text-white">Reward User API</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Instructs the gas-sponsored relayer nodes to mint or dispatch on-chain `SHARP` tokens directly into a developer&apos;s wallet address on Polygon.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">Request Parameters</h3>
              <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">Field</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Rule / Bounds</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-400">
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold">wallet</td>
                      <td className="py-3 px-4 font-mono">string</td>
                      <td className="py-3 px-4 text-rose-400 font-bold"><Badge type="required" /></td>
                      <td className="py-3 px-4">42-character hex Ethereum-compatible address.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold">amount</td>
                      <td className="py-3 px-4 font-mono">number</td>
                      <td className="py-3 px-4 text-rose-400 font-bold"><Badge type="required" /></td>
                      <td className="py-3 px-4">Whole positive integer representing tokens to distribute.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Spend API */}
          {activeSection === 'spend-api' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="bg-purple-600/20 border border-purple-500/30 text-purple-400 font-bold px-2 py-0.5 rounded text-[10px]">POST</span>
                <span className="text-xs font-mono font-bold text-white">/v1/api/spend</span>
              </div>
              <h2 className="text-2xl font-black text-white">Spend User API</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Deducts or burns `SHARP` tokens from a developer wallet address. This endpoint validates balance scopes on-chain before burning.
              </p>

              <WarningCard title="Balance Validation Constraint">
                If the target address holds less than the requested `amount` value, the request fails with a `500 Server Error` and returns `"Deduction amount exceeds balance"`.
              </WarningCard>
            </div>
          )}

          {/* Section: Webhooks */}
          {activeSection === 'webhooks' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">⚡ Webhook Events</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Register webhook URLs inside the portal to capture async blockchain events and confirmation notices.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">Registered Webhook Event Matrix</h3>
              <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">Event String</th>
                      <th className="py-3 px-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-400">
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-blue-400">reward.success</td>
                      <td className="py-3 px-4">Triggered when token rewards are confirmed mined in a block on Polygon.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-purple-400">spend.success</td>
                      <td className="py-3 px-4">Triggered when tokens spent are successfully validated and burned on-chain.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-red-400">transaction.failed</td>
                      <td className="py-3 px-4">Fires when on-chain EVM reverts or gas sponsorships fail.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Examples */}
          {activeSection === 'examples' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">Integration Flow & Examples</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Wire up standard engagement loops by pairing backend triggers with live off-chain token awards.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">🚀 Recommended Integration Flow</h3>
              <div className="relative border-l-2 border-white/[0.08] pl-5 ml-2 space-y-6 text-xs text-zinc-400">
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 h-3 w-3 rounded-full bg-blue-500 ring-4 ring-[#0A0A0B]" />
                  <span className="font-bold text-white block">Step 1: Create API Key credentials</span>
                  <p className="mt-1">Navigate to credentials console inside workspace to retrieve API Key tokens.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 h-3 w-3 rounded-full bg-indigo-500 ring-4 ring-[#0A0A0B]" />
                  <span className="font-bold text-white block">Step 2: Install client SDK modules</span>
                  <p className="mt-1">Install package dependencies into your backend project using standard node package builders.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 h-3 w-3 rounded-full bg-purple-500 ring-4 ring-[#0A0A0B]" />
                  <span className="font-bold text-white block">Step 3: Call Reward API in Sandbox</span>
                  <p className="mt-1">Verify that mock settlements process and register transaction hashes inside the Sandbox environment.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-[#0A0A0B]" />
                  <span className="font-bold text-white block">Step 4: Configure HMAC Webhook Listener</span>
                  <p className="mt-1">Wire up signature verification logic on your express servers to securely handle events.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[27px] top-0 h-3 w-3 rounded-full bg-[#00ff88] ring-4 ring-[#0A0A0B] shadow-[0_0_8px_#00ff88]" />
                  <span className="font-bold text-white block">Step 5: Toggle environment into Production</span>
                  <p className="mt-1">Transition settings into active Production mode and settle real Amoy Testnet transactions.</p>
                </div>
              </div>
            </div>
          )}

          {/* Section: Pagination & Scaling */}
          {activeSection === 'pagination' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">Pagination & Scaling Strategy</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                For list operations (such as fetching user transaction logs or active campaign events), SharpFlow implements cursor-based pagination to support rapid data streaming and protect client databases from bulk load crashes.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">Query Parameters</h3>
              <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-xl">
                <table className="w-full text-left border-collapse text-xs text-zinc-400">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">Parameter</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Default / Max</th>
                      <th className="py-3 px-4">Definition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    <tr>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">limit</td>
                      <td className="py-3 px-4 font-mono">integer</td>
                      <td className="py-3 px-4">10 / 100</td>
                      <td className="py-3 px-4">Standard limit to bound size of the response payload.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">starting_after</td>
                      <td className="py-3 px-4 font-mono">string</td>
                      <td className="py-3 px-4">none</td>
                      <td className="py-3 px-4">Cursor object identifier pointing to item index. Fetch element records following this cursor.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-bold text-blue-400">ending_before</td>
                      <td className="py-3 px-4 font-mono">string</td>
                      <td className="py-3 px-4">none</td>
                      <td className="py-3 px-4">Cursor object identifier. Fetch element records preceding this cursor index.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: API Status & Health */}
          {activeSection === 'api-status' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">API Operational Status & Health</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Monitor live node configurations, database connectivity, and on-chain syncing statistics dynamically.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">System Health Endpoint</h3>
              <div className="flex gap-2.5 items-center font-mono text-xs">
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-[#00ff88] font-bold px-2 py-1 rounded">GET</span>
                <span className="text-zinc-350">/v1/health</span>
              </div>
              <p className="text-xs text-zinc-500">
                Returns the system health structure across our RPC consensus nodes, databasing layers, and Amoy block height.
              </p>

              <div className="border-l-2 border-emerald-500/30 pl-4 py-1.5 space-y-1 bg-emerald-500/5 rounded-r-lg text-xs leading-normal">
                <span className="font-bold text-emerald-450 block uppercase text-[9px] tracking-wider">Retry Guidance</span>
                <p className="text-zinc-500">
                  During service operations or chain reorg detections, endpoints could return transient faults. Clients should handle exceptions gracefully and apply jittered backoff retry strategies.
                </p>
              </div>
            </div>
          )}

          {/* Section: Security Specs */}
          {activeSection === 'security-specs' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">Security & Integrity Specs</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                The Trust Layer defends relayer nodes using replay window filters and rate limits.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">Replay Windows</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Transactions carry custom `nonce` structures and millisecond-accurate timestamps. Payloads with timestamps outside a +/- 300 seconds window are discarded immediately.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">API Rate Ceilings</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Standard developer keys limits rest at **60 requests per minute**. Excess calls receive `429 Too Many Requests`.
              </p>
            </div>
          )}

          {/* Section: useSharp Hook */}
          {activeSection === 'use-sharp-hook' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">useSharp Custom React Hook</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Interact with the SharpFlow network state using official React context variables.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">useSharp Hook Props</h3>
              <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">Property</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Purpose / Definition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-400">
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold">onSuccess</td>
                      <td className="py-3 px-4 font-mono">function</td>
                      <td className="py-3 px-4">Fires when the block confirmation event is verified on-chain.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold">onError</td>
                      <td className="py-3 px-4 font-mono">function</td>
                      <td className="py-3 px-4">Fires on authentication failures, re-org detects, or invalid wallet structure.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold">telemetry</td>
                      <td className="py-3 px-4 font-mono">boolean</td>
                      <td className="py-3 px-4">Toggle to run background latency consensus checks across nodes.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: SDK Guides */}
          {activeSection === 'sdk-guides' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">SDK Guides</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Integrate using helper libraries that manage signature signing and request timeouts natively.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2">Official Supported Languages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                  <span className="font-bold text-white block text-xs">JavaScript/TypeScript</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">@sharpflow/sdk (NPM)</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl">
                  <span className="font-bold text-white block text-xs">Python</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">sharpflow-sdk (PyPi)</span>
                </div>
                <div className="bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl opacity-60">
                  <span className="font-bold text-zinc-400 block text-xs">Go (Golang)</span>
                  <span className="text-[10px] text-zinc-500 font-mono mt-0.5 block">github.com/... (Soon)</span>
                </div>
              </div>
            </div>
          )}

          {/* Section: Error Codes */}
          {activeSection === 'error-codes' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">Standard Error Codes & Limits</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                API calls that fail to execute correctly return standardized REST response schemas and code blocks.
              </p>

              <InfoCard title="Robust Recovery Guide">
                For detailed client-side recovery patterns, including exponential backoff with jitter and server error handling policies, visit the dedicated <strong>⚠️ Error Recovery</strong> section.
              </InfoCard>

              <h3 className="text-sm font-extrabold text-white pt-4">Error Mapping Table</h3>
              <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">HTTP Status</th>
                      <th className="py-3 px-4">Standard Message</th>
                      <th className="py-3 px-4">Remedy Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-400 text-[11px]">
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-red-400">400 Bad Request</td>
                      <td className="py-3 px-4 font-mono">"Invalid parameters..."</td>
                      <td className="py-3 px-4">Verify parameters layout. Check wallet format size.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-red-400">401 Unauthorized</td>
                      <td className="py-3 px-4 font-mono">"Unauthorized"</td>
                      <td className="py-3 px-4">Verify the x-api-key credential inside request headers.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-yellow-400">429 Rate Limit</td>
                      <td className="py-3 px-4 font-mono">"Too Many Requests"</td>
                      <td className="py-3 px-4">Reduce dispatch rates. Inspect X-RateLimit headers and apply backoffs.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono font-semibold text-red-500">500 Server Error</td>
                      <td className="py-3 px-4 font-mono">"Deduction exceeds balance"</td>
                      <td className="py-3 px-4">EVM contract state call reverted. Verify user holds balance.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: OpenAPI Spec */}
          {activeSection === 'openapi-spec' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">Swagger / OpenAPI 3.0 Specifications</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                The official API schema is mapped using the OpenAPI 3.0 standard. Use the specification JSON layout in the console on the right to import into Postman, Swagger UI, or code generation scripts instantly.
              </p>

              <div className="border-l-2 border-blue-500 pl-4 py-1.5 space-y-1 bg-blue-500/5 rounded-r-lg text-xs leading-normal">
                <span className="font-bold text-blue-400 block uppercase text-[10px] tracking-wider">Enterprise Compliance</span>
                <p className="text-zinc-500">
                  This schema defines endpoint request models, expected payload objects, and HTTP responses, making SharpFlow integration enterprise-compliant.
                </p>
              </div>
            </div>
          )}

          {/* Section: Error Recovery */}
          {activeSection === 'error-recovery' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">⚠️ Error Handling & Recovery</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                Integrate robust client-side retry policies to prevent service degradation during temporary node connectivity issues or block reorganizations.
              </p>

              <WarningCard title="Idempotency Guard">
                Always ensure you use distinct client-side nonces or idempotency keys when retrying POST transactions. Retrying a reward call without an idempotency key may lead to duplicate token mints.
              </WarningCard>

              <h3 className="text-sm font-extrabold text-white pt-2 font-black">Exponential Backoff with Jitter</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                When retry attempts are synchronized, clients can accidentally overwhelm the service nodes in a "thundering herd" pattern. Mitigate this by adding randomized jitter offsets to your backoff timeouts.
              </p>

              <h3 className="text-sm font-extrabold text-white pt-2 font-black">500 Server Error Safe Retry</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                If a request fails with an HTTP <code className="text-red-400 font-mono text-[11px]">500 Internal Server Error</code>, verify whether the transaction hash was successfully published on-chain before attempting a retry.
              </p>
            </div>
          )}

          {/* Section: Rate Limiting */}
          {activeSection === 'rate-limiting' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">📊 Rate Limit Strategy</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                API requests are subject to rate limiting policies to prevent node exhaustion and maintain high performance for all ecosystem developers.
              </p>

              <InfoCard title="Default Developer Limit">
                Standard API keys are limited to <CodeSnippet code="60 requests per minute" inline={true} />. Enterprise keys can be scaled up to 5,000+ RPM.
              </InfoCard>

              <h3 className="text-sm font-extrabold text-white pt-2 font-black">Rate Limit Headers</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                Use the following HTTP response headers returned on every API route to dynamically throttle requests in your application logic:
              </p>

              <div className="overflow-x-auto bg-white/[0.01] border border-white/[0.06] rounded-xl my-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="py-3 px-4">Header</th>
                      <th className="py-3 px-4">Definition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-zinc-400 font-mono">
                    <tr>
                      <td className="py-3 px-4 text-blue-400 font-bold">X-RateLimit-Limit</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">The maximum requests allowed per minute window.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-blue-400 font-bold">X-RateLimit-Remaining</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">The remaining requests you can execute inside the current limit window.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-blue-400 font-bold">X-RateLimit-Reset</td>
                      <td className="py-3 px-4 font-sans text-zinc-400">The UNIX epoch timestamp representing when the rate limit window resets.</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-amber-400 font-bold">Retry-After</td>
                      <td className="py-3 px-4 font-sans text-amber-300">Returned only on <Badge type="required" /> rate limit 429 errors. Indicates delay duration in seconds before retrying.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section: Webhook Guarantees */}
          {activeSection === 'webhook-retry' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white">🔄 Webhook Delivery Guarantees</h2>
              <p className="text-xs text-zinc-400 leading-relaxed font-bold">
                SharpFlow employs a resilient "at-least-once" delivery policy to ensure your servers never miss transactional confirmations.
              </p>

              <WarningCard title="Event Deduplication Required">
                Because events can occasionally be delivered more than once, your receiver endpoint **must** enforce deduplication mechanisms. Store the incoming event's <code className="text-amber-300 font-mono text-[11px]">eventId</code> in a Redis set or DB unique constraint to guarantee idempotency.
              </WarningCard>

              <h3 className="text-sm font-extrabold text-white pt-2 font-black">Retry Intervals & Schedule</h3>
              <p className="text-xs text-zinc-400 leading-normal">
                If your server endpoint experiences temporary timeouts or returns non-200 responses, the delivery service triggers automatic retries. The retry offsets follow a standard jittered timeline:
              </p>
              <div className="flex items-center justify-between bg-zinc-950/50 border border-white/[0.04] p-4 rounded-xl font-mono text-xs text-blue-400 font-bold my-2">
                <span>1s Retry</span>
                <span className="text-zinc-600">→</span>
                <span>5s Retry</span>
                <span className="text-zinc-600">→</span>
                <span>30s Retry</span>
                <span className="text-zinc-600">→</span>
                <span>2m Retry</span>
                <span className="text-zinc-600">→</span>
                <span>10m Retry</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Code Mockups */}
        <div className="lg:col-span-5 rounded-2xl bg-[#09090b] text-zinc-300 font-mono text-[10px] overflow-hidden border border-white/[0.06] shadow-2xl h-fit lg:sticky lg:top-5 w-full min-w-0">
          <div className="flex items-center justify-between bg-zinc-900/40 px-4 py-3 border-b border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5 mr-2">
                <span className="w-2 h-2 rounded-full bg-red-500/80" />
                <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                <span className="w-2 h-2 rounded-full bg-green-500/80" />
              </div>
              <Terminal className="h-3.5 w-3.5 text-blue-500" />
              <span className="font-extrabold text-[10px] uppercase tracking-wider text-zinc-400">API Specifications</span>
            </div>
            <button
              onClick={() => handleCopy(generatedCodes[activeSection], 'Code block')}
              className="text-[9px] hover:text-white text-zinc-500 flex items-center gap-1 transition-colors"
            >
              {copiedText === generatedCodes[activeSection] ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 overflow-x-hidden overflow-y-auto max-h-[480px] text-left w-full docs-code-scroll">
            <pre className="text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap break-words select-text w-full min-w-0">
              <code className="text-blue-400 font-mono break-words">{generatedCodes[activeSection]}</code>
            </pre>
          </div>
        </div>

          </div>
        </div>
      </div>
    </div>
  );
}
