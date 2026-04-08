import { api } from './apiClient';
import { InventoryType } from '@/types/inventorytype';

const INVENTORYTYPE_API_BASE = '/asset_inventory/api/inventory-types';

export interface InventoryTypesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InventoryType[];
}

export interface InventoryTypeQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  type?: string;
}

// Fetch all inventory types without filtering parameters
export const fetchInventoryTypes = async (): Promise<InventoryTypesResponse> => {
  try {
    const response = await api.get(`${INVENTORYTYPE_API_BASE}/`);
    
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
    console.error('Error fetching inventory types:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single inventory type by ID
export const getInventoryType = async (id: string): Promise<InventoryType> => {
  const response = await api.get(`${INVENTORYTYPE_API_BASE}/${id}/`);
  return response.data;
};

// Create a new inventory type
export const createInventoryType = async (inventoryType: Omit<InventoryType, 'id'>): Promise<InventoryType> => {
  const response = await api.post(INVENTORYTYPE_API_BASE + '/', inventoryType);
  return response.data;
};

// Update an existing inventory type
export const updateInventoryType = async ({ id, inventoryType }: { id: string; inventoryType: Partial<InventoryType> }): Promise<InventoryType> => {
  const response = await api.put(`${INVENTORYTYPE_API_BASE}/${id}/`, inventoryType);
  return response.data;
};

// Delete an inventory type
export const deleteInventoryType = async (id: string): Promise<void> => {
  await api.delete(`${INVENTORYTYPE_API_BASE}/${id}/`);
}; 