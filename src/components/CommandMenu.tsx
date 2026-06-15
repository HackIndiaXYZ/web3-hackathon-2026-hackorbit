'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Wallet, Key, Sparkles, Sun, Moon, Home, Layout, FileText, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useSharpStore } from '@/hooks/useSharpStore';

export default function CommandMenu() {
  const router = useRouter();
  const { user, setUser, theme, setTheme, activeProject, setActiveProject, addTransaction, triggerDemoMode } = useSharpStore();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle Command Palette on CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const runCommand = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const commands = [
    {
      category: 'Mock API Actions',
      items: [
        {
          label: 'Connect Wallet',
          desc: 'Simulate Web3 wallet login',
          icon: Wallet,
          action: () => {
            setUser({
              name: 'Developer Profile',
              walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
              email: 'developer@sharpflow.ai',
            });
            toast.success('Wallet connected: 0xf39Fd6...2266');
          },
        },
        {
          label: 'Generate API Key',
          desc: 'Provision a new sf_live key',
          icon: Key,
          action: () => {
            const newKey = 'sf_live_' + Array.from({ length: 28 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            setActiveProject({
              name: activeProject?.name || 'Default Project',
              apiKey: newKey,
            });
            toast.success('Generated new API Key!');
          },
        },
        {
          label: 'Reward 50 SHARP Tokens',
          desc: 'Execute instant reward mint',
          icon: Sparkles,
          action: () => {
            const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
            addTransaction({
              wallet: user?.walletAddress || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
              amount: 50,
              txHash,
              timestamp: new Date().toISOString(),
            });
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#3b82f6', '#a855f7'],
            });
            toast.success('Rewarded 50 SHARP! (Check explorer)');
          },
        },
        {
          label: 'Generate Demo Ecosystem',
          desc: 'Simulate 100 users and 500 transactions instantly',
          icon: Sparkles,
          action: () => {
            triggerDemoMode();
            toast.success('Ecosystem simulated! Dashboard is now live.');
          },
        },
      ],
    },
    {
      category: 'Navigation',
      items: [
        {
          label: 'Go to Home',
          desc: 'Navigate to product landing page',
          icon: Home,
          action: () => router.push('/'),
        },
        {
          label: 'Go to Dashboard',
          desc: 'Navigate to rest developer interface',
          icon: Layout,
          action: () => router.push('/dashboard'),
        },
        {
          label: 'Go to API Docs',
          desc: 'Open developer guides and references',
          icon: FileText,
          action: () => router.push('/docs'),
        },
      ],
    },
  ];

  const filteredCommands = commands
    .map((group) => {
      const items = group.items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
      );
      return { ...group, items };
    })
    .filter((group) => group.items.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark blur overlay */}
      <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" onClick={() => setIsOpen(false)} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-white/[0.08] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[420px]">
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08]">
          <Search className="h-5 w-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm border-none focus:outline-none text-white placeholder-zinc-400"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400 uppercase border border-white/[0.04]">
            esc
          </kbd>
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {filteredCommands.length > 0 ? (
            filteredCommands.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-1">
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-3 py-1">
                  {group.category}
                </div>
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={itemIdx}
                      onClick={() => runCommand(item.action)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-zinc-800/60 group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-400 border border-white/[0.04] group-hover:bg-blue-500 group-hover:text-white transition-colors">
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{item.label}</div>
                          <div className="text-[10px] text-zinc-400">{item.desc}</div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            ))
          ) : (
            <div className="px-3 py-8 text-center text-xs text-zinc-400">
              No matching commands found.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-zinc-900/50 border-t border-white/[0.08] text-[10px] text-zinc-400 font-medium flex justify-between items-center">
          <span>Use search to filter tools</span>
          <div className="flex gap-2.5">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
        </div>
      </div>
    </div>
  );
}
