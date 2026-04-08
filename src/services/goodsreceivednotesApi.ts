import { api } from './apiClient';
import { Goodsreceivednote } from '@/types/goodsreceivednote';

const GOODSRECEIVEDNOTES_API_BASE = '/procurement/api/goods-received-note';

export interface GoodsreceivednotesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Goodsreceivednote[];
}

export interface GoodsreceivednoteQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all goodsreceivednotes without filtering parameters
export const fetchGoodsreceivednotes = async (): Promise<GoodsreceivednotesResponse> => {
  try {
    const response = await api.get(`${GOODSRECEIVEDNOTES_API_BASE}/`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns { success, message, data: [...] } structure
      if (response.data.success && Array.isArray(response.data.data)) {
        return {
          count: response.data.data.length,
          next: null,
          previous: null,
          results: response.data.data
        };
      }
      
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
    console.error('Error fetching goodsreceivednotes:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single goodsreceivednote by ID
export const getGoodsreceivednote = async (id: string): Promise<Goodsreceivednote> => {
  const response = await api.get(`${GOODSRECEIVEDNOTES_API_BASE}/${id}/`);
  
  // If the API returns { success, message, data } structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fallback to direct data if structure is different
  return response.data;
};

// Create a new goodsreceivednote
export const createGoodsreceivednote = async (goodsreceivednote: any): Promise<Goodsreceivednote> => {
  const response = await api.post(GOODSRECEIVEDNOTES_API_BASE + '/', goodsreceivednote);
  
  // If the API returns { success, message, data } structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fallback to direct data if structure is different
  return response.data;
};

// Update an existing goodsreceivednote
export const updateGoodsreceivednote = async ({ id, goodsreceivednote }: { id: string; goodsreceivednote: any }): Promise<Goodsreceivednote> => {
  const response = await api.put(`${GOODSRECEIVEDNOTES_API_BASE}/${id}/`, goodsreceivednote);
  
  // If the API returns { success, message, data } structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fallback to direct data if structure is different
  return response.data;
};

// Delete a goodsreceivednote
export const deleteGoodsreceivednote = async (id: string): Promise<void> => {
  await api.delete(`${GOODSRECEIVEDNOTES_API_BASE}/${id}/`);
};