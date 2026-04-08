import { api } from './apiClient';
import { Bankaccount } from '@/types/bankaccount';

const BANKACCOUNTS_API_BASE = '/accounts/api/bank-accounts';

export interface BankaccountsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Bankaccount[];
}

export interface BankaccountQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all bankaccounts without filtering parameters
export const fetchBankaccounts = async (): Promise<BankaccountsResponse> => {
  try {
    const response = await api.get(`${BANKACCOUNTS_API_BASE}/`);
    
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
    console.error('Error fetching bankaccounts:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single bankaccount by SLUG
export const getBankaccount = async (slug: string): Promise<Bankaccount> => {
  const response = await api.get(`${BANKACCOUNTS_API_BASE}/${slug}/`);
  return response.data;
};

// Create a new bankaccount
export const createBankaccount = async (bankaccount: Omit<Bankaccount, 'id'>): Promise<Bankaccount> => {
  const response = await api.post(BANKACCOUNTS_API_BASE + '/', bankaccount);
  return response.data;
};

// Update an existing bankaccount
export const updateBankaccount = async ({ slug, bankaccount }: { slug: string; bankaccount: Partial<Bankaccount> }): Promise<Bankaccount> => {
  const response = await api.put(`${BANKACCOUNTS_API_BASE}/${slug}/`, bankaccount);
  return response.data;
};

// Accept FormData instead of Partial<Bankaccount>
// export const updateBankaccount = async ({ slug, formData }: { slug: string; formData: FormData }): Promise<Bankaccount> => {
//   const response = await api.put(`${BANKACCOUNTS_API_BASE}/${slug}/`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// Delete a bankaccount
export const deleteBankaccount = async (slug: string): Promise<void> => {
  await api.delete(`${BANKACCOUNTS_API_BASE}/${slug}/`);
};