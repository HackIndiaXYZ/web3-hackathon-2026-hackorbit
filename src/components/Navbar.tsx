'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sun, Moon, Wallet, ArrowRight, Layers, Menu, X } from 'lucide-react';
import { useSharpStore } from '@/hooks/useSharpStore';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, theme, setTheme, setUser, logout, triggerDemoMode, isLiveMode, setLiveMode } = useSharpStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWalletConnect = () => {
    if (user) {
      logout();
      toast.success('Logged out successfully');
      router.push('/');
    } else {
      router.push('/login');
    }
  };

  const isConnected = !!user;
  const displayAddress = user
    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
    : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 lg:px-10 py-3 transition-all duration-300">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 group">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md">
          <Layers className="h-4.5 w-4.5 text-white" />
          <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 blur opacity-40 group-hover:opacity-75 transition-opacity" />
        </div>
        <span className="text-base font-bold tracking-tight text-white">
          SharpFlow<span className="text-blue-500">.</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
        <Link
          href="/"
          scroll={false}
          prefetch={true}
          className={`transition-colors hover:text-white ${
            pathname === '/' ? 'text-white font-black' : 'text-zinc-400'
          }`}
        >
          Home
        </Link>
        <Link
          href={user ? "/dashboard" : "/login"}
          scroll={false}
          prefetch={true}
          className={`transition-colors hover:text-white ${
            pathname === '/dashboard' || pathname === '/login' ? 'text-white font-black' : 'text-zinc-400'
          }`}
        >
          Dashboard
        </Link>
        <Link
          href="/shop"
          scroll={false}
          prefetch={true}
          className={`transition-colors hover:text-white ${
            pathname === '/shop' ? 'text-white font-black' : 'text-zinc-400'
          }`}
        >
          Shop Sandbox
        </Link>
        <Link
          href="/docs"
          scroll={false}
          prefetch={true}
          className={`transition-colors hover:text-white ${
            pathname?.startsWith('/docs') ? 'text-white font-black' : 'text-zinc-400'
          }`}
        >
          API Docs
        </Link>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-1.5 md:gap-4">
        {/* Network Mode Toggle */}
        <div className="hidden sm:flex items-center gap-1 bg-zinc-900 border border-white/[0.08] p-1 rounded-xl">
          <button
            onClick={() => {
              setLiveMode(false);
              toast.success('Switched to Demo Sandbox');
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all ${
              !isLiveMode
                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 font-extrabold shadow-sm'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Demo Mode
          </button>
          <button
            onClick={() => {
              setLiveMode(true);
              toast.success('Amoy Testnet Mode Activated!');
            }}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-tight transition-all flex items-center gap-1.5 ${
              isLiveMode
                ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold shadow-sm'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${isLiveMode ? 'bg-[#00ff88] animate-pulse' : 'bg-zinc-500'}`} />
            Live Mode
          </button>
        </div>

        {/* Demo Trigger Button */}
        <button
          onClick={() => {
            triggerDemoMode();
            router.push('/dashboard');
            toast.success('Demo Ecosystem Generated!', { icon: '🚀' });
          }}
          className="hidden lg:flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 px-4 py-2 text-xs font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Generate Demo Ecosystem</span>
        </button>

        {/* Wallet Button */}
        <button
          onClick={handleWalletConnect}
          className={`flex items-center gap-1.5 md:gap-2 rounded-xl px-2.5 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold transition-all duration-350 shrink-0 ${
            isConnected
              ? 'border border-blue-900/50 bg-blue-950/20 text-blue-300 hover:bg-blue-950/40 shadow-inner'
              : 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm'
          }`}
        >
          <Wallet className="h-3 w-3 md:h-3.5 md:w-3.5" />
          <span>{isConnected ? displayAddress : 'Sign In'}</span>
        </button>

        {/* Get Started Button */}
        {pathname !== '/dashboard' && (
          <Link
            href={user ? "/dashboard" : "/login"}
            className="hidden sm:flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden items-center justify-center p-2 rounded-xl border border-white/[0.08] bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-95"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="absolute top-full left-0 w-full bg-zinc-950/95 border-b border-white/[0.08] backdrop-blur-2xl flex flex-col z-50 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-6">
              {/* Nav Links */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Navigation</span>
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-bold tracking-wide transition-colors hover:text-white ${
                    pathname === '/' ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  Home
                </Link>
                <Link
                  href={user ? "/dashboard" : "/login"}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-bold tracking-wide transition-colors hover:text-white ${
                    pathname === '/dashboard' || pathname === '/login' ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/shop"
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-bold tracking-wide transition-colors hover:text-white ${
                    pathname === '/shop' ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  Shop Sandbox
                </Link>
                <Link
                  href="/docs"
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-bold tracking-wide transition-colors hover:text-white ${
                    pathname?.startsWith('/docs') ? 'text-white' : 'text-zinc-400'
                  }`}
                >
                  API Docs
                </Link>
              </div>

              <div className="h-px bg-white/[0.08]" />

              {/* Quick Actions */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network / Actions</span>
                
                {/* Network Mode Toggle inside Mobile Drawer */}
                <div className="flex items-center gap-1 bg-zinc-900 border border-white/[0.08] p-1 rounded-xl w-full justify-between">
                  <button
                    onClick={() => {
                      setLiveMode(false);
                      toast.success('Switched to Demo Sandbox');
                      setIsOpen(false);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-tight text-center transition-all ${
                      !isLiveMode
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-blue-400 font-extrabold shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    Demo Mode
                  </button>
                  <button
                    onClick={() => {
                      setLiveMode(true);
                      toast.success('Amoy Testnet Mode Activated!');
                      setIsOpen(false);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-tight text-center transition-all flex items-center justify-center gap-1.5 ${
                      isLiveMode
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 font-extrabold shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-350'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isLiveMode ? 'bg-[#00ff88] animate-pulse' : 'bg-zinc-500'}`} />
                    Live Mode
                  </button>
                </div>

                {/* Generate Demo Ecosystem Button inside Mobile Drawer */}
                <button
                  onClick={() => {
                    triggerDemoMode();
                    router.push('/dashboard');
                    toast.success('Demo Ecosystem Generated!', { icon: '🚀' });
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 px-4 py-2.5 text-xs font-bold text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] active:scale-[0.98] transition-all duration-350 w-full"
                >
                  <Layers className="h-4 w-4" />
                  <span>Generate Demo Ecosystem</span>
                </button>

                {/* Get Started Button / CTA inside Mobile Drawer */}
                {pathname !== '/dashboard' && (
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-[0.98] transition-all w-full"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
