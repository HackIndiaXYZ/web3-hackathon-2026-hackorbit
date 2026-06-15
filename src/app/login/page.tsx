'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Layers, Zap, Code2, ShieldCheck, Users } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';

import AuthForm from '@/components/AuthForm';
import LoadingOverlay from '@/components/LoadingOverlay';
import WelcomeWizard from '@/components/WelcomeWizard';
import { useSharpStore } from '@/hooks/useSharpStore';
import { useAchievement } from '@/hooks/useAchievement';

const BackgroundSpace = dynamic(() => import('@/components/BackgroundSpace'), { ssr: false });
const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false });

// Animated counter hook
function useAnimatedCounter(target: number, duration = 2000) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function AnimatedStat({ label, value, prefix = '', suffix = '', icon: Icon, color }: {
  label: string; value: number; prefix?: string; suffix?: string;
  icon: React.FC<{ className?: string }>; color: string;
}) {
  const count = useAnimatedCounter(value);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-zinc-500 mb-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-black text-white tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken, triggerDemoMode, user, isHydrated } = useSharpStore();
  const { award } = useAchievement();
  const containerRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 30, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 30, damping: 25 });

  // If already logged in, go to dashboard
  useEffect(() => {
    if (isHydrated && user) {
      router.push('/dashboard');
    }
  }, [isHydrated, user, router]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left - rect.width / 2) * 0.015);
    mouseY.set((e.clientY - rect.top - rect.height / 2) * 0.015);
  };

  const handleDemo = () => {
    setIsLoading(true);
    setPendingEmail('__demo__');
  };

  const handleLogin = (email: string) => {
    setIsLoading(true);
    setPendingEmail(email);
    sessionStorage.setItem('temp_login_email', email);
  };

  const onLoadingComplete = () => {
    setIsLoading(false);

    if (pendingEmail === '__demo__') {
      triggerDemoMode();
      
      // Background sync default demo user to MongoDB
      fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Pratik Mishra',
          walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          email: 'pratik@sharpflow.ai',
          avatar: 'linear-gradient(135deg, #ff007f 0%, #7f00ff 100%)'
        })
      }).catch(err => console.warn('Demo user DB sync error:', err));

      triggerConfetti();
      toast.success('Welcome to SharpFlow Demo Workspace 🚀', {
        style: { background: '#18181b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }
      });
      router.push('/dashboard');
    } else {
      const email = pendingEmail || sessionStorage.getItem('temp_login_email') || 'developer@company.com';
      const isWallet = email.includes('@wallet');
      const name = isWallet
        ? `Dev ${email.slice(2, 8).toUpperCase()}`
        : email.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, ' ').split(' ')[0];

      const userPayload = {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        walletAddress: isWallet
          ? email.replace('@wallet.eth', '').replace('@wallet.com', '')
          : '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        avatar: 'linear-gradient(135deg, #ff007f 0%, #7f00ff 100%)'
      };

      setUser(userPayload);
      setToken('sf_jwt_' + Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(''));

      // Background sync user login to MongoDB
      fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload)
      }).catch(err => console.warn('User login DB sync error:', err));

      award('first_login');
      triggerConfetti();
      setShowWizard(true);
    }
  };

  const triggerConfetti = () => {
    const end = Date.now() + 2000;
    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#3b82f6', '#a855f7', '#06b6d4'] });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#3b82f6', '#a855f7', '#06b6d4'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleWizardSelect = (action: string) => {
    router.push('/dashboard');
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen flex bg-[#0A0A0B] text-white overflow-hidden relative"
    >
      {/* ─── LEFT SIDE (60%) ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-between p-12 border-r border-white/[0.04]">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <BackgroundSpace />
          {/* Aurora glows */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
            animate={{ opacity: [0.06, 0.12, 0.06] }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.2), transparent 70%)' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full pointer-events-none"
            animate={{ opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 7, repeat: Infinity, delay: 2 }}
            style={{ background: 'radial-gradient(ellipse, rgba(168,85,247,0.2), transparent 70%)' }}
          />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600">
              <Layers className="h-4 w-4 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 blur opacity-50 group-hover:opacity-80 transition-opacity" />
            </div>
            <span className="text-sm font-bold text-white">
              SharpFlow<span className="text-blue-500">.</span>
            </span>
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col items-start justify-center pr-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 mb-6"
          >
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              Built on Polygon · Live on Amoy Testnet
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="space-y-6 max-w-xl"
          >
            <h1 className="text-5xl xl:text-6xl font-black tracking-tight leading-[1.05]">
              Powering the Future of{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
                Web3 Rewards
              </span>
            </h1>
            <p className="text-lg text-zinc-400 leading-relaxed max-w-md">
              One REST API call. Infinite on-chain possibilities. Reward your users
              with SHARP tokens across any platform, instantly.
            </p>
          </motion.div>

          {/* Rotating 3D Token */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[380px] h-[380px] pointer-events-none opacity-90 mix-blend-screen">
            <Canvas3D />
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative z-10 grid grid-cols-4 gap-6 pt-8 border-t border-white/[0.05]"
        >
          <AnimatedStat label="Rewards" value={100000} suffix="+" icon={Zap} color="text-blue-400" />
          <AnimatedStat label="Developers" value={25000} suffix="+" icon={Code2} color="text-purple-400" />
          <AnimatedStat label="API Calls" value={5000000} suffix="+" icon={ShieldCheck} color="text-emerald-400" />
          <AnimatedStat label="Active Users" value={10000} suffix="+" icon={Users} color="text-orange-400" />
        </motion.div>
      </div>

      {/* ─── RIGHT SIDE (40%) ────────────────────────────── */}
      <div className="w-full lg:w-[40%] relative flex items-center justify-center p-6 sm:p-10">
        {/* Background layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0B] to-[#0D0D14] z-0" />
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top right, rgba(99,102,241,0.06) 0%, transparent 60%)' }}
        />

        {/* Mobile Logo */}
        <div className="absolute top-6 left-6 lg:hidden z-10">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600">
              <Layers className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">SharpFlow<span className="text-blue-500">.</span></span>
          </button>
        </div>

        {/* Auth Form — no GoogleOAuthProvider needed, using NextAuth directly */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 w-full"
        >
          <AuthForm onLogin={handleLogin} onDemo={handleDemo} />
        </motion.div>
      </div>

      {/* ─── OVERLAYS ────────────────────────────────────── */}
      <LoadingOverlay isVisible={isLoading} onComplete={onLoadingComplete} />
      <WelcomeWizard
        isVisible={showWizard}
        onClose={() => { setShowWizard(false); router.push('/dashboard'); }}
        onSelectOption={handleWizardSelect}
      />
    </div>
  );
}
