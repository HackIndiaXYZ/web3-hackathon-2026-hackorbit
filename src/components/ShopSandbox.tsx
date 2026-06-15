'use client';

import React, { useState } from 'react';
import { 
  Coins, ShoppingBag, ArrowRight, ShieldCheck, AlertCircle, 
  Loader2, CheckCircle2, RefreshCw, Key, ShieldAlert, Cpu, 
  Layers, Lock, FileCode, ExternalLink
} from 'lucide-react';
import GlassCard from './GlassCard';
import { useSharpStore } from '@/hooks/useSharpStore';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
  gradient: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'prod-developer-pro',
    name: 'Developer Pro Access NFT',
    description: 'Unlocks unlimited campaign building, premium SDK hooks, and priority relayer priority lanes.',
    price: 150,
    icon: Key,
    gradient: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'prod-relayer-bundle',
    name: 'SharpFlow Relayer Bundle',
    description: 'Pre-funded gas relayer allocation with 5,000 transactions and enterprise security monitoring.',
    price: 300,
    icon: Cpu,
    gradient: 'from-purple-600 to-pink-600'
  },
  {
    id: 'prod-dedicated-node',
    name: 'Dedicated Node Access License',
    description: 'High-throughput private RPC node endpoint on Amoy with 99.99% uptime SLA.',
    price: 500,
    icon: Layers,
    gradient: 'from-emerald-600 to-teal-600'
  }
];

type FailureMode = 'none' | 'rpc_down' | 'duplicate_checkout' | 'wallet_mismatch' | 'insufficient_gas';

interface ShopSandboxProps {
  renderLayout: (leftPanel: React.ReactNode, rightPanel: React.ReactNode) => React.ReactNode;
}

