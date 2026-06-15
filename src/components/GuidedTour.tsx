'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSharpStore } from '@/hooks/useSharpStore';

const TOUR_STEPS = [
  {
    target: '[data-tour="keys"]',
    title: 'Generate Your First API Key',
    description: 'Create instant developer credentials for your app. One key unlocks the entire SharpFlow reward infrastructure.',
    action: 'Click the Keys tab',
  },
  {
    target: '[data-tour="playground"]',
    title: 'Send Your First Reward',
    description: 'Fire a reward transaction to any wallet in seconds. Our API handles the entire on-chain process for you.',
    action: 'Try the API Playground',
  },
  {
    target: '[data-tour="explorer"]',
    title: 'View Blockchain Transactions',
    description: 'Every reward is transparent and immutable on Polygon. Track every transaction in real time.',
    action: 'Open the Explorer',
  },
  {
    target: '[data-tour="analytics"]',
    title: 'Track Reward Analytics',
    description: 'Visualize your reward distribution, wallet activity, and API traffic on beautiful charts.',
    action: 'View Analytics',
  },
  {
    target: '[data-tour="chatbot"]',
    title: 'Your AI Copilot',
    description: 'Ask SharpFlow AI anything — generate SDK code, create campaigns, or design webhooks in seconds.',
    action: 'Open AI Assistant',
  },
  {
    target: '[data-tour="scanner"]',
    title: 'Website Intelligence Scanner',
    description: 'Analyze any website and get AI-powered suggestions for reward campaigns tailored to their audience.',
    action: 'Launch Website Scanner',
  },
];

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export default function GuidedTour() {
  const { tourStep, nextTourStep, endTour } = useSharpStore();
  const [tooltipPos, setTooltipPos] = useState<TooltipPosition | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame>>(0);

  const isActive = tourStep !== null && tourStep < TOUR_STEPS.length;
  const currentStep = isActive ? TOUR_STEPS[tourStep!] : null;

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updatePosition = () => {
      const el = document.querySelector(currentStep.target) as HTMLElement | null;
      if (!el) {
        rafRef.current = requestAnimationFrame(updatePosition);
        return;
      }

      const rect = el.getBoundingClientRect();
      setTargetRect(rect);

      const tooltipWidth = 320;
      const tooltipHeight = 160;
      const gap = 16;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      let placement: TooltipPosition['placement'] = 'bottom';
      let top = rect.bottom + gap;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;

      if (top + tooltipHeight > vh - gap) {
        placement = 'top';
        top = rect.top - tooltipHeight - gap;
      }
      if (left < gap) left = gap;
      if (left + tooltipWidth > vw - gap) left = vw - tooltipWidth - gap;

      setTooltipPos({ top, left, placement });
    };

    updatePosition();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, currentStep, tourStep]);

  const handleFinish = () => {
    endTour();
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#3b82f6', '#a855f7', '#10b981'] });
  };

  const isLastStep = tourStep === TOUR_STEPS.length - 1;

  return (
    <AnimatePresence>
      {isActive && currentStep && (
        <>
          {/* Dark overlay with spotlight cutout */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] pointer-events-none"
            style={{
              background: targetRect
                ? `radial-gradient(
                    ellipse ${targetRect.width + 32}px ${targetRect.height + 32}px
                    at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px,
                    transparent 0%,
                    rgba(0,0,0,0.85) 80%
                  )`
                : 'rgba(0,0,0,0.85)',
            }}
          />

          {/* Click blocker for non-spotlight areas */}
          <div className="fixed inset-0 z-[199]" onClick={() => {}} />

          {/* Target highlight ring */}
          {targetRect && (
            <motion.div
              key="ring"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[201] rounded-2xl pointer-events-none"
              style={{
                top: targetRect.top - 6,
                left: targetRect.left - 6,
                width: targetRect.width + 12,
                height: targetRect.height + 12,
                boxShadow: '0 0 0 2px rgba(99,102,241,0.8), 0 0 30px rgba(99,102,241,0.4)',
              }}
            />
          )}

          {/* Tooltip */}
          {tooltipPos && (
            <motion.div
              key={`tooltip-${tourStep}`}
              initial={{ opacity: 0, y: tooltipPos.placement === 'bottom' ? -10 : 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed z-[202] w-80 pointer-events-auto"
              style={{ top: tooltipPos.top, left: tooltipPos.left }}
            >
              <div className="relative rounded-2xl border border-white/[0.12] bg-[#0A0A0B]/95 backdrop-blur-2xl p-5 shadow-[0_0_60px_rgba(0,0,0,0.7)]">
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    {TOUR_STEPS.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === tourStep
                            ? 'w-4 bg-indigo-500'
                            : i < tourStep!
                            ? 'w-2 bg-indigo-800'
                            : 'w-2 bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={endTour}
                    className="p-1 rounded-lg hover:bg-white/[0.06] text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-white mb-1.5">{currentStep.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">{currentStep.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    Step {tourStep! + 1} of {TOUR_STEPS.length}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={isLastStep ? handleFinish : nextTourStep}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg"
                  >
                    {isLastStep ? '🎉 Finish Tour' : (
                      <>
                        {currentStep.action}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
