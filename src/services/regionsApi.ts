// src/services/regionsApi.ts
import { api } from './apiClient';
import { Region } from '@/types/region';

const REGIONS_API_BASE = '/facility/api/api/regions';

export interface RegionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Region[];
}

export interface RegionQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  facility?: string;
}

// Fetch all regions without filtering parameters
export const fetchRegions = async (): Promise<RegionsResponse> => {
  try {
    const response = await api.get(`${REGIONS_API_BASE}/`);
    
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
    console.error('Error fetching regions:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single region by ID
export const getRegion = async (id: string): Promise<Region> => {
  const response = await api.get(`${REGIONS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new region
export const createRegion = async (region: Omit<Region, 'id'>): Promise<Region> => {
  const response = await api.post(REGIONS_API_BASE + '/', region);
  return response.data;
};

// Update an existing region
export const updateRegion = async ({ id, region }: { id: string; region: Partial<Region> }): Promise<Region> => {
  const response = await api.put(`${REGIONS_API_BASE}/${id}/`, region);
  return response.data;
};

// Delete a region
export const deleteRegion = async (id: string): Promise<void> => {
  await api.delete(`${REGIONS_API_BASE}/${id}/`);
};