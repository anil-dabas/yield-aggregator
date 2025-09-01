import express from 'express';
import { z } from 'zod';
import { IngestionService } from '../services/ingestionService';
import { MatchingService } from '../services/matchingService';
import { YieldOpportunity, UserProfile, MatchResponse } from '../types';
import { ValidationError, ServiceError, isCustomError } from '../errors';
import { API_ROUTES, ERROR_MESSAGES, PAGINATION_DEFAULTS } from '../constants';

const router = express.Router();
const ingestionService = new IngestionService();

// Request validation schemas
const UserProfileSchema = z.object({
  walletBalance: z.record(z.string(), z.string()),
  riskTolerance: z.number().min(1).max(10),
  maxAllocationPct: z.number().min(0).max(100),
  investmentHorizon: z.number().min(1),
});

const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.PAGE),
  pageSize: z.coerce.number().int().min(1).default(PAGINATION_DEFAULTS.PAGE_SIZE),
}).transform((data) => ({
  page: Number(data.page),
  pageSize: Number(data.pageSize),
}));

// Response validation schemas
const YieldOpportunitySchema = z.object({
  id: z.string(),
  name: z.string(),
  provider: z.string(),
  asset: z.string(),
  chain: z.enum(['ethereum', 'solana']),
  apr: z.number().nullable(),
  category: z.enum(['staking', 'lending', 'vault']),
  liquidity: z.enum(['liquid', 'locked']),
  riskScore: z.number().min(1).max(10),
  updatedAt: z.string(),
});

const MatchResponseSchema = z.object({
  matchedOpportunities: z.array(YieldOpportunitySchema),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  currentPage: z.number().int().min(1),
});

router.get(API_ROUTES.HEALTH, (req, res) => {
  res.status(200).json({ status: 'OK' });
});

router.get(API_ROUTES.OPPORTUNITIES, async (req, res) => {
  try {
    const { page, pageSize } = PaginationSchema.parse(req.query);
    const { opportunities, totalItems, totalPages, currentPage } = await ingestionService.getOpportunities({ page, pageSize });
    const validatedOpportunities = z.array(YieldOpportunitySchema).parse(opportunities);
    res.json({ opportunities: validatedOpportunities, totalItems, totalPages, currentPage });
  } catch (error: unknown) {
    const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
    console.error(`[${new Date().toISOString()}] GET /api/earn/opportunities failed: ${errorMsg}`);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: ERROR_MESSAGES.INVALID_PAGINATION_PARAMS, code: 'VALIDATION_ERROR', details: error.errors });
    } else {
      const err = isCustomError(error) ? error : new ServiceError(ERROR_MESSAGES.FAILED_TO_FETCH_OPPORTUNITIES, 'UNKNOWN_ERROR', { originalError: error });
      res.status(500).json({ error: err.message, code: err.code, details: err.details || {} });
    }
  }
});

router.post(API_ROUTES.MATCH_OPPORTUNITIES, async (req, res) => {
  try {
    const profile = UserProfileSchema.parse(req.body) as UserProfile;
    const { page, pageSize } = PaginationSchema.parse(req.query);
    const { opportunities } = await ingestionService.getOpportunities({ page: 1, pageSize: Number.MAX_SAFE_INTEGER });
    const result = MatchingService.matchOpportunities(opportunities, profile, page, pageSize);
    const validatedResult = MatchResponseSchema.parse(result);
    res.json(validatedResult);
  } catch (error: unknown) {
    const errorMsg = isCustomError(error) ? error.message : 'Unknown error';
    console.error(`[${new Date().toISOString()}] POST /api/earn/opportunities/match failed: ${errorMsg}`);
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.message.includes('query') ? ERROR_MESSAGES.INVALID_PAGINATION_PARAMS : ERROR_MESSAGES.INVALID_REQUEST_BODY, code: 'VALIDATION_ERROR', details: error.errors });
    } else {
      const err = isCustomError(error) ? error : new ServiceError(ERROR_MESSAGES.FAILED_TO_MATCH_OPPORTUNITIES, 'UNKNOWN_ERROR', { originalError: error });
      res.status(500).json({ error: err.message, code: err.code, details: err.details || {} });
    }
  }
});

export default router;