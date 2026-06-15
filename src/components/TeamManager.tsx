'use client';

import React, { useState } from 'react';
import { Users, Plus, Mail, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import GlassCard from './GlassCard';

interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
  avatarInitials: string;
  joinedAt: string;
}

export default function TeamManager() {
  const [members, setMembers] = useState<Member[]>([
    {
      id: 'mem-1',
      name: 'Pratik Suresh Mishra',
      email: 'pratik@sharpflow.ai',
      role: 'Owner',
      avatarInitials: 'PM',
      joinedAt: '2026-06-01',
    },
    {
      id: 'mem-2',
      name: 'Sarah Connor',
      email: 'sarah@sharpflow.ai',
      role: 'Admin',
      avatarInitials: 'SC',
      joinedAt: '2026-06-05',
    },
    {
      id: 'mem-3',
      name: 'John Doe',
      email: 'john@sharpflow.ai',
      role: 'Member',
      avatarInitials: 'JD',
      joinedAt: '2026-06-12',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member');
  const [loading, setLoading] = useState(false);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error('Email is required.');
      return;
    }
    if (!inviteEmail.includes('@') || !inviteEmail.includes('.')) {
      toast.error('Please specify a valid email address.');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Sending invitation...');

    setTimeout(() => {
      const initials = inviteEmail.slice(0, 2).toUpperCase();
      const newMember: Member = {
        id: `mem-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        avatarInitials: initials,
        joinedAt: new Date().toISOString().split('T')[0],
      };

      setMembers((prev) => [...prev, newMember]);
      setInviteEmail('');
      setLoading(false);
      toast.success(`Sent team invitation to ${inviteEmail}!`, { id: toastId });
    }, 1000);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Owner':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/20 dark:border-blue-900/20';
      case 'Admin':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-200/20 dark:border-purple-900/20';
      default:
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/50 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-zinc-950 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Developer Team Members</span>
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Invite engineers, admins, and collaborators to review metrics and manage endpoints.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Invitation Form Card */}
        <div className="lg:col-span-5">
          <GlassCard className="p-6 text-left space-y-4">
            <h4 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span>Invite Collaborator</span>
            </h4>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Teammate Email</label>
                <input
                  type="email"
                  placeholder="developer@platform.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Organization Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2.5 text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Member">Member (Read Only)</option>
                  <option value="Admin">Admin (Read/Write)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 py-2.5 text-xs font-bold hover:scale-[1.01] transition-all disabled:opacity-50"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Send Invitation</span>
              </button>
            </form>
          </GlassCard>
        </div>

        {/* Members Roster List */}
        <div className="lg:col-span-7 space-y-4 text-left">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Organization Roster</h4>
            {/* Avatar Stack Summary */}
            <div className="flex -space-x-2 overflow-hidden">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 text-[10px] font-extrabold text-zinc-600 dark:text-zinc-400"
                >
                  {m.avatarInitials}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {members.map((item) => (
              <GlassCard key={item.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Left: Avatar + Details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500/20 to-purple-500/20 border border-blue-500/10 text-xs font-black text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                      {item.avatarInitials}
                    </div>

                    <div className="text-left min-w-0">
                      <div className="text-xs font-bold text-zinc-950 dark:text-white truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        {item.email}
                      </div>
                    </div>
                  </div>

                  {/* Right: Badge + Joined */}
                  <div className="text-right shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(item.role)}`}>
                      {item.role}
                    </span>
                    <div className="text-[9px] text-zinc-400 mt-1 font-semibold">
                      Joined {item.joinedAt}
                    </div>
                  </div>

                </div>
              </GlassCard>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
