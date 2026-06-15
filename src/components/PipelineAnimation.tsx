'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Code, Terminal, FileCode, Cpu, Wallet, ChevronRight } from 'lucide-react';
import GlassCard from './GlassCard';

export default function PipelineAnimation() {
  const nodes = [
    { label: 'Developer', desc: 'SDK Call', icon: Code, color: 'text-blue-500 border-blue-500/30 bg-blue-500/5' },
    { label: 'SharpFlow API', desc: 'Key Verified', icon: Terminal, color: 'text-indigo-500 border-indigo-500/30 bg-indigo-500/5' },
    { label: 'Smart Contract', desc: 'Mint Trigger', icon: FileCode, color: 'text-purple-500 border-purple-500/30 bg-purple-500/5' },
    { label: 'Polygon Network', desc: 'On-Chain Ledger', icon: Cpu, color: 'text-pink-500 border-pink-500/30 bg-pink-500/5' },
    { label: 'User Wallet', desc: 'SHARP Recieved', icon: Wallet, color: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-12 px-4">
      {/* Node Horizontal Chain */}
      <div className="relative flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4">
        
        {/* Animated Connecting SVG Pipe Line behind items */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 hidden md:block z-0 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
          {/* Drifting glowing pulse */}
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'linear',
            }}
            className="w-40 h-full bg-gradient-to-r from-transparent via-blue-500 to-purple-500"
          />
          <motion.div
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'linear',
              delay: 1.75,
            }}
            className="w-40 h-full bg-gradient-to-r from-transparent via-purple-500 to-emerald-500"
          />
        </div>

        {/* Nodes rendering */}
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          return (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                className="relative z-10 w-full md:w-auto flex flex-col items-center group"
              >
                {/* Floating ambient glow */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Glass Node Card */}
                <GlassCard className="p-5 flex flex-col items-center text-center w-full md:w-44 border border-zinc-200/60 dark:border-zinc-800/80 shadow-md">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border ${node.color} mb-3.5 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 stroke-[1.8]" />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">{node.label}</h4>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 font-semibold">{node.desc}</p>
                </GlassCard>
              </motion.div>

              {/* Mobile Arrows */}
              {idx < nodes.length - 1 && (
                <div className="md:hidden flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400">
                  <ChevronRight className="h-4 w-4 rotate-90" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
