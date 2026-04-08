import { api } from './apiClient';
import { InventoryReference } from '@/types/inventoryreference';

const INVENTORYREFERENCE_API_BASE = '/asset_inventory/api/inventory-references';

export interface InventoryReferencesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: InventoryReference[];
}

export interface InventoryReferenceQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  inventory_type?: number;
  category?: number;
  subcategory?: number;
  model_reference?: number;
  manufacturer?: number;
}

// Fetch all inventory references without filtering parameters
export const fetchInventoryReferences = async (): Promise<InventoryReferencesResponse> => {
  try {
    const response = await api.get(`${INVENTORYREFERENCE_API_BASE}/`);
    
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
    console.error('Error fetching inventory references:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single inventory reference by ID
export const getInventoryReference = async (id: string): Promise<InventoryReference> => {
  const response = await api.get(`${INVENTORYREFERENCE_API_BASE}/${id}/`);
  return response.data;
};

// Create a new inventory reference
export const createInventoryReference = async (inventoryReference: Omit<InventoryReference, 'id' | 'category_detail' | 'subcategory_detail'>): Promise<InventoryReference> => {
  const response = await api.post(INVENTORYREFERENCE_API_BASE + '/', inventoryReference);
  return response.data;
};

// Update an existing inventory reference
export const updateInventoryReference = async ({ id, inventoryReference }: { id: string; inventoryReference: Partial<Omit<InventoryReference, 'id' | 'category_detail' | 'subcategory_detail'>> }): Promise<InventoryReference> => {
  const response = await api.put(`${INVENTORYREFERENCE_API_BASE}/${id}/`, inventoryReference);
  return response.data;
};

// Delete an inventory reference
export const deleteInventoryReference = async (id: string): Promise<void> => {
  await api.delete(`${INVENTORYREFERENCE_API_BASE}/${id}/`);
}; 