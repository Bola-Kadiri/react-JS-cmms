// src/services/paymentitemsApi.ts
import { api } from './apiClient';
import { Paymentitem } from '@/types/paymentitem';

const PAYMENTITEMS_API_BASE = '/work/api/payment-items';

export interface PaymentitemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Paymentitem[];
}

export interface PaymentitemQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all paymentitems without filtering parameters
export const fetchPaymentitems = async (): Promise<PaymentitemsResponse> => {
  try {
    const response = await api.get(`${PAYMENTITEMS_API_BASE}/`);
    
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
    console.error('Error fetching paymentitems:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single paymentitem by ID
export const getPaymentitem = async (id: string): Promise<Paymentitem> => {
  const response = await api.get(`${PAYMENTITEMS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new paymentitem
export const createPaymentitem = async (paymentitem: Omit<Paymentitem, 'id'>): Promise<Paymentitem> => {
  const response = await api.post(PAYMENTITEMS_API_BASE + '/', paymentitem);
  return response.data;
};

// Update an existing paymentitem
export const updatePaymentitem = async ({ id, paymentitem }: { id: string; paymentitem: Partial<Paymentitem> }): Promise<Paymentitem> => {
  const response = await api.put(`${PAYMENTITEMS_API_BASE}/${id}/`, paymentitem);
  return response.data;
};

// Delete a paymentitem
export const deletePaymentitem = async (id: string): Promise<void> => {
  await api.delete(`${PAYMENTITEMS_API_BASE}/${id}/`);
};