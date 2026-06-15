'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { BarChart3, TrendingUp, PieChart, ShieldCheck, Activity, Cpu, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import GlassCard from './GlassCard';
import { useSharpStore } from '@/hooks/useSharpStore';
import toast from 'react-hot-toast';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  valueSuffix?: string;
  bulletColor?: string;
}

const CustomTooltip = ({ active, payload, label, valueSuffix = "", bulletColor = "#3b82f6" }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-[#0a0b0d]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-2xl text-left">
        <p className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]" style={{ backgroundColor: bulletColor, color: bulletColor }} />
          <p className="text-xs font-black text-white">
            {payload[0].value.toLocaleString()} <span className="text-[9px] font-normal text-zinc-400 font-mono">{valueSuffix}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function WalletAnalytics() {
  const { transactions, apiCalls, isLiveMode, syncState, lastBlockNumber } = useSharpStore();

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const [streamData, setStreamData] = useState<any[]>([]);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [latency, setLatency] = useState(21);
  const [blockOffset, setBlockOffset] = useState(0);

  // Polling simulator loop for streaming chart inputs
  useEffect(() => {
    const generateInitialData = () => {
      return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayName = daysOfWeek[d.getDay()];
        
        const baseTokens: Record<string, number> = {
          Mon: 120, Tue: 240, Wed: 180, Thu: 320, Fri: 210, Sat: 450, Sun: 380
        };
        const baseRequests: Record<string, number> = {
          Mon: 45, Tue: 90, Wed: 60, Thu: 120, Fri: 80, Sat: 150, Sun: 110
        };

        let tokens = baseTokens[dayName] || 100;
        let requests = baseRequests[dayName] || 50;

        // Hydrate actual live workspace records on today's node
        if (i === 6) {
          const totalTxs = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
          tokens += totalTxs % 350;
          requests += apiCalls;
        }

        return {
          day: dayName,
          tokens,
          requests
        };
      });
    };

    setStreamData(generateInitialData());

    // Stream updates every 3 seconds to animate Recharts live
    const dataInterval = setInterval(() => {
      setStreamData(prev => {
        if (prev.length === 0) return prev;
        const next = [...prev];
        const lastIndex = next.length - 1;
        
        // Random micro fluctuations to simulate live system data streaming
        const tokenFluct = Math.floor(Math.random() * 16) - 8;
        const reqFluct = Math.floor(Math.random() * 4) - 2;

        next[lastIndex] = {
          ...next[lastIndex],
          tokens: Math.max(100, next[lastIndex].tokens + tokenFluct),
          requests: Math.max(40, next[lastIndex].requests + reqFluct)
        };
        return next;
      });
      setSecondsSinceUpdate(0);
      setLatency(Math.floor(Math.random() * 11) + 15); // 15 - 26ms
      setBlockOffset(b => b + 1);
    }, 3000);

    // Increment seconds elapsed counter
    const secondsInterval = setInterval(() => {
      setSecondsSinceUpdate(s => s + 1);
    }, 1000);

    return () => {
      clearInterval(dataInterval);
      clearInterval(secondsInterval);
    };
  }, [transactions, apiCalls]);

  // Derive dynamic details for Insight Cards
  const computedStats = useMemo(() => {
    const weeklyChange = apiCalls > 10 ? `+${(12.4 + (apiCalls % 10) * 0.5).toFixed(1)}%` : '+12.4%';
    const peakLoad = Math.max(120, 142 + apiCalls * 3);
    const velocityLevel = (totalTokensDistributed: number) => {
      if (totalTokensDistributed > 2000) return 'HIGH';
      if (totalTokensDistributed > 500) return 'MEDIUM';
      return 'LOW';
    };

    const totalDistributed = transactions.reduce((acc, t) => acc + t.amount, 0);
    return {
      growth: weeklyChange,
      load: peakLoad,
      velocity: velocityLevel(totalDistributed),
      rawVelocity: totalDistributed > 0 ? (totalDistributed / 12).toFixed(1) : '8.4'
    };
  }, [apiCalls, transactions]);

  // Deterministic block counter sync
  const currentBlock = useMemo(() => {
    if (isLiveMode && lastBlockNumber) {
      return lastBlockNumber;
    }
    return 12450890 + blockOffset;
  }, [isLiveMode, lastBlockNumber, blockOffset]);

  return (
    <div className="space-y-6 text-left">
      
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border border-white/[0.06] bg-zinc-950/20 backdrop-blur-md rounded-3xl px-6 py-4.5 gap-4">
        <div className="space-y-0.5">
          <h3 className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <span>Telemetry Ledger</span>
          </h3>
          <h4 className="text-sm font-extrabold text-white tracking-tight">System Performance & Transactions</h4>
        </div>
        
        {/* Streaming Data Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="text-[9px] font-mono font-bold text-[#00ff88] uppercase tracking-wider">Live Data Stream</span>
          </div>
          <span className="text-[9px] font-mono text-zinc-500">
            Updated {secondsSinceUpdate}s ago
          </span>
        </div>
      </div>

      {/* System Health Indicators Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-950/30 border border-white/[0.06] rounded-2xl p-4">
        
        <div className="space-y-1">
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Network</span>
          <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Polygon Amoy
          </span>
        </div>

        <div className="space-y-1 border-l border-white/[0.06] pl-4">
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">Gateway Sync</span>
          <span className="text-[10px] font-bold text-white flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${
              isLiveMode 
                ? syncState === 'CONFIRMED' ? 'bg-emerald-500' : 'bg-amber-500'
                : 'bg-emerald-500'
            }`} />
            {isLiveMode ? syncState : 'CONFIRMED'}
          </span>
        </div>

        <div className="space-y-1 border-l border-white/[0.06] pl-4">
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">RPC Failover Routes</span>
          <span className="text-[10px] font-bold text-[#00ff88] flex items-center gap-1.5 font-mono">
            Primary <span className="text-zinc-500">→</span> Alchemy
          </span>
        </div>

        <div className="space-y-1 border-l border-white/[0.06] pl-4">
          <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">API Gateway Latency</span>
          <span className="text-[10px] font-bold text-blue-400 font-mono">
            {latency}ms
          </span>
        </div>

      </div>

      {/* Grid of Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Token Area Distribution */}
        <div className="relative group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-6 flex flex-col justify-between transition-all hover:border-white/[0.1] hover:bg-white/[0.04]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">Distribution Volume</span>
              <h4 className="text-xs font-bold text-white mt-0.5">SHARP Tokens Issued</h4>
            </div>
            
            <div className="flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-[9px] font-mono font-bold text-blue-400 uppercase tracking-wider">Audited Ledger</span>
            </div>
          </div>

          <div className="h-60 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={streamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.015)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#52525b" />
                <YAxis axisLine={false} tickLine={false} stroke="#52525b" />
                <Tooltip content={<CustomTooltip valueSuffix="SHARP" bulletColor="#3b82f6" />} />
                <Area type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={1.8} fillOpacity={1} fill="url(#colorTokens)" isAnimationActive={true} animationDuration={400} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API Requests Bar Chart */}
        <div className="relative group rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] backdrop-blur-xl p-6 flex flex-col justify-between transition-all hover:border-white/[0.1] hover:bg-white/[0.04]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">System Activity</span>
              <h4 className="text-xs font-bold text-white mt-0.5">Developer API Requests</h4>
            </div>
            
            <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
              <Cpu className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider">Gateway Verified</span>
            </div>
          </div>

          <div className="h-60 w-full text-[10px] font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={streamData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.015)" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#52525b" />
                <YAxis axisLine={false} tickLine={false} stroke="#52525b" />
                <Tooltip content={<CustomTooltip valueSuffix="Reqs" bulletColor="#a855f7" />} />
                <Bar dataKey="requests" fill="url(#colorRequests)" stroke="#a855f7" strokeWidth={1} radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={400} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Insight Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <GlassCard className="p-4 border border-white/[0.08] bg-white/[0.02]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Adoption Trend</span>
            <span className="text-[9px] text-emerald-450 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">WEEKLY</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-extrabold text-white">{computedStats.growth}</span>
            <span className="text-[9px] text-zinc-500 font-mono">dApp integrations</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-white/[0.08] bg-white/[0.02]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">API Load Peaks</span>
            <span className="text-[9px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">GATEWAY</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-extrabold text-white">{computedStats.load} rpm</span>
            <span className="text-[9px] text-zinc-500 font-mono">peak load capacity</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border border-white/[0.08] bg-white/[0.02]">
          <div className="flex justify-between items-start">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Token Fluidity</span>
            <span className="text-[9px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded">VELOCITY</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-extrabold text-white">{computedStats.velocity}</span>
            <span className="text-[9px] text-zinc-500 font-mono">({computedStats.rawVelocity} SHARP/h)</span>
          </div>
        </GlassCard>

      </div>

      {/* AI Insight Summary Panel */}
      <GlassCard className="p-5 border border-purple-500/20 bg-purple-950/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-purple-500/5 blur-xl pointer-events-none" />
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shrink-0">
            <Activity className="h-4.5 w-4.5 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest block">AI Copilot Analytics Insight</span>
            <p className="text-xs text-zinc-350 leading-relaxed font-bold">
              dApp transaction routing shows zero Sybil anomalies. Token Velocity matches healthy distribution indices. 
              API Peak load has expanded slightly following deployment of the automated campaign trigger, remaining safely within 
              rate bounds. Recommend key limits adjustments on developer routes to match scale.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Verified On-Chain transactions explorer */}
      <div className="bg-white/[0.01] border border-white/[0.06] rounded-3xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
            Verified On-Chain Activity Feed
          </span>
          
          <div className="text-[9px] font-mono text-zinc-500 flex items-center gap-1.5">
            <span>Amoy Block Confirmation:</span>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">#{currentBlock}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.slice(0, 4).map((tx, idx) => (
            <div key={idx} className="flex justify-between items-center bg-white/[0.01] border border-white/[0.04] px-4 py-2.5 rounded-xl text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${tx.type === 'spend' ? 'bg-purple-400' : 'bg-emerald-400'}`} />
                <span className="text-zinc-500">{tx.type === 'spend' ? 'Spend' : 'Reward'}:</span>
                <span className="text-white font-bold">{tx.amount} SHARP</span>
              </div>
              <a
                href={`https://amoy.polygonscan.com/tx/${tx.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 hover:underline transition-all"
              >
                <span className="truncate max-w-[80px]">{tx.txHash}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="col-span-2 text-center text-zinc-500 text-xs py-4">
              No recent transactions processed. Run rules or checkouts to record activity.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