export default function ShopSandbox({ renderLayout }: ShopSandboxProps) {
  const { user, balance, setBalance, addTransaction, isLiveMode } = useSharpStore();

  const [selectedProduct, setSelectedProduct] = useState<Product>(PRODUCTS[0]);
  const [failureMode, setFailureMode] = useState<FailureMode>('none');
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'signing' | 'pending' | 'confirmed' | 'failed'>('idle');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [nonce, setNonce] = useState<number>(1);
  const [generatedTxHash, setGeneratedTxHash] = useState<string>('');
  const [generatedBlock, setGeneratedBlock] = useState<number>(0);
  const [payloadDetails, setPayloadDetails] = useState<any>(null);
  const [rpcRecoveryAttempts, setRpcRecoveryAttempts] = useState<number>(0);
  const [confirmations, setConfirmations] = useState<number>(0);

  const addLog = (msg: string) => {
    setLogMessages((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const resetState = () => {
    setCheckoutStep('idle');
    setLogMessages([]);
    setGeneratedTxHash('');
    setGeneratedBlock(0);
    setPayloadDetails(null);
    setRpcRecoveryAttempts(0);
    setConfirmations(0);
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please connect your wallet first!');
      return;
    }

    resetState();
    setCheckoutStep('signing');
    addLog('Initiating secure cryptographic transaction handshaking...');
    
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const timestamp = Date.now();
    const productPrice = selectedProduct.price;
    const currentNonce = nonce;
    setNonce((n) => n + 1);

    const rawPayload = `${user.walletAddress}-${selectedProduct.id}-${currentNonce}-${timestamp}`;
    const payloadHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const mockSig = '0x' + Array.from({ length: 130 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    setPayloadDetails({
      address: user.walletAddress,
      productId: selectedProduct.id,
      nonce: currentNonce,
      timestamp,
      hash: payloadHash,
      signature: mockSig
    });

    addLog(`Signed purchase intent: ${payloadHash.slice(0, 16)}...`);
    addLog(`Generated cryptographic client signature: ${mockSig.slice(0, 20)}...`);

    setCheckoutStep('pending');
    addLog('Dispatched payload to SharpFlow Relayer Gateway...');

    if (failureMode === 'rpc_down') {
      addLog('⚠️ Connection to primary RPC node timed out.');
      setRpcRecoveryAttempts(1);
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog('🔄 RPC Fallback System activated. Querying Alchemy endpoint...');
      setRpcRecoveryAttempts(2);
      
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog('🔄 Alchemy endpoint delayed. Querying Infura endpoint...');
      setRpcRecoveryAttempts(3);
      
      await new Promise((resolve) => setTimeout(resolve, 1200));
      addLog('✅ Consensus reached via Infura node (highest block resolved). Continuing transaction.');
    }

    if (failureMode === 'wallet_mismatch') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog('❌ Security Check Failed: Sender wallet address mismatch in payload.');
      addLog('🚨 Potential spoofing / hijack detected. Transaction rejected.');
      setCheckoutStep('failed');
      toast.error('Checkout failed: Wallet Address Mismatch!');
      return;
    }

    if (failureMode === 'insufficient_gas') {
      await new Promise((resolve) => setTimeout(resolve, 1800));
      addLog('❌ EVM transaction reverted: [Gas Limit Exceeded].');
      addLog('🚨 Reverting local state changes...');
      setCheckoutStep('failed');
      toast.error('Checkout failed: Insufficient gas allocation!');
      return;
    }

    if (failureMode === 'duplicate_checkout') {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog('❌ Replay Attack Prevention: Transaction nonce already processed.');
      addLog('🚨 Blocked duplicate checkout attempts.');
      setCheckoutStep('failed');
      toast.error('Checkout failed: Duplicate nonce/replay attack blocked!');
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));
    setConfirmations(1);
    addLog('Mined Transaction: 1/1 block confirmations registered.');

    const blockNum = 12450800 + Math.floor(Math.random() * 1000);
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    setGeneratedBlock(blockNum);
    setGeneratedTxHash(txHash);

    if (balance < productPrice) {
      addLog('❌ Insufficient balance for purchase.');
      setCheckoutStep('failed');
      toast.error('Checkout failed: Insufficient SHARP balance!');
      return;
    }

    setBalance(balance - productPrice);
    addTransaction({
      wallet: user.walletAddress,
      amount: productPrice,
      txHash,
      timestamp: new Date().toISOString(),
      type: 'spend'
    });

    setCheckoutStep('confirmed');
    addLog(`🎉 Transaction confirmed inside block #${blockNum}.`);
    addLog(`Transaction Hash: ${txHash}`);
    toast.success('Purchase confirmed successfully!', { icon: '🛍️' });
  };

  const leftPanel = (
    <div className="flex-1 min-w-0 space-y-6 pb-8 pr-1">
        <h2 className="text-base font-bold text-zinc-350 px-2 flex items-center gap-2">
          <ShoppingBag className="h-4.5 w-4.5 text-blue-400" />
          Select Premium Upgrade
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {PRODUCTS.map((prod) => {
            const Icon = prod.icon;
            const isSelected = selectedProduct.id === prod.id;
            return (
              <div
                key={prod.id}
                onClick={() => {
                  setSelectedProduct(prod);
                  resetState();
                }}
                className={`relative cursor-pointer rounded-2xl p-6 border text-left transition-all duration-300 ${
                  isSelected
                    ? 'bg-white/[0.04] border-blue-500/50 shadow-[0_4px_20px_rgba(59,130,246,0.15)] -translate-y-0.5'
                    : 'bg-white/[0.01] border-white/[0.06] hover:bg-white/[0.02] hover:border-white/[0.1]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${prod.gradient} text-white shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-white">{prod.name}</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">{prod.description}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-white font-mono">{prod.price}</span>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase block">SHARP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <GlassCard className="p-6 border border-white/[0.08] bg-white/[0.03] text-left">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Wallet Balance</span>
              <div className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-amber-400" />
                <span className="text-2xl font-black text-white font-mono">{balance.toLocaleString()} SHARP</span>
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2">
              <span className="text-[9px] font-bold text-zinc-500 block uppercase">Network Relayer</span>
              <span className="text-[10px] font-mono font-bold text-emerald-400">Gasless (Sponsored)</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border border-white/[0.08] bg-white/[0.02] text-left">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-purple-400" />
            Simulate Failure / Edge Cases
          </h3>
          <p className="text-xs text-zinc-400 mb-4">
            Toggle specific failure conditions to verify the platform&apos;s recovery design, gas limits, and RPC fallback resolvers.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { id: 'none', label: 'Healthy Flow (Success)', desc: 'Smooth checkout path' },
              { id: 'rpc_down', label: 'RPC Node Failover', desc: 'Timeout failover to Alchemy/Infura' },
              { id: 'wallet_mismatch', label: 'Wallet Spoofing Mismatch', desc: 'Checks address signing validity' },
              { id: 'insufficient_gas', label: 'Insufficient Gas Limits', desc: 'Rollback & gas recovery' },
              { id: 'duplicate_checkout', label: 'Replay/Duplicate Checkout', desc: 'Nonce reuse validation check' }
            ].map((mode) => (
              <label
                key={mode.id}
                onClick={() => setFailureMode(mode.id as FailureMode)}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  failureMode === mode.id
                    ? 'bg-purple-950/20 border-purple-500/40 text-white'
                    : 'bg-white/[0.01] border-white/[0.04] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <input
                  type="radio"
                  name="failureMode"
                  checked={failureMode === mode.id}
                  onChange={() => {}}
                  className="mt-1 accent-purple-500"
                />
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold block">{mode.label}</span>
                  <span className="text-[9px] text-zinc-500 font-normal">{mode.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </GlassCard>
      </div>
  );

  const rightPanel = (
    <div className="flex-1 min-w-0 space-y-6 pb-8 pr-1">
        <h2 className="text-base font-bold text-zinc-350 px-2 flex items-center gap-2">
          <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
          Verification & Settlement Gateway
        </h2>

        <GlassCard className="p-6 border border-white/[0.08] bg-white/[0.03] text-left">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Active Upgrades:</span>
              <span className="text-xs font-bold text-white bg-white/5 border border-white/10 rounded-lg px-2.5 py-1">
                {selectedProduct.name}
              </span>
            </div>

            <div className="flex items-center justify-between border-y border-white/[0.06] py-3.5">
              <span className="text-xs text-zinc-400">Subtotal:</span>
              <div className="text-right">
                <span className="text-xl font-black text-white font-mono">{selectedProduct.price}</span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase ml-1">SHARP</span>
              </div>
            </div>

            {checkoutStep === 'idle' && (
              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 py-3 text-xs font-bold text-white hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                <span>Authorize Secure Purchase</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {checkoutStep !== 'idle' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                    checkoutStep === 'signing'
                      ? 'bg-blue-950/20 border-blue-500/50 text-blue-400'
                      : checkoutStep === 'pending' || checkoutStep === 'confirmed' || (checkoutStep === 'failed' && payloadDetails)
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/[0.01] border-white/[0.04] text-zinc-500'
                  }`}>
                    <Lock className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-[10px] font-bold block">1. Signed</span>
                    <span className="text-[8px] font-mono text-zinc-500">Authenticated</span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                    checkoutStep === 'pending'
                      ? 'bg-amber-950/20 border-amber-500/50 text-amber-400'
                      : checkoutStep === 'confirmed'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/[0.01] border-white/[0.04] text-zinc-500'
                  }`}>
                    <Loader2 className={`h-4 w-4 mx-auto mb-1 ${checkoutStep === 'pending' ? 'animate-spin' : ''}`} />
                    <span className="text-[10px] font-bold block">2. Pending</span>
                    <span className="text-[8px] font-mono text-zinc-500">
                      {checkoutStep === 'pending' ? '0/1 Blocks' : checkoutStep === 'confirmed' ? '1/1 Mined' : 'Staged'}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border text-center space-y-1 transition-all ${
                    checkoutStep === 'confirmed'
                      ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400'
                      : checkoutStep === 'failed'
                        ? 'bg-red-950/20 border-red-500/50 text-red-400'
                        : 'bg-white/[0.01] border-white/[0.04] text-zinc-500'
                  }`}>
                    {checkoutStep === 'failed' ? (
                      <AlertCircle className="h-4 w-4 mx-auto mb-1" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mx-auto mb-1" />
                    )}
                    <span className="text-[10px] font-bold block">
                      {checkoutStep === 'failed' ? 'Failed' : '3. Confirmed'}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500">
                      {checkoutStep === 'failed' ? 'Reverted' : 'Settled on Chain'}
                    </span>
                  </div>
                </div>

                {checkoutStep !== 'confirmed' && checkoutStep !== 'failed' && (
                  <div className="flex items-center justify-center gap-2 py-2 text-xs text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    <span>Processing transaction steps...</span>
                  </div>
                )}

                {(checkoutStep === 'confirmed' || checkoutStep === 'failed') && (
                  <button
                    onClick={resetState}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 py-2.5 text-xs font-bold text-zinc-300 hover:bg-white/10 transition-all"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Reset Simulator</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </GlassCard>

        {payloadDetails && (
          <GlassCard className="p-5 border border-white/[0.08] bg-white/[0.02] text-left">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3.5 mb-4">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-blue-400" />
                Intent Payload Details
              </span>
              <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                SHA-256
              </span>
            </div>
            <div className="space-y-3 font-mono text-[10px] text-zinc-400">
              <div className="flex justify-between items-start gap-4">
                <span className="text-zinc-500 shrink-0">Wallet:</span>
                <span className="text-white truncate">{payloadDetails.address}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Product ID:</span>
                <span className="text-white">{payloadDetails.productId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Nonce:</span>
                <span className="text-white">{payloadDetails.nonce}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Timestamp:</span>
                <span className="text-white">{payloadDetails.timestamp}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-zinc-500 shrink-0">Hashed Intent:</span>
                <span className="text-blue-300 truncate">{payloadDetails.hash}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-zinc-500 shrink-0">Sig:</span>
                <span className="text-purple-300 truncate">{payloadDetails.signature}</span>
              </div>
              
              {generatedTxHash && (
                <div className="mt-4 pt-4 border-t border-white/[0.06] space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Block Mined:</span>
                    <span className="text-emerald-400 font-bold">#{generatedBlock}</span>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-zinc-500 shrink-0">Transaction Hash:</span>
                    <span className="text-emerald-400 truncate">{generatedTxHash}</span>
                  </div>
                  <div className="flex justify-end pt-1">
                    <a
                      href={`https://amoy.polygonscan.com/tx/${generatedTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 hover:underline transition-all"
                    >
                      <span>View on Amoy Explorer</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        <div className="rounded-3xl border border-white/[0.06] bg-zinc-950 p-5 font-mono text-xs text-left">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-3.5">
            <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Ledger Logs & Failover Monitor
            </span>
            <span className="text-[9px] text-zinc-500">Node Status: Online</span>
          </div>
          
          <div className="h-[180px] overflow-y-auto space-y-2 text-[10px] text-zinc-400 pr-1">
            {logMessages.length === 0 ? (
              <div className="text-zinc-600 italic h-full flex items-center justify-center">
                Awaiting checkout authorization to record logs...
              </div>
            ) : (
              logMessages.map((log, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap">
                  {log.includes('⚠️') || log.includes('🚨') || log.includes('❌') ? (
                    <span className="text-amber-500">{log}</span>
                  ) : log.includes('🎉') || log.includes('✅') || log.includes('confirmed') ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
  );

  return <>{renderLayout(leftPanel, rightPanel)}</>;
}
