// src/services/buildingsApi.ts
import { api } from './apiClient';
import { Asset } from '@/types/asset';

const ASSETS_API_BASE = '/asset_inventory/api/assets';

export interface AssetsResponse {
 count: number;
 next: string | null;
 previous: string | null;
 results: Asset[];
}

export interface AssetQueryParams {
 page?: number;
 page_size?: number;
 search?: string;
 status?: string;
 facility?: string;
}

// Fetch all assets without filtering parameters
export const fetchAssets = async (): Promise<AssetsResponse> => {
 try {
   const response = await api.get(`${ASSETS_API_BASE}/`);
   
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
   console.error('Error fetching assets:', error);
   return {
     count: 0,
     next: null,
     previous: null,
     results: []
   };
 }
};

// Get a single asset by ID
export const getAsset = async (id: string): Promise<Asset> => {
 const response = await api.get(`${ASSETS_API_BASE}/${id}/`);
 return response.data;
};

// Create a new asset
export const createAsset = async (asset: Omit<Asset, 'id'>): Promise<Asset> => {
 const response = await api.post(ASSETS_API_BASE + '/', asset);
 return response.data;
};

// Update an existing asset
export const updateAsset = async ({ id, asset }: { id: string; asset: Partial<Asset> }): Promise<Asset> => {
 const response = await api.put(`${ASSETS_API_BASE}/${id}/`, asset);
 return response.data;
};

// Delete a asset
export const deleteAsset = async (id: string): Promise<void> => {
 await api.delete(`${ASSETS_API_BASE}/${id}/`);
};