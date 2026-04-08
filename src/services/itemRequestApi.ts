import { api } from './apiClient';
import { ItemRequest, ItemRequestItem } from '@/types/itemrequest';

const ITEMREQUEST_API_BASE = '/asset_inventory/api/item-request';

export interface ItemRequestsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ItemRequest[];
}

export interface ItemRequestQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  request_from?: number;
  type?: "for_use" | "for_store";
  requested_by?: number;
  department?: number;
  facility?: number;
  building?: number;
}

export interface ItemRequestCreatePayload {
  name: string;
  description: string;
  request_from: number;
  required_date: string;
  requested_by: number;
  department?: number;
  type: "for_use" | "for_store";
  facility?: number;
  building?: number;
  comment: string;
  approved_by: number;
  items: ItemRequestItem[];
}

export interface RequestApprovalPayload {
  request_id: number;
  approved: boolean;
  comments?: string;
}

// Fetch all item requests with optional filtering parameters
export const fetchItemRequests = async (params?: ItemRequestQueryParams): Promise<ItemRequestsResponse> => {
  try {
    const response = await api.get(`${ITEMREQUEST_API_BASE}/`, { params });
    
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
    console.error('Error fetching item requests:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single item request by ID
export const getItemRequest = async (id: string): Promise<ItemRequest> => {
  const response = await api.get(`${ITEMREQUEST_API_BASE}/${id}/`);
  return response.data;
};

// Create a new item request
export const createItemRequest = async (itemRequest: ItemRequestCreatePayload): Promise<ItemRequest> => {
  const response = await api.post(ITEMREQUEST_API_BASE + '/', itemRequest);
  return response.data;
};

// Update an existing item request
export const updateItemRequest = async ({ id, itemRequest }: { id: string; itemRequest: Partial<ItemRequestCreatePayload> }): Promise<ItemRequest> => {
  const response = await api.put(`${ITEMREQUEST_API_BASE}/${id}/`, itemRequest);
  return response.data;
};

// Delete an item request
export const deleteItemRequest = async (id: string): Promise<void> => {
  await api.delete(`${ITEMREQUEST_API_BASE}/${id}/`);
};

// Submit request approval
export const submitRequestApproval = async (payload: RequestApprovalPayload): Promise<any> => {
  const response = await api.post(`${ITEMREQUEST_API_BASE}/request_approval/`, payload);
  return response.data;
}; 