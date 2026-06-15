'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Plus, Trash2, ShieldCheck, Check, Send, AlertCircle, Mail, MessageSquare, ToggleLeft, ToggleRight, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from './GlassCard';
import { useSharpStore, WebhookSubscription } from '@/hooks/useSharpStore';

export default function WebhookManager() {
  const { webhooks, setWebhooks } = useSharpStore();

  const [newUrl, setNewUrl] = useState('');
  const [targetType, setTargetType] = useState<'discord' | 'slack' | 'email'>('discord');
  
  // Event selection states
  const [eventRewardSent, setEventRewardSent] = useState(true);
  const [eventRewardFailed, setEventRewardFailed] = useState(false);
  const [eventTxConfirmed, setEventTxConfirmed] = useState(true);
  const [eventUserSignup, setEventUserSignup] = useState(false);

  // Ping simulation states
  const [pingingWebhookId, setPingingWebhookId] = useState<string | null>(null);
  const [pingStep, setPingStep] = useState<number>(-1);

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) {
      toast.error('Please specify a destination URL or email address.');
      return;
    }

    if (targetType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUrl)) {
        toast.error('Please enter a valid email address.');
        return;
      }
    } else {
      if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        toast.error('Webhook endpoint must begin with http:// or https://');
        return;
      }
    }

    const evts = [];
    if (eventRewardSent) evts.push('reward.sent');
    if (eventRewardFailed) evts.push('reward.failed');
    if (eventTxConfirmed) evts.push('transaction.confirmed');
    if (eventUserSignup) evts.push('user.signup');

    if (evts.length === 0) {
      toast.error('Select at least one event topic to listen to.');
      return;
    }

    const newWh: WebhookSubscription = {
      id: `wh-${Date.now()}`,
      url: newUrl,
      type: targetType,
      events: evts,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setWebhooks([newWh, ...webhooks]);
    setNewUrl('');
    toast.success('Configured new webhook listener!');
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(webhooks.filter((w) => w.id !== id));
    toast.success('Webhook endpoint deleted.');
  };

  const toggleWebhookStatus = (id: string) => {
    setWebhooks(
      webhooks.map((w) => {
        if (w.id === id) {
          const nextStatus = w.status === 'active' ? 'disabled' : 'active';
          toast.success(`Webhook subscription is now ${nextStatus}.`);
          return { ...w, status: nextStatus };
        }
        return w;
      })
    );
  };

  const testPingWebhook = async (item: WebhookSubscription) => {
    if (pingingWebhookId) return;
    setPingingWebhookId(item.id);
    setPingStep(0); // Dispatching

    // Step 0 -> 1: Event Mapped
    await new Promise((r) => setTimeout(r, 900));
    setPingStep(1);

    // Step 1 -> 2: Muted Relay
    await new Promise((r) => setTimeout(r, 900));
    setPingStep(2);

    // Step 2 -> 3: Final Delivery
    await new Promise((r) => setTimeout(r, 1000));
    setPingStep(3);

    await new Promise((r) => setTimeout(r, 500));
    toast.success(`Ping event delivered to ${item.type.toUpperCase()} client!`);
    setPingingWebhookId(null);
    setPingStep(-1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
            <Radio className="h-5 w-5 text-blue-500" />
            <span>Webhook Subscriptions</span>
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Configure target integrations to dispatch real-time JSON payloads upon transaction events.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Create Webhook card */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 text-left space-y-4 bg-zinc-900/40">
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-500" />
              <span>Configure Listener</span>
            </h4>

            <form onSubmit={handleCreateWebhook} className="space-y-4">
              {/* Target Selector */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Integration Target</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/50 dark:border-zinc-800/50">
                  {(['discord', 'slack', 'email'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTargetType(t);
                        setNewUrl('');
                      }}
                      className={`py-1.5 rounded-lg text-[10px] font-semibold transition-all uppercase tracking-wider ${
                        targetType === t
                          ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-white'
                          : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-200'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  {targetType === 'email' ? 'Destination Email Address' : 'Target Endpoint URL'}
                </label>
                <input
                  type={targetType === 'email' ? 'email' : 'text'}
                  placeholder={targetType === 'email' ? 'dev@yourdomain.com' : 'https://discord.com/api/webhooks/...'}
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Event toggle checks */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Event Topics</label>
                <div className="space-y-2 font-mono text-[10.5px]">
                  <label className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={eventRewardSent} onChange={(e) => setEventRewardSent(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500" />
                    <span><code>reward.sent</code> (On-chain rewards dispatched)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={eventRewardFailed} onChange={(e) => setEventRewardFailed(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500" />
                    <span><code>reward.failed</code> (Tx failures / network issues)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={eventTxConfirmed} onChange={(e) => setEventTxConfirmed(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500" />
                    <span><code>transaction.confirmed</code> (Polygon block mined)</span>
                  </label>
                  <label className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={eventUserSignup} onChange={(e) => setEventUserSignup(e.target.checked)} className="rounded text-blue-500 focus:ring-blue-500" />
                    <span><code>user.signup</code> (Developer dashboard signups)</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-2.5 text-xs font-bold hover:scale-[1.01] transition-all border-none outline-none cursor-pointer"
              >
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>Activate Webhook</span>
              </button>
            </form>
          </GlassCard>

          {/* Visual Webhook Routing Canvas */}
          <GlassCard className="p-6 mt-6 border-purple-500/20 bg-purple-500/5 relative overflow-hidden group">
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-500" />
              <span>Real-Time Routing Pipeline</span>
            </h4>
            
            {/* Visual routing diagram */}
            <div className="flex flex-col items-center space-y-4">
              <div className={`w-full py-2 px-4 rounded-xl text-center border transition-all ${
                pingStep === 0 ? 'bg-blue-600/10 border-blue-500 text-white font-bold' : 'bg-zinc-900 border-white/[0.06] text-zinc-400'
              }`}>
                <span className="text-2xs font-mono">1. REWARD EVENT DETECTED</span>
              </div>
              
              <div className="h-4 w-0.5 bg-zinc-800 relative">
                {pingStep === 0 && (
                  <motion.div
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 0.8 }}
                    className="absolute left-[-3px] w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]"
                  />
                )}
              </div>

              <div className={`w-full py-2 px-4 rounded-xl text-center border transition-all ${
                pingStep === 1 ? 'bg-purple-600/10 border-purple-500 text-white font-bold' : 'bg-zinc-900 border-white/[0.06] text-zinc-400'
              }`}>
                <span className="text-2xs font-mono">2. SHARPFLOW ROUTER RELAY</span>
              </div>
              
              <div className="h-4 w-0.5 bg-zinc-800 relative">
                {pingStep === 1 && (
                  <motion.div
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 0.8 }}
                    className="absolute left-[-3px] w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"
                  />
                )}
              </div>

              <div className={`w-full py-2 px-4 rounded-xl text-center border transition-all ${
                pingStep === 2 ? 'bg-emerald-600/10 border-emerald-500 text-white font-bold' : 'bg-zinc-900 border-white/[0.06] text-zinc-400'
              }`}>
                <span className="text-2xs font-mono">3. DELIVERING PAYLOAD</span>
              </div>

              <div className="h-4 w-0.5 bg-zinc-800 relative">
                {pingStep === 2 && (
                  <motion.div
                    initial={{ top: '-10%' }}
                    animate={{ top: '110%' }}
                    transition={{ duration: 0.8 }}
                    className="absolute left-[-3px] w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  />
                )}
              </div>

              <div className={`w-full py-2 px-4 rounded-xl text-center border transition-all ${
                pingStep === 3 ? 'bg-indigo-600/10 border-indigo-500 text-white font-bold' : 'bg-zinc-900 border-white/[0.06] text-zinc-400'
              }`}>
                <span className="text-2xs font-mono">4. DISCORD / SLACK / EMAIL DISPATCHED</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Webhooks list */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Configured Webhooks</h4>

          <div className="space-y-4">
            {webhooks.length > 0 ? (
              webhooks.map((item) => {
                const isPinging = pingingWebhookId === item.id;
                const isDisabled = item.status === 'disabled';

                return (
                  <GlassCard key={item.id} className={`p-5 relative ${isDisabled ? 'opacity-55' : ''}`}>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {/* Type Icon */}
                            <div className="shrink-0 h-6 w-6 rounded-lg bg-zinc-800 flex items-center justify-center border border-white/[0.04] text-zinc-400">
                              {item.type === 'email' ? <Mail className="h-3.5 w-3.5 text-amber-400" /> : item.type === 'slack' ? <MessageSquare className="h-3.5 w-3.5 text-pink-400" /> : <MessageSquare className="h-3.5 w-3.5 text-violet-400" />}
                            </div>

                            <span className="text-xs font-bold text-zinc-950 dark:text-white truncate block max-w-xs sm:max-w-md" title={item.url}>
                              {item.url}
                            </span>
                            
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider border ${
                              isDisabled
                                ? 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {item.status}
                            </span>
                          </div>

                          {/* Display events bound */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {item.events.map((evt) => (
                              <span key={evt} className="px-2 py-0.5 rounded text-[8px] font-mono bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                                {evt}
                              </span>
                            ))}
                          </div>

                          <div className="text-[9px] text-zinc-500 font-mono">
                            Configured on {item.createdAt}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Test Ping */}
                          <button
                            onClick={() => testPingWebhook(item)}
                            disabled={isPinging || isDisabled}
                            className="flex items-center gap-1 text-blue-500 hover:text-blue-400 disabled:opacity-30 font-bold text-[9px] uppercase border border-blue-500/10 hover:bg-blue-500/5 px-2.5 py-1.5 rounded-xl transition-all"
                          >
                            <Send className="h-3 w-3" />
                            <span>{isPinging ? 'Pinging...' : 'Ping'}</span>
                          </button>

                          {/* Toggle State */}
                          <button
                            onClick={() => toggleWebhookStatus(item.id)}
                            className="p-1.5 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] text-zinc-400 hover:text-white transition-all"
                          >
                            {isDisabled ? <ToggleLeft className="h-4.5 w-4.5 text-zinc-500" /> : <ToggleRight className="h-4.5 w-4.5 text-emerald-400" />}
                          </button>

                          {/* Delete webhook */}
                          <button
                            onClick={() => deleteWebhook(item.id)}
                            className="p-1.5 rounded-lg border border-red-500/10 hover:bg-red-500/5 text-red-500 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })
            ) : (
              <div className="text-zinc-500 dark:text-zinc-400 text-xs py-8 text-center font-medium">
                No active webhooks configured.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
