'use client';

import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSharpStore } from '@/hooks/useSharpStore';

type SdkTab = 'js' | 'python' | 'react' | 'html' | 'curl' | 'postman';

export default function SdkGenerator() {
  const { activeProject } = useSharpStore();
  const [activeTab, setActiveTab] = useState<SdkTab>('js');
  const [copied, setCopied] = useState(false);

  const apiKey = activeProject?.apiKey || 'sf_live_4f89d81a92e105b5f8c6b73a218d';

  const snippets = {
    js: `// Install via npm: npm install @sharpflow/sdk
import { SharpFlow } from '@sharpflow/sdk';

const sharpflow = new SharpFlow({
  apiKey: "${apiKey}"
});

// Reward user wallet on event trigger (e.g. registration)
async function triggerReward(userWallet) {
  try {
    const tx = await sharpflow.rewardUser(userWallet, 50);
    console.log("On-Chain Reward Sent! Hash:", tx.txHash);
  } catch (error) {
    console.error("Reward failed:", error.message);
  }
}`,
    python: `# Install via pip: pip install sharpflow-sdk
from sharpflow import SharpFlow

client = SharpFlow(
    api_key="${apiKey}"
)

# Reward user wallet on signup/achievement
def signup_bonus(wallet_address):
    try:
        tx = client.reward_user(
            wallet=wallet_address,
            amount=50
        )
        print(f"Reward Successful! Tx: {tx['txHash']}")
    except Exception as e:
        print(f"Error rewarding user: {str(e)}")`,
    react: `// Install via npm: npm install @sharpflow/react
import { RewardButton } from '@sharpflow/react';

export default function App() {
  return (
    <div className="flex flex-col items-center p-6 bg-zinc-950">
      <h1 className="text-white text-lg">Claim Loyalty Reward</h1>
      
      {/* Interactive reward trigger component */}
      <RewardButton
        apiKey="${apiKey}"
        wallet="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
        amount={50}
        theme="dark"
        onSuccess={(txHash) => {
          console.log("Tokens rewarded! Hash:", txHash);
          alert("Success! 50 SHARP sent.");
        }}
        onFailure={(err) => {
          console.error("Reward failed:", err.message);
        }}
      >
        Claim 50 SHARP
      </RewardButton>
    </div>
  );
}`,
    html: `<!-- 1. Include the SharpFlow CDN Script Tag -->
<script 
  src="https://cdn.sharpflow.ai/sdk/v1/sharpflow-sdk.js" 
  data-api-key="${apiKey}"
  async>
</script>

<!-- 2. Call SDK methods globally in your application scripts -->
<button id="claim-reward-btn">Claim 50 SHARP</button>

<script>
  document.getElementById('claim-reward-btn').addEventListener('click', () => {
    // Open standard reward call
    window.SharpFlow.rewardUser("USER_WALLET_ADDRESS", 50)
      .then(tx => {
        alert("Tokens rewarded! Tx Hash: " + tx.txHash);
      })
      .catch(err => {
        alert("Transaction failed: " + err.message);
      });
  });
</script>`,
    curl: `curl -X POST https://api.sharpflow.ai/api/reward \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '{"wallet":"USER_WALLET_ADDRESS","amount":50}'`,
    postman: `{
  "info": {
    "name": "SharpFlow API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Reward User",
      "request": {
        "method": "POST",
        "header": [
          { "key": "x-api-key", "value": "${apiKey}", "type": "text" },
          { "key": "Content-Type", "value": "application/json", "type": "text" }
        ],
        "url": {
          "raw": "https://api.sharpflow.ai/api/reward",
          "protocol": "https",
          "host": ["api", "sharpflow", "ai"],
          "path": ["api", "reward"]
        }
      }
    }
  ]
}`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopied(true);
    toast.success('SDK Snippet copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const tabNames: Record<SdkTab, string> = {
    js: 'JavaScript (Node)',
    python: 'Python',
    react: 'React',
    html: 'No-Code Script',
    curl: 'cURL',
    postman: 'Postman'
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4 mb-5 gap-3">
        <div className="text-left">
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
            <Code2 className="h-5 w-5 text-blue-500" />
            <span>Developer SDK Generator</span>
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Plug and play our client or script helpers into your existing app framework.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 text-xs font-semibold overflow-x-auto max-w-full">
          {(Object.keys(snippets) as SdkTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200'
              }`}
            >
              {tabNames[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Snippet Code Block */}
      <div className="relative rounded-2xl bg-zinc-950 border border-zinc-900 shadow-xl overflow-hidden">
        {/* Actions bar */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-zinc-900/40 border-b border-zinc-900 text-zinc-500 text-[10px]">
          <span>SDK INTEGRATION EXAMPLE</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-white text-zinc-400 font-mono transition-colors border-none bg-transparent outline-none cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-x-auto">
          <pre className="text-zinc-300 font-mono text-[11px] sm:text-xs leading-relaxed text-left whitespace-pre">
            <code>{snippets[activeTab]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
