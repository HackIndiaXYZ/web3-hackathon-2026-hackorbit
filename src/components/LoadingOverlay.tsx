'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function LoadingOverlay({ isVisible, onComplete }: LoadingOverlayProps) {
  const [loadingText, setLoadingText] = useState('Initializing Blockchain Environment...');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      setLoadingText('Initializing Blockchain Environment...');
      return;
    }

    const duration = 3000;
    const interval = 30;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const p = (currentStep / steps) * 100;
      setProgress(p);

      if (p > 33 && p <= 66) {
        setLoadingText('Connecting Developer Workspace...');
      } else if (p > 66) {
        setLoadingText('Loading Analytics Engine...');
      }

      if (currentStep >= steps) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A0A0B]/80 text-white"
        >
          <div className="flex flex-col items-center max-w-sm w-full space-y-8 p-6">
            
            {/* Pulsing Logo */}
            <motion.div 
              animate={{ 
                scale: [1, 1.1, 1],
                boxShadow: [
                  '0 0 20px rgba(59, 130, 246, 0.2)',
                  '0 0 40px rgba(168, 85, 247, 0.4)',
                  '0 0 20px rgba(59, 130, 246, 0.2)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-2xl"
            >
              <Layers className="h-10 w-10 text-white" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-600 to-purple-600 blur-md opacity-50" />
            </motion.div>

            <div className="w-full space-y-4 text-center">
              {/* Animated Text Sequence */}
              <AnimatePresence mode="wait">
                <motion.h3
                  key={loadingText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-sm font-bold tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                >
                  {loadingText}
                </motion.h3>
              </AnimatePresence>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'linear', duration: 0.03 }}
                />
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
