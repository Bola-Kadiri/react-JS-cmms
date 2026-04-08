// src/services/buildingsApi.ts
import { api } from './apiClient';
import { Landlord } from '@/types/landlord';

const LANDLORDS_API_BASE = '/facility/api/api/landlords';

export interface LandlordsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Landlord[];
}

export interface LandlordQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
}

// Fetch all landlords without filtering parameters
export const fetchLandlords = async (): Promise<LandlordsResponse> => {
  try {
    const response = await api.get(`${LANDLORDS_API_BASE}/`);
    
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
    console.error('Error fetching landlords:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single landlord by ID
export const getLandlord = async (id: string): Promise<Landlord> => {
  const response = await api.get(`${LANDLORDS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new landlord
export const createLandlord = async (landlord: Omit<Landlord, 'id'>): Promise<Landlord> => {
  const response = await api.post(LANDLORDS_API_BASE + '/', landlord);
  return response.data;
};

// Update an existing landlord
export const updateLandlord = async ({ id, landlord }: { id: string; landlord: Partial<Landlord> }): Promise<Landlord> => {
  const response = await api.put(`${LANDLORDS_API_BASE}/${id}/`, landlord);
  return response.data;
};

// Delete a landlord
export const deleteLandlord = async (id: string): Promise<void> => {
  await api.delete(`${LANDLORDS_API_BASE}/${id}/`);
};