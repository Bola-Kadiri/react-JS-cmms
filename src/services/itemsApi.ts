// src/services/itemsApi.ts
import { api } from './apiClient';
import { Item } from '@/types/item';

const ITEMS_API_BASE = '/asset_inventory/api/items';

export interface ItemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Item[];
}

export interface ItemQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all items without filtering parameters
export const fetchItems = async (): Promise<ItemsResponse> => {
  try {
    const response = await api.get(`${ITEMS_API_BASE}/`);
    
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
    console.error('Error fetching items:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single item by ID
export const getItem = async (id: string): Promise<Item> => {
  const response = await api.get(`${ITEMS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new item
export const createItem = async (item: Omit<Item, 'id'>): Promise<Item> => {
  const response = await api.post(ITEMS_API_BASE + '/', item);
  return response.data;
};

// Update an existing item
export const updateItem = async ({ id, item }: { id: string; item: Partial<Item> }): Promise<Item> => {
  const response = await api.put(`${ITEMS_API_BASE}/${id}/`, item);
  return response.data;
};

// Delete an item
export const deleteItem = async (id: string): Promise<void> => {
  await api.delete(`${ITEMS_API_BASE}/${id}/`);
};