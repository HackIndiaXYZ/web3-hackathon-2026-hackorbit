'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, User, Wallet, Sparkles, ArrowRight,
  Check, Eye, EyeOff, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import WalletErrorBoundaryClass from './WalletErrorBoundary';
import WalletFallbackModal from './WalletFallbackModal';

interface AuthFormProps {
  onLogin: (email: string) => void;
  onDemo: () => void;
}

// Inline SVG Google Icon (no external dependency)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function AuthForm({ onLogin, onDemo }: AuthFormProps) {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showWalletFallback, setShowWalletFallback] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => { setMounted(true); }, []);

  const { openConnectModal } = useConnectModal();
  const { isConnected, address } = useAccount();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (activeTab === 'signup' && !name)) {
      toast.error('Please fill in all fields.');
      return;
    }
    // Store in localStorage if Remember Me
    if (rememberMe) {
      localStorage.setItem('sharpflow_remembered_email', email);
    }
    onLogin(email);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signIn('google', {
        redirect: false,
        callbackUrl: '/dashboard',
      });
      if (result?.error) {
        toast.error('Google sign in failed. Try email login.');
      }
      // If success, SessionSync in Providers.tsx handles the store update
    } catch {
      toast.error('Google sign in unavailable. Try email login.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleWalletConnect = () => {
    // Validate provider existence first
    const hasEthereum = typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
    
    if (!hasEthereum) {
      // MetaMask/Provider not found -> Show Fallback UI safely
      setShowWalletFallback(true);
    } else {
      // Provider exists -> Use RainbowKit Modal securely without direct calls
      if (openConnectModal) {
        openConnectModal();
      } else {
        toast.error('Wallet connection unavailable.');
      }
    }
  };

  // Wait, I removed isConnected auto-login here. 
  // It's safer to not auto-login to prevent render loop issues.

  // When wallet connects, auto-login
  React.useEffect(() => {
    if (isConnected && address) {
      onLogin(address + '@wallet.eth');
    }
  }, [isConnected, address, onLogin]);

  return (
    <WalletErrorBoundaryClass>
      <WalletFallbackModal 
        isOpen={showWalletFallback} 
        onClose={() => setShowWalletFallback(false)} 
        onWalletConnect={() => openConnectModal?.()} 
        onGoogle={handleGoogleLogin} 
      />
      <div className="w-full max-w-[440px] mx-auto space-y-6">
        {/* ─── DEMO BUTTON ────────────────────────────── */}
        <motion.button
        onClick={onDemo}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative w-full rounded-2xl p-[1px] shadow-[0_0_40px_rgba(59,130,246,0.25)] hover:shadow-[0_0_70px_rgba(168,85,247,0.4)] transition-shadow duration-500"
        style={{ background: 'linear-gradient(135deg, #3b82f6, #a855f7, #3b82f6)' }}
      >
        <div className="relative flex items-center justify-between rounded-2xl bg-zinc-950 px-6 py-4 transition-colors group-hover:bg-zinc-950/80">
          {/* Animated background shimmer */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <motion.div
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
            />
          </div>

          <div className="relative flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all">
                Explore Demo Workspace
              </h3>
              <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mt-0.5">
                500 transactions · No signup needed
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-yellow-400 animate-pulse" />
            <ArrowRight className="h-5 w-5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </motion.button>

      {/* ─── DIVIDER ────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-white/[0.06]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Or sign in</span>
        <div className="flex-1 h-px bg-white/[0.06]" />
      </div>

      {/* ─── AUTH PANEL ─────────────────────────────── */}
      <div className="relative rounded-3xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-3xl p-8 shadow-2xl"
        style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}
      >
        {/* Subtle top glow */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-indigo-500/[0.06] to-transparent rounded-t-3xl pointer-events-none" />

        {/* ─── REAL AUTH BUTTONS ──────────────────── */}
        <div className="relative space-y-3 mb-6">
          {/* Google */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white hover:bg-white/[0.06] hover:border-white/[0.12] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white"
              />
            ) : (
              <GoogleIcon className="h-5 w-5" />
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </motion.button>

          {/* Wallet */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(59,130,246,0.3)' }}
            whileTap={{ scale: 0.99 }}
            onClick={handleWalletConnect}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-blue-500/25 bg-blue-500/[0.08] px-4 py-3 text-sm font-semibold text-blue-300 hover:bg-blue-500/[0.14] hover:border-blue-500/40 transition-all"
          >
            <Wallet className="h-5 w-5" />
            {mounted && isConnected && address ? `${address.slice(0, 6)}...${address.slice(-4)} Connected` : 'Connect Wallet'}
          </motion.button>
        </div>

        {/* ─── DIVIDER ──────────────────────────────── */}
        <div className="relative flex items-center mb-6">
          <div className="flex-grow border-t border-white/[0.05]" />
          <span className="flex-shrink-0 mx-4 text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
            Email & Password
          </span>
          <div className="flex-grow border-t border-white/[0.05]" />
        </div>

        {/* ─── TABS ─────────────────────────────────── */}
        <div className="relative flex w-full rounded-xl bg-white/[0.03] p-1 mb-6">
          {(['signin', 'signup'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative w-1/2 rounded-lg py-2 text-xs font-bold transition-colors z-10 ${
                activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
          <motion.div
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-lg bg-zinc-800/80 z-0"
            animate={{ left: activeTab === 'signin' ? '4px' : 'calc(50%)' }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
          />
        </div>

        {/* ─── FORM ─────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <AnimatePresence mode="popLayout">
            {activeTab === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/40 focus:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
            <input
              type="email"
              placeholder="developer@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] py-3 pl-11 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/40 focus:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-blue-400 transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] py-3 pl-11 pr-11 text-sm text-white placeholder:text-zinc-600 focus:border-blue-500/40 focus:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer h-4 w-4 appearance-none rounded border border-zinc-700 bg-zinc-900 checked:border-blue-500 checked:bg-blue-500 transition-all"
                />
                <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
              </div>
              <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300">Remember me</span>
            </label>

            {activeTab === 'signin' && (
              <button type="button" className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </button>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            className="mt-2 w-full flex justify-center items-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-zinc-950 hover:bg-zinc-100 transition-colors shadow-lg"
          >
            {activeTab === 'signin' ? 'Sign In' : 'Create Account'}
          </motion.button>
        </form>
      </div>
    </div>
    </WalletErrorBoundaryClass>
  );
}
