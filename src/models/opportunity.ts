import { OpportunityCategory, YieldOpportunity } from '../types';

export class Opportunity {
  static generateId(provider: string, asset: string): string {
    return `${provider}-${asset}-${Date.now()}`;
  }

  static calculateRiskScore(opportunity: YieldOpportunity): number {
    const STABLECOINS = ['USDC', 'USDT', 'DAI', 'FRAX'];
    const MAJOR_ASSETS = ['ETH', 'SOL', 'WETH'];
    let baseRisk: number;

    if (STABLECOINS.includes(opportunity.asset)) {
      baseRisk = Math.floor(Math.random() * 3) + 1; // 1-3
    } else if (MAJOR_ASSETS.includes(opportunity.asset)) {
      baseRisk = Math.floor(Math.random() * 3) + 4; // 4-6
    } else {
      baseRisk = Math.floor(Math.random() * 3) + 7; // 7-9
    }

    const liquidityRisk = opportunity.liquidity === 'locked' ? 1 : 0;
    return Math.min(10, baseRisk + liquidityRisk);
  }

  static normalize(
      providerData: { apr: number | null; asset: string; name: string },
      config: { name: string; chain: 'ethereum' | 'solana'; category: OpportunityCategory; liquidity: 'liquid' | 'locked' }
  ): YieldOpportunity {
    return {
      id: this.generateId(config.name, providerData.asset),
      name: providerData.name,
      provider: config.name,
      asset: providerData.asset,
      chain: config.chain,
      apr: providerData.apr,
      category: config.category,
      liquidity: config.liquidity,
      riskScore: this.calculateRiskScore({
        asset: providerData.asset,
        liquidity: config.liquidity,
        id: '',
        name: '',
        provider: '',
        chain: config.chain,
        apr: providerData.apr,
        category: config.category,
        updatedAt: '',
        riskScore: 0,
      }),
      updatedAt: new Date().toISOString(),
    };
  }
}