import axios, { AxiosError } from 'axios';
import { YieldOpportunity, UserProfile } from './types';

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

export const fetchOpportunities = async (): Promise<YieldOpportunity[]> => {
  try {
    const response = await api.get('/api/earn/opportunities');
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

export const matchOpportunities = async (profile: UserProfile): Promise<YieldOpportunity[]> => {
  try {
    const response = await api.post('/api/earn/opportunities/match', profile);
    return response.data.matchedOpportunities;
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
