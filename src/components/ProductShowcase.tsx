'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, ChevronRight } from 'lucide-react';
import { useSharpStore } from '@/hooks/useSharpStore';

const SHOWCASE_STEPS = [
  {
    title: 'Wallet Connection',
    subtitle: 'MetaMask & WalletConnect ready',
    duration: 7,
    color: 'from-orange-500 to-amber-500',
    glow: 'rgba(251,146,60,0.3)',
    content: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3">
          <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-sm">🦊</div>
          <div>
            <div className="text-xs font-bold text-white">MetaMask</div>
            <div className="text-[10px] text-zinc-500">Polygon Amoy · Connected</div>
          </div>
          <div className="ml-auto h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
            <div className="text-zinc-500 mb-1">Address</div>
            <div className="text-white font-mono text-[10px]">0xf39F...2266</div>
          </div>
          <div className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3">
            <div className="text-zinc-500 mb-1">Balance</div>
            <div className="text-emerald-400 font-bold">5,000 SHARP</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Reward Transaction',
    subtitle: 'On-chain in under 2 seconds',
    duration: 8,
    color: 'from-blue-500 to-indigo-500',
    glow: 'rgba(59,130,246,0.3)',
    content: (
      <div className="space-y-3">
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 font-mono text-xs">
          <div className="text-zinc-500 mb-2">POST /api/reward</div>
          <div className="text-green-400">{'{'}</div>
          <div className="pl-4 text-zinc-300">
            <div><span className="text-blue-400">"wallet"</span>: <span className="text-amber-300">"0x742d...1c9E"</span>,</div>
            <div><span className="text-blue-400">"amount"</span>: <span className="text-emerald-400">100</span>,</div>
            <div><span className="text-blue-400">"token"</span>: <span className="text-amber-300">"SHARP"</span></div>
          </div>
          <div className="text-green-400">{'}'}</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold">Transaction confirmed on Polygon Amoy</span>
        </div>
      </div>
    ),
  },
  {
    title: 'Block Explorer',
    subtitle: 'Full transaction transparency',
    duration: 7,
    color: 'from-violet-500 to-purple-500',
    glow: 'rgba(139,92,246,0.3)',
    content: (
      <div className="space-y-2">
        {['0x9e3f...f4a', '0xfa39...b6c', '0xc2d1...0e5', '0x7a8b...91f'].map((hash, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
            <div className="h-6 w-6 rounded-md bg-violet-500/20 flex items-center justify-center text-[10px] font-bold text-violet-400">{i + 1}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-mono text-zinc-300 truncate">{hash}</div>
              <div className="text-[9px] text-zinc-600">{(i + 1) * 12 + 8}s ago</div>
            </div>
            <div className="text-[10px] font-bold text-emerald-400">+{[100, 50, 200, 75][i]} SHARP</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Analytics Dashboard',
    subtitle: 'Real-time reward intelligence',
    duration: 8,
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16,185,129,0.3)',
    content: (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[['500', 'Transactions'], ['1,540', 'API Calls'], ['5,000', 'SHARP Sent']].map(([val, label]) => (
            <div key={label} className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-2 text-center">
              <div className="text-sm font-black text-white">{val}</div>
              <div className="text-[9px] text-zinc-500">{label}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
          <div className="flex gap-1 items-end h-12">
            {[30, 55, 40, 80, 60, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-emerald-600 to-teal-400 opacity-80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="text-[10px] text-zinc-500 mt-2 text-center">7-day reward distribution</div>
        </div>
      </div>
    ),
  },
  {
    title: 'AI Copilot',
    subtitle: 'Generate code & integrations instantly',
    duration: 8,
    color: 'from-pink-500 to-rose-500',
    glow: 'rgba(236,72,153,0.3)',
    content: (
      <div className="space-y-3">
        <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
          <div className="text-[10px] text-zinc-500 mb-2">User prompt</div>
          <div className="text-xs text-white mb-3">"Reward customers after 5 lessons"</div>
          <div className="text-[10px] text-zinc-500 mb-2">Generated Node.js SDK</div>
          <div className="font-mono text-[10px] text-emerald-400 leading-relaxed">
            {`const sharp = new SharpFlow(API_KEY);\nawait sharp.reward(userId, 100, {\n  trigger: 'lesson_complete',\n  count: 5\n});`}
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Website Scanner',
    subtitle: 'AI-powered campaign suggestions',
    duration: 7,
    color: 'from-cyan-500 to-sky-500',
    glow: 'rgba(6,182,212,0.3)',
    content: (
      <div className="space-y-3">
        <div className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-zinc-300">Scanning</span>
          <span className="text-cyan-400 font-mono">shopify-store.com</span>
        </div>
        <div className="space-y-2">
          {['Purchase Reward Campaign', 'Referral Bonus System', 'Loyalty Points Program'].map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2">
              <div className="h-5 w-5 rounded-md bg-cyan-500/20 flex items-center justify-center text-[9px] text-cyan-400 font-bold">{i + 1}</div>
              <span className="text-[10px] text-zinc-300">{s}</span>
              <ChevronRight className="ml-auto h-3 w-3 text-zinc-600" />
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function ProductShowcase() {
  const { showProductShowcase, setShowProductShowcase } = useSharpStore();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStep = SHOWCASE_STEPS[step];
  const totalDuration = currentStep.duration;
  const progress = Math.min((elapsed / totalDuration) * 100, 100);

  const [done, setDone] = useState(false);

  // Close showcase when done flag is set (avoids setState-in-render)
  useEffect(() => {
    if (done) {
      setShowProductShowcase(false);
      setDone(false);
      setStep(0);
      setElapsed(0);
    }
  }, [done, setShowProductShowcase]);

  useEffect(() => {
    if (!showProductShowcase) {
      setStep(0);
      setElapsed(0);
      return;
    }

    if (paused) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 0.1;
        if (next >= totalDuration) {
          setStep((s) => {
            if (s >= SHOWCASE_STEPS.length - 1) {
              setDone(true);
              return 0;
            }
            return s + 1;
          });
          return 0;
        }
        return next;
      });
    }, 100);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [showProductShowcase, paused, step, totalDuration]);

  if (!showProductShowcase) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[150] flex items-center justify-center bg-[#0A0A0B]/90 backdrop-blur-sm p-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="relative w-full max-w-lg"
        >
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-3xl blur-2xl opacity-30 pointer-events-none"
            style={{ background: currentStep.glow }}
          />

          <div className="relative rounded-3xl border border-white/[0.08] bg-[#0D0D12] overflow-hidden shadow-2xl">
            {/* Header */}
            <div className={`relative bg-gradient-to-r ${currentStep.color} p-6`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
                    Product Showcase · {step + 1}/{SHOWCASE_STEPS.length}
                  </div>
                  <h2 className="text-xl font-black text-white">{currentStep.title}</h2>
                  <p className="text-sm text-white/70 mt-0.5">{currentStep.subtitle}</p>
                </div>
                <button
                  onClick={() => setShowProductShowcase(false)}
                  className="p-2 rounded-xl bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white/60 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                {currentStep.content}
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="px-6 pb-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {SHOWCASE_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setStep(i); setElapsed(0); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-white' : 'w-1.5 bg-zinc-700 hover:bg-zinc-500'}`}
                  />
                ))}
              </div>
              <button
                onClick={() => setPaused((p) => !p)}
                className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-all"
              >
                {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                {paused ? 'Resume' : 'Pause'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
