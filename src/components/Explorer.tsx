'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, ArrowUpRight, ArrowDownLeft, Check, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSharpStore } from '@/hooks/useSharpStore';

export default function Explorer() {
  const { transactions, setTransactions, triggerDemoMode, isDemoMode } = useSharpStore();
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedTx, setCopiedTx] = useState<string | null>(null);

  // Generate unique gradient avatars for wallets dynamically
  const getWalletGradient = (address: string) => {
    const cleanAddress = address.replace('0x', '');
    const c1 = cleanAddress.slice(0, 6) || '3b82f6';
    const c2 = cleanAddress.slice(6, 12) || 'a855f7';
    return `linear-gradient(135deg, #${c1}, #${c2})`;
  };

  // Generate mock block numbers derived from transaction hashes — safe for any charset
  const getBlockNumber = (hash: string) => {
    const clean = hash.replace('0x', '');
    // Sum char codes for a stable, always-numeric result
    const seed = clean.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return 14500000 + (seed % 100000);
  };

  const fetchTransactions = useCallback(async (showToast = false) => {
    if (isDemoMode) return;
    setLoading(true);
    try {
      const res = await fetch('/api/transactions?limit=15');
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions);
        if (showToast) {
          toast.success('Explorer updated!');
        }
      }
    } catch (err) {
      console.warn('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [setTransactions, isDemoMode]);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(() => {
      fetchTransactions();
    }, 8500);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedTx(hash);
    toast.success('Tx Hash copied!');
    setTimeout(() => setCopiedTx(null), 2000);
  };

  const filteredTxs = transactions.filter((tx) => {
    if (!filterQuery) return true;
    return tx.wallet.toLowerCase().includes(filterQuery.toLowerCase()) || 
           tx.txHash.toLowerCase().includes(filterQuery.toLowerCase());
  });

  const displayTxs = filteredTxs.slice(0, 30);

  const getRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);

      if (diffSecs < 10) return 'Just now';
      if (diffSecs < 60) return `${diffSecs}s ago`;
      if (diffMins < 60) return `${diffMins}m ago`;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Transaction Ledger</span>
          </h3>
          <p className="text-xs text-zinc-500">Real-time Polygon Amoy Testnet block events explorer.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchTransactions(true)}
            disabled={loading}
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search wallet / hash..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="border border-zinc-200/50 dark:border-zinc-800/80 rounded-2xl overflow-hidden bg-white/30 dark:bg-zinc-950/20 backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/50 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 text-[9px] uppercase font-bold text-zinc-500 tracking-wider">
                <th className="px-5 py-3.5">Method</th>
                <th className="px-5 py-3.5">Tx Hash</th>
                <th className="px-5 py-3.5">Block</th>
                <th className="px-5 py-3.5">Recipient Wallet</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Time</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/30 dark:divide-zinc-800/40 text-xs">
              <AnimatePresence initial={false}>
                {displayTxs.length > 0 ? (
                  displayTxs.map((tx, idx) => {
                    const isBuy = tx.type === 'buy';
                    const isReward = tx.amount >= 0 && !isBuy;
                    return (
                      <motion.tr
                        key={`${tx.txHash}-${idx}`}
                        initial={{ opacity: 0, y: -10, backgroundColor: isBuy ? 'rgba(234, 179, 8, 0.05)' : isReward ? 'rgba(59, 130, 246, 0.05)' : 'rgba(168, 85, 247, 0.05)' }}
                        animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(0,0,0,0)' }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="hover:bg-zinc-100/45 dark:hover:bg-zinc-900/30 transition-colors"
                      >
                        {/* Method badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide border ${
                              isBuy
                                ? 'bg-amber-50/80 text-amber-700 border-amber-200/30 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                : isReward
                                ? 'bg-blue-50/80 text-blue-700 border-blue-200/30 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30'
                                : 'bg-purple-50/80 text-purple-700 border-purple-200/30 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/30'
                            }`}
                          >
                            {isBuy ? (
                              <>
                                <ArrowDownLeft className="h-3 w-3 text-amber-400" />
                                <span>BUY</span>
                              </>
                            ) : isReward ? (
                              <>
                                <ArrowDownLeft className="h-3 w-3" />
                                <span>REWARD</span>
                              </>
                            ) : (
                              <>
                                <ArrowUpRight className="h-3 w-3" />
                                <span>SPEND</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* Tx Hash */}
                        <td className="px-5 py-4 font-mono text-zinc-500 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="cursor-pointer hover:underline hover:text-zinc-950 dark:hover:text-white" onClick={() => copyHash(tx.txHash)}>
                              {tx.txHash.slice(0, 10)}...
                            </span>
                            <button onClick={() => copyHash(tx.txHash)} className="text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors">
                              {copiedTx === tx.txHash ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </td>

                        {/* Block */}
                        <td className="px-5 py-4 font-mono text-zinc-500 whitespace-nowrap">
                          {getBlockNumber(tx.txHash)}
                        </td>

                        {/* Recipient Wallet with unique avatar */}
                        <td className="px-5 py-4 font-mono text-zinc-700 dark:text-zinc-300 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full shrink-0 border border-zinc-200/10" style={{ background: getWalletGradient(tx.wallet) }} />
                            <span className="hover:text-zinc-950 dark:hover:text-white cursor-help" title={tx.wallet}>
                              {tx.wallet.slice(0, 6)}...{tx.wallet.slice(-4)}
                            </span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="px-5 py-4 font-semibold whitespace-nowrap">
                          <span className={isBuy ? 'text-amber-500' : isReward ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}>
                            {tx.amount >= 0 ? '+' : ''}
                            {tx.amount} SHARP
                          </span>
                        </td>

                        {/* Age */}
                        <td className="px-5 py-4 text-zinc-500 whitespace-nowrap">
                          {getRelativeTime(tx.timestamp)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              Success
                            </span>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                        <div className="h-12 w-12 rounded-2xl bg-zinc-800/50 flex items-center justify-center border border-white/[0.08] mb-4">
                          <Search className="h-5 w-5 text-zinc-500" />
                        </div>
                        <h4 className="text-zinc-200 font-bold mb-1">No Transactions Yet</h4>
                        <p className="text-xs text-zinc-500 mb-6">Your ledger is completely empty. Generate mock transactions to visualize the blockchain.</p>
                        <button
                          onClick={triggerDemoMode}
                          className="px-6 py-2 rounded-xl bg-white text-zinc-950 text-xs font-bold hover:scale-105 transition-transform"
                        >
                          Generate Demo Data →
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
