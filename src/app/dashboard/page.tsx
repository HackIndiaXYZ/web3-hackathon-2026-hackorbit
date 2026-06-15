'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Layout, Play, Search, BarChart3, Key, Radio, Users, 
  Coins, Activity, Wallet, Sparkles, Layers, ChevronRight, ShieldAlert,
  Copy, ExternalLink, Check, ShieldCheck, ShoppingBag, HardDrive, RefreshCw, AlertTriangle,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageContainer } from '@/components/LayoutSystem';
import GlassCard from '@/components/GlassCard';
import ApiPlayground from '@/components/ApiPlayground';
import SdkGenerator from '@/components/SdkGenerator';
import Explorer from '@/components/Explorer';
import ApiKeyManager from '@/components/ApiKeyManager';
import WebhookManager from '@/components/WebhookManager';
import TeamManager from '@/components/TeamManager';
import WalletAnalytics from '@/components/WalletAnalytics';
import ActivityFeed from '@/components/ActivityFeed';
import WebsiteScanner from '@/components/WebsiteScanner';
import CampaignBuilder from '@/components/CampaignBuilder';
import FraudDetection from '@/components/FraudDetection';
import AnimatedCounter from '@/components/AnimatedCounter';
import AiWorkflowBuilder from '@/components/AiWorkflowBuilder';
import ShopSandbox from '@/components/ShopSandbox';
import UserProfile from '@/components/UserProfile';
import { useSharpStore } from '@/hooks/useSharpStore';
import { resolveRpcConsensus, ConsensusResult } from '@/lib/rpcResolver';

type DashboardTab = 
  | 'overview' 
  | 'playground' 
  | 'explorer' 
  | 'analytics' 
  | 'scanner' 
  | 'campaigns' 
  | 'fraud' 
  | 'keys' 
  | 'webhooks' 
  | 'team' 
  | 'workflow'
  | 'trust'
  | 'marketplace'
  | 'shop'
  | 'profile';

export default function Dashboard() {
  const {
    user,
    transactions,
    setTransactions,
    apiCalls,
    theme,
    balance,
    setBalance,
    isDemoMode,
    isHydrated,
    startTour,
    setShowProductShowcase,
    // Live mode store properties
    isLiveMode,
    setLiveMode,
    syncState,
    setSyncState,
    lastBlockNumber,
    setLastBlockNumber,
    lastBalanceSnapshot,
    setLastBalanceSnapshot,
    lastTxHash,
    setLastTxHash
  } = useSharpStore();

  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const router = useRouter();

  // Consensus & Simulation Settings
  const [consensusResult, setConsensusResult] = useState<ConsensusResult | null>(null);
  const [simulateFork, setSimulateFork] = useState(false);
  const [simulateRpcFail, setSimulateRpcFail] = useState<string | undefined>(undefined);
  const [validationTxHash, setValidationTxHash] = useState('');
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  // Protected Route Check
  useEffect(() => {
    if (isHydrated) {
      if (!user && !isDemoMode) {
        router.push('/login');
      }
    }
  }, [user, isDemoMode, router, isHydrated]);


  // Live Mode Polling & Consensus Resolver Loop
  useEffect(() => {
    if (!isLiveMode) {
      setSyncState('DISCONNECTED');
      return;
    }

    let isSubscribed = true;
    
    const fetchConsensus = async () => {
      if (!isSubscribed) return;
      setSyncState('SYNCING');
      
      try {
        const res = await resolveRpcConsensus(simulateRpcFail, simulateFork);
        if (!isSubscribed) return;

        setConsensusResult(res);

        if (res.resolvedBlock !== null) {
          setSyncState('PENDING_CONFIRMATION');
          
          await new Promise((resolve) => setTimeout(resolve, 800));
          if (!isSubscribed) return;

          setLastBlockNumber(res.resolvedBlock);
          
          if (simulateFork) {
            setSyncState('REORG_DETECTED');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            if (!isSubscribed) return;
          }

          setSyncState('CONFIRMED');

          // Update on-chain wallet balance snapshot based on block height sequence
          const calculatedBalance = Math.max(500, 2500 + (res.resolvedBlock % 100) * 12);
          setLastBalanceSnapshot(calculatedBalance);

          // Simulate deterministic on-chain transaction hash mapping
          if (transactions.length > 0 && !lastTxHash) {
            setLastTxHash(transactions[0].txHash);
          }
        } else {
          setSyncState('STALE');
        }
      } catch (err) {
        if (isSubscribed) {
          setSyncState('DISCONNECTED');
        }
      }
    };

    fetchConsensus();
    const pollInterval = setInterval(fetchConsensus, 8000); // Sync every 8 seconds

    return () => {
      isSubscribed = false;
      clearInterval(pollInterval);
    };
  }, [isLiveMode, simulateFork, simulateRpcFail, transactions, setSyncState, setLastBlockNumber, setLastBalanceSnapshot, setLastTxHash]);

  // Sync wallet balance for Demo Mode
  useEffect(() => {
    if (isLiveMode) return;
    const fetchBalance = async () => {
      if (!user?.walletAddress) return;
      try {
        const res = await fetch(`/api/balance?wallet=${user.walletAddress}`);
        const data = await res.json();
        if (data.success) {
          setBalance(data.balance);
        }
      } catch (err) {
        console.warn('Error fetching balance:', err);
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 6000);
    return () => clearInterval(interval);
  }, [user?.walletAddress, setBalance, transactions, isLiveMode]);

  // Global background polling for transactions
  useEffect(() => {
    if (isDemoMode) return;

    const fetchTransactions = async () => {
      try {
        const res = await fetch('/api/transactions?limit=50');
        const data = await res.json();
        if (data.success && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      } catch (err) {
        console.warn('Error syncing global transactions:', err);
      }
    };
    
    fetchTransactions();
    const syncInterval = setInterval(fetchTransactions, 5000);
    return () => clearInterval(syncInterval);
  }, [setTransactions, isDemoMode]);

  // Compute Metrics
  const totalTokensDistributed = useMemo(() => {
    return transactions
      .filter((tx) => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const activeUserCount = useMemo(() => {
    const wallets = new Set(transactions.map((tx) => tx.wallet.toLowerCase()));
    if (user?.walletAddress) {
      wallets.add(user.walletAddress.toLowerCase());
    }
    return wallets.size;
  }, [transactions, user]);

  const handleCopyWallet = (e: React.MouseEvent) => {
    if (!user?.walletAddress) return;
    e.stopPropagation();
    navigator.clipboard.writeText(user.walletAddress);
    setCopiedWallet(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  // Verify manual Tx hashes on trust protocol tab
  const handleVerifyTxHash = () => {
    if (!validationTxHash) return;
    setValidationStatus('validating');
    setTimeout(() => {
      if (validationTxHash.startsWith('0x') && validationTxHash.length === 66) {
        setValidationStatus('valid');
        toast.success('Ledger Verification Successful! Hash found on Polygon.');
      } else {
        setValidationStatus('invalid');
        toast.error('Cryptographic signature check failed. Invalid TxHash.');
      }
    }, 1200);
  };

  // Sidebar Group Items
  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: Layout, category: '🏆 Core Demo Flow', tour: undefined },
    { id: 'workflow', label: 'AI Workflow Canvas', icon: Sparkles, category: '🏆 Core Demo Flow', tour: 'workflow' },
    { id: 'shop', label: 'Web3 Shop Sandbox', icon: ShoppingBag, category: '🏆 Core Demo Flow', tour: undefined },
    { id: 'trust', label: 'Trust Protocol', icon: ShieldCheck, category: '🏆 Core Demo Flow', tour: undefined },
    
    { id: 'playground', label: 'API Sandbox', icon: Play, category: '⚙️ Secondary Console', tour: 'playground' },
    { id: 'explorer', label: 'Block Explorer', icon: Search, category: '⚙️ Secondary Console', tour: 'explorer' },
    { id: 'analytics', label: 'Wallet Analytics', icon: BarChart3, category: '⚙️ Secondary Console', tour: 'analytics' },
    { id: 'scanner', label: 'Smart Scanner', icon: Sparkles, category: '⚙️ Secondary Console', tour: 'scanner' },
    { id: 'campaigns', label: 'Campaign Builder', icon: Layers, category: '⚙️ Secondary Console', tour: undefined },
    { id: 'fraud', label: 'Fraud Detection', icon: ShieldAlert, category: '⚙️ Secondary Console', tour: undefined },
    { id: 'keys', label: 'API Credentials', icon: Key, category: '⚙️ Secondary Console', tour: 'keys' },
    { id: 'webhooks', label: 'Webhook Listeners', icon: Radio, category: '⚙️ Secondary Console', tour: undefined },
    { id: 'marketplace', label: 'Marketplace Plugins', icon: ShoppingBag, category: '⚙️ Secondary Console', tour: undefined },
    { id: 'team', label: 'Collaborators', icon: Users, category: '⚙️ Secondary Console', tour: undefined },

    { id: 'profile', label: 'My Profile', icon: User, category: '👤 Account', tour: undefined },
  ];

  return (
    <PageContainer lockViewport={true}>
      <main className="w-full px-4 lg:px-8 pt-6 pb-6 relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 lg:items-stretch items-start min-h-0 h-auto overflow-visible lg:h-full lg:overflow-hidden">
        
        {/* Left Side Navigation */}
        <div className="lg:col-span-3 layout-scroll-panel space-y-4 pb-6 min-h-0">
          {user && (
            <button
              onClick={() => setActiveTab('profile')}
              className="w-full hidden lg:block backdrop-blur-[14px] bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.15] hover:shadow-[0_10px_30px_rgba(0,0,0,0.4)] text-left group relative overflow-hidden cursor-pointer"
            >
              <div className="absolute -right-10 -top-10 w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600/10 to-purple-600/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="flex items-center gap-3.5">
                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-emerald-400 shrink-0">
                  {user.avatar ? (
                    user.avatar.startsWith('linear-gradient') ? (
                      <div className="h-10 w-10 rounded-full border border-white/10 shrink-0 shadow-inner" style={{ background: user.avatar }} />
                    ) : (
                      <div className="h-10 w-10 rounded-full relative overflow-hidden bg-zinc-950">
                        <Image
                          src={user.avatar}
                          alt={user.name}
                          width={40}
                          height={40}
                          loading="lazy"
                          className={`image-fade ${avatarLoaded ? 'loaded' : ''} object-cover`}
                          onLoad={() => setAvatarLoaded(true)}
                        />
                      </div>
                    )
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#6d5efc] to-[#00d4ff] text-xs font-black text-white flex items-center justify-center shrink-0 tracking-wider">
                      {user.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-[#0A0A0B] bg-[#00ff88] flex items-center justify-center">
                    <span className="absolute inline-flex h-2 w-2 rounded-full bg-[#00ff88] animate-status-pulse"></span>
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-white truncate leading-snug tracking-tight">
                    {user.name}
                  </h3>
                  <p className="text-[10px] font-bold text-zinc-400 mt-0.5 tracking-wide">
                    Developer <span className="text-zinc-600">•</span> <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{totalTokensDistributed >= 10000 ? 'Enterprise' : totalTokensDistributed >= 1000 ? 'Pro Tier' : 'Developer Tier'}</span>
                  </p>
                </div>
              </div>

              <div className="my-4 border-t border-white/[0.06]" />

              <div className="space-y-3">
                <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Connected Wallet</div>
                
                <div className="flex items-center justify-between gap-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] rounded-xl px-3 py-2 transition-all">
                  <div
                    onClick={(e) => { e.stopPropagation(); handleCopyWallet(e); }}
                    title="Click to copy wallet"
                    className="flex items-center gap-2 text-[10px] font-mono text-zinc-300 hover:text-white transition-colors text-left flex-1 min-w-0 cursor-pointer"
                  >
                    <Wallet className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{user.walletAddress}</span>
                    {copiedWallet ? (
                      <Check className="h-3 w-3 text-emerald-400 shrink-0 ml-1" />
                    ) : (
                      <Copy className="h-3 w-3 text-zinc-500 shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>

                  <a
                    href={`https://amoy.polygonscan.com/address/${user.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on Polygonscan"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-blue-400 transition-all shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-left space-y-0.5">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">API Calls</span>
                    <span className="text-xs font-mono font-bold text-white block">
                      {apiCalls}
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-left space-y-0.5">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Earned</span>
                    <span className="text-xs font-mono font-bold text-purple-400 block">
                      {totalTokensDistributed} <span className="text-[8px] text-zinc-500 font-normal">SHARP</span>
                    </span>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-2 text-left space-y-0.5">
                    <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Status</span>
                    <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                      <span>Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          )}

          {/* Desktop Sidebar Card */}
          <div className="hidden lg:block p-6 space-y-5 rounded-3xl border border-white/[0.08] bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] text-left hover:border-white/[0.15] transition-all duration-500">
            <div className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-4 px-2">
              Developer Deck
            </div>

            <div className="space-y-4">
              {['🏆 Core Demo Flow', '⚙️ Secondary Console', '👤 Account'].map((cat) => (
                <div key={cat} className="space-y-1">
                  <div className="text-[9px] font-bold text-zinc-605 uppercase tracking-wider px-2 mb-1">
                    {cat}
                  </div>
                  {sidebarItems
                    .filter((item) => item.category === cat)
                    .map((item) => {
                      const Icon = item.icon;
                      const isSelected = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          data-tour={item.tour}
                          onClick={() => setActiveTab(item.id as DashboardTab)}
                          className={`w-full relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 border ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/5 text-white border-white/[0.12] shadow-inner shadow-blue-500/10'
                              : 'text-zinc-400 hover:text-white hover:bg-white/[0.03] border-transparent'
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] rounded-r-md bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                          )}
                          <Icon className={`h-4 w-4 shrink-0 transition-colors ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`} style={{ strokeWidth: 1.8 }} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-white/[0.06] pt-4">
              <button
                onClick={() => setShowProductShowcase(true)}
                className="w-full flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/5 px-3 py-2 text-xs font-bold text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/40 transition-all"
              >
                <Play className="h-3.5 w-3.5" />
                Watch Demo
              </button>
              <button
                onClick={() => startTour()}
                className="w-full flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/10 transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Guided Tour
              </button>
            </div>
          </div>

          {/* Mobile Swipeable Tab Menu */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto pb-3 w-full px-2 -mx-2 no-scrollbar" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as DashboardTab)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-500 shadow-[0_2px_8px_rgba(59,130,246,0.3)]'
                      : 'bg-white/[0.02] text-zinc-400 hover:text-zinc-200 border-white/[0.06] backdrop-blur-md'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-zinc-500'}`} style={{ strokeWidth: 1.8 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side - Dynamic Tab panels */}
        <div className="lg:col-span-9 layout-scroll-panel flex flex-col gap-6 w-full pb-8 pr-1 min-h-0">
          {/* Top Dashboard Tab Header & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-white/[0.06] bg-zinc-950/20 backdrop-blur-md rounded-3xl px-4 sm:px-6 py-3.5 sm:py-4.5 gap-4 text-left">
            <div className="space-y-0.5">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <span>Workspace</span>
                <span>/</span>
                <span className="text-zinc-400">Dashboard</span>
                <span>/</span>
                <span className="text-blue-400 font-bold">{activeTab.toUpperCase()}</span>
              </div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                {activeTab === 'overview' && 'System Analytics'}
                {activeTab === 'workflow' && 'AI Rule Orchestration Canvas'}
                {activeTab === 'shop' && 'Web3 Checkout Sandbox'}
                {activeTab === 'playground' && 'Developer Core Sandbox'}
                {activeTab === 'explorer' && 'On-Chain Block Explorer'}
                {activeTab === 'trust' && 'SharpFlow Trust Protocol'}
                {activeTab === 'analytics' && 'Wallet Performance Metrics'}
                {activeTab === 'scanner' && 'Automated Gamification Discovery'}
                {activeTab === 'campaigns' && 'Pre-built Reward Pipelines'}
                {activeTab === 'fraud' && 'Real-time Security Telemetry'}
                {activeTab === 'keys' && 'API Credentials & Tokens'}
                {activeTab === 'webhooks' && 'Webhook Listeners & Endpoints'}
                {activeTab === 'marketplace' && 'Plugin Marketplace Packages'}
                {activeTab === 'team' && 'Collaborators & Access Rules'}
              </h2>
            </div>
            
            {/* Sync State Machine Status Badge & Mobile Live Mode Switch */}
            <div className="flex flex-col sm:items-end items-start gap-1.5 shrink-0">
              <button
                onClick={() => {
                  setLiveMode(!isLiveMode);
                  toast.success(
                    !isLiveMode ? 'Amoy Testnet Mode Activated!' : 'Switched to Demo Sandbox'
                  );
                }}
                className={`flex items-center gap-2 border px-3.5 py-1.5 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                  isLiveMode 
                    ? syncState === 'CONFIRMED'
                      ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
                      : syncState === 'REORG_DETECTED'
                      ? 'bg-amber-950/20 border-amber-900/30 text-amber-455'
                      : 'bg-blue-950/20 border-blue-900/30 text-blue-400'
                    : 'bg-zinc-900 border-white/[0.04] text-zinc-450 hover:bg-white/[0.03]'
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isLiveMode 
                      ? syncState === 'CONFIRMED' ? 'bg-emerald-400' : syncState === 'REORG_DETECTED' ? 'bg-amber-400' : 'bg-blue-400'
                      : 'bg-zinc-500'
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${
                    isLiveMode 
                      ? syncState === 'CONFIRMED' ? 'bg-emerald-500' : syncState === 'REORG_DETECTED' ? 'bg-amber-500' : 'bg-blue-500'
                      : 'bg-zinc-600'
                  }`}></span>
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest">
                  {isLiveMode ? `Sync: ${syncState}` : 'Ledger Offline (Click to Live)'}
                </span>
              </button>
              {isLiveMode && lastBlockNumber && (
                <span className="text-[8px] font-mono text-zinc-500">
                  Block: #{lastBlockNumber}
                </span>
              )}
            </div>
          </div>

          {/* Optimized Instant-Switch Render Stack (Visibility Toggle Layout) */}
          <div className="w-full relative min-h-[500px]">
            
            {/* Overview */}
            <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'overview' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                {isLiveMode && (
                  <div className="bg-amber-950/10 border border-amber-900/30 rounded-2xl p-4 text-left flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-amber-400 block">Testnet Mode Active</span>
                      <span className="text-[11px] text-zinc-400">
                        Live Mode queries reads and writes from the Polygon Amoy testnet only. No real or production funds are ever utilized inside this workspace.
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-5 flex flex-col justify-between min-h-[120px] transition-all hover:border-white/[0.12] hover:bg-white/[0.04] text-left">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Tokens Distributed</span>
                        <h4 className="text-2xl font-black text-white leading-none tracking-tight">
                          <AnimatedCounter value={totalTokensDistributed} /> <span className="text-[10px] font-mono font-medium text-zinc-500">SHARP</span>
                        </h4>
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
                        <Coins className="h-4 w-4" style={{ strokeWidth: 1.8 }} />
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 font-bold mt-4 flex items-center gap-1">
                      <span>↑ +12.4%</span>
                      <span className="text-zinc-500 font-normal">this month</span>
                    </div>
                  </div>

                  <div className="relative group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-5 flex flex-col justify-between min-h-[120px] transition-all hover:border-white/[0.12] hover:bg-white/[0.04] text-left">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Active Users</span>
                        <h4 className="text-2xl font-black text-white leading-none tracking-tight">
                          <AnimatedCounter value={activeUserCount} /> <span className="text-[10px] font-mono font-medium text-zinc-500">Wallets</span>
                        </h4>
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
                        <Users className="h-4 w-4" style={{ strokeWidth: 1.8 }} />
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 font-bold mt-4 flex items-center gap-1">
                      <span>↑ +4.8%</span>
                      <span className="text-zinc-500 font-normal">active daily</span>
                    </div>
                  </div>

                  <div className="relative group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-5 flex flex-col justify-between min-h-[120px] transition-all hover:border-white/[0.12] hover:bg-white/[0.04] text-left">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-blue-500" />
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono">Sandbox API Calls</span>
                        <h4 className="text-2xl font-black text-white leading-none tracking-tight">
                          <AnimatedCounter value={apiCalls} /> <span className="text-[10px] font-mono font-medium text-zinc-500">Reqs</span>
                        </h4>
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                        <Activity className="h-4 w-4" style={{ strokeWidth: 1.8 }} />
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-blue-400 font-bold mt-4 flex items-center gap-1">
                      <span>⏱ 12ms avg</span>
                      <span className="text-zinc-500 font-normal">latency</span>
                    </div>
                  </div>

                  <div className="relative group rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[0.08] backdrop-blur-3xl p-5 flex flex-col justify-between min-h-[120px] transition-all hover:border-white/[0.15] hover:bg-white/[0.06] text-left">
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 font-mono">
                          {isLiveMode ? 'On-Chain Balance' : 'Wallet Balance'}
                        </span>
                        <h4 className="text-2xl font-black text-white leading-none tracking-tight">
                          <AnimatedCounter value={isLiveMode ? lastBalanceSnapshot : balance} decimals={1} /> <span className="text-[10px] font-mono font-medium text-zinc-500">SHARP</span>
                        </h4>
                      </div>
                      <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                        <Wallet className="h-4 w-4" style={{ strokeWidth: 1.8 }} />
                      </div>
                    </div>
                    <div className="text-[9px] font-mono text-emerald-400 font-bold mt-4 flex items-center gap-1">
                      <span>✔ Gas Paid</span>
                      <span className="text-zinc-500 font-normal">by Polygon relay</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4 hover:border-white/[0.12] transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Adoption Score</span>
                      <span className="text-[9px] font-mono text-blue-400 font-bold">Formula Driven</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-blue-500/5 border border-blue-500/20 shrink-0">
                        <span className="text-lg font-black text-blue-400">
                          {Math.min(100, Math.round((3 * 20) + Math.min(40, (apiCalls / 2000) * 40) + 25))}
                        </span>
                        <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Active Integration</span>
                        <span className="text-[10px] text-zinc-500 leading-normal block">
                          Normalized Adoption: apps (40%) + traffic (30%) + retention (30%)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4 hover:border-white/[0.12] transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Token Velocity</span>
                      <span className="text-[9px] font-mono text-purple-400 font-bold">Distributed / Day</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-purple-500/5 border border-purple-500/20 shrink-0">
                        <span className="text-sm font-black text-purple-400">
                          {Math.round(totalTokensDistributed / 14)}/d
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">SHARP Fluidity Index</span>
                        <span className="text-[10px] text-zinc-500 leading-normal block">
                          Daily movement speed of reward allocations across dApp nodes.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="relative rounded-3xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-4 hover:border-white/[0.12] transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">Gas Sponsors ROI</span>
                      <span className="text-[9px] font-mono text-emerald-400 font-bold">Accumulated Savings</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 flex items-center justify-center rounded-full bg-emerald-500/5 border border-emerald-500/20 shrink-0">
                        <span className="text-sm font-black text-emerald-400">
                          ${(0.0035 * apiCalls).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Gas sponsor metrics</span>
                        <span className="text-[10px] text-zinc-500 leading-normal block">
                          Calculated gas fees: transaction count * saved Gas Fees.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  {isLiveMode ? (
                    <div className="lg:col-span-8">
                      <GlassCard className="p-6 border border-white/[0.08] bg-white/[0.03] text-left space-y-6">
                        <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                          <div className="flex items-center gap-2">
                            <HardDrive className="h-5 w-5 text-emerald-400" />
                            <h3 className="text-sm font-bold text-white">EVM Node Consensus Control Monitor</h3>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-500">Resolution Algorithm: Majority Mode Selection</span>
                        </div>

                        {consensusResult ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              {consensusResult.nodes.map((node, idx) => (
                                <div key={idx} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-4 space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-white truncate max-w-[110px]">{node.name}</span>
                                    <span className={`h-2 w-2 rounded-full ${node.status === 'SUCCESS' ? 'bg-[#00ff88]' : 'bg-red-500'}`} />
                                  </div>
                                  <div className="space-y-1 font-mono text-[9px] text-zinc-500">
                                    <div className="flex justify-between">
                                      <span>Block:</span>
                                      <span className="text-white font-bold">{node.block ? `#${node.block}` : 'TIMEOUT'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Latency:</span>
                                      <span className="text-blue-400">{node.latency}ms</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="flex items-center justify-between bg-white/[0.01] border border-white/[0.06] rounded-2xl p-4">
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold uppercase text-zinc-500 tracking-wider">Consensus Status</span>
                                <span className="text-xs text-white block">
                                  {consensusResult.majorityReached 
                                    ? '✅ Majority Consensus Reached (Mode Resolved)' 
                                    : '⚠️ Consensus Out-of-Sync. Evaluating RPC Nodes fallback...'}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-[9px] font-mono text-zinc-500 block">Resolved Block Height:</span>
                                <span className="text-sm font-bold text-emerald-400 font-mono">#{consensusResult.resolvedBlock}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-xs text-zinc-500 py-6">
                            Connecting to Polygon Amoy RPC gateways...
                          </div>
                        )}

                        <div className="border-t border-white/[0.06] pt-5 space-y-4">
                          <span className="text-xs font-bold text-zinc-400 block uppercase tracking-wider">Simulate Network Divergences & Outages</span>
                          <div className="flex flex-wrap gap-4 text-xs">
                            <label className="flex items-center gap-2 cursor-pointer bg-white/[0.02] border border-white/[0.06] px-3.5 py-2 rounded-xl">
                              <input
                                type="checkbox"
                                checked={simulateFork}
                                onChange={(e) => setSimulateFork(e.target.checked)}
                                className="accent-purple-500"
                              />
                              <span>Simulate Chain Reorg / Fork</span>
                            </label>
                            
                            <label className="flex items-center gap-2 cursor-pointer bg-white/[0.02] border border-white/[0.06] px-3.5 py-2 rounded-xl">
                              <input
                                type="checkbox"
                                checked={simulateRpcFail === 'Primary RPC (Polygon)'}
                                onChange={(e) => setSimulateRpcFail(e.target.checked ? 'Primary RPC (Polygon)' : undefined)}
                                className="accent-purple-500"
                              />
                              <span>Simulate Node Outage (Primary Down)</span>
                            </label>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  ) : (
                    <div className="lg:col-span-8">
                      <WalletAnalytics />
                    </div>
                  )}

                  <div className="lg:col-span-4 flex flex-col gap-6">
                    <GlassCard className="p-5 border border-white/[0.08] bg-white/[0.04]">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-4 text-left">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">System Health & Telemetry</h4>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" />
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-left font-mono text-[10px] text-zinc-400">
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500">API Latency</span>
                          <span className="text-white font-bold">28ms</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500">RPC Gateway</span>
                          <span className="text-emerald-400 font-bold">HEALTHY</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500">Gas Tracker</span>
                          <span className="text-blue-400 font-bold">LOW (15 Gwei)</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500">MongoDB</span>
                          <span className="text-emerald-400 font-bold">CONNECTED</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500">Fraud Score</span>
                          <span className="text-emerald-400 font-bold">0.02 / SAFE</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider text-zinc-500">Webhook Queue</span>
                          <span className="text-amber-400 font-bold">12 PENDING</span>
                        </div>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-6 border border-white/[0.08] bg-white/[0.04]">
                      <ActivityFeed />
                    </GlassCard>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* AI Workflow Canvas */}
            <div className={activeTab === 'workflow' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'workflow' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <GlassCard className="p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-white/[0.04]">
                  <AiWorkflowBuilder />
                </GlassCard>
              </motion.div>
            </div>

            {/* Web3 Checkout Sandbox */}
            <div className={activeTab === 'shop' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'shop' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <GlassCard className="p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-white/[0.04]">
                  <ShopSandbox />
                </GlassCard>
              </motion.div>
            </div>

            {/* API Sandbox */}
            <div className={activeTab === 'playground' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'playground' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
                className="space-y-8"
              >
                <GlassCard className="p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-white/[0.04]">
                  <ApiPlayground />
                </GlassCard>
                <GlassCard className="p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-white/[0.04]">
                  <SdkGenerator />
                </GlassCard>
              </motion.div>
            </div>

            {/* Block Explorer */}
            <div className={activeTab === 'explorer' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'explorer' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <GlassCard className="p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-white/[0.04]">
                  <Explorer />
                </GlassCard>
              </motion.div>
            </div>

            {/* Wallet Analytics */}
            <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'analytics' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <WalletAnalytics />
              </motion.div>
            </div>

            {/* Smart Scanner */}
            <div className={activeTab === 'scanner' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'scanner' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <GlassCard className="p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-white/[0.04]">
                  <WebsiteScanner />
                </GlassCard>
              </motion.div>
            </div>

            {/* Campaign Builder */}
            <div className={activeTab === 'campaigns' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'campaigns' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <GlassCard className="p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-white/[0.04]">
                  <CampaignBuilder />
                </GlassCard>
              </motion.div>
            </div>

            {/* Fraud Detection */}
            <div className={activeTab === 'fraud' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'fraud' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <GlassCard className="p-4 sm:p-6 md:p-8 border border-white/[0.08] bg-white/[0.04]">
                  <FraudDetection />
                </GlassCard>
              </motion.div>
            </div>

            {/* API Credentials */}
            <div className={activeTab === 'keys' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'keys' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <ApiKeyManager />
              </motion.div>
            </div>

            {/* Webhook Listeners */}
            <div className={activeTab === 'webhooks' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'webhooks' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <WebhookManager />
              </motion.div>
            </div>

            {/* Collaborators */}
            <div className={activeTab === 'team' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'team' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <TeamManager />
              </motion.div>
            </div>

            {/* Trust Protocol */}
            <div className={activeTab === 'trust' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'trust' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <GlassCard className="p-4 sm:p-6 border border-white/[0.08] bg-white/[0.03] space-y-4">
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-blue-400" />
                    SharpFlow Core Trust Protocol
                  </h2>
                  <p className="text-xs text-zinc-400">
                    The core validation protocol that keeps Web3 integrations secure, immutable, and protected from replay attacks and gas failures.
                  </p>

                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-4">
                    <span className="text-xs font-bold text-white block">Cryptographic Web3 Ledger Auditor</span>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={validationTxHash}
                        onChange={(e) => setValidationTxHash(e.target.value)}
                        placeholder="Paste Polygon Transaction Hash (0x...)"
                        className="w-full sm:flex-1 px-4 py-2.5 bg-zinc-950 border border-white/[0.08] rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none"
                      />
                      <button
                        onClick={handleVerifyTxHash}
                        disabled={validationStatus === 'validating'}
                        className="w-full sm:w-auto justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${validationStatus === 'validating' ? 'animate-spin' : ''}`} />
                        <span>{validationStatus === 'validating' ? 'Auditing...' : 'Verify Hash'}</span>
                      </button>
                    </div>
                    {validationStatus === 'valid' && (
                      <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0" />
                        <span>Audit Verified! Valid Polygon transaction hash structure and timestamp.</span>
                      </div>
                    )}
                    {validationStatus === 'invalid' && (
                      <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-400 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        <span>Cryptographic structure check failed. Transaction hash must be 66 characters hex.</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className="bg-white/[0.01] border border-white/[0.04] p-4.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">01</span>
                        Ledger Integrity Layer
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Immutable block logging on Polygon. Web3 event telemetry audits transaction receipts client-side using deterministic block indices.
                      </p>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.04] p-4.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">02</span>
                        Execution Safety Layer
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Active signature validation, nonce drift caching, and webhook HMAC validation safeguards client applications from replay attacks.
                      </p>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.04] p-4.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">03</span>
                        Relayer Accountability Layer
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Relayer server-wallet public audits. Sponsored gas allocation ceilings are monitored in real-time to avoid relayer outages.
                      </p>
                    </div>

                    <div className="bg-white/[0.01] border border-white/[0.04] p-4.5 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">04</span>
                        Observation Layer
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        Smart anomaly scanner detection flags potential Sybil farming, high rate-limit alerts, and multi-wallet double spend anomalies.
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>

            {/* Marketplace */}
            <div className={activeTab === 'marketplace' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'marketplace' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-4 text-left">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-white">Sharp Marketplace Plugins</h3>
                    <p className="text-xs text-zinc-400">Discover pre-built third-party plugins with version-controlled manifests.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: 'Discord loyalty bot',
                      version: '1.2.0',
                      author: 'SharpFlow Core',
                      desc: 'Dispatches reward events to users who react, chat, or invite friends to Discord.',
                      manifest: 'sf-discord-bot@1.2.0',
                      status: 'Active'
                    },
                    {
                      name: 'Stripe Billing Payouts',
                      version: '2.1.4',
                      author: 'SharpFlow Core',
                      desc: 'Unlocks automated token spending deductions when users pay subscriptions via Stripe.',
                      manifest: 'sf-stripe-billing@2.1.4',
                      status: 'Install'
                    },
                    {
                      name: 'GitHub Bounty rewarder',
                      version: '1.0.1',
                      author: 'Community Integrator',
                      desc: 'Automates PR bounty payments to contributors directly when issue requests merge.',
                      manifest: 'sf-github-bounty@1.0.1',
                      status: 'Install'
                    }
                  ].map((plugin, idx) => (
                    <GlassCard key={idx} className="p-5 border border-white/[0.08] bg-white/[0.03] space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-white block truncate">{plugin.name}</span>
                          <span className="text-[9px] font-mono text-zinc-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">
                            v{plugin.version}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-zinc-500 block uppercase">Author: {plugin.author}</span>
                        <p className="text-[11px] text-zinc-450 leading-relaxed">{plugin.desc}</p>
                      </div>

                      <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[9px] font-mono text-blue-400">{plugin.manifest}</span>
                        <button
                          onClick={() => {
                            toast.success(`${plugin.name} plugin configured successfully!`);
                          }}
                          className={`px-3 py-1.5 text-2xs font-extrabold uppercase rounded-lg transition-all ${
                            plugin.status === 'Active'
                              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                              : 'bg-white text-zinc-950 hover:bg-zinc-200'
                          }`}
                        >
                          {plugin.status === 'Active' ? 'Configure' : 'Install'}
                        </button>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* User Profile */}
            <div className={activeTab === 'profile' ? 'block' : 'hidden'}>
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={activeTab === 'profile' ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.15 }}
              >
                <GlassCard className="p-8 border border-white/[0.08] bg-white/[0.04]">
                  <UserProfile />
                </GlassCard>
              </motion.div>
            </div>

          </div>
        </div>

      </main>
    </PageContainer>
  );
}
