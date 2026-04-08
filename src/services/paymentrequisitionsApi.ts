// src/services/paymentrequisitionsApi.ts
import { api } from './apiClient';
import { Paymentrequisition } from '@/types/paymentrequisition';

const PAYMENTREQUISITIONS_API_BASE = '/work/api/payment-requisitions';

export interface PaymentrequisitionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Paymentrequisition[];
}

export interface PaymentrequisitionQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all paymentrequisitions without filtering parameters
export const fetchPaymentrequisitions = async (): Promise<PaymentrequisitionsResponse> => {
  try {
    const response = await api.get(`${PAYMENTREQUISITIONS_API_BASE}/`);
    
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
    console.error('Error fetching paymentrequisitions:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single paymentrequisition by ID
export const getPaymentrequisition = async (id: string): Promise<Paymentrequisition> => {
  const response = await api.get(`${PAYMENTREQUISITIONS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new paymentrequisition
export const createPaymentrequisition = async (paymentrequisition: Omit<Paymentrequisition, 'id'>): Promise<Paymentrequisition> => {
  const response = await api.post(PAYMENTREQUISITIONS_API_BASE + '/', paymentrequisition);
  return response.data;
};

// Update an existing paymentrequisition
export const updatePaymentrequisition = async ({ id, paymentrequisition }: { id: string; paymentrequisition: Partial<Paymentrequisition> }): Promise<Paymentrequisition> => {
  const response = await api.put(`${PAYMENTREQUISITIONS_API_BASE}/${id}/`, paymentrequisition);
  return response.data;
};

// Delete a paymentrequisition
export const deletePaymentrequisition = async (id: string): Promise<void> => {
  await api.delete(`${PAYMENTREQUISITIONS_API_BASE}/${id}/`);
};