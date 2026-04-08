// src/services/paymentcommentsApi.ts
import { api } from './apiClient';
import { Paymentcomment } from '@/types/paymentComment';

// URL
const PAYMENTCOMMENTS_API_BASE = '/work/api/payment-comments';

export interface PaymentcommentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Paymentcomment[];
}

export interface PaymentcommentQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all paymentcomments without filtering parameters
export const fetchPaymentcomments = async (): Promise<PaymentcommentsResponse> => {
  try {
    const response = await api.get(`${PAYMENTCOMMENTS_API_BASE}/`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns an array directly instead of a paginated response
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }
      
      // If the API returns paginated data
      if (Array.isArray(response.data.results)) {
        return {
          count: response.data.count || response.data.results.length,
          next: response.data.next || null,
          previous: response.data.previous || null,
          results: response.data.results
        };
      }
    }
    
    // Default fallback if the structure doesn't match expected format
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
    
  } catch (error) {
    console.error('Error fetching paymentcomments:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single paymentcomment by ID
export const getPaymentcomment = async (id: string): Promise<Paymentcomment> => {
  const response = await api.get(`${PAYMENTCOMMENTS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new paymentcomment
export const createPaymentcomment = async (paymentcomment: Omit<Paymentcomment, 'id'>): Promise<Paymentcomment> => {
  const response = await api.post(PAYMENTCOMMENTS_API_BASE + '/', paymentcomment);
  return response.data;
};

// Update an existing paymentcomment
export const updatePaymentcomment = async ({ id, paymentcomment }: { id: string; paymentcomment: Partial<Paymentcomment> }): Promise<Paymentcomment> => {
  const response = await api.put(`${PAYMENTCOMMENTS_API_BASE}/${id}/`, paymentcomment);
  return response.data;
};

// Delete a paymentcomment
export const deletePaymentcomment = async (id: string): Promise<void> => {
  await api.delete(`${PAYMENTCOMMENTS_API_BASE}/${id}/`);
};