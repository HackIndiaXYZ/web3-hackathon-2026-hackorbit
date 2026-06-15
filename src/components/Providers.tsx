'use client';

import React, { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import {
  WagmiProvider,
  createConfig,
  http,
  useAccount,
  useBalance,
  useConnect,
} from 'wagmi';
import { polygonAmoy, mainnet } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSharpStore } from '@/hooks/useSharpStore';
import NetworkGuard from './NetworkGuard';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';

// ─── Wagmi config with RainbowKit ───────
const wagmiConfig = getDefaultConfig({
  appName: 'SharpFlow AI',
  projectId: '3fcc6bba6f1de962d911bb5b5c3dba68', // Public WalletConnect ID for Hackathon
  chains: [polygonAmoy, mainnet],
  transports: {
    [polygonAmoy.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: false, // Ensures client-side only rendering to avoid hydration mismatches
});

const queryClient = new QueryClient();

/** Syncs NextAuth session into Zustand store */
function SessionSync() {
  const { data: session } = useSession();
  const { setUser, setToken, unlockAchievement } = useSharpStore();

  useEffect(() => {
    if (session?.user?.email) {
      setUser({
        name: session.user.name || session.user.email.split('@')[0],
        email: session.user.email,
        walletAddress: '0x0000000000000000000000000000000000000000',
        avatar: session.user.image || undefined,
      });
      setToken('sf_nextauth_' + btoa(session.user.email));
      unlockAchievement('first_login');
    }
  }, [session, setUser, setToken, unlockAchievement]);

  return null;
}

/** Syncs wagmi wallet into Zustand store */
function WalletSync() {
  const { address, isConnected } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { setUser, setBalance, user, unlockAchievement } = useSharpStore();
  const userRef = React.useRef(user);
  userRef.current = user;

  useEffect(() => {
    if (isConnected && address) {
      const cur = userRef.current;
      setUser({
        name: cur?.name || `Dev ${address.slice(2, 8).toUpperCase()}`,
        email: cur?.email || `${address.slice(0, 6)}@wallet.eth`,
        walletAddress: address,
        avatar: cur?.avatar,
      });
      unlockAchievement('first_wallet');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  useEffect(() => {
    if (balanceData) {
      setBalance(parseFloat(balanceData.formatted));
    }
  }, [balanceData, setBalance]);

  return null;
}

function InnerProviders({ children }: { children: React.ReactNode }) {
  const { initLocalStorage } = useSharpStore();

  useEffect(() => {
    initLocalStorage();
  }, [initLocalStorage]);

  // Suppress Next.js dev overlay for internal MetaMask extension crashes and WalletConnect Reown errors
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      const msg = event.reason?.message || '';
      const stack = event.reason?.stack || '';
      
      if (
        msg.includes('MetaMask') || 
        msg.includes('extension not found') || 
        msg.includes('Failed to connect') ||
        msg.includes('Connection interrupted') || // New MetaMask internal crash
        msg.includes('Reown') || // WalletConnect origin allowlist error
        stack.includes('inpage.js') || // Any extension injection script crash
        stack.includes('reown')
      ) {
        event.preventDefault(); // Stop Next.js error overlay
        console.warn('Suppressed internal wallet/extension crash:', event.reason);
      }
    };
    
    // Intercept console.error to suppress Reown 403 logs that trigger the Next.js overlay
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const logString = args.join(' ');
      if (
        logString.includes('Reown') || 
        logString.includes('cloud.reown.com') ||
        logString.includes('Allowlist') ||
        logString.includes('inpage.js') ||
        logString.toLowerCase().includes('failed to fetch')
      ) {
        // Silently swallow/warn to prevent Next.js dev overlay on network hiccups
        console.warn(...args);
        return;
      }
      originalConsoleError(...args);
    };

    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleRejection);
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <>
      <SessionSync />
      <WalletSync />
      <NetworkGuard />
      {children}
    </>
  );
}

import WalletErrorBoundaryClass from './WalletErrorBoundary';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WalletErrorBoundaryClass>
        <WagmiProvider config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider theme={darkTheme({
              accentColor: '#3b82f6',
              accentColorForeground: 'white',
              borderRadius: 'large',
              fontStack: 'system',
              overlayBlur: 'small',
            })}>
              <InnerProviders>
                {children}
              </InnerProviders>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </WalletErrorBoundaryClass>
    </SessionProvider>
  );
}
