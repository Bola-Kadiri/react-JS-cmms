// src/services/ppmsApi.ts
import { api } from './apiClient';
import { Ppm } from '@/types/ppm';

const PPMS_API_BASE = '/work/api/ppm';

export interface PpmsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Ppm[];
}

export interface PpmQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all ppms without filtering parameters
export const fetchPpms = async (): Promise<PpmsResponse> => {
  try {
    const response = await api.get(`${PPMS_API_BASE}/`);
    
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
    console.error('Error fetching ppms:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single ppm by ID
export const getPpm = async (id: string): Promise<Ppm> => {
  const response = await api.get(`${PPMS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new ppm
export const createPpm = async (ppm: Omit<Ppm, 'id'>): Promise<Ppm> => {
  const response = await api.post(PPMS_API_BASE + '/', ppm);
  return response.data;
};

// Update an existing ppm
export const updatePpm = async ({ id, ppm }: { id: string; ppm: Partial<Ppm> }): Promise<Ppm> => {
  const response = await api.put(`${PPMS_API_BASE}/${id}/`, ppm);
  return response.data;
};

// Delete a ppm
export const deletePpm = async (id: string): Promise<void> => {
  await api.delete(`${PPMS_API_BASE}/${id}/`);
};

// Review a ppm
export const reviewPpm = async ({ id, review_action }: { id: string; review_action: 'approve' | 'reject' }): Promise<Ppm> => {
  const response = await api.post(`${PPMS_API_BASE}/${id}/review/`, { review_action });
  return response.data;
};

// Reject a ppm
export const rejectPpm = async ({ id, rejection_reason }: { id: string; rejection_reason: string }): Promise<Ppm> => {
  const response = await api.post(`${PPMS_API_BASE}/${id}/reject/`, { rejection_reason });
  return response.data;
};

// Reviewers list (users with role REVIEWER)
export interface ReviewerUser {
  id: number;
  name: string;
  email?: string;
}

export const fetchPpmReviewers = async (): Promise<ReviewerUser[]> => {
  const response = await api.get('/accounts/api/users/?role=REVIEWER');
  // Map the response to match ReviewerUser interface
  if (Array.isArray(response.data.results)) {
    return response.data.results.map((user: any) => ({
      id: user.id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email
    }));
  }
  return [];
};

// Pending reviews for current reviewer
export const fetchPendingPpmsForReviewer = async (): Promise<PpmsResponse> => {
  try {
    const response = await api.get(`${PPMS_API_BASE}/my-assigned-ppms/`);
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }
      if (Array.isArray(response.data.results)) {
        return {
          count: response.data.count || response.data.results.length,
          next: response.data.next || null,
          previous: response.data.previous || null,
          results: response.data.results
        };
      }
    }
    return { count: 0, next: null, previous: null, results: [] };
  } catch (error) {
    console.error('Error fetching pending ppms:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

// Fetch reviewed PPMs for work order creation
export const fetchReviewedPpms = async (): Promise<PpmsResponse> => {
  try {
    const response = await api.get(`/work/api/work/ppm/?review_status=Reviewed/`);
    
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
    console.error('Error fetching reviewed ppms:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Fetch approved PPMs for workorder creation
export const fetchApprovedPpms = async (): Promise<PpmsResponse> => {
  try {
    const response = await api.get('/work/api/ppm/approved-ppms/');
    
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
    console.error('Error fetching approved PPMs:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};