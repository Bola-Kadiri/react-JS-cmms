import { api } from './apiClient';
import { Vendor } from '@/types/vendor';

const VENDORS_API_BASE = '/accounts/api/vendors';

export interface VendorsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Vendor[];
}

export interface VendorQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all vendors without filtering parameters
export const fetchVendors = async (): Promise<VendorsResponse> => {
  try {
    const response = await api.get(`${VENDORS_API_BASE}/`);
    
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
    console.error('Error fetching vendors:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single vendor by SLUG
export const getVendor = async (slug: string): Promise<Vendor> => {
  const response = await api.get(`${VENDORS_API_BASE}/${slug}/`);
  return response.data;
};

// Create a new vendor
export const createVendor = async (vendor: Omit<Vendor, 'id'>): Promise<Vendor> => {
  const response = await api.post(VENDORS_API_BASE + '/', vendor);
  return response.data;
};

// Update an existing vendor
export const updateVendor = async ({ slug, vendor }: { slug: string; vendor: Partial<Vendor> }): Promise<Vendor> => {
  const response = await api.put(`${VENDORS_API_BASE}/${slug}/`, vendor);
  return response.data;
};

// Accept FormData instead of Partial<Vendor>
// export const updateVendor = async ({ slug, formData }: { slug: string; formData: FormData }): Promise<Vendor> => {
//   const response = await api.put(`${VENDORS_API_BASE}/${slug}/`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// Delete a vendor
export const deleteVendor = async (slug: string): Promise<void> => {
  await api.delete(`${VENDORS_API_BASE}/${slug}/`);
};