'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Users, Calendar, Trophy, Heart, Flag, CheckCircle2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from './GlassCard';

export default function CampaignBuilder() {
  const campaigns = [
    {
      id: 'referrals',
      title: 'Referral Rewards',
      desc: 'Incentivize existing users to invite new friends to your platform.',
      icon: Users,
      color: 'blue',
      amount: 100,
      active: true
    },
    {
      id: 'daily',
      title: 'Daily Rewards',
      desc: 'Boost daily active users by dropping micro-rewards for sequential logins.',
      icon: Calendar,
      color: 'emerald',
      amount: 5,
      active: false
    },
    {
      id: 'achievements',
      title: 'Achievement Unlocks',
      desc: 'Gamify your product by granting tokens when users complete core actions.',
      icon: Trophy,
      color: 'yellow',
      amount: 50,
      active: false
    },
    {
      id: 'loyalty',
      title: 'Loyalty Tiers',
      desc: 'Provide recurring token dividends for customers who maintain premium subscriptions.',
      icon: Heart,
      color: 'pink',
      amount: 250,
      active: false
    },
    {
      id: 'birthday',
      title: 'Birthday Rewards',
      desc: 'Surprise your users with a personalized token drop on their special day.',
      icon: Gift,
      color: 'purple',
      amount: 150,
      active: false
    },
    {
      id: 'milestone',
      title: 'Platform Milestones',
      desc: 'Trigger global community airdrops when your app hits a major growth metric.',
      icon: Flag,
      color: 'orange',
      amount: 1000,
      active: false
    }
  ];

  const [activeCampaigns, setActiveCampaigns] = useState<Record<string, boolean>>({
    referrals: true
  });

  const toggleCampaign = (id: string) => {
    setActiveCampaigns(prev => {
      const newState = !prev[id];
      return { ...prev, [id]: newState };
    });
    // Toast after state update (not inside updater)
    setTimeout(() => {
      const willBeActive = !activeCampaigns[id];
      if (willBeActive) toast('Webhook triggered', {
        icon: '🟡',
        style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      else toast('Campaign paused.', { icon: '⏸️' });
    }, 0);
  };

  const copyConfig = (id: string) => {
    toast.success('Configuration ID copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
            <Gift className="h-5 w-5 text-purple-500" />
            <span>Campaign Gamification Builder</span>
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Activate visual reward templates to instantly map pre-configured token logic to your application.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((c, i) => {
          const isActive = activeCampaigns[c.id];
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard 
                className={`relative p-6 flex flex-col h-full transition-all duration-300 border ${
                  isActive 
                    ? 'bg-zinc-900/60 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]' 
                    : 'bg-zinc-900/20 border-white/[0.05] hover:bg-zinc-900/40'
                }`}
              >
                {isActive && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Live
                  </div>
                )}
                
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-12 w-12 rounded-2xl bg-${c.color}-500/10 flex items-center justify-center border border-${c.color}-500/20 shadow-inner`}>
                    <c.icon className={`h-6 w-6 text-${c.color}-400`} />
                  </div>
                </div>
                
                <h4 className="text-base font-bold text-white mb-2">{c.title}</h4>
                <p className="text-xs text-zinc-400 flex-1 leading-relaxed mb-6">{c.desc}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-auto">
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span className="text-purple-400">+{c.amount}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">SHARP</span>
                  </div>
                  
                  <button
                    onClick={() => toggleCampaign(c.id)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isActive 
                        ? 'bg-zinc-800 text-zinc-400 hover:text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105'
                    }`}
                  >
                    {isActive ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
