// src/services/workordercompletionsApi.ts
import { api } from './apiClient';
import { WorkOrderCompletion } from '@/types/workordercompletion';
import { Workorder } from '@/types/workorder';

const WORKORDER_COMPLETIONS_API_BASE = '/work/api/work-order-completions';

export interface WorkOrderCompletionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: WorkOrderCompletion[];
}

export interface AvailableWorkOrdersResponse {
  count: number;
  results: Workorder[];
  filters_applied: {
    facility: number | null;
    category: number | null;
    priority: string | null;
    status: string | null;
    search: string | null;
    exclude_completed: boolean;
    work_order_types: string[];
  };
}

export interface RaisePaymentWorkOrdersResponse {
  message: string;
  count: number;
  results: Workorder[];
  filters_applied: {
    facility: number | null;
    category: number | null;
    priority: string | null;
    status: string | null;
    approval_status: string | null;
    search: string | null;
    user_filter: string;
    work_order_type: string;
  };
}

export interface WorkOrderCompletionQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all work order completions
export const fetchWorkOrderCompletions = async (params?: WorkOrderCompletionQueryParams): Promise<WorkOrderCompletionsResponse> => {
  try {
    const response = await api.get(`${WORKORDER_COMPLETIONS_API_BASE}/`, { params });
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns an array directly instead of a paginated response
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        };
      }
      
      // If the API returns a proper paginated response
      return response.data as WorkOrderCompletionsResponse;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error fetching work order completions:', error);
    throw error;
  }
};

// Get a single work order completion by ID
export const getWorkOrderCompletion = async (id: number): Promise<WorkOrderCompletion> => {
  try {
    const response = await api.get(`${WORKORDER_COMPLETIONS_API_BASE}/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching work order completion ${id}:`, error);
    throw error;
  }
};

// Create a new work order completion
export const createWorkOrderCompletion = async (workOrderCompletionData: FormData | Partial<WorkOrderCompletion>): Promise<WorkOrderCompletion> => {
  try {
    const config = workOrderCompletionData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.post(`${WORKORDER_COMPLETIONS_API_BASE}/`, workOrderCompletionData, config);
    return response.data;
  } catch (error) {
    console.error('Error creating work order completion:', error);
    throw error;
  }
};

// Update an existing work order completion
export const updateWorkOrderCompletion = async (id: number, workOrderCompletionData: FormData | Partial<WorkOrderCompletion>): Promise<WorkOrderCompletion> => {
  try {
    const config = workOrderCompletionData instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const response = await api.put(`${WORKORDER_COMPLETIONS_API_BASE}/${id}/`, workOrderCompletionData, config);
    return response.data;
  } catch (error) {
    console.error(`Error updating work order completion ${id}:`, error);
    throw error;
  }
};

// Delete a work order completion
export const deleteWorkOrderCompletion = async (id: number): Promise<void> => {
  try {
    await api.delete(`${WORKORDER_COMPLETIONS_API_BASE}/${id}/`);
  } catch (error) {
    console.error(`Error deleting work order completion ${id}:`, error);
    throw error;
  }
};

// Approve work order completion by approver
export const approveByApprover = async (id: number): Promise<{ message: string; data: WorkOrderCompletion }> => {
  try {
    const response = await api.post(`${WORKORDER_COMPLETIONS_API_BASE}/${id}/approve-by-approver/`);
    return response.data;
  } catch (error) {
    console.error(`Error approving work order completion ${id} by approver:`, error);
    throw error;
  }
};

// Reject work order completion by approver
export const rejectByApprover = async (id: number, notes?: string): Promise<{ message: string; data: WorkOrderCompletion }> => {
  try {
    const response = await api.post(`${WORKORDER_COMPLETIONS_API_BASE}/${id}/reject-by-approver/`, {
      notes: notes || ''
    });
    return response.data;
  } catch (error) {
    console.error(`Error rejecting work order completion ${id} by approver:`, error);
    throw error;
  }
};

// Approve work order completion by reviewer
export const approveByReviewer = async (id: number): Promise<{ message: string; data: WorkOrderCompletion }> => {
  try {
    const response = await api.post(`${WORKORDER_COMPLETIONS_API_BASE}/${id}/approve-by-reviewer/`);
    return response.data;
  } catch (error) {
    console.error(`Error approving work order completion ${id} by reviewer:`, error);
    throw error;
  }
};

// Reject work order completion by reviewer
export const rejectByReviewer = async (id: number, notes?: string): Promise<{ message: string; data: WorkOrderCompletion }> => {
  try {
    const response = await api.post(`${WORKORDER_COMPLETIONS_API_BASE}/${id}/reject-by-reviewer/`, {
      notes: notes || ''
    });
    return response.data;
  } catch (error) {
    console.error(`Error rejecting work order completion ${id} by reviewer:`, error);
    throw error;
  }
};

// Fetch available work orders for work order completions
export const fetchAvailableWorkOrders = async (): Promise<AvailableWorkOrdersResponse> => {
  try {
    const response = await api.get(`${WORKORDER_COMPLETIONS_API_BASE}/available-work-orders/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching available work orders:', error);
    throw error;
  }
};

// Fetch work order completions by requester ID
export const fetchWorkOrderCompletionsByRequester = async (requesterId: number): Promise<WorkOrderCompletionsResponse> => {
  try {
    const response = await api.get(`${WORKORDER_COMPLETIONS_API_BASE}/by-requester/${requesterId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching work order completions by requester:', error);
    throw error;
  }
};

// Fetch work orders for raising payment
export const fetchRaisePaymentWorkOrders = async (): Promise<RaisePaymentWorkOrdersResponse> => {
  try {
    const response = await api.get(`${WORKORDER_COMPLETIONS_API_BASE}/raise-payment-work-orders/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching raise payment work orders:', error);
    throw error;
  }
};

 