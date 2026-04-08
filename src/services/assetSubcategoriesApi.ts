import { api } from './apiClient';
import { AssetSubcategory } from '@/types/assetsubcategory';

const ASSETSUBCATEGORY_API_BASE = '/asset_inventory/api/asset-subcategories';

export interface AssetSubcategoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AssetSubcategory[];
}

export interface AssetSubcategoryQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  asset_category?: string;
}

// Fetch all asset subcategories without filtering parameters
export const fetchAssetSubcategories = async (): Promise<AssetSubcategoriesResponse> => {
  try {
    const response = await api.get(`${ASSETSUBCATEGORY_API_BASE}/`);
    
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
    console.error('Error fetching asset subcategories:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single asset subcategory by ID
export const getAssetSubcategory = async (id: string): Promise<AssetSubcategory> => {
  const response = await api.get(`${ASSETSUBCATEGORY_API_BASE}/${id}/`);
  return response.data;
};

// Create a new asset subcategory
export const createAssetSubcategory = async (assetSubcategory: Omit<AssetSubcategory, 'id' | 'asset_category_detail'>): Promise<AssetSubcategory> => {
  const response = await api.post(ASSETSUBCATEGORY_API_BASE + '/', assetSubcategory);
  return response.data;
};

// Update an existing asset subcategory
export const updateAssetSubcategory = async ({ id, assetSubcategory }: { id: string; assetSubcategory: Partial<Omit<AssetSubcategory, 'id' | 'asset_category_detail'>> }): Promise<AssetSubcategory> => {
  const response = await api.put(`${ASSETSUBCATEGORY_API_BASE}/${id}/`, assetSubcategory);
  return response.data;
};

// Delete an asset subcategory
export const deleteAssetSubcategory = async (id: string): Promise<void> => {
  await api.delete(`${ASSETSUBCATEGORY_API_BASE}/${id}/`);
}; 