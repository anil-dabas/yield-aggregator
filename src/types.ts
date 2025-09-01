export enum OpportunityCategory {
  STAKING = 'staking',
  LENDING = 'lending',
  VAULT = 'vault',
}

export interface YieldOpportunity {
  id: string;
  name: string;
  provider: string;
  asset: string;
  chain: 'ethereum' | 'solana';
  apr: number | null;
  category: OpportunityCategory;
  liquidity: 'liquid' | 'locked';
  riskScore: number;
  updatedAt: string;
}

export interface ProviderConfig {
  name: string;
  chain: 'ethereum' | 'solana';
  apiUrl: string;
  category: OpportunityCategory;
  liquidity: 'liquid' | 'locked';
  fetchInterval: number; // ms
  parseResponse: (data: any) => { apr: number | null; asset: string; name: string }[];
}

export interface UserProfile {
  walletBalance: { [key: string]: string };
  riskTolerance: number; // 1-10
  maxAllocationPct: number; // e.g., 25
  investmentHorizon: number; // days
}

export interface MatchResponse {
  matchedOpportunities: YieldOpportunity[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}