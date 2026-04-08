import { api } from './apiClient';
import { Manufacturer } from '@/types/manufacturer';

const MANUFACTURER_API_BASE = '/asset_inventory/api/manufacturers';

export interface ManufacturersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Manufacturer[];
}

export interface ManufacturerQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}

// Fetch all manufacturers without filtering parameters
export const fetchManufacturers = async (): Promise<ManufacturersResponse> => {
  try {
    const response = await api.get(`${MANUFACTURER_API_BASE}/`);
    
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
    console.error('Error fetching manufacturers:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single manufacturer by ID
export const getManufacturer = async (id: string): Promise<Manufacturer> => {
  const response = await api.get(`${MANUFACTURER_API_BASE}/${id}/`);
  return response.data;
};

// Create a new manufacturer
export const createManufacturer = async (manufacturer: Omit<Manufacturer, 'id'>): Promise<Manufacturer> => {
  const response = await api.post(MANUFACTURER_API_BASE + '/', manufacturer);
  return response.data;
};

// Update an existing manufacturer
export const updateManufacturer = async ({ id, manufacturer }: { id: string; manufacturer: Partial<Manufacturer> }): Promise<Manufacturer> => {
  const response = await api.put(`${MANUFACTURER_API_BASE}/${id}/`, manufacturer);
  return response.data;
};

// Delete a manufacturer
export const deleteManufacturer = async (id: string): Promise<void> => {
  await api.delete(`${MANUFACTURER_API_BASE}/${id}/`);
}; 