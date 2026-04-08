// src/services/workordersApi.ts
import { api } from './apiClient';
import { Workorder } from '@/types/workorder';

const WORKORDERS_API_BASE = '/work/api/work-orders';

export interface WorkordersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Workorder[];
}

export interface WorkorderQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface ApproverUser {
  id: number;
  name: string;
  email: string;
  username: string;
}

export interface ApproverUserResponse {
  count: number;
  results: ApproverUser[];
}


// Fetch all workorders without filtering parameters
export const fetchWorkorders = async (): Promise<WorkordersResponse> => {
  try {
    const response = await api.get(`${WORKORDERS_API_BASE}/`);
    
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
    console.error('Error fetching workorders:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single workorder by SLUG
export const getWorkorder = async (slug: string): Promise<Workorder> => {
  const response = await api.get(`${WORKORDERS_API_BASE}/${slug}/`);
  return response.data;
};

// Create a new workorder
// export const createWorkorder = async (workorder: Omit<Workorder, 'id'>): Promise<Workorder> => {
//   const response = await api.post(WORKORDERS_API_BASE + '/', workorder);
//   return response.data;
// };
export const createWorkorder = async (formData: FormData): Promise<Workorder> => {
  const response = await api.post(WORKORDERS_API_BASE + '/', formData);
  return response.data;
};

// Update an existing workorder
// export const updateWorkorder = async ({ slug, workorder }: { slug: string; workorder: Partial<Workorder> }): Promise<Workorder> => {
//   const response = await api.put(`${WORKORDERS_API_BASE}/${slug}/`, workorder);
//   return response.data;
// };

// Accept FormData instead of Partial<Workorder>
export const updateWorkorder = async ({ slug, formData }: { slug: string; formData: FormData }): Promise<Workorder> => {
  const response = await api.put(`${WORKORDERS_API_BASE}/${slug}/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete a workorder
export const deleteWorkorder = async (slug: string): Promise<void> => {
  await api.delete(`${WORKORDERS_API_BASE}/${slug}/`);
};

// Get approved work requests for workorder creation
export const getApprovedWorkrequests = async (): Promise<any[]> => {
  try {
    const response = await api.get(`${WORKORDERS_API_BASE}/approved-requests/`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns an array directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      // If the API returns paginated data with results array
      if (Array.isArray(response.data.results)) {
        return response.data.results;
      }
    }
    
    // Default fallback
    return [];
  } catch (error) {
    console.error('Error fetching approved work requests:', error);
    return [];
  }
};

// Get approver users
export const getApproverUsers = async (): Promise<ApproverUserResponse> => {
  const response = await api.get(`${WORKORDERS_API_BASE}/approvers/`);
  return response.data;
};

// Approve workorder by approver
export const approveWorkorderByApprover = async (slug: string): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/approve-by-approver/`, {
    approval_status: "Approved"
  });
  return response.data;
};

// Approve workorder by reviewer
export const approveWorkorderByReviewer = async (slug: string): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/approve-by-reviewer/`);
  return response.data;
};