import { api } from './apiClient';
import { Requestquotation } from '@/types/requestquotation';

const REQUESTQUOTATIONS_API_BASE = '/procurement/api/request-quotation';

export interface RequestquotationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Requestquotation[];
}

export interface RequestquotationQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all requestquotations without filtering parameters
export const fetchRequestquotations = async (): Promise<RequestquotationsResponse> => {
  try {
    const response = await api.get(`${REQUESTQUOTATIONS_API_BASE}/`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns { success, message, data: [...] } structure
      if (response.data.success && Array.isArray(response.data.data)) {
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
    console.error('Error fetching requestquotations:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single requestquotation by ID
export const getRequestquotation = async (id: string): Promise<Requestquotation> => {
  const response = await api.get(`${REQUESTQUOTATIONS_API_BASE}/${id}/`);
  
  // If the API returns { success, message, data } structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fallback to direct data if structure is different
  return response.data;
};

// Create a new requestquotation
export const createRequestquotation = async (requestquotation: FormData): Promise<Requestquotation> => {
  const response = await api.post(REQUESTQUOTATIONS_API_BASE + '/', requestquotation, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // If the API returns { success, message, data } structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fallback to direct data if structure is different
  return response.data;
};

// Update an existing requestquotation
export const updateRequestquotation = async ({ id, requestquotation }: { id: string; requestquotation: FormData }): Promise<Requestquotation> => {
  const response = await api.put(`${REQUESTQUOTATIONS_API_BASE}/${id}/`, requestquotation, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // If the API returns { success, message, data } structure
  if (response.data && response.data.success && response.data.data) {
    return response.data.data;
  }
  
  // Fallback to direct data if structure is different
  return response.data;
};

// Accept FormData instead of Partial<Requestquotation>
// export const updateRequestquotation = async ({ id, formData }: { id: string; formData: FormData }): Promise<Requestquotation> => {
//   const response = await api.put(`${REQUESTQUOTATIONS_API_BASE}/${id}/`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// Delete a requestquotation
export const deleteRequestquotation = async (id: string): Promise<void> => {
  await api.delete(`${REQUESTQUOTATIONS_API_BASE}/${id}/`);
};