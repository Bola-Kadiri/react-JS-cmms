import { api } from './apiClient';
import { VendorContract, VendorContractListResponse, VendorContractResponse } from '@/types/vendorcontract';

const VENDOR_CONTRACTS_API_BASE = '/procurement/api/vendor-contracts';

export interface VendorContractsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: VendorContract[];
}

export interface VendorContractQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all vendor contracts
export const fetchVendorContracts = async (): Promise<VendorContractsResponse> => {
  try {
    const response = await api.get(`${VENDOR_CONTRACTS_API_BASE}/`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns data wrapped in success/message format
      if (response.data.success && Array.isArray(response.data.data)) {
        return {
          count: response.data.data.length,
          next: null,
          previous: null,
          results: response.data.data
        };
      }
      
      // If the API returns an array directly
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
    
    // Default fallback
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
    
  } catch (error) {
    console.error('Error fetching vendor contracts:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single vendor contract by ID
export const getVendorContract = async (id: string): Promise<VendorContract> => {
  const response = await api.get(`${VENDOR_CONTRACTS_API_BASE}/${id}/`);
  // Handle wrapped response format
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Create a new vendor contract
export const createVendorContract = async (vendorContract: FormData): Promise<VendorContract> => {
  const response = await api.post(`${VENDOR_CONTRACTS_API_BASE}/`, vendorContract, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Handle wrapped response format
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Update an existing vendor contract
export const updateVendorContract = async ({ id, vendorContract }: { id: string; vendorContract: FormData }): Promise<VendorContract> => {
  const response = await api.put(`${VENDOR_CONTRACTS_API_BASE}/${id}/`, vendorContract, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Handle wrapped response format
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Partial update an existing vendor contract
export const patchVendorContract = async ({ id, vendorContract }: { id: string; vendorContract: FormData }): Promise<VendorContract> => {
  const response = await api.patch(`${VENDOR_CONTRACTS_API_BASE}/${id}/`, vendorContract, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  // Handle wrapped response format
  if (response.data.success && response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// Delete a vendor contract
export const deleteVendorContract = async (id: string): Promise<void> => {
  await api.delete(`${VENDOR_CONTRACTS_API_BASE}/${id}/`);
};

