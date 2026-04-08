// src/services/buildingsApi.ts
import { api } from './apiClient';
import { Subcategory } from '@/types/subcategory';

const SUBCATEGORIES_API_BASE = '/accounts/api/subcategories';

export interface SubcategoriesResponse {
 count: number;
 next: string | null;
 previous: string | null;
 results: Subcategory[];
}

export interface SubcategoryQueryParams {
 page?: number;
 page_size?: number;
 search?: string;
 status?: string;
 facility?: string;
}

// Fetch all subcategories without filtering parameters
export const fetchSubcategories = async (): Promise<SubcategoriesResponse> => {
 try {
   const response = await api.get(`${SUBCATEGORIES_API_BASE}/`);
   
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
   console.error('Error fetching subcategories:', error);
   return {
     count: 0,
     next: null,
     previous: null,
     results: []
   };
 }
};

// Get a single subcategory by ID
export const getSubcategory = async (id: string): Promise<Subcategory> => {
 const response = await api.get(`${SUBCATEGORIES_API_BASE}/${id}/`);
 return response.data;
};

// Create a new subcategory
export const createSubcategory = async (subcategory: Omit<Subcategory, 'id'>): Promise<Subcategory> => {
 const response = await api.post(SUBCATEGORIES_API_BASE + '/', subcategory);
 return response.data;
};

// Update an existing subcategory
export const updateSubcategory = async ({ id, subcategory }: { id: string; subcategory: Partial<Subcategory> }): Promise<Subcategory> => {
 const response = await api.put(`${SUBCATEGORIES_API_BASE}/${id}/`, subcategory);
 return response.data;
};

// Delete a subcategory
export const deleteSubcategory = async (id: string): Promise<void> => {
 await api.delete(`${SUBCATEGORIES_API_BASE}/${id}/`);
};