// src/services/subsystemsApi.ts
import { api } from './apiClient';
import { Subsystem } from '@/types/subsystem';

const SUBSYSTEMS_API_BASE = '/facility/api/api/subsystems';

export interface SubsystemsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Subsystem[];
}

export interface SubsystemQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  facility?: string;
}

// Fetch all subsystems without filtering parameters
export const fetchSubsystems = async (): Promise<SubsystemsResponse> => {
  try {
    const response = await api.get(`${SUBSYSTEMS_API_BASE}/`);
    
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
    console.error('Error fetching subsystems:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Fetch all buildings by facility 
export const fetchSubsystemBuildingsByFacility = async (id: string): Promise<Subsystem[]> => {
  try {
    const response = await api.get(`${SUBSYSTEMS_API_BASE}/buildings-by-facility/${id}/`);
    
    return response.data;
    
  } catch (error) {
    console.error('Error fetching subsystems:', error);
    return [];
  }
};

// Get a single subsystem by ID
export const getSubsystem = async (id: string): Promise<Subsystem> => {
  const response = await api.get(`${SUBSYSTEMS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new subsystem
export const createSubsystem = async (subsystem: Omit<Subsystem, 'id'>): Promise<Subsystem> => {
  const response = await api.post(SUBSYSTEMS_API_BASE + '/', subsystem);
  return response.data;
};

// Update an existing subsystem
export const updateSubsystem = async ({ id, subsystem }: { id: string; subsystem: Partial<Subsystem> }): Promise<Subsystem> => {
  const response = await api.put(`${SUBSYSTEMS_API_BASE}/${id}/`, subsystem);
  return response.data;
};

// Delete a subsystem
export const deleteSubsystem = async (id: string): Promise<void> => {
  await api.delete(`${SUBSYSTEMS_API_BASE}/${id}/`);
};