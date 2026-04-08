import { api } from './apiClient';
import { Purchaseorder } from '@/types/purchaseorder';

const PURCHASEORDERS_API_BASE = '/procurement/api/purchase-orders';

export interface PurchaseordersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Purchaseorder[];
}

export interface PurchaseorderQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all purchaseorders without filtering parameters
export const fetchPurchaseorders = async (): Promise<PurchaseordersResponse> => {
  try {
    const response = await api.get(`${PURCHASEORDERS_API_BASE}/`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // Check for wrapped response structure { success, message, data: [...] }
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
    console.error('Error fetching purchaseorders:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single purchaseorder by SLUG
export const getPurchaseorder = async (id: string): Promise<Purchaseorder> => {
  const response = await api.get(`${PURCHASEORDERS_API_BASE}/${id}/`);
  // Check if response is wrapped
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Create a new purchaseorder
// export const createPurchaseorder = async (purchaseorder: Omit<Purchaseorder, 'id'>): Promise<Purchaseorder> => {
//   const response = await api.post(PURCHASEORDERS_API_BASE + '/', purchaseorder);
//   return response.data;
// };
export const createPurchaseorder = async (purchaseorder: FormData): Promise<Purchaseorder> => {
  const response = await api.post(PURCHASEORDERS_API_BASE + '/', purchaseorder, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Check if response is wrapped
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Update an existing purchaseorder
export const updatePurchaseorder = async ({ id, purchaseorder }: { id: string; purchaseorder: FormData }): Promise<Purchaseorder> => {
  const response = await api.put(`${PURCHASEORDERS_API_BASE}/${id}/`, purchaseorder, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Check if response is wrapped
  if (response.data && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Accept FormData instead of Partial<Purchaseorder>
// export const updatePurchaseorder = async ({ id, formData }: { id: string; formData: FormData }): Promise<Purchaseorder> => {
//   const response = await api.put(`${PURCHASEORDERS_API_BASE}/${id}/`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// Delete a purchaseorder
export const deletePurchaseorder = async (id: string): Promise<void> => {
  await api.delete(`${PURCHASEORDERS_API_BASE}/${id}/`);
};