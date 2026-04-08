// src/services/buildingsApi.ts
import { api } from './apiClient';
import { Building } from '@/types/building';

const BUILDINGS_API_BASE = '/facility/api/api/buildings';

export interface BuildingsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Building[];
}

export interface BuildingQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  facility?: string;
}

// Fetch all buildings without filtering parameters
export const fetchBuildings = async (): Promise<BuildingsResponse> => {
  try {
    const response = await api.get(`${BUILDINGS_API_BASE}/`);
    
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
    console.error('Error fetching buildings:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Fetch all building zones without by facility
export const fetchBuildingZoneByFacility = async (id: string): Promise<Building[]> => {
  try {
    const response = await api.get(`${BUILDINGS_API_BASE}/zones-by-facility/${id}/`);
    
    return response.data;
    
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return []
  }
};

// Get a single building by ID
export const getBuilding = async (id: string): Promise<Building> => {
  const response = await api.get(`${BUILDINGS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new building
export const createBuilding = async (building: Omit<Building, 'id'>): Promise<Building> => {
  const response = await api.post(BUILDINGS_API_BASE + '/', building);
  return response.data;
};

// Update an existing building
export const updateBuilding = async ({ id, building }: { id: string; building: Partial<Building> }): Promise<Building> => {
  const response = await api.put(`${BUILDINGS_API_BASE}/${id}/`, building);
  return response.data;
};

// Delete a building
export const deleteBuilding = async (id: string): Promise<void> => {
  await api.delete(`${BUILDINGS_API_BASE}/${id}/`);
};