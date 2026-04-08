import { api } from './apiClient';
import { Workrequest, ProcurementUser } from '@/types/workrequest';
import { Asset } from '@/types/asset';
import { Building } from '@/types/building';

const WORKREQUESTS_API_BASE = '/work/api/work-requests';

// --- Interfaces ---

export interface WorkrequestsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Workrequest[];
}

export interface ProcurementWorkrequestsResponse {
  count: number;
  results: Workrequest[];
}

export interface WorkrequestQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface ApproveWorkrequestData {
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  notes: string;
}

export interface ProcurementData {
  cost: number;
  currency: 'USD' | 'EUR' | 'NGN';
  attach_po?: string;
  notes?: string;
}

// --- Helper Functions ---

/**
 * Normalizes the payload to ensure Django-compatible data.
 * Django foreign keys often reject '0' or empty strings with "Invalid pk".
 * This converts them to 'null' (None in Python).
 */
const normalizePayload = (data: any) => {
  const normalized = { ...data };
  const idFields = [
    'facility', 
    'building', 
    'department', 
    'asset', 
    'suggested_vendor'
  ];
  
  idFields.forEach(field => {
    if (
      normalized[field] === 0 || 
      normalized[field] === '0' || 
      normalized[field] === '' || 
      normalized[field] === undefined
    ) {
      normalized[field] = null;
    }
  });
  return normalized;
};

// --- API Implementation ---

export const fetchWorkrequests = async (): Promise<WorkrequestsResponse> => {
  try {
    const response = await api.get(`${WORKREQUESTS_API_BASE}/`);
    
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
        return response.data;
      }
    }
    
    return { count: 0, next: null, previous: null, results: [] };
  } catch (error) {
    console.error('Error fetching workrequests:', error);
    return { count: 0, next: null, previous: null, results: [] };
  }
};

export const getWorkrequest = async (slug: string): Promise<Workrequest> => {
  const response = await api.get(`${WORKREQUESTS_API_BASE}/${slug}/`);
  return response.data;
};

/**
 * CREATE WORKREQUEST
 * Added payload normalization and detailed logging for status 400 errors.
 */
export const createWorkrequest = async (workrequest: Omit<Workrequest, 'id'>): Promise<Workrequest> => {
  try {
    const cleanData = normalizePayload(workrequest);
    // Ensure trailing slash is present
    const response = await api.post(`${WORKREQUESTS_API_BASE}/`, cleanData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 400) {
      console.error('SERVER VALIDATION ERROR:', error.response.data);
    } else {
      console.error('API Error:', error.message);
    }
    throw error; 
  }
};

export const updateWorkrequest = async ({ slug, workrequest }: { slug: string; workrequest: Partial<Workrequest> }): Promise<Workrequest> => {
  const cleanData = normalizePayload(workrequest);
  const response = await api.put(`${WORKREQUESTS_API_BASE}/${slug}/`, cleanData);
  return response.data;
};

export const deleteWorkrequest = async (slug: string): Promise<void> => {
  await api.delete(`${WORKREQUESTS_API_BASE}/${slug}/`);
};

// --- Cascading Dropdown Support ---

export const getAssetsByFacility = async (facility_id: number): Promise<Asset[]> => {
  if (!facility_id) return [];
  const response = await api.get(`${WORKREQUESTS_API_BASE}/assets-by-facility/${facility_id}/`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getBuildingsByFacility = async (facility_id: number): Promise<Building[]> => {
  if (!facility_id) return [];
  const response = await api.get(`${WORKREQUESTS_API_BASE}/buildings-by-facility/${facility_id}/`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getProcurementUsers = async (): Promise<ProcurementUser[]> => {
  const response = await api.get(`${WORKREQUESTS_API_BASE}/procurement-users/`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

// --- Approval & Status Methods ---

export const approveWorkrequest = async ({ slug, approvalData }: { slug: string; approvalData: ApproveWorkrequestData }): Promise<Workrequest> => {
  const response = await api.post(`${WORKREQUESTS_API_BASE}/${slug}/approve/`, approvalData);
  return response.data;
};

export const rejectWorkrequest = async ({ slug, rejection_reason }: { slug: string; rejection_reason: string }): Promise<Workrequest> => {
  const response = await api.post(`${WORKREQUESTS_API_BASE}/${slug}/reject/`, { rejection_reason });
  return response.data;
};

export const addProcurementDetails = async ({ slug, procurementData }: { slug: string; procurementData: ProcurementData }): Promise<Workrequest> => {
  const response = await api.post(`${WORKREQUESTS_API_BASE}/${slug}/add-procurement-details/`, procurementData);
  return response.data;
};

export const fetchProcurementWorkrequests = async (): Promise<ProcurementWorkrequestsResponse> => {
  try {
    const response = await api.get(`${WORKREQUESTS_API_BASE}/procurement-assigned/`);
    const results = response.data.results || (Array.isArray(response.data) ? response.data : []);
    return { count: results.length, results };
  } catch (error) {
    console.error('Error fetching procurement workrequests:', error);
    return { count: 0, results: [] };
  }
};

export const fetchApprovedWorkrequests = async (): Promise<Workrequest[]> => {
  try {
    const response = await api.get(`${WORKREQUESTS_API_BASE}/approved-work-requests/`);
    const results = response.data.results || (Array.isArray(response.data) ? response.data : []);
    return results;
  } catch (error) {
    console.error('Error fetching approved work requests:', error);
    return [];
  }
};