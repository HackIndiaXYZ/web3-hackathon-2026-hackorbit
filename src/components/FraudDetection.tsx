'use client';

import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity, Search, Crosshair, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';
import { useSharpStore } from '@/hooks/useSharpStore';

export default function FraudDetection() {
  const { transactions } = useSharpStore();

  // Mock computed stats for demo purposes
  const riskScore = 12; // Out of 100
  const duplicateWallets = 3;
  const spamRequests = 14;
  
  const recentAlerts = [
    { id: 1, type: 'warning', msg: 'High frequency requests detected from IP 192.168.1.45', time: '2m ago' },
    { id: 2, type: 'danger', msg: 'Sybil pattern: 5 wallets funded by same origin', time: '14m ago' },
    { id: 3, type: 'safe', msg: 'Automated IP ban lifted for 10.0.0.12', time: '1h ago' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <span>Fraud & Security Monitoring</span>
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Real-time threat detection for duplicate wallets, sybil attacks, and reward abuse.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Score */}
        <GlassCard className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden bg-zinc-900/40">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-6">System Risk Score</h4>
          
          <div className="relative h-32 w-32 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-800" />
              <motion.circle 
                cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="8" 
                strokeDasharray="283" strokeDashoffset={283 - (283 * riskScore) / 100}
                className="text-emerald-500"
                initial={{ strokeDashoffset: 283 }}
                animate={{ strokeDashoffset: 283 - (283 * riskScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{riskScore}</span>
              <span className="text-[10px] text-emerald-400 font-bold">SAFE</span>
            </div>
          </div>
          <p className="text-xs text-zinc-500">Your network health is optimal. No active exploits detected.</p>
        </GlassCard>

        {/* Stats */}
        <div className="flex flex-col gap-6">
          <GlassCard className="p-5 flex-1 flex flex-col justify-center relative overflow-hidden bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <Users className="h-24 w-24 text-yellow-500" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Duplicate Wallets Detected</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-white">{duplicateWallets}</span>
              <span className="text-xs font-bold text-yellow-500 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Warning</span>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex-1 flex flex-col justify-center relative overflow-hidden bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors">
            <div className="absolute right-[-20px] top-[-20px] opacity-10">
              <Crosshair className="h-24 w-24 text-red-500" />
            </div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Spam API Requests Blocked</span>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black text-white">{spamRequests}</span>
              <span className="text-xs font-bold text-red-500 mb-1 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Mitigated</span>
            </div>
          </GlassCard>
        </div>

        {/* Alert Feed */}
        <GlassCard className="p-6 flex flex-col bg-zinc-900/40">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Live Security Log</h4>
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            </div>
          </div>

          <div className="space-y-4 flex-1">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex gap-3 text-left">
                <div className="mt-0.5">
                  {alert.type === 'danger' && <ShieldAlert className="h-4 w-4 text-red-500" />}
                  {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {alert.type === 'safe' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                </div>
                <div>
                  <p className="text-xs text-zinc-300 leading-snug">{alert.msg}</p>
                  <span className="text-[10px] font-mono text-zinc-600">{alert.time}</span>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-2 border border-white/[0.06] rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/[0.04] transition-all">
            View Full Audit Log
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
