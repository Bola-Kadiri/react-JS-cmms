import { api } from './apiClient';
import { Department } from '@/types/department';

const DEPARTMENTS_API_BASE = '/asset_inventory/api/departments';

export interface DepartmentsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Department[];
}

export interface DepartmentQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all departments without filtering parameters
export const fetchDepartments = async (): Promise<DepartmentsResponse> => {
  try {
    const response = await api.get(`${DEPARTMENTS_API_BASE}/`);
    
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
    console.error('Error fetching departments:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single department by ID
export const getDepartment = async (id: string): Promise<Department> => {
  const response = await api.get(`${DEPARTMENTS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new department
export const createDepartment = async (department: Omit<Department, 'id'>): Promise<Department> => {
  const response = await api.post(DEPARTMENTS_API_BASE + '/', department);
  return response.data;
};

// Update an existing department
export const updateDepartment = async ({ id, department }: { id: string; department: Partial<Department> }): Promise<Department> => {
  const response = await api.put(`${DEPARTMENTS_API_BASE}/${id}/`, department);
  return response.data;
};

// Delete a department
export const deleteDepartment = async (id: string): Promise<void> => {
  await api.delete(`${DEPARTMENTS_API_BASE}/${id}/`);
};