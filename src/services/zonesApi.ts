// src/services/zonesApi.ts
import { api } from './apiClient';
import { Zone } from '@/types/zone';

const ZONES_API_BASE = '/facility/api/api/zones';

export interface ZonesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Zone[];
}

export interface ZoneQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  facility?: string;
}

// Fetch all zones without filtering parameters
export const fetchZones = async (): Promise<ZonesResponse> => {
  try {
    const response = await api.get(`${ZONES_API_BASE}/`);
    
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
    console.error('Error fetching zones:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Fetch all zones without filtering parameters
export const fetchZonesByFacility = async (id: string): Promise<Zone[]> => {
  try {
    const response = await api.get(`${ZONES_API_BASE}/by-facility/${id}/`);
    
    return response.data;
    
  } catch (error) {
    console.error('Error fetching zones:', error);
    return [];
  }
};

// Get a single zone by ID
export const getZone = async (id: string): Promise<Zone> => {
  const response = await api.get(`${ZONES_API_BASE}/${id}/`);
  return response.data;
};

// Create a new zone
export const createZone = async (zone: Omit<Zone, 'id'>): Promise<Zone> => {
  const response = await api.post(ZONES_API_BASE + '/', zone);
  return response.data;
};

// Update an existing zone
export const updateZone = async ({ id, zone }: { id: string; zone: Partial<Zone> }): Promise<Zone> => {
  const response = await api.put(`${ZONES_API_BASE}/${id}/`, zone);
  return response.data;
};

// Delete a zone
export const deleteZone = async (id: string): Promise<void> => {
  await api.delete(`${ZONES_API_BASE}/${id}/`);
};