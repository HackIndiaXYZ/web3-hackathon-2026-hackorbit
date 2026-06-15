import { ethers } from 'ethers';

export interface NodeResponse {
  name: string;
  endpoint: string;
  block: number | null;
  status: 'SUCCESS' | 'TIMEOUT' | 'ERROR';
  latency: number;
}

export interface ConsensusResult {
  resolvedBlock: number | null;
  majorityReached: boolean;
  nodes: NodeResponse[];
}

export async function resolveRpcConsensus(
  forceFailEndpoint?: string,
  forceBlockDifference: boolean = false
): Promise<ConsensusResult> {
  const nodes = [
    { name: 'Primary RPC (Polygon)', url: process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc-amoy.polygon.technology' },
    { name: 'Alchemy Testnet', url: 'https://polygon-amoy.g.alchemy.com/v2/mock-key' },
    { name: 'Infura Testnet', url: 'https://polygon-amoy.infura.io/v3/mock-key' }
  ];

  const results: NodeResponse[] = [];
  // Calculate a realistic block number that ticks slowly
  const startBlockBase = 12450800 + Math.floor(Date.now() / 15000);

  for (const node of nodes) {
    const startTime = Date.now();
    
    // Simulate real or mock behavior to avoid CORS or fetch failures blocking the dashboard UI
    const isFailed = forceFailEndpoint === node.name || (Math.random() < 0.08); // 8% chance of spontaneous failure
    const latency = Math.floor(Math.random() * 220) + 40; // 40-260ms

    // Small delay to simulate network latency
    await new Promise((resolve) => setTimeout(resolve, Math.min(latency, 120)));

    if (isFailed) {
      results.push({
        name: node.name,
        endpoint: node.url,
        block: null,
        status: forceFailEndpoint === node.name ? 'TIMEOUT' : 'ERROR',
        latency: latency + 200
      });
    } else {
      let resolvedBlock = startBlockBase;
      
      // If we force block difference (e.g. showing a reorg scenario or fork consensus resolving)
      if (forceBlockDifference && node.name === 'Infura Testnet') {
        resolvedBlock = startBlockBase - 2; // Simulate a delayed block / micro-fork
      } else if (forceBlockDifference && node.name === 'Alchemy Testnet') {
        resolvedBlock = startBlockBase - 1;
      }
      
      results.push({
        name: node.name,
        endpoint: node.url,
        block: resolvedBlock,
        status: 'SUCCESS',
        latency
      });
    }
  }

  // Count frequencies of each block height
  const validBlocks = results
    .filter(r => r.status === 'SUCCESS' && r.block !== null)
    .map(r => r.block as number);

  if (validBlocks.length === 0) {
    return {
      resolvedBlock: null,
      majorityReached: false,
      nodes: results
    };
  }

  const counts: Record<number, number> = {};
  let maxCount = 0;
  let majorityBlock: number | null = null;

  for (const block of validBlocks) {
    counts[block] = (counts[block] || 0) + 1;
    if (counts[block] > maxCount) {
      maxCount = counts[block];
      majorityBlock = block;
    }
  }

  // In a 3-node set, majority is reached if at least 2 nodes agree, or if only 1 node succeeded.
  const majorityReached = maxCount >= 2 || validBlocks.length === 1;

  return {
    resolvedBlock: majorityBlock,
    majorityReached,
    nodes: results
  };
}
