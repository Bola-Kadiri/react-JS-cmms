// src/services/facilitiesApi.ts
import { api } from './apiClient';
import { Facility } from '@/types/facility';

const FACILITIES_API_BASE = '/facility/api/api/facilities';

export interface FacilitiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Facility[];
}

export interface FacilityQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all facilities without filtering parameters
export const fetchFacilities = async (): Promise<FacilitiesResponse> => {
  try {
    const response = await api.get(`${FACILITIES_API_BASE}/`);
    
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
    console.error('Error fetching facilities:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Fetch facilities assigned to the authenticated user
export const fetchUserFacilities = async (): Promise<FacilitiesResponse> => {
  try {
    const response = await api.get('/facility/api/api/facilities/user-facilities/');
    
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
    console.error('Error fetching user facilities:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single facility by ID
export const getFacility = async (code: string): Promise<Facility> => {
  const response = await api.get(`${FACILITIES_API_BASE}/${code}/`);
  return response.data;
};

// Create a new facility
export const createFacility = async (facility: Omit<Facility, 'id'>): Promise<Facility> => {
  const response = await api.post(FACILITIES_API_BASE + '/', facility);
  return response.data;
};

// Update an existing facility
export const updateFacility = async ({ code, facility }: { code: string; facility: Partial<Facility> }): Promise<Facility> => {
  const response = await api.put(`${FACILITIES_API_BASE}/${code}/`, facility);
  return response.data;
};

// Delete a facility
export const deleteFacility = async (code: string): Promise<void> => {
  await api.delete(`${FACILITIES_API_BASE}/${code}/`);
};