// src/services/warehousesApi.ts
import { api } from './apiClient';
import { Warehouse } from '@/types/warehouse';

const WAREHOUSES_API_BASE = '/asset_inventory/api/warehouses';

export interface WarehousesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Warehouse[];
}

export interface WarehouseQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all warehouses without filtering parameters
export const fetchWarehouses = async (): Promise<WarehousesResponse> => {
  try {
    const response = await api.get(`${WAREHOUSES_API_BASE}/`);
    
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
    console.error('Error fetching warehouses:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single warehouse by ID
export const getWarehouse = async (id: string): Promise<Warehouse> => {
  const response = await api.get(`${WAREHOUSES_API_BASE}/${id}/`);
  return response.data;
};

// Create a new warehouse
export const createWarehouse = async (warehouse: Omit<Warehouse, 'id'>): Promise<Warehouse> => {
  const response = await api.post(WAREHOUSES_API_BASE + '/', warehouse);
  return response.data;
};

// Update an existing warehouse
export const updateWarehouse = async ({ id, warehouse }: { id: string; warehouse: Partial<Warehouse> }): Promise<Warehouse> => {
  const response = await api.put(`${WAREHOUSES_API_BASE}/${id}/`, warehouse);
  return response.data;
};

// Delete a warehouse
export const deleteWarehouse = async (id: string): Promise<void> => {
  await api.delete(`${WAREHOUSES_API_BASE}/${id}/`);
};