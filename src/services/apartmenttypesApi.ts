// src/services/apartmenttypesApi.ts
import { api } from './apiClient';
import { Apartmenttype } from '@/types/apartmenttype';

const APARTMENTTYPES_API_BASE = '/facility/api/api/apartment-types';

export interface ApartmenttypesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Apartmenttype[];
}

export interface ApartmenttypeQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all apartmenttypes without filtering parameters
export const fetchApartmenttypes = async (): Promise<ApartmenttypesResponse> => {
  try {
    const response = await api.get(`${APARTMENTTYPES_API_BASE}/`);
    
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
    console.error('Error fetching apartmenttypes:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single apartmenttype by ID
export const getApartmenttype = async (slug: string): Promise<Apartmenttype> => {
  const response = await api.get(`${APARTMENTTYPES_API_BASE}/${slug}/`);
  return response.data;
};

// Create a new apartmenttype
export const createApartmenttype = async (apartmenttype: Omit<Apartmenttype, 'id'>): Promise<Apartmenttype> => {
  const response = await api.post(APARTMENTTYPES_API_BASE + '/', apartmenttype);
  return response.data;
};

// Update an existing apartmenttype
export const updateApartmenttype = async ({ slug, apartmenttype }: { slug: string; apartmenttype: Partial<Apartmenttype> }): Promise<Apartmenttype> => {
  const response = await api.put(`${APARTMENTTYPES_API_BASE}/${slug}/`, apartmenttype);
  return response.data;
};

// Delete a apartmenttype
export const deleteApartmenttype = async (slug: string): Promise<void> => {
  await api.delete(`${APARTMENTTYPES_API_BASE}/${slug}/`);
};