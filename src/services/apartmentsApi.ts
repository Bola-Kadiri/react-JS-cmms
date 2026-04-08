// src/services/apartmentsApi.ts
import { api } from './apiClient';
import { Apartment } from '@/types/apartment';

const APARTMENTS_API_BASE = '/facility/api/api/apartments';

export interface ApartmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Apartment[];
}

export interface ApartmentQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all apartments without filtering parameters
export const fetchApartments = async (): Promise<ApartmentsResponse> => {
  try {
    const response = await api.get(`${APARTMENTS_API_BASE}/`);
    
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
    console.error('Error fetching apartments:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single apartment by ID
export const getApartment = async (id: string): Promise<Apartment> => {
  const response = await api.get(`${APARTMENTS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new apartment
export const createApartment = async (apartment: Omit<Apartment, 'id'>): Promise<Apartment> => {
  const response = await api.post(APARTMENTS_API_BASE + '/', apartment);
  return response.data;
};

// Update an existing apartment
export const updateApartment = async ({ id, apartment }: { id: string; apartment: Partial<Apartment> }): Promise<Apartment> => {
  const response = await api.put(`${APARTMENTS_API_BASE}/${id}/`, apartment);
  return response.data;
};

// Delete a apartment
export const deleteApartment = async (id: string): Promise<void> => {
  await api.delete(`${APARTMENTS_API_BASE}/${id}/`);
};