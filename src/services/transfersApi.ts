// src/services/buildingsApi.ts
import { api } from './apiClient';
import { Transfer } from '@/types/transfer';

const TRANSFERS_API_BASE = '/asset_inventory/api/transfers';

export interface TransfersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Transfer[];
}

export interface TransferQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string; //
  facility?: string;
}

// Fetch all transfers without filtering parameters
export const fetchTransfers = async (): Promise<TransfersResponse> => {
  try {
    const response = await api.get(`${TRANSFERS_API_BASE}/`);
    
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
    console.error('Error fetching transfers:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single transfer by ID
export const getTransfer = async (id: string): Promise<Transfer> => {
  const response = await api.get(`${TRANSFERS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new transfer
export const createTransfer = async (transfer: Omit<Transfer, 'id'>): Promise<Transfer> => {
  const response = await api.post(TRANSFERS_API_BASE + '/', transfer);
  return response.data;
};

// Update an existing transfer
export const updateTransfer = async ({ id, transfer }: { id: string; transfer: Partial<Transfer> }): Promise<Transfer> => {
  const response = await api.put(`${TRANSFERS_API_BASE}/${id}/`, transfer);
  return response.data;
};

// Delete a transfer
export const deleteTransfer = async (id: string): Promise<void> => {
  await api.delete(`${TRANSFERS_API_BASE}/${id}/`);
};