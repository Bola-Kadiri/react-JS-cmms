import { api } from './apiClient';
import { Porequisition } from '@/types/porequisition';

const POREQUISITIONS_API_BASE = '/procurement/api/po-requisitions';

export interface PorequisitionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Porequisition[];
}

export interface PorequisitionQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all porequisitions without filtering parameters
export const fetchPorequisitions = async (): Promise<PorequisitionsResponse> => {
  try {
    const response = await api.get(`${POREQUISITIONS_API_BASE}/`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns { success, message, data: [...] } structure
      if (response.data.data && Array.isArray(response.data.data)) {
        return {
          count: response.data.data.length,
          next: null,
          previous: null,
          results: response.data.data
        };
      }
      
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
    console.error('Error fetching porequisitions:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single porequisition by ID
export const getPorequisition = async (id: string): Promise<Porequisition> => {
  const response = await api.get(`${POREQUISITIONS_API_BASE}/${id}/`);
  // Handle { success, message, data } structure
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Create a new porequisition
export const createPorequisition = async (porequisition: FormData): Promise<Porequisition> => {
  const response = await api.post(POREQUISITIONS_API_BASE + '/', porequisition, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Handle { success, message, data } structure
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Update an existing porequisition
export const updatePorequisition = async ({ id, porequisition }: { id: string; porequisition: FormData }): Promise<Porequisition> => {
  const response = await api.put(`${POREQUISITIONS_API_BASE}/${id}/`, porequisition, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Handle { success, message, data } structure
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Accept FormData instead of Partial<Porequisition>
// export const updatePorequisition = async ({ id, formData }: { id: string; formData: FormData }): Promise<Porequisition> => {
//   const response = await api.put(`${POREQUISITIONS_API_BASE}/${id}/`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// Delete a porequisition
export const deletePorequisition = async (id: string): Promise<void> => {
  await api.delete(`${POREQUISITIONS_API_BASE}/${id}/`);
};