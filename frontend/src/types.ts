export interface YieldOpportunity {
  id: string;
  name: string;
  provider: string;
  asset: string;
  chain: string;
  apr?: number;
  category: string;
  liquidity: string;
  riskScore: number;
  updatedAt: string;
}

export interface UserProfile {
  walletBalance: {
    ETH: string;
    SOL: string;
    USDC: string;
  };
  riskTolerance: number;
  maxAllocationPct: number;
  investmentHorizon: number;
}

export interface HardcodedUser {
  username: string;
  password: string;
  walletAddress: string;
  walletBalance: {
    ETH: string;
    SOL: string;
    USDC: string;
  };
}