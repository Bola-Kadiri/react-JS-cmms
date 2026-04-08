import { api } from './apiClient';
import { Model } from '@/types/model';

const MODEL_API_BASE = '/asset_inventory/api/model-references';

export interface ModelsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Model[];
}

export interface ModelQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  subcategory?: number;
  manufacturer?: number;
}

// Fetch all models without filtering parameters
export const fetchModels = async (): Promise<ModelsResponse> => {
  try {
    const response = await api.get(`${MODEL_API_BASE}/`);
    
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
    console.error('Error fetching models:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single model by ID
export const getModel = async (id: string): Promise<Model> => {
  const response = await api.get(`${MODEL_API_BASE}/${id}/`);
  return response.data;
};

// Create a new model
export const createModel = async (model: Omit<Model, 'id'>): Promise<Model> => {
  const response = await api.post(MODEL_API_BASE + '/', model);
  return response.data;
};

// Update an existing model
export const updateModel = async ({ id, model }: { id: string; model: Partial<Model> }): Promise<Model> => {
  const response = await api.put(`${MODEL_API_BASE}/${id}/`, model);
  return response.data;
};

// Delete a model
export const deleteModel = async (id: string): Promise<void> => {
  await api.delete(`${MODEL_API_BASE}/${id}/`);
}; 