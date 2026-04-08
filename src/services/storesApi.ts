// src/services/storesApi.ts
import { api } from './apiClient';
import { Store } from '@/types/store';

const STORES_API_BASE = '/asset_inventory/api/stores';

export interface StoresResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Store[];
}

export interface StoreQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all stores without filtering parameters
export const fetchStores = async (): Promise<StoresResponse> => {
  try {
    const response = await api.get(`${STORES_API_BASE}/`);
    
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
    console.error('Error fetching stores:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single store by ID
export const getStore = async (id: string): Promise<Store> => {
  const response = await api.get(`${STORES_API_BASE}/${id}/`);
  return response.data;
};

// Create a new store
export const createStore = async (store: Omit<Store, 'id'>): Promise<Store> => {
  const response = await api.post(STORES_API_BASE + '/', store);
  return response.data;
};

// Update an existing store
export const updateStore = async ({ id, store }: { id: string; store: Partial<Store> }): Promise<Store> => {
  const response = await api.put(`${STORES_API_BASE}/${id}/`, store);
  return response.data;
};

// Delete a store
export const deleteStore = async (id: string): Promise<void> => {
  await api.delete(`${STORES_API_BASE}/${id}/`);
};