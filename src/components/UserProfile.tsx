'use client';

import React, { useState } from 'react';
import { 
  User, Mail, Copy, Check, ExternalLink, Lock, Unlock, 
  Award, ShieldAlert, AlertTriangle, Cpu, Coins, Terminal 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSharpStore, AchievementId } from '@/hooks/useSharpStore';

const GRADIENTS = [
  { name: 'Cyberpunk Neon', value: 'linear-gradient(135deg, #ff007f 0%, #7f00ff 100%)' },
  { name: 'Blue Horizon', value: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)' },
  { name: 'Solar Flare', value: 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)' },
  { name: 'Emerald Wave', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { name: 'Ultraviolet', value: 'linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)' },
  { name: 'Cosmic Dust', value: 'linear-gradient(135deg, #2c3e50 0%, #000000 100%)' }
];

export default function UserProfile() {
  const { user, setUser, transactions, apiCalls, achievements } = useSharpStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || GRADIENTS[0].value);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [saving, setSaving] = useState(false);

  // Compute stats
  const totalTokensDistributed = transactions
    .filter((tx) => tx.amount > 0)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentTier = totalTokensDistributed >= 10000 
    ? 'Enterprise' 
    : totalTokensDistributed >= 1000 
      ? 'Pro Tier' 
      : 'Developer Tier';

  const handleCopyWallet = () => {
    if (!user?.walletAddress) return;
    navigator.clipboard.writeText(user.walletAddress);
    setCopiedWallet(true);
    toast.success('Wallet address copied!');
    setTimeout(() => setCopiedWallet(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!name.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          walletAddress: user.walletAddress,
          avatar: selectedAvatar
        })
      });
      
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update remote profile storage.');
      }

      setUser({
        ...user,
        name: name.trim(),
        email: email.trim(),
        avatar: selectedAvatar,
      });

      toast.success('Profile settings updated successfully!');
    } catch (err: any) {
      console.warn('DB Profile Sync Error:', err);
      toast.error(err.message || 'Remote database synchronization failed.');
    } finally {
      setSaving(false);
    }
  };

  // Pre-selected Achievements mapping
  const featuredAchievements = [
    { id: 'first_login' as AchievementId, title: 'First Login', desc: 'Welcome to the platform.' },
    { id: 'first_wallet' as AchievementId, title: 'Wallet Pioneer', desc: 'Successfully connected wallet.' },
    { id: 'first_api_key' as AchievementId, title: 'API Key Architect', desc: 'Generated developer credentials.' },
    { id: 'workflow_builder' as AchievementId, title: 'Workflow Builder', desc: 'Deployed your first AI pipeline.' },
    { id: 'power_user' as AchievementId, title: 'Power User', desc: 'Distributed over 1000 SHARP tokens.' }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <Terminal className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">API Requests</span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{apiCalls}</div>
          <span className="text-[10px] text-zinc-500">Total requests logged this tier</span>
        </div>

        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <Coins className="h-4 w-4 text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">SHARP Earned</span>
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">+{totalTokensDistributed}</div>
          <span className="text-[10px] text-zinc-500">On-chain testnet rewards issued</span>
        </div>

        <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-white/[0.1] transition-all">
          <div className="flex items-center gap-3 text-zinc-500 mb-2">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Developer Tier</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">{currentTier}</div>
          <span className="text-[10px] text-zinc-500">Based on transaction velocity</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Profile Card & Info Form */}
        <div className="lg:col-span-7 backdrop-blur-md bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 lg:p-8 space-y-6">
          <h3 className="text-base font-extrabold text-white tracking-tight">Identity Settings</h3>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex flex-col sm:flex-row gap-5 items-center bg-white/[0.01] border border-white/[0.04] p-4.5 rounded-2xl">
              {/* Avatar Preview */}
              <div 
                className="h-16 w-16 rounded-full shrink-0 border-2 border-white/10 shadow-lg relative flex items-center justify-center text-lg font-black text-white"
                style={{ background: selectedAvatar }}
              >
                {!selectedAvatar.startsWith('linear-gradient') && name.slice(0, 2).toUpperCase()}
              </div>

              {/* Gradient Selector */}
              <div className="flex-1 w-full text-left">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-2">Custom Avatar Gradient</span>
                <div className="grid grid-cols-6 gap-2">
                  {GRADIENTS.map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      onClick={() => setSelectedAvatar(g.value)}
                      title={g.name}
                      className={`h-8 rounded-full border transition-all cursor-pointer ${
                        selectedAvatar === g.value 
                          ? 'border-white scale-110 shadow-lg shadow-white/10' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ background: g.value }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Developer Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-650 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 px-4 py-3 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel: Wallet & Achievements */}
        <div className="lg:col-span-5 space-y-6">
          {/* Wallet Section */}
          <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 text-left">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">On-chain Wallet Identity</h4>
            {user?.walletAddress ? (
              <div className="flex items-center justify-between gap-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl px-4 py-3">
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] font-mono text-zinc-500 block">CONNECTED PUBLIC KEY</span>
                  <span className="font-mono text-xs text-zinc-300 truncate block mt-0.5" title={user.walletAddress}>
                    {user.walletAddress}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopyWallet}
                    className="p-2 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedWallet ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <a
                    href={`https://amoy.polygonscan.com/address/${user.walletAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-blue-450 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-red-950/10 border border-red-900/20 rounded-2xl px-4 py-3">
                <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-red-400 block">Not Connected</span>
                  <span className="text-[9px] text-zinc-500 block">Authenticate with Web3 provider to enable transactions</span>
                </div>
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.06] rounded-3xl p-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-4 w-4 text-amber-400" />
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Ecosystem Achievements</h4>
            </div>

            <div className="space-y-3">
              {featuredAchievements.map((item) => {
                const found = achievements.find((a) => a.id === item.id);
                const isUnlocked = !!(found && found.unlockedAt);
                return (
                  <div 
                    key={item.id}
                    className={`flex items-center gap-3 border rounded-2xl px-4 py-3 transition-all ${
                      isUnlocked 
                        ? 'border-indigo-500/20 bg-indigo-500/5' 
                        : 'border-white/[0.03] bg-white/[0.01] opacity-40 grayscale select-none'
                    }`}
                  >
                    <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-lg shrink-0 border ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/30' 
                        : 'bg-zinc-900 border-white/[0.02]'
                    }`}>
                      {found?.emoji || '🔒'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-zinc-200 truncate">{item.title}</span>
                        {isUnlocked ? (
                          <Unlock className="h-3 w-3 text-emerald-400 shrink-0" />
                        ) : (
                          <Lock className="h-3 w-3 text-zinc-500 shrink-0" />
                        )}
                      </div>
                      <span className="text-[9px] text-zinc-500 block mt-0.5">{item.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
