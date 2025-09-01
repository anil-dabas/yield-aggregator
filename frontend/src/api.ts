import axios, { AxiosError } from 'axios';
import { YieldOpportunity, UserProfile, MatchResponse } from './types';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const checkHealth = async (): Promise<{ status: string }> => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const fetchOpportunities = async (page: number = 1, pageSize: number = 10): Promise<{
  opportunities: YieldOpportunity[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}> => {
  try {
    const response = await api.get('/api/earn/opportunities', {
      params: { page, pageSize },
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const matchOpportunities = async (profile: UserProfile, page: number = 1, pageSize: number = 10): Promise<MatchResponse> => {
  try {
    const response = await api.post('/api/earn/opportunities/match', profile, {
      params: { page, pageSize },
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

const handleError = (error: unknown): Error => {
  if (error instanceof AxiosError) {
    return new Error(error.response?.data?.error || error.message);
  }
  return new Error('An unexpected error occurred');
};