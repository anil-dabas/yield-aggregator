export interface YieldOpportunity {
  id: string;
  name: string;
  provider: string;
  asset: string;
  chain: 'ethereum' | 'solana';
  apr: number | null;
  category: string;
  liquidity: 'liquid' | 'locked';
  riskScore: number;
  updatedAt: string;
}

export interface UserProfile {
  walletBalance: {
    [key: string]: string;
  };
  riskTolerance: number;
  maxAllocationPct: number;
  investmentHorizon: number;
}

export interface MatchResponse {
  matchedOpportunities: YieldOpportunity[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}