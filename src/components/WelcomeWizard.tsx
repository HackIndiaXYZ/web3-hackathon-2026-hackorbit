'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Send, BarChart3, Bot, Globe, Play, X, Sparkles } from 'lucide-react';
import { useSharpStore } from '@/hooks/useSharpStore';

interface WelcomeWizardProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectOption: (action: string) => void;
}

const WIZARD_OPTIONS = [
  {
    id: 'apikey',
    label: 'Generate API Key',
    desc: 'Get instant developer credentials.',
    icon: Key,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    glow: '0 0 20px rgba(59,130,246,0.15)',
  },
  {
    id: 'reward',
    label: 'Send a Reward',
    desc: 'Reward any wallet with SHARP tokens.',
    icon: Send,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    glow: '0 0 20px rgba(16,185,129,0.15)',
  },
  {
    id: 'analytics',
    label: 'View Analytics',
    desc: 'Track rewards, API traffic, and wallets.',
    icon: BarChart3,
    gradient: 'from-violet-500/20 to-purple-500/20',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    glow: '0 0 20px rgba(139,92,246,0.15)',
  },
  {
    id: 'ai',
    label: 'AI Assistant',
    desc: 'Generate SDK code and integrations with AI.',
    icon: Bot,
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/20',
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/10 border-pink-500/20',
    glow: '0 0 20px rgba(236,72,153,0.15)',
  },
  {
    id: 'scanner',
    label: 'Website Scanner',
    desc: 'Analyze websites and suggest campaigns.',
    icon: Globe,
    gradient: 'from-cyan-500/20 to-sky-500/20',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    glow: '0 0 20px rgba(6,182,212,0.15)',
  },
  {
    id: 'tour',
    label: 'Start Guided Demo',
    desc: 'Let us walk you through the platform.',
    icon: Play,
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    glow: '0 0 20px rgba(245,158,11,0.15)',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, damping: 20, stiffness: 300 } },
};

export default function WelcomeWizard({ isVisible, onClose, onSelectOption }: WelcomeWizardProps) {
  const { startTour, completeWizard } = useSharpStore();

  const handleSelect = (id: string) => {
    if (id === 'tour') {
      completeWizard();
      onClose();
      setTimeout(() => startTour(), 400);
      return;
    }
    onSelectOption(id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0A0A0B]/80 backdrop-blur-sm p-6"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-2xl"
          >
            {/* Background glow */}
            <div className="absolute -inset-4 bg-indigo-500/5 rounded-3xl blur-2xl pointer-events-none" />

            <div className="relative rounded-3xl border border-white/[0.08] bg-[#0A0A0B] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
              {/* Top glow */}
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-indigo-500/[0.07] to-transparent pointer-events-none" />

              <div className="relative p-8">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-xl hover:bg-white/[0.05] text-zinc-500 hover:text-white transition-all"
                >
                  <X className="h-4 w-4" />
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 mb-4">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                      Welcome to SharpFlow AI
                    </span>
                  </div>
                  <h2 className="text-3xl font-extrabold text-white tracking-tight">
                    What do you want to do?
                  </h2>
                  <p className="text-sm text-zinc-500 mt-2">
                    Your Web3 developer workspace is ready. Pick a quick action to begin.
                  </p>
                </div>

                {/* Cards */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                >
                  {WIZARD_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <motion.button
                        key={opt.id}
                        variants={cardVariants}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelect(opt.id)}
                        className={`text-left group relative rounded-2xl border ${opt.border} bg-gradient-to-br ${opt.gradient} p-4 transition-all hover:border-opacity-60`}
                        style={{ '--glow': opt.glow } as React.CSSProperties}
                      >
                        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${opt.iconBg} mb-3`}>
                          <Icon className={`h-4.5 w-4.5 ${opt.iconColor}`} />
                        </div>
                        <h4 className="text-xs font-bold text-white mb-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-zinc-300 transition-all">
                          {opt.label}
                        </h4>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">{opt.desc}</p>

                        {opt.id === 'tour' && (
                          <div className="absolute top-3 right-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </motion.div>

                {/* Skip */}
                <div className="mt-6 text-center">
                  <button
                    onClick={onClose}
                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
