// src/services/ppmitemsApi.ts
import { api } from './apiClient';
import { PPMItem } from '@/types/ppmitem';

const PPMITEMS_API_BASE = '/work/api/ppm-items';

export interface PPMItemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PPMItem[];
}

export interface PPMItemQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all ppm items without filtering parameters
export const fetchPPMItems = async (): Promise<PPMItemsResponse> => {
  try {
    const response = await api.get(`${PPMITEMS_API_BASE}/`);
    
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
    console.error('Error fetching ppm items:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single ppm item by ID
export const getPPMItem = async (id: string): Promise<PPMItem> => {
  const response = await api.get(`${PPMITEMS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new ppm item
export const createPPMItem = async (ppmitem: Omit<PPMItem, 'id' | 'total_price'>): Promise<PPMItem> => {
  const response = await api.post(PPMITEMS_API_BASE + '/', ppmitem);
  return response.data;
};

// Update an existing ppm item (PUT)
export const updatePPMItem = async ({ id, ppmitem }: { id: string; ppmitem: Partial<PPMItem> }): Promise<PPMItem> => {
  const response = await api.put(`${PPMITEMS_API_BASE}/${id}/`, ppmitem);
  return response.data;
};

// Partial update an existing ppm item (PATCH)
export const patchPPMItem = async ({ id, ppmitem }: { id: string; ppmitem: Partial<PPMItem> }): Promise<PPMItem> => {
  const response = await api.patch(`${PPMITEMS_API_BASE}/${id}/`, ppmitem);
  return response.data;
};

// Delete a ppm item
export const deletePPMItem = async (id: string): Promise<void> => {
  await api.delete(`${PPMITEMS_API_BASE}/${id}/`);
};
