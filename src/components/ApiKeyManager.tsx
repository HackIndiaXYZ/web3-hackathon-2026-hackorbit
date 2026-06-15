'use client';

import React, { useState } from 'react';
import { Key, Eye, EyeOff, Copy, Check, Trash2, Plus, ShieldCheck, RefreshCw, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from './GlassCard';
import { useSharpStore } from '@/hooks/useSharpStore';

export default function ApiKeyManager() {
  const { keys, setKeys } = useSharpStore();

  const [revealKeyId, setRevealKeyId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  
  // Permission states for creation
  const [permRead, setPermRead] = useState(true);
  const [permWrite, setPermWrite] = useState(true);
  const [permReward, setPermReward] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealKeyId((prev) => (prev === id ? null : id));
  };

  const copyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    toast.success('API Key copied to clipboard!');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const revokeKey = (id: string) => {
    setKeys(
      keys.map((k) => (k.id === id ? { ...k, status: 'revoked' } : k))
    );
    toast.error('API Key revoked.');
  };

  const toggleStatus = (id: string) => {
    setKeys(
      keys.map((k) => {
        if (k.id === id) {
          const nextStatus = k.status === 'active' ? 'disabled' : 'active';
          toast.success(`API Key is now ${nextStatus}.`);
          return { ...k, status: nextStatus };
        }
        return k;
      })
    );
  };

  const rotateKey = (id: string) => {
    setKeys(
      keys.map((k) => {
        if (k.id === id) {
          const prefix = k.key.startsWith('sk_live') ? 'sk_live_' : 'sk_test_';
          const newKeyString = prefix + Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
          toast.success('Key rotated successfully! Update your server config.');
          return {
            ...k,
            key: newKeyString,
            lastUsed: 'Just now',
          };
        }
        return k;
      })
    );
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) {
      toast.error('Please name your API key.');
      return;
    }

    const perms = [];
    if (permRead) perms.push('read');
    if (permWrite) perms.push('write');
    if (permReward) perms.push('reward');

    const generatedKey = 'sk_live_' + Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: generatedKey,
      permissions: perms,
      status: 'active' as const,
      requestsToday: 0,
      lastUsed: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setKeys([newKeyItem, ...keys]);
    setNewKeyName('');
    setPermReward(false);
    toast('API key generated', { 
      icon: '🔵', 
      style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-500" />
            <span>API Secret Credentials</span>
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate and manage access tokens used to authenticate incoming REST transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* API Key Creation Card */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 text-left space-y-4">
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-500" />
              <span>Generate API Key</span>
            </h4>

            <form onSubmit={handleGenerateKey} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Key Identifier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Production Webhook trigger"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Permissions scope checkboxes */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Scope Permissions</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={permRead} onChange={(e) => setPermRead(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500" />
                    <span><code>read</code> (Fetch balances and transaction ledgers)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={permWrite} onChange={(e) => setPermWrite(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500" />
                    <span><code>write</code> (Update user directories and projects)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={permReward} onChange={(e) => setPermReward(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500" />
                    <span className="flex items-center gap-1.5">
                      <code>reward</code> (Deduct and reward tokens on-chain)
                      <span title="High Security Scope"><ShieldCheck className="h-3.5 w-3.5 text-amber-500" /></span>
                    </span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-2.5 text-xs font-bold hover:scale-[1.01] transition-all"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Create Secret Key</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* API Keys Table List */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Active Credentials</h4>

          <div className="space-y-4">
            {keys.map((item) => {
              const isRevoked = item.status === 'revoked';
              const isDisabled = item.status === 'disabled';
              const isRevealed = revealKeyId === item.id;
              const isCopied = copiedKeyId === item.id;

              return (
                <GlassCard key={item.id} className={`p-5 relative ${isRevoked ? 'opacity-40' : isDisabled ? 'opacity-65' : ''}`} hoverEffect={!isRevoked}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-950 dark:text-white">{item.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase tracking-wider border ${
                            isRevoked
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : isDisabled
                              ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        {/* Display Key string */}
                        <div className="flex items-center gap-2 max-w-full">
                          <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400 block truncate">
                            {isRevealed
                              ? item.key
                              : `${item.key.slice(0, 12)}••••••••••••••••••••••••`}
                          </span>

                          {/* Reveal/Hide buttons */}
                          <button
                            onClick={() => toggleReveal(item.id)}
                            disabled={isRevoked}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 disabled:opacity-30 shrink-0"
                          >
                            {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>

                          {/* Copy button */}
                          <button
                            onClick={() => copyKey(item.id, item.key)}
                            disabled={isRevoked}
                            className="p-1 rounded-md text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 disabled:opacity-30 shrink-0"
                          >
                            {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Control Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Status Toggle Button (Disable/Enable) */}
                        {!isRevoked && (
                          <button
                            onClick={() => toggleStatus(item.id)}
                            title={isDisabled ? "Enable Key" : "Disable Key"}
                            className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-zinc-400 hover:text-white transition-all"
                          >
                            {isDisabled ? <ToggleLeft className="h-4.5 w-4.5 text-zinc-500" /> : <ToggleRight className="h-4.5 w-4.5 text-emerald-400" />}
                          </button>
                        )}

                        {/* Rotate Key Button */}
                        {!isRevoked && (
                          <button
                            onClick={() => rotateKey(item.id)}
                            title="Rotate Secret Key"
                            className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-zinc-400 hover:text-white hover:rotate-180 transition-all duration-300"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}

                        {/* Revoke button */}
                        {!isRevoked && (
                          <button
                            onClick={() => revokeKey(item.id)}
                            title="Revoke Key"
                            className="p-1.5 rounded-lg border border-red-500/10 hover:bg-red-500/5 text-red-500 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stats Metrics Row */}
                    <div className="grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-3.5 font-mono text-[10px] text-zinc-500">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-600 font-bold mb-0.5">Requests Today</span>
                        <span className="text-zinc-300 font-bold">{item.requestsToday.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-600 font-bold mb-0.5">Last Used</span>
                        <span className="text-zinc-300 font-bold">{item.lastUsed}</span>
                      </div>
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-zinc-600 font-bold mb-0.5">Created Date</span>
                        <span className="text-zinc-300 font-bold">{item.createdAt}</span>
                      </div>
                    </div>

                    {/* Scope Chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {item.permissions.map((perm) => (
                        <span
                          key={perm}
                          className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            perm === 'reward'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/20 dark:border-amber-900/20'
                              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
