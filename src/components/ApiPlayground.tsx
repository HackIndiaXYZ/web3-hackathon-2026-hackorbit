'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Copy, Check, Terminal, Code } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useSharpStore } from '@/hooks/useSharpStore';

export default function ApiPlayground() {
  const { user, activeProject, addTransaction, incrementApiCalls } = useSharpStore();

  const [method, setMethod] = useState<'reward' | 'spend' | 'buy'>('reward');
  const [wallet, setWallet] = useState(user?.walletAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266');
  const [amount, setAmount] = useState('50');
  const [apiKey, setApiKey] = useState(activeProject?.apiKey || 'sf_live_4f89d81a92e105b5f8c6b73a218d');
  
  const [loading, setLoading] = useState(false);
  const [copiedReq, setCopiedReq] = useState(false);
  const [copiedRes, setCopiedRes] = useState(false);
  
  const [logs, setLogs] = useState<string[]>([]);
  const [response, setResponse] = useState<any>(null);
  
  const endpoint = method === 'reward' ? '/api/reward' : method === 'spend' ? '/api/spend' : '/api/buy';
  const requestJson = JSON.stringify({ wallet, amount: Number(amount) }, null, 2);

  const curlCommand = `curl -X POST https://api.sharpflow.ai${endpoint} \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey}" \\
  -d '${JSON.stringify({ wallet, amount: Number(amount) })}'`;

  // Pre-load typewriter defaults
  useEffect(() => {
    setLogs([
      `# Ready to test API key: ${apiKey.slice(0, 10)}...`,
      `# Select actions and click "Run Request" below.`,
    ]);
    setResponse(null);
  }, [method, apiKey]);

  const handleCopyRequest = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedReq(true);
    toast.success('cURL command copied!');
    setTimeout(() => setCopiedReq(false), 2000);
  };

  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response, null, 2));
    setCopiedRes(true);
    toast.success('JSON response copied!');
    setTimeout(() => setCopiedRes(false), 2000);
  };

  const simulateTypewriter = async (apiResponse: any) => {
    setLogs((prev) => [...prev, `> POST ${endpoint} HTTP/1.1`, `> Host: api.sharpflow.ai`, `> x-api-key: ${apiKey.slice(0, 8)}...`]);
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    setLogs((prev) => [...prev, `> Connection: keep-alive`, `> Content-Length: ${requestJson.length}`, `> Payload: ${JSON.stringify({ wallet: wallet.slice(0, 8) + '...', amount: Number(amount) })}`]);
    await new Promise((resolve) => setTimeout(resolve, 800));

    setLogs((prev) => [...prev, ``, `* Dialing Polygon RPC gateway node...`, `* Broadcasting transaction event to smart contract...`]);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLogs((prev) => [...prev, `* Mining block index on Polygon Testnet...`]);
    await new Promise((resolve) => setTimeout(resolve, 1100));

    setLogs((prev) => [
      ...prev,
      `* Event logs: Transfer(0x0000000000000000000000000000000000000000, ${wallet.slice(0, 6)}..., ${amount} SHARP)`,
      `* Block confirmation validated. Ledger updated.`,
      `< HTTP/1.1 200 OK`,
      `< Content-Type: application/json; charset=utf-8`,
    ]);
    await new Promise((resolve) => setTimeout(resolve, 500));

    setResponse(apiResponse);
  };

  const handleExecute = async () => {
    setLoading(true);
    setResponse(null);
    setLogs([]);
    const toastId = toast.loading(`Sending request to ${endpoint}...`);

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: requestJson,
      });

      const data = await res.json();

      if (data.success) {
        toast.dismiss(toastId);
        toast('Reward sent', { 
          icon: '🟢',
          style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
        });
        
        // Push transactions to store
        addTransaction({
          wallet: data.wallet,
          amount: method === 'spend' ? -Number(amount) : Number(amount),
          txHash: data.txHash,
          timestamp: data.timestamp || new Date().toISOString(),
          type: method,
        });
        incrementApiCalls();

        // Trigger console logs typewriter
        await simulateTypewriter(data);

        if (method === 'reward' || method === 'buy') {
          confetti({
            particleCount: 120,
            spread: 75,
            origin: { y: 0.65 },
            colors: method === 'buy' ? ['#fbbf24', '#f59e0b', '#d97706'] : ['#3b82f6', '#a855f7', '#10b981'],
          });
        }
      } else {
        toast.error(data.error || 'Request execution failed.', { id: toastId });
        setLogs([`> POST ${endpoint} HTTP/1.1`, `< HTTP/1.1 400 Bad Request`, ``, `Error: ${data.error}`]);
        setResponse(data);
      }
    } catch (err: any) {
      console.warn(err);
      toast.error('Network gateway error.', { id: toastId });
      setLogs([`> POST ${endpoint} HTTP/1.1`, ``, `Fatal Error: Node connection failed`]);
      setResponse({ success: false, error: 'RPC Gateway offline' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
      {/* Parameter Form */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-6 text-left">
        <div className="space-y-5">
          <div>
            <h3 className="text-lg font-semibold text-zinc-950 dark:text-white mb-1">Developer Playground</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Interactive client playground to dispatch blockchain reward triggers and spend updates.
            </p>
          </div>

          <div className="space-y-4">
            {/* Action toggle */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">REST Method Endpoint</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setMethod('reward')}
                  className={`py-1.5 px-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                    method === 'reward'
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200'
                  }`}
                >
                  POST /reward
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('spend')}
                  className={`py-1.5 px-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                    method === 'spend'
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200'
                  }`}
                >
                  POST /spend
                </button>
                <button
                  type="button"
                  onClick={() => setMethod('buy')}
                  className={`py-1.5 px-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                    method === 'buy'
                      ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                      : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200'
                  }`}
                >
                  POST /buy
                </button>
              </div>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">x-api-key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs font-mono text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Wallet Address */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider">wallet (User Address)</label>
                {user && (
                  <button
                    type="button"
                    onClick={() => setWallet(user.walletAddress)}
                    className="text-[9px] text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Select my wallet
                  </button>
                )}
              </div>
              <input
                type="text"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
                placeholder="0x..."
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs font-mono text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Token Amount */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">amount (SHARP)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-xs text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleExecute}
          disabled={loading || !wallet || !amount}
          className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-100 py-3 text-xs font-bold text-white dark:text-zinc-950 shadow-md disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          <span>{loading ? 'Confirming Transaction...' : 'Run Request'}</span>
        </button>
      </div>

      {/* Terminal Display */}
      <div className="lg:col-span-7 flex flex-col rounded-2xl bg-zinc-950 text-zinc-300 font-mono text-xs overflow-hidden border border-zinc-900 shadow-2xl min-h-[380px]">
        {/* Terminal Title */}
        <div className="flex items-center justify-between bg-zinc-900/40 px-4 py-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <Terminal className="h-4.5 w-4.5 text-purple-500" />
            <span className="font-semibold text-zinc-200">Interactive Code Sandbox</span>
          </div>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
          </div>
        </div>

        {/* Terminal Log Console */}
        <div className="flex-1 flex flex-col p-5 space-y-4 overflow-y-auto">
          {/* Request command */}
          <div className="space-y-1 text-left">
            <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
              <span>Request Command</span>
              <button onClick={handleCopyRequest} className="hover:text-white flex items-center gap-1 transition-colors">
                {copiedReq ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>Copy</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-900 text-zinc-400 break-words whitespace-pre-wrap leading-relaxed text-[10px] sm:text-xs">
              {curlCommand}
            </pre>
          </div>

          {/* Typewriter logs console */}
          <div className="flex-1 flex flex-col justify-end space-y-2 text-left">
            <div className="flex justify-between items-center text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
              <span>Telemetry Console Logs</span>
              {response && (
                <button onClick={handleCopyResponse} className="hover:text-white flex items-center gap-1 transition-colors">
                  {copiedRes ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>Copy Payload</span>
                </button>
              )}
            </div>
            <div className="p-3 rounded-lg bg-zinc-900/50 border border-zinc-900 text-[10px] sm:text-xs min-h-[170px] overflow-y-auto">
              <div className="space-y-1 text-zinc-400 leading-normal">
                {logs.map((log, i) => (
                  <div key={i} className={log.startsWith('<') ? 'text-zinc-400 font-bold' : log.startsWith('*') ? 'text-blue-400' : 'text-zinc-500'}>
                    {log}
                  </div>
                ))}
                {loading && (
                  <div className="text-zinc-500 flex items-center gap-2 pt-1 font-semibold animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    <span>Processing transaction sequence...</span>
                  </div>
                )}
                {response && (
                  <pre className="text-emerald-400 mt-2 border-t border-zinc-900 pt-2 overflow-x-auto whitespace-pre font-bold">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                )}
                {!loading && !response && logs.length === 0 && (
                  <div className="text-zinc-500 text-center py-8">
                    Submit request below to stream blockchain event logs.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
