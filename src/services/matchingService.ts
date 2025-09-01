import { YieldOpportunity, UserProfile, MatchResponse } from '../types';
import { ServiceError, isCustomError } from '../errors';
import { ERROR_MESSAGES } from '../constants';

export class MatchingService {
  static matchOpportunities(
      opportunities: YieldOpportunity[],
      profile: UserProfile,
      page: number = 1,
      pageSize: number = 10
  ): MatchResponse {
    try {
      const matched = opportunities.filter((opp) => {
        const balance = parseFloat(profile.walletBalance[opp.asset] || '0');
        if (isNaN(balance)) {
          console.warn(`[${new Date().toISOString()}] Invalid balance for asset ${opp.asset} in user profile`);
          return false;
        }
        const minInvestment = 0.01; // Assume small min investment
        const isSufficientBalance = balance >= minInvestment;
        const isRiskAcceptable = opp.riskScore <= profile.riskTolerance;
        const isLiquiditySuitable =
            profile.investmentHorizon < 30 ? opp.liquidity === 'liquid' : true;
        const totalBalance = Object.values(profile.walletBalance).reduce((sum, val) => {
          const num = parseFloat(val);
          return isNaN(num) ? sum : sum + num;
        }, 0);
        const isAllocationReasonable = totalBalance > 0
            ? (minInvestment / totalBalance) * 100 <= profile.maxAllocationPct
            : false;

        return isSufficientBalance && isRiskAcceptable && isLiquiditySuitable && isAllocationReasonable;
      });

      const totalItems = matched.length;
      const totalPages = Math.ceil(totalItems / pageSize);
      const currentPage = Math.max(1, Math.min(page, totalPages));
      const start = (currentPage - 1) * pageSize;
      const paginatedMatched = matched.slice(start, start + pageSize);

      return { matchedOpportunities: paginatedMatched, totalItems, totalPages, currentPage };
    } catch (error: unknown) {
      const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
      console.error(`[${new Date().toISOString()}] Failed to match opportunities: ${errorMsg}`);
      throw new ServiceError(ERROR_MESSAGES.FAILED_TO_MATCH_OPPORTUNITIES, 'MATCHING_ERROR', { originalError: error });
    }
  }
}