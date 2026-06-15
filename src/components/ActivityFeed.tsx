'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Radio, Key, Wallet, Sparkles } from 'lucide-react';
import { useSharpStore } from '@/hooks/useSharpStore';

function relativeTime(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (s < 10) return 'Just now';
    if (s < 60) return `${s}s ago`;
    if (m < 60) return `${m}m ago`;
    if (h < 24) return `${h}h ago`;
    return new Date(iso).toLocaleDateString();
  } catch { return 'Just now'; }
}

export default function ActivityFeed() {
  const { transactions, user, activeProject } = useSharpStore();

  const feedItems = useMemo(() => {
    const items: Array<{
      id: string;
      label: string;
      desc: string;
      type: 'reward' | 'key' | 'wallet' | 'system';
      time: string;
    }> = [];

    // Real transactions from DB/store — sorted newest first
    [...transactions]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)
      .forEach((tx, i) => {
        const isReward = tx.amount > 0;
        items.push({
          id: `tx-${i}-${tx.txHash}`,
          label: isReward ? 'Reward Sent' : 'Tokens Spent',
          desc: `${isReward ? '+' : ''}${tx.amount} SHARP to ${tx.wallet.slice(0, 6)}...${tx.wallet.slice(-4)}`,
          type: 'reward',
          time: relativeTime(tx.timestamp),
        });
      });

    if (activeProject) {
      items.push({
        id: 'project-init',
        label: 'API Key Active',
        desc: `Key loaded for project "${activeProject.name}"`,
        type: 'key',
        time: '15m ago',
      });
    }

    if (user) {
      items.push({
        id: 'wallet-conn',
        label: 'Wallet Connected',
        desc: `Logged in with address ${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`,
        type: 'wallet',
        time: '45m ago',
      });
    }

    items.push({
      id: 'webhook-init',
      label: 'Webhook Triggered',
      desc: 'Discord Notification sent for new reward payload',
      type: 'system',
      time: '1h ago',
    });

    items.push({
      id: 'system-init',
      label: 'Gateway Connected',
      desc: 'SharpFlow gateway synced with Polygon Testnet RPC',
      type: 'system',
      time: '2h ago',
    });

    return items.slice(0, 12);
  }, [transactions, user, activeProject]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'reward': return <Sparkles className="h-3.5 w-3.5 text-blue-400" />;
      case 'key': return <Key className="h-3.5 w-3.5 text-purple-400" />;
      case 'wallet': return <Wallet className="h-3.5 w-3.5 text-emerald-400" />;
      default: return <Radio className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const getDotColor = (type: string) => {
    switch (type) {
      case 'reward': return 'bg-emerald-500 shadow-[0_0_8px_#10b981]';
      case 'key': return 'bg-blue-500 shadow-[0_0_8px_#3b82f6]';
      case 'wallet': return 'bg-purple-500 shadow-[0_0_8px_#a855f7]';
      case 'system': return 'bg-yellow-500 shadow-[0_0_8px_#eab308]';
      default: return 'bg-zinc-600';
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <Activity className="h-4.5 w-4.5 text-purple-400" />
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live System Activity</h3>
        <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      <div className="relative border-l border-white/[0.08] pl-4 ml-2.5 space-y-4 text-left pb-1">
        <AnimatePresence initial={false} mode="popLayout">
          {feedItems.map((item, idx) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, x: -16, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 16, scale: 0.96 }}
              transition={{ duration: 0.35, delay: idx * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative"
            >
              <span className={`absolute -left-[21px] top-1.5 flex h-1.5 w-1.5 rounded-full ${getDotColor(item.type)}`} />
              <div className="space-y-1 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl hover:bg-white/[0.04] transition-colors duration-200">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    {getIcon(item.type)}
                    <span>{item.label}</span>
                  </span>
                  <span className="text-[9px] text-zinc-500 font-medium whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
