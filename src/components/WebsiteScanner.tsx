'use client';

import React, { useState } from 'react';
import { Search, Globe, ChevronRight, CheckCircle2, Code2, Sparkles, Box, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';

export default function WebsiteScanner() {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsScanning(true);
    setScanComplete(false);
    setProgress(0);

    const stages = [
      { p: 15, text: 'Fetching DOM layout...' },
      { p: 40, text: 'Analyzing e-commerce flows...' },
      { p: 65, text: 'Detecting user registration endpoints...' },
      { p: 85, text: 'Mapping gamification opportunities...' },
      { p: 100, text: 'Generating integration code...' },
    ];

    for (let i = 0; i < stages.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setProgress(stages[i].p);
      setStatusText(stages[i].text);
    }

    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 500);
  };

  const suggestions = [
    {
      title: 'Post-Checkout Reward',
      desc: 'Award tokens when a customer completes a purchase on your Shopify/WooCommerce store.',
      icon: Box,
      color: 'blue',
      code: `// Listen for purchase completion event
window.addEventListener('checkout_success', (e) => {
  const amount = Math.floor(e.detail.cartTotal * 0.1); // 10% back
  sharpflow.rewardUser(e.detail.userWallet, amount);
});`
    },
    {
      title: 'Referral Signups',
      desc: 'Incentivize your community to invite friends with an instant 50 SHARP drop.',
      icon: Sparkles,
      color: 'purple',
      code: `// Handle new user registration with referral code
app.post('/register', async (req, res) => {
  const { wallet, refCode } = req.body;
  const user = await db.createUser(wallet);
  
  if (refCode) {
    // Reward both referrer and new user
    await sharpflow.rewardUser(wallet, 50);
    await sharpflow.rewardUser(getWalletFromRef(refCode), 50);
  }
});`
    },
    {
      title: 'Daily Login Streak',
      desc: 'Boost retention by awarding small amounts of SHARP for consecutive daily logins.',
      icon: Activity,
      color: 'emerald',
      code: `// Check login streaks on authentication
function onUserLogin(user) {
  if (user.streakCount > 0 && user.streakCount % 5 === 0) {
    sharpflow.rewardUser(user.wallet, 25)
      .then(() => showToast('Streak Bonus! +25 SHARP'));
  }
}`
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
          <Globe className="h-6 w-6 text-purple-500" />
          <span>Smart Integration Scanner</span>
        </h3>
        <p className="text-sm text-zinc-400">
          Enter your website URL. Our AI will analyze your DOM and automatically suggest the best places to integrate token rewards, complete with copy-paste code.
        </p>
      </div>

      <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3 max-w-2xl text-xs">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4.5 w-4.5 text-zinc-500" />
          </div>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-website.com"
            disabled={isScanning}
            className="block w-full pl-10 pr-4 py-3.5 bg-zinc-950/50 border border-white/[0.08] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={isScanning || !url}
          className="px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-650 text-white font-bold text-xs rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          {isScanning ? 'Scanning...' : 'Analyze'}
        </button>
      </form>

      {/* Progress Bar */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-2xl space-y-3 overflow-hidden"
          >
            <div className="flex justify-between text-xs font-semibold text-zinc-400">
              <span className="animate-pulse text-purple-400">{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {scanComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-6 border-t border-white/[0.08]"
          >
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <CheckCircle2 className="h-5 w-5" />
              <span>Scan complete. We found 3 high-converting gamification opportunities.</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {suggestions.map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                >
                  <GlassCard className="h-full flex flex-col p-6 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors border-white/[0.06] group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`h-10 w-10 rounded-xl bg-${s.color}-500/10 flex items-center justify-center border border-${s.color}-500/20 group-hover:scale-110 transition-transform`}>
                        <s.icon className={`h-5 w-5 text-${s.color}-400`} />
                      </div>
                      <h4 className="font-bold text-white text-sm">{s.title}</h4>
                    </div>
                    
                    <p className="text-xs text-zinc-400 mb-6 flex-1 leading-relaxed">
                      {s.desc}
                    </p>

                    <div className="rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 mt-auto">
                      <div className="bg-zinc-900/50 px-3 py-2 border-b border-zinc-800 flex items-center gap-2">
                        <Code2 className="h-3 w-3 text-zinc-500" />
                        <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Implementation</span>
                      </div>
                      <pre className="p-3 text-[10px] font-mono text-zinc-300 overflow-x-auto">
                        <code>{s.code}</code>
                      </pre>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
