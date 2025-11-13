/**
 * API Service Layer
 * 
 * Handles all API communication with the backend server.
 * Provides functions for individual and couple calculations with
 * error handling, timeout configuration, and retry logic.
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  IndividualCalculationInput,
  CoupleCalculationInput,
  IndividualResult,
  CoupleResult,
  ApiError,
  EnhancedIndividualResult,
  EnhancedCoupleResult,
  EnhancedIndividualInput,
  EnhancedCoupleInput,
} from '../types/calculator.types';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

/**
 * Create axios instance with default configuration
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Parse API error response
 */
const parseApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ error: ApiError }>;
    
    // Server responded with error
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
    
    // Network error or timeout
    if (axiosError.code === 'ECONNABORTED') {
      return {
        code: 'TIMEOUT_ERROR',
        message: 'Request timed out. Please try again.',
      };
    }
    
    if (axiosError.code === 'ERR_NETWORK') {
      return {
        code: 'NETWORK_ERROR',
        message: 'Unable to connect to the server. Please check your connection.',
      };
    }
    
    // Generic axios error
    return {
      code: 'REQUEST_ERROR',
      message: axiosError.message || 'An error occurred while making the request.',
    };
  }
  
  // Unknown error
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred.',
  };
};

/**
 * Retry wrapper for API calls
 */
const withRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      // Only retry on network errors or timeouts
      const apiError = parseApiError(error);
      if (apiError.code === 'NETWORK_ERROR' || apiError.code === 'TIMEOUT_ERROR') {
        await sleep(RETRY_DELAY);
        return withRetry(fn, retries - 1);
      }
    }
    throw error;
  }
};

/**
 * Calculate optimal claiming strategy for an individual
 * 
 * @param input - Individual calculation input
 * @returns Individual calculation result
 * @throws ApiError if request fails
 */
export const calculateIndividual = async (
  input: IndividualCalculationInput
): Promise<IndividualResult> => {
  try {
    const response = await withRetry(async () => {
      return await apiClient.post<IndividualResult>('/api/calculate/individual', input);
    });
    
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Calculate optimal claiming strategy for a married couple
 * 
 * @param input - Couple calculation input
 * @returns Couple calculation result
 * @throws ApiError if request fails
 */
export const calculateCouple = async (
  input: CoupleCalculationInput
): Promise<CoupleResult> => {
  try {
    const response = await withRetry(async () => {
      return await apiClient.post<CoupleResult>('/api/calculate/couple', input);
    });
    
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Calculate optimal claiming strategy for an individual with enhanced features
 * Includes present value calculations and year-by-year projections
 * 
 * @param input - Enhanced individual calculation input with optional discount rate
 * @returns Enhanced individual calculation result (backward compatible with IndividualResult)
 * @throws ApiError if request fails
 */
export const calculateIndividualEnhanced = async (
  input: EnhancedIndividualInput
): Promise<EnhancedIndividualResult> => {
  try {
    const response = await withRetry(async () => {
      return await apiClient.post<{ individual: EnhancedIndividualResult }>('/api/calculate/enhanced/individual', input);
    });
    
    // Extract the individual result from the wrapped response
    return response.data.individual;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Calculate optimal claiming strategy for a married couple with enhanced features
 * Includes present value calculations, year-by-year projections, and survivor scenarios
 * 
 * @param input - Enhanced couple calculation input with optional discount rate
 * @returns Enhanced couple calculation result (backward compatible with CoupleResult)
 * @throws ApiError if request fails
 */
export const calculateCoupleEnhanced = async (
  input: EnhancedCoupleInput
): Promise<EnhancedCoupleResult> => {
  try {
    const response = await withRetry(async () => {
      return await apiClient.post<{ couple: EnhancedCoupleResult }>('/api/calculate/enhanced/couple', input);
    });
    
    // Extract the couple result from the wrapped response
    return response.data.couple;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Health check endpoint
 * 
 * @returns Health status
 */
export const checkHealth = async (): Promise<{ status: string; timestamp: string }> => {
  try {
    const response = await apiClient.get('/api/health');
    return response.data;
  } catch (error) {
    throw parseApiError(error);
  }
};

/**
 * Type guard to check if error is ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
};

export default {
  calculateIndividual,
  calculateCouple,
  calculateIndividualEnhanced,
  calculateCoupleEnhanced,
  checkHealth,
  isApiError,
};
