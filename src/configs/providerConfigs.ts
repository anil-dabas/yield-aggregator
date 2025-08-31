import { OpportunityCategory, ProviderConfig } from '../types';

export const providerConfigs: ProviderConfig[] = [
  {
    name: 'Lido',
    chain: 'ethereum',
    apiUrl: 'https://eth-api.lido.fi/v1/protocol/steth/apr/last',
    category: OpportunityCategory.STAKING,
    liquidity: 'liquid',
    fetchInterval: 60000, // 1 minute
    parseResponse: (data: any) => [
      {
        apr: data.apr / 100,
        asset: 'ETH',
        name: 'Lido ETH Staking',
      },
    ],
  },
  {
    name: 'Marinade',
    chain: 'solana',
    apiUrl: 'https://api.marinade.finance/msol/apy/30d',
    category: OpportunityCategory.STAKING,
    liquidity: 'liquid',
    fetchInterval: 60000,
    parseResponse: (data: any) => [
      {
        apr: data.value / 100,
        asset: 'SOL',
        name: 'Marinade SOL Staking',
      },
    ],
  },
  {
    name: 'DeFiLlama',
    chain: 'ethereum',
    apiUrl: 'https://yields.llama.fi/pools',
    category: OpportunityCategory.VAULT,
    liquidity: 'liquid',
    fetchInterval: 120000, // 2 minutes
    parseResponse: (data: any) =>
        data.data.slice(0, 5).map((pool: any) => ({
          apr: pool.apy / 100,
          asset: pool.symbol.split('-')[0],
          name: `${pool.project} Vault`,
        })),
  },
];