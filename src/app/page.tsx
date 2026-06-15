'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, Layers, ShieldCheck, Zap, Code, 
  HelpCircle, ChevronRight, Cpu, Radio, Sparkles, Copy, Check, Gift
} from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import PipelineAnimation from '@/components/PipelineAnimation';
import { useSharpStore } from '@/hooks/useSharpStore';
import { useRouter } from 'next/navigation';

// Dynamically load R3F space backdrop and main coin canvas with SSR disabled
const BackgroundSpace = dynamic(() => import('@/components/BackgroundSpace'), { ssr: false });
const Canvas3D = dynamic(() => import('@/components/Canvas3D'), { ssr: false });

// Reusable animated metric counter component
function Counter({ target, duration = 1200, suffix = "" }: { target: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    const stepTime = Math.max(Math.floor(duration / 60), 15);
    const stepValue = Math.ceil(end / (duration / stepTime));

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        clearInterval(timer);
        setCount(end);
      } else {
        setCount(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(0);
    if (num >= 1000) return (num / 1000).toFixed(0);
    return num.toString();
  };

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
}

export default function Home() {
  const { theme } = useSharpStore();
  
  // Track scroll position for shrinking navbar effect
  const { scrollY } = useScroll();
  const navPadding = useTransform(scrollY, [0, 80], ['1.25rem', '0.75rem']);
  const navBackground = useTransform(scrollY, [0, 80], ['rgba(10,10,11,0.55)', 'rgba(10,10,11,0.92)']);

  const [copiedCode, setCopiedCode] = useState(false);
  const router = useRouter();
  const { user } = useSharpStore();

  const codeString = `await sharpflow.rewardUser({
  wallet: "0x70997970C518...",
  amount: 50
});`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Scroll reveal variants
  const revealVariants = {
    hidden: { opacity: 0, y: 50, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <div className="min-h-screen relative bg-zinc-950 text-white overflow-hidden select-none subtle-grid-bg">
      
      {/* 1. Hardware-accelerated dynamic Space Background WebGL Canvas */}
      <BackgroundSpace />

      {/* Noise Texture layer */}
      <div className="absolute inset-0 pointer-events-none noise-overlay z-0" />

      {/* Floating Island Navbar */}
      <motion.header 
        style={{ 
          paddingTop: navPadding, 
          paddingBottom: navPadding,
          backgroundColor: navBackground
        }}
        className="sticky top-4 mx-auto z-50 w-[95%] max-w-[1440px] rounded-2xl border border-white/[0.08] backdrop-blur-lg shadow-lg flex items-center justify-between px-6"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md">
            <Layers className="h-4.5 w-4.5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 blur-sm opacity-40 group-hover:opacity-75 transition-opacity" />
          </div>
          <span className="text-base font-bold tracking-tight text-white">
            SharpFlow<span className="text-blue-500">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider relative h-full">
          <div className="relative py-2 px-1">
            <Link href="/" scroll={false} prefetch={true} className="text-white font-black transition-colors">Home</Link>
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
          </div>
          <Link href={user ? "/dashboard" : "/login"} scroll={false} prefetch={true} className="text-zinc-400 hover:text-white transition-colors py-2">Dashboard</Link>
          <Link href="/docs" scroll={false} prefetch={true} className="text-zinc-400 hover:text-white transition-colors py-2">API Docs</Link>
          <Link href="/docs" scroll={false} prefetch={true} className="text-zinc-400 hover:text-white transition-colors py-2">Developers</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href={user ? "/dashboard" : "/login"}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>Start Building</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[92vh] flex flex-col justify-center pt-10 pb-20 md:py-20">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center flex-1">
          
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] as any }}
            className="lg:col-span-6 space-y-6 text-left relative z-20"
          >
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-950/20 text-blue-300 border border-blue-900/30 backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Integrate Rewards. Empower Users.</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Reward Users <br />
              <span className="bg-gradient-to-r from-blue-500 via-indigo-550 to-purple-550 bg-clip-text text-transparent">
                In Seconds
              </span>
            </h1>

            <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
              Plug-and-play Web3 reward infrastructure for modern applications. Seamlessly award tokens on-chain to drive customer retention and unlock premium platform tiers.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={user ? "/dashboard" : "/login"}
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 hover:opacity-90 px-6 py-3.5 text-xs font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Start Building</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/docs"
                scroll={false}
                prefetch={true}
                className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-zinc-900/40 hover:bg-zinc-800/60 px-6 py-3.5 text-xs font-bold text-zinc-300 backdrop-blur-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>View Developers</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </div>

            {/* Counters */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/[0.08] text-left">
              <div className="space-y-2">
                <Gift className="h-5 w-5 text-blue-500" />
                <div className="text-xl sm:text-2xl font-black text-white">
                  <Counter target={50000} suffix="K+" />
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Rewards Distributed</div>
              </div>
              <div className="space-y-2">
                <Code className="h-5 w-5 text-purple-500" />
                <div className="text-xl sm:text-2xl font-black text-white">
                  <Counter target={1000000} suffix="M+" />
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">API Calls</div>
              </div>
              <div className="space-y-2">
                <ShieldCheck className="h-5 w-5 text-blue-500" />
                <div className="text-xl sm:text-2xl font-black text-white">
                  <span>99.99%</span>
                </div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Uptime</div>
              </div>
            </div>
          </motion.div>

          {/* Hero centerpiece rotating coin */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="lg:col-span-6 w-full relative flex justify-center items-center h-[340px] sm:h-[420px] lg:h-[480px] z-20"
          >
            {/* Soft Layered Gradient Glow behind centerpiece (softens dark areas) */}
            <div 
              className="absolute w-[70%] h-[70%] rounded-full pointer-events-none select-none z-0 opacity-20"
              style={{
                filter: 'blur(120px)',
                WebkitFilter: 'blur(120px)',
                background: `
                  radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.12) 0%, transparent 60%),
                  radial-gradient(circle at 70% 30%, rgba(168, 85, 247, 0.10) 0%, transparent 60%),
                  radial-gradient(circle at 50% 70%, rgba(6, 182, 212, 0.06) 0%, transparent 60%)
                `
              }}
            />
            <div className="relative z-10 w-full h-full">
              <Canvas3D />
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-widest z-20">
          <div className="w-5 h-8 rounded-full border border-zinc-700 flex justify-center p-1">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"
            />
          </div>
          <span>Scroll to explore</span>
        </div>
      </section>

      {/* Bento Grid Features Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
        variants={revealVariants}
        className="relative z-10 py-24 border-t border-white/[0.08] will-change-transform"
      >
        <div className="container mx-auto px-6 space-y-12">
          
          <div className="text-left max-w-2xl space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Engineered for Seamless Token Utility
            </h2>
            <p className="text-sm text-zinc-400">
              Award on-chain micro-incentives globally. Re-define loyalty rewards without complex smart contract logic.
            </p>
          </div>

          {/* Asymmetrical Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Card 1 - col-span-8 */}
            <GlassCard hoverEffect={true} className="md:col-span-8 p-8 flex flex-col justify-between text-left min-h-[260px]">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">⚡ One API Call</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
                  Call our single REST endpoint server-side to execute transactions. Integrate token minting or burns without managing Web3 private keys in frontends.
                </p>
              </div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-6">REST SDK INTEGRATION</div>
            </GlassCard>
            
            {/* Card 2 - col-span-4 */}
            <GlassCard hoverEffect={true} className="md:col-span-4 p-8 flex flex-col justify-between text-left min-h-[260px]">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">🔒 Secure Smart Contracts</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Audited Solidity contracts enforce mint privileges and manage spending logs on the blockchain ledger.
                </p>
              </div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-6">SECURITY STANDARD</div>
            </GlassCard>
            
            {/* Card 3 - col-span-4 */}
            <GlassCard hoverEffect={true} className="md:col-span-4 p-8 flex flex-col justify-between text-left min-h-[260px]">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">🌐 Polygon Powered</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Mint and transfer SHARP tokens at sub-penny gas costs with Polygon Amoy network finality.
                </p>
              </div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-6">NETWORK NODE</div>
            </GlassCard>
            
            {/* Card 4 - col-span-8 */}
            <GlassCard hoverEffect={true} className="md:col-span-8 p-8 flex flex-col justify-between text-left min-h-[260px]">
              <div className="space-y-4">
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Radio className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-white">📈 Real Time Analytics</h3>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
                  Track developer REST request counts, total tokens issued, active user balances, and live events inside an interactive dashboard ledger.
                </p>
              </div>
              <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-6">LEDGER METRICS</div>
            </GlassCard>

          </div>
        </div>
      </motion.section>

      {/* Pipeline Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
        variants={revealVariants}
        className="relative z-10 py-20 border-t border-white/[0.08] bg-zinc-900/10 will-change-transform"
      >
        <div className="container mx-auto px-6 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-wider text-zinc-500 text-xs">Dynamic Datastream</h2>
            <h3 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">On-Chain Pipeline Architecture</h3>
          </div>
          <PipelineAnimation />
        </div>
      </motion.section>

      {/* Code to Transaction Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-120px' }}
        variants={revealVariants}
        className="relative z-10 py-24 border-t border-white/[0.08] will-change-transform"
      >
        <div className="container mx-auto px-6 space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Code Transformed Into On-Chain Settlements
            </h2>
            <p className="text-sm text-zinc-400">
              Watch simple server API queries materialize instantly as confirmed events on the Polygon blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            {/* Left: Code Snippet */}
            <div className="lg:col-span-4 flex flex-col text-left rounded-2xl bg-zinc-950 border border-zinc-900 shadow-xl overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/40 border-b border-zinc-900 text-zinc-500 text-[10px]">
                <span>EXPRESS CODE TRIGGER</span>
                <button onClick={handleCopyCode} className="hover:text-white flex items-center gap-1 transition-colors">
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 overflow-x-auto text-[11px] sm:text-xs">
                <pre className="text-blue-400 whitespace-pre leading-relaxed">
                  <code>{codeString}</code>
                </pre>
              </div>
            </div>

            {/* Center: Pulsing Arrow */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center py-4">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                <span>Dispatching</span>
                <ChevronRight className="h-4 w-4 animate-bounce" />
              </div>
              <div className="w-full h-8 flex items-center justify-center relative mt-3">
                <div className="w-3/4 h-0.5 bg-zinc-850 relative rounded-full overflow-hidden">
                  <motion.div
                    animate={{ x: ['-100%', '300%'] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-12 h-full bg-gradient-to-r from-transparent via-blue-500 to-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Right: Confirmed Receipt Glass Card */}
            <div className="lg:col-span-4">
              <GlassCard hoverEffect={true} className="p-6 text-left border border-white/[0.08] bg-white/[0.04] shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Transaction Status</span>
                  <span className="px-2 py-0.5 rounded-full text-[8px] font-bold bg-emerald-950/20 text-emerald-400 border border-emerald-900/20">
                    Confirmed
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Transaction Hash</span>
                    <div className="text-xs font-mono text-zinc-350 truncate">
                      0x9e3f162db8ea58252277d3bf67b848c9df410...
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Gas Fee</span>
                      <div className="text-xs font-mono text-zinc-300 mt-0.5">0.0001 MATIC</div>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-bold">Balance Delta</span>
                      <div className="text-xs font-mono font-bold text-blue-400 mt-0.5">+50 SHARP</div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 py-10 border-t border-white/[0.08] text-center text-xs text-zinc-500 bg-zinc-950/20">
        <div className="container mx-auto px-6">
          <p>© {new Date().getFullYear()} SharpFlow AI. Powered by Polygon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
