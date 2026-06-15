'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Wallet, LayoutGrid, Download } from 'lucide-react';
import { useSharpStore } from '@/hooks/useSharpStore';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

class WalletErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Wallet Error Boundary caught an error:', error, errorInfo);
  }

  componentDidMount() {
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const msg = event.reason?.message || '';
    if (
      msg.includes('MetaMask') ||
      msg.includes('extension not found') ||
      msg.includes('Failed to connect')
    ) {
      event.preventDefault(); // Stop Next.js dev overlay
      this.setState({
        hasError: true,
        errorMsg: 'Wallet extension crashed or is unavailable.',
      });
    }
  };

  public render() {
    if (this.state.hasError) {
      return <FallbackUI errorMsg={this.state.errorMsg} onReset={() => this.setState({ hasError: false, errorMsg: '' })} />;
    }

    return this.props.children;
  }
}

// Extracted into functional component to use hooks
function FallbackUI({ errorMsg, onReset }: { errorMsg: string; onReset: () => void }) {
  const { generateMockWallet } = useSharpStore();

  const handleDemo = () => {
    generateMockWallet();
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-[400px] w-full flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 to-zinc-950/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(239,68,68,0.15)] text-center space-y-6"
      >
        <div className="mx-auto h-16 w-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">No Wallet Detected</h2>
          <p className="text-sm text-zinc-400">
            {errorMsg.includes('crashed') 
              ? 'Your wallet extension appears to be broken or has crashed internally.' 
              : 'We couldn\'t connect to your Web3 wallet.'}
          </p>
        </div>

        <div className="space-y-3 pt-2">
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
            onClick={onReset}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-sm font-bold transition-all"
          >
            <Wallet className="h-4 w-4 text-blue-400" />
            Try WalletConnect
          </button>
          
          <button
            onClick={handleDemo}
            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.04] text-zinc-400 hover:text-white text-sm font-bold transition-all"
          >
            <LayoutGrid className="h-4 w-4" />
            Continue in Demo Mode
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default WalletErrorBoundaryClass;
