'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSharpStore, AchievementId } from '@/hooks/useSharpStore';

// Track which achievements we've already announced this session
const announcedSet = new Set<AchievementId>();

export function useAchievement() {
  const { unlockAchievement, achievements } = useSharpStore();

  const award = (id: AchievementId) => {
    if (announcedSet.has(id)) return;
    const already = achievements.find((a) => a.id === id && a.unlockedAt);
    if (already) return;

    announcedSet.add(id);
    unlockAchievement(id);

    const achievement = achievements.find((a) => a.id === id);
    if (!achievement) return;

    toast.custom(
      (t) => (
        <AnimatePresence>
          {t.visible && (
            <motion.div
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="flex items-center gap-3 rounded-2xl border border-white/[0.1] bg-[#111115] px-5 py-3.5 shadow-2xl backdrop-blur-2xl"
              style={{ boxShadow: '0 0 30px rgba(99,102,241,0.2)' }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 text-xl">
                {achievement.emoji}
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-0.5">
                  Achievement Unlocked
                </div>
                <div className="text-sm font-bold text-white">{achievement.label}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ),
      { duration: 4000, position: 'bottom-right' }
    );
  };

  return { award };
}
