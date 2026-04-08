import { api } from './apiClient';
import { AssetCategory } from '@/types/assetcategory';

const ASSETCATEGORY_API_BASE = '/asset_inventory/api/asset-categories';

export interface AssetCategoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AssetCategory[];
}

export interface AssetCategoryQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  type?: string;
}

// Fetch all asset categories without filtering parameters
export const fetchAssetCategories = async (): Promise<AssetCategoriesResponse> => {
  try {
    const response = await api.get(`${ASSETCATEGORY_API_BASE}/`);
    
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
    console.error('Error fetching asset categories:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single asset category by ID
export const getAssetCategory = async (id: string): Promise<AssetCategory> => {
  const response = await api.get(`${ASSETCATEGORY_API_BASE}/${id}/`);
  return response.data;
};

// Create a new asset category
export const createAssetCategory = async (assetCategory: Omit<AssetCategory, 'id'>): Promise<AssetCategory> => {
  const response = await api.post(ASSETCATEGORY_API_BASE + '/', assetCategory);
  return response.data;
};

// Update an existing asset category
export const updateAssetCategory = async ({ id, assetCategory }: { id: string; assetCategory: Partial<AssetCategory> }): Promise<AssetCategory> => {
  const response = await api.put(`${ASSETCATEGORY_API_BASE}/${id}/`, assetCategory);
  return response.data;
};

// Delete an asset category
export const deleteAssetCategory = async (id: string): Promise<void> => {
  await api.delete(`${ASSETCATEGORY_API_BASE}/${id}/`);
}; 