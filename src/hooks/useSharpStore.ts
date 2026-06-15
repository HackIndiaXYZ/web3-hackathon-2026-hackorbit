import { create } from 'zustand';

export interface UserState {
  name: string;
  walletAddress: string;
  email: string;
  avatar?: string;
}

export interface ProjectState {
  name: string;
  apiKey: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  status: 'active' | 'disabled' | 'revoked';
  requestsToday: number;
  lastUsed: string;
  createdAt: string;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  type: 'discord' | 'slack' | 'email';
  events: string[];
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface TransactionState {
  wallet: string;
  amount: number;
  txHash: string;
  timestamp: string;
  type?: 'reward' | 'spend' | 'buy';
}

export type AchievementId =
  | 'first_login'
  | 'first_wallet'
  | 'first_api_key'
  | 'first_reward'
  | 'first_campaign'
  | 'workflow_builder'
  | 'power_user';

export interface Achievement {
  id: AchievementId;
  label: string;
  emoji: string;
  unlockedAt?: string;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_login', label: 'First Login', emoji: '🎉' },
  { id: 'first_wallet', label: 'Wallet Pioneer', emoji: '🦊' },
  { id: 'first_api_key', label: 'API Key Architect', emoji: '🔑' },
  { id: 'first_reward', label: 'First Reward Sent', emoji: '💸' },
  { id: 'first_campaign', label: 'Campaign Creator', emoji: '🚀' },
  { id: 'workflow_builder', label: 'Workflow Builder', emoji: '🤖' },
  { id: 'power_user', label: 'Power User', emoji: '⚡' },
];

interface SharpStore {
  user: UserState | null;
  token: string | null;
  hasSeenWizard: boolean;
  isHydrated: boolean;
  activeProject: ProjectState | null;
  transactions: TransactionState[];
  balance: number;
  apiCalls: number;
  isDemoMode: boolean;
  theme: 'dark';
  achievements: Achievement[];
  tourStep: number | null; // null = tour not active
  showProductShowcase: boolean;

  // New features state
  keys: ApiKey[];
  webhooks: WebhookSubscription[];
  shockwaveCount: number;

  // Live state telemetry
  isLiveMode: boolean;
  syncState: 'SYNCING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'STALE' | 'DISCONNECTED' | 'REORG_DETECTED';
  lastBlockNumber: number | null;
  lastBalanceSnapshot: number;
  lastTxHash: string | null;

  setTheme: (theme: 'dark') => void;
  setUser: (user: UserState | null) => void;
  setToken: (token: string | null) => void;
  completeWizard: () => void;
  logout: () => void;
  setActiveProject: (project: ProjectState | null) => void;
  addTransaction: (tx: TransactionState) => void;
  setTransactions: (txs: TransactionState[]) => void;
  incrementApiCalls: () => void;
  setBalance: (bal: number) => void;
  initLocalStorage: () => void;
  triggerDemoMode: () => void;
  unlockAchievement: (id: AchievementId) => void;
  startTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;
  setShowProductShowcase: (show: boolean) => void;
  generateMockWallet: () => void;

  // Setters/handlers for new features
  setKeys: (keys: ApiKey[]) => void;
  setWebhooks: (webhooks: WebhookSubscription[]) => void;
  triggerShockwave: () => void;

  // Live mode setters
  setLiveMode: (live: boolean) => void;
  setSyncState: (state: 'SYNCING' | 'PENDING_CONFIRMATION' | 'CONFIRMED' | 'STALE' | 'DISCONNECTED' | 'REORG_DETECTED') => void;
  setLastBlockNumber: (num: number | null) => void;
  setLastBalanceSnapshot: (bal: number) => void;
  setLastTxHash: (hash: string | null) => void;
}

export const useSharpStore = create<SharpStore>((set, get) => ({
  user: null,
  token: null,
  hasSeenWizard: false,
  isHydrated: false,
  activeProject: null,
  transactions: [],
  balance: 0,
  apiCalls: 0,
  isDemoMode: false,
  theme: 'dark',
  achievements: ALL_ACHIEVEMENTS,
  tourStep: null,
  showProductShowcase: false,

  // Default values
  keys: [
    {
      id: 'key-1',
      name: 'Production Server Client',
      key: 'sf_live_4f89d81a92e105b5f8c6b73a218d',
      permissions: ['read', 'write', 'reward'],
      status: 'active',
      requestsToday: 14320,
      lastUsed: '2 minutes ago',
      createdAt: '2026-06-01',
    },
    {
      id: 'key-2',
      name: 'Staging Dashboard Web',
      key: 'sf_test_8d9a102e3b4a5d6e7f8c9b0a1c2d',
      permissions: ['read', 'write'],
      status: 'active',
      requestsToday: 420,
      lastUsed: '3 hours ago',
      createdAt: '2026-06-12',
    },
  ],
  webhooks: [
    {
      id: 'wh-1',
      url: 'https://api.myplatform.com/webhooks/sharpflow',
      type: 'discord',
      events: ['reward.sent', 'transaction.confirmed'],
      status: 'active',
      createdAt: '2026-06-05',
    },
  ],
  shockwaveCount: 0,
  isLiveMode: false,
  syncState: 'DISCONNECTED',
  lastBlockNumber: null,
  lastBalanceSnapshot: 0,
  lastTxHash: null,

  setTheme: () => {
    set({ theme: 'dark' });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharpflow_theme', 'dark');
      document.documentElement.classList.add('dark');
    }
  },

  setUser: (user) => {
    set({ user });
    if (typeof window !== 'undefined') {
      if (user) {
        localStorage.setItem('sharpflow_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('sharpflow_user');
      }
    }
  },

  setToken: (token) => {
    set({ token });
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('sharpflow_token', token);
      } else {
        localStorage.removeItem('sharpflow_token');
      }
    }
  },

  completeWizard: () => {
    set({ hasSeenWizard: true });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharpflow_wizard_seen', 'true');
    }
  },

  logout: () => {
    set({
      user: null,
      token: null,
      activeProject: null,
      transactions: [],
      balance: 0,
      apiCalls: 0,
      isDemoMode: false,
      tourStep: null,
    });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sharpflow_user');
      localStorage.removeItem('sharpflow_token');
      localStorage.removeItem('sharpflow_project');
      localStorage.removeItem('sharpflow_transactions');
      localStorage.removeItem('sharpflow_apicalls');
      localStorage.removeItem('sharpflow_wizard_seen');
    }
  },

  setActiveProject: (activeProject) => {
    set({ activeProject });
    if (typeof window !== 'undefined' && activeProject) {
      localStorage.setItem('sharpflow_project', JSON.stringify(activeProject));
    }
  },

  addTransaction: (tx) => {
    set((state) => {
      const updated = [tx, ...state.transactions];
      if (typeof window !== 'undefined') {
        localStorage.setItem('sharpflow_transactions', JSON.stringify(updated));
      }
      return { transactions: updated, shockwaveCount: state.shockwaveCount + 1 };
    });
  },

  setTransactions: (transactions) => {
    set({ transactions });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharpflow_transactions', JSON.stringify(transactions));
    }
  },

  incrementApiCalls: () => {
    set((state) => {
      const calls = state.apiCalls + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sharpflow_apicalls', calls.toString());
      }
      return { apiCalls: calls };
    });
  },

  setBalance: (balance) => {
    set({ balance });
  },

  unlockAchievement: (id: AchievementId) => {
    set((state) => {
      const achievements = state.achievements.map((a) =>
        a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('sharpflow_achievements', JSON.stringify(achievements));
      }
      return { achievements };
    });
  },

  startTour: () => {
    set({ tourStep: 0 });
  },

  nextTourStep: () => {
    set((state) => {
      const next = (state.tourStep ?? 0) + 1;
      return { tourStep: next >= 6 ? null : next };
    });
  },

  endTour: () => {
    set({ tourStep: null });
  },

  setShowProductShowcase: (show) => {
    set({ showProductShowcase: show });
  },

  triggerDemoMode: () => {
    set((state) => {
      const mockTxs: TransactionState[] = [];
      const baseTime = Date.now();

      for (let i = 0; i < 500; i++) {
        const randomPastMs = Math.random() * 7 * 24 * 60 * 60 * 1000;
        const txTime = new Date(baseTime - randomPastMs).toISOString();
        const amount = Math.floor(Math.random() * 150) + 10;

        const r1 = Math.random().toString(16).substring(2, 10);
        const r2 = Math.random().toString(16).substring(2, 10);
        const hashR1 = Math.random().toString(36).substring(2, 15);
        const hashR2 = Math.random().toString(36).substring(2, 15);
        const hashR3 = Math.random().toString(36).substring(2, 15);

        mockTxs.push({
          wallet: `0x${r1}000000000000000000000000${r2}`,
          amount,
          txHash: `0x${hashR1}${hashR2}${hashR3}`,
          timestamp: txTime,
          type: Math.random() > 0.8 ? 'spend' : 'reward',
        });
      }

      mockTxs.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      if (typeof window !== 'undefined') {
        localStorage.setItem('sharpflow_transactions', JSON.stringify(mockTxs));
        localStorage.setItem('sharpflow_apicalls', '1540');
      }

      return {
        user: {
          name: 'Pratik Mishra',
          walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
          email: 'pratik@sharpflow.ai',
          avatar: undefined,
        },
        activeProject: {
          name: 'My SharpFlow Dapp',
          apiKey: 'sf_live_4f89d81a92e105b5f8c6b73a218d',
        },
        token: 'sf_jwt_demo_mode_active',
        transactions: mockTxs,
        apiCalls: 1540,
        balance: state.balance + 5000,
        isDemoMode: true,
      };
    });
  },

  generateMockWallet: () => {
    set({
      user: {
        name: 'Demo User',
        email: 'demo@sharpflow.io',
        walletAddress: '0x7A3B9c02dF41092F14B',
      },
      balance: 2500,
      isDemoMode: true,
      token: 'sf_mock_token_12345',
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharpflow_user', JSON.stringify({
        name: 'Demo User',
        email: 'demo@sharpflow.io',
        walletAddress: '0x7A3B9c02dF41092F14B',
      }));
      localStorage.setItem('sharpflow_token', 'sf_mock_token_12345');
      localStorage.setItem('sharpflow_demomode', 'true');
    }
  },

  initLocalStorage: () => {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('sharpflow_user');
    const storedToken = localStorage.getItem('sharpflow_token');
    const storedWizard = localStorage.getItem('sharpflow_wizard_seen');
    const storedProject = localStorage.getItem('sharpflow_project');
    const storedTxs = localStorage.getItem('sharpflow_transactions');
    const storedCalls = localStorage.getItem('sharpflow_apicalls');
    const storedAchievements = localStorage.getItem('sharpflow_achievements');
    const storedLiveMode = localStorage.getItem('sharpflow_live_mode');
    const storedLastBlock = localStorage.getItem('sharpflow_last_block');
    const storedLastBalance = localStorage.getItem('sharpflow_last_balance');
    const storedLastTxHash = localStorage.getItem('sharpflow_last_tx_hash');

    set({
      user: storedUser ? JSON.parse(storedUser) : null,
      token: storedToken || null,
      hasSeenWizard: storedWizard === 'true',
      isHydrated: true,
      activeProject: storedProject ? JSON.parse(storedProject) : null,
      achievements: storedAchievements
        ? JSON.parse(storedAchievements)
        : ALL_ACHIEVEMENTS,
      transactions: storedTxs
        ? JSON.parse(storedTxs)
        : [
            {
              wallet: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
              amount: 50,
              txHash:
                '0x9e3f162db8ea58252277d3bf67b848c9df4101e4a116cfc981a81a1795db2f4a',
              timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
            },
            {
              wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
              amount: 15,
              txHash:
                '0xfa39413280c7d41f173167137f8849b2512f718cb66dfc6ef6e36dcd77ad1b6c',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
          ],
      apiCalls: storedCalls ? parseInt(storedCalls, 10) : 0,
      theme: 'dark',
      isLiveMode: storedLiveMode === 'true',
      lastBlockNumber: storedLastBlock ? parseInt(storedLastBlock, 10) : null,
      lastBalanceSnapshot: storedLastBalance ? parseFloat(storedLastBalance) : 0,
      lastTxHash: storedLastTxHash || null,
    });

    document.documentElement.classList.add('dark');
  },

  setKeys: (keys) => set({ keys }),
  setWebhooks: (webhooks) => set({ webhooks }),
  triggerShockwave: () => set((state) => ({ shockwaveCount: state.shockwaveCount + 1 })),

  setLiveMode: (isLiveMode) => {
    set({ isLiveMode });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharpflow_live_mode', isLiveMode ? 'true' : 'false');
    }
  },
  setSyncState: (syncState) => set({ syncState }),
  setLastBlockNumber: (lastBlockNumber) => {
    set({ lastBlockNumber });
    if (typeof window !== 'undefined') {
      if (lastBlockNumber !== null) {
        localStorage.setItem('sharpflow_last_block', lastBlockNumber.toString());
      } else {
        localStorage.removeItem('sharpflow_last_block');
      }
    }
  },
  setLastBalanceSnapshot: (lastBalanceSnapshot) => {
    set({ lastBalanceSnapshot });
    if (typeof window !== 'undefined') {
      localStorage.setItem('sharpflow_last_balance', lastBalanceSnapshot.toString());
    }
  },
  setLastTxHash: (lastTxHash) => {
    set({ lastTxHash });
    if (typeof window !== 'undefined') {
      if (lastTxHash !== null) {
        localStorage.setItem('sharpflow_last_tx_hash', lastTxHash);
      } else {
        localStorage.removeItem('sharpflow_last_tx_hash');
      }
    }
  },
}));
