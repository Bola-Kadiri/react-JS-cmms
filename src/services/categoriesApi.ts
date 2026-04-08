// src/services/buildingsApi.ts
import { api } from './apiClient';
import { Category } from '@/types/category';
import { SubCat } from '@/types/category';

const CATEGORIES_API_BASE = '/accounts/api/categories';

export interface CategoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Category[];
}

export interface CategoryQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
}

// Fetch all categories without filtering parameters
export const fetchCategories = async (): Promise<CategoriesResponse> => {
  try {
    const response = await api.get(`${CATEGORIES_API_BASE}/`);
    
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
    console.error('Error fetching categories:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single category by ID
export const getCategory = async (id: string): Promise<Category> => {
  const response = await api.get(`${CATEGORIES_API_BASE}/${id}/`);
  return response.data;
};

// Create a new category
export const createCategory = async (category: Omit<Category, 'id'>): Promise<Category> => {
  const response = await api.post(CATEGORIES_API_BASE + '/', category);
  return response.data;
};

// Create a new sub category
export const createSubCategory = async ({ id, subCat }: { id: string; subCat: Partial<SubCat> }): Promise<SubCat> => {
  const response = await api.post(`${CATEGORIES_API_BASE}/${id}/subcategories/`, subCat);
  return response.data;
};

// Update an existing category
export const updateCategory = async ({ id, category }: { id: string; category: Partial<Category> }): Promise<Category> => {
  const response = await api.put(`${CATEGORIES_API_BASE}/${id}/`, category);
  return response.data;
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  await api.delete(`${CATEGORIES_API_BASE}/${id}/`);
};