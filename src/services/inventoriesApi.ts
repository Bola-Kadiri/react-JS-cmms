// src/services/buildingsApi.ts
import { api } from './apiClient';
import { Inventory } from '@/types/inventory';

const INVENTORIES_API_BASE = '/asset_inventory/api/inventory';

export interface InventoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Inventory[];
}

export interface InventoryQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
//   facility?: string;
}

// Fetch all inventories without filtering parameters
export const fetchInventories = async (): Promise<InventoriesResponse> => {
  try {
    const response = await api.get(`${INVENTORIES_API_BASE}/`);
    
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
    console.error('Error fetching inventories:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single inventory by ID
export const getInventory = async (id: string): Promise<Inventory> => {
  const response = await api.get(`${INVENTORIES_API_BASE}/${id}/`);
  return response.data;
};

// Create a new inventory
export const createInventory = async (inventory: Omit<Inventory, 'id'>): Promise<Inventory> => {
  const response = await api.post(INVENTORIES_API_BASE + '/', inventory);
  return response.data;
};

// Update an existing inventory
export const updateInventory = async ({ id, inventory }: { id: string; inventory: Partial<Inventory> }): Promise<Inventory> => {
  const response = await api.put(`${INVENTORIES_API_BASE}/${id}/`, inventory);
  return response.data;
};

// Delete a inventory
export const deleteInventory = async (id: string): Promise<void> => {
  await api.delete(`${INVENTORIES_API_BASE}/${id}/`);
};