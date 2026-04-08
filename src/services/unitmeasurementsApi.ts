import { api } from './apiClient';
import { Unitmeasurement } from '@/types/unitmeasurement';

const UNITMEASUREMENTS_API_BASE = '/accounts/api/units';

export interface UnitmeasurementsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Unitmeasurement[];
}

export interface UnitmeasurementQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all unitmeasurements without filtering parameters
export const fetchUnitmeasurements = async (): Promise<UnitmeasurementsResponse> => {
  try {
    const response = await api.get(`${UNITMEASUREMENTS_API_BASE}/`);
    
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
    console.error('Error fetching unitmeasurements:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single unitmeasurement by CODE
export const getUnitmeasurement = async (code: string): Promise<Unitmeasurement> => {
  const response = await api.get(`${UNITMEASUREMENTS_API_BASE}/${code}/`);
  return response.data;
};

// Create a new unitmeasurement
export const createUnitmeasurement = async (unitmeasurement: Omit<Unitmeasurement, 'id'>): Promise<Unitmeasurement> => {
  const response = await api.post(UNITMEASUREMENTS_API_BASE + '/', unitmeasurement);
  return response.data;
};

// Update an existing unitmeasurement
export const updateUnitmeasurement = async ({ code, unitmeasurement }: { code: string; unitmeasurement: Partial<Unitmeasurement> }): Promise<Unitmeasurement> => {
  const response = await api.put(`${UNITMEASUREMENTS_API_BASE}/${code}/`, unitmeasurement);
  return response.data;
};

// Accept FormData instead of Partial<Unitmeasurement>
// export const updateUnitmeasurement = async ({ code, formData }: { code: string; formData: FormData }): Promise<Unitmeasurement> => {
//   const response = await api.put(`${UNITMEASUREMENTS_API_BASE}/${code}/`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// Delete a unitmeasurement
export const deleteUnitmeasurement = async (code: string): Promise<void> => {
  await api.delete(`${UNITMEASUREMENTS_API_BASE}/${code}/`);
};