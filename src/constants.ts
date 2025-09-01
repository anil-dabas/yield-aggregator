/**
 * Constants for API routes, error messages, and default values.
 */
export const API_ROUTES = {
  HEALTH: '/health',
  OPPORTUNITIES: '/api/earn/opportunities',
  MATCH_OPPORTUNITIES: '/api/earn/opportunities/match',
} as const;

export const ERROR_MESSAGES = {
  INVALID_REQUEST_BODY: 'Invalid request body',
  FAILED_TO_FETCH_OPPORTUNITIES: 'Failed to fetch opportunities',
  FAILED_TO_MATCH_OPPORTUNITIES: 'Failed to match opportunities',
  INVALID_PAGINATION_PARAMS: 'Invalid pagination parameters',
  SERVER_STARTUP_FAILED: 'Server startup failed',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 10,
  PAGE: 1,
}