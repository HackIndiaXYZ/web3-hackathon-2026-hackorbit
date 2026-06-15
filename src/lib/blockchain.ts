import { ethers } from 'ethers';
import { SHARP_TOKEN_ABI } from './sharpTokenAbi';

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const RPC_URL = process.env.RPC_URL || '';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

export interface BlockchainTransaction {
  txHash: string;
  wallet: string;
  amount: number;
  type: 'REWARD' | 'SPEND';
  timestamp: string;
}

// Stateful fallback mocks for local demo
const mockTransactions: BlockchainTransaction[] = [
  {
    txHash: '0x9e3f162db8ea58252277d3bf67b848c9df4101e4a116cfc981a81a1795db2f4a',
    wallet: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    amount: 50,
    type: 'REWARD',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    txHash: '0xfa39413280c7d41f173167137f8849b2512f718cb66dfc6ef6e36dcd77ad1b6c',
    wallet: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    amount: 15,
    type: 'SPEND',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
];

const mockBalances: Record<string, number> = {
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': 500,
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': 250,
};

export const isLiveBlockchain = !!(CONTRACT_ADDRESS && RPC_URL && PRIVATE_KEY);

export async function rewardUserOnChain(userAddress: string, amount: number) {
  if (!isLiveBlockchain) {
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const tx: BlockchainTransaction = {
      txHash,
      wallet: userAddress,
      amount,
      type: 'REWARD',
      timestamp: new Date().toISOString(),
    };
    mockTransactions.unshift(tx);
    mockBalances[userAddress] = (mockBalances[userAddress] || 0) + amount;
    return {
      success: true,
      txHash,
      mock: true,
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SHARP_TOKEN_ABI, wallet);

    const parsedAmount = ethers.parseEther(amount.toString());
    const tx = await contract.rewardUser(userAddress, parsedAmount);
    await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      mock: false,
    };
  } catch (error: any) {
    console.error('Blockchain Reward Error:', error);
    throw new Error(error.message || 'Failed to reward user on-chain.');
  }
}

export async function spendTokensOnChain(userAddress: string, amount: number) {
  if (!isLiveBlockchain) {
    const balance = mockBalances[userAddress] || 0;
    if (balance < amount) {
      throw new Error('Deduction amount exceeds balance');
    }
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const tx: BlockchainTransaction = {
      txHash,
      wallet: userAddress,
      amount,
      type: 'SPEND',
      timestamp: new Date().toISOString(),
    };
    mockTransactions.unshift(tx);
    mockBalances[userAddress] = balance - amount;
    return {
      success: true,
      txHash,
      mock: true,
    };
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SHARP_TOKEN_ABI, wallet);

    const parsedAmount = ethers.parseEther(amount.toString());
    const tx = await contract.spendTokens(userAddress, parsedAmount);
    await tx.wait();

    return {
      success: true,
      txHash: tx.hash,
      mock: false,
    };
  } catch (error: any) {
    console.error('Blockchain Spend Error:', error);
    throw new Error(error.message || 'Failed to spend tokens on-chain.');
  }
}

export async function getBalanceOnChain(userAddress: string) {
  if (!isLiveBlockchain) {
    return mockBalances[userAddress] || 0;
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, SHARP_TOKEN_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    return parseFloat(ethers.formatEther(balance));
  } catch (error: any) {
    console.error('Blockchain Balance Error:', error);
    return 0;
  }
}

export async function getMockTransactions() {
  return mockTransactions;
}
