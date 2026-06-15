import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Download, Wallet, User, LayoutGrid, X } from 'lucide-react';
import { useSharpStore } from '@/hooks/useSharpStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnect: () => void;
  onGoogle: () => void;
}

export default function WalletFallbackModal({ isOpen, onClose, onWalletConnect, onGoogle }: Props) {
  const { generateMockWallet } = useSharpStore();

  const handleDemo = () => {
    generateMockWallet();
    window.location.href = '/dashboard';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md p-6 rounded-3xl border border-red-500/20 bg-gradient-to-b from-zinc-900 to-zinc-950 shadow-2xl pointer-events-auto relative overflow-hidden"
            >
              {/* Top accent glow */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-50" />
              
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mx-auto mt-2 h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
              
              <div className="text-center space-y-2 mt-4 mb-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Wallet Not Found</h2>
                <p className="text-sm text-zinc-400">
                  MetaMask extension was not detected or is unavailable.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  <Download className="h-4 w-4" />
                  Install MetaMask
                </a>
                
                <button
                  onClick={() => {
                    onClose();
                    onWalletConnect();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-sm font-bold transition-all"
                >
                  <Wallet className="h-4 w-4 text-blue-400" />
                  Connect with WalletConnect
                </button>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onGoogle();
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.04] text-zinc-300 hover:text-white text-sm font-bold transition-all"
                  >
                    <User className="h-4 w-4" />
                    Google
                  </button>

                  <button
                    onClick={handleDemo}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.04] text-zinc-300 hover:text-white text-sm font-bold transition-all"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Demo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
