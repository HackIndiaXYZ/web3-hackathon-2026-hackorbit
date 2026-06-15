'use client';

import React, { useEffect, useState } from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { polygonAmoy } from 'wagmi/chains';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NetworkGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (isConnected && chainId && chainId !== polygonAmoy.id) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [isConnected, chainId]);

  const handleSwitch = () => {
    if (switchChain) {
      switchChain(
        { chainId: polygonAmoy.id },
        {
          onSuccess: () => {
            toast.success('Switched to Polygon Amoy');
            setShowWarning(false);
          },
          onError: (err) => {
            toast.error(err.message.includes('rejected') ? 'Switch rejected by user' : 'Failed to switch network');
          },
        }
      );
    }
  };

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md p-4 rounded-2xl border border-amber-500/30 bg-amber-950/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(245,158,11,0.2)] flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40 shrink-0">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">Wrong Network</h4>
              <p className="text-xs text-amber-200/70">Please switch to Polygon Amoy Testnet</p>
            </div>
          </div>
          <button
            onClick={handleSwitch}
            disabled={isPending}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-xl transition-all flex items-center gap-2 shrink-0 disabled:opacity-50"
          >
            {isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Switch Network'}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
