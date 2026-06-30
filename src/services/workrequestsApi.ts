import { api } from './apiClient';
import { Workrequest, ShortUser } from '@/types/workrequest';
import { Asset } from '@/types/asset';
import { Building } from '@/types/building';

const BASE = '/work/api/work-requests';

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

export interface CpApproveData {
  po_number: string;
  po_vendor?: number;
  po_document?: File;
  po_amount?: string;
}

export interface CpRejectData {
  po_vendor: number;
  cp_reason: string;
}

export interface ReviewerRejectData {
  reviewer_reason: string;
}

export interface FinalApproveData {
  digital_signature: string;
}

export interface FinalRejectData {
  approver_reason: string;
}

// --- List & detail ---

export const fetchWorkrequests = async (params?: WorkrequestQueryParams): Promise<WorkrequestsResponse> => {
  const response = await api.get(`${BASE}/`, { params });
  if (response.data && typeof response.data === 'object') {
    if (Array.isArray(response.data)) {
      return { count: response.data.length, next: null, previous: null, results: response.data };
    }
    if (Array.isArray(response.data.results)) {
      return response.data;
    }
  }
  return { count: 0, next: null, previous: null, results: [] };
};

export const getWorkrequest = async (slug: string): Promise<Workrequest> => {
  const response = await api.get(`${BASE}/${slug}/`);
  return response.data;
};

// --- Create (always FormData because vendor_invoice is a file) ---

export const createWorkrequest = async (formData: FormData): Promise<Workrequest> => {
  try {
    const response = await api.post(`${BASE}/`, formData);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.error('SERVER VALIDATION ERROR:', error.response.data);
    }
    throw error;
  }
};

// --- Update (PATCH, FormData to support optional re-upload of vendor_invoice) ---

export const updateWorkrequest = async ({
  slug,
  formData,
}: {
  slug: string;
  formData: FormData;
}): Promise<Workrequest> => {
  const response = await api.patch(`${BASE}/${slug}/`, formData);
  return response.data;
};

export const deleteWorkrequest = async (slug: string): Promise<void> => {
  await api.delete(`${BASE}/${slug}/`);
};

// --- Cascading dropdowns ---

export const getAssetsByFacility = async (facility_id: number): Promise<Asset[]> => {
  if (!facility_id) return [];
  const response = await api.get(`${BASE}/assets-by-facility/${facility_id}/`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getBuildingsByFacility = async (facility_id: number): Promise<Building[]> => {
  if (!facility_id) return [];
  const response = await api.get(`${BASE}/buildings-by-facility/${facility_id}/`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getProcurementUsers = async (): Promise<ShortUser[]> => {
  const response = await api.get(`${BASE}/procurement-users/`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getWorkrequestReviewers = async (): Promise<ShortUser[]> => {
  const response = await api.get(`${BASE}/reviewers/`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const getWorkrequestApprovers = async (): Promise<ShortUser[]> => {
  const response = await api.get(`${BASE}/approvers/`);
  return Array.isArray(response.data) ? response.data : response.data.results || [];
};

export const fetchProcurementWorkrequests = async (): Promise<ProcurementWorkrequestsResponse> => {
  const response = await api.get(`${BASE}/procurement-assigned/`);
  const results = response.data.results || (Array.isArray(response.data) ? response.data : []);
  return { count: results.length, results };
};

export const fetchApprovedWorkrequests = async (): Promise<Workrequest[]> => {
  const response = await api.get(`${BASE}/approved-work-requests/`);
  return response.data.results || (Array.isArray(response.data) ? response.data : []);
};

// --- Step 2: Procurement & Store actions ---

export const cpApprove = async ({
  slug,
  data,
}: {
  slug: string;
  data: CpApproveData;
}): Promise<Workrequest> => {
  const fd = new FormData();
  fd.append('po_number', data.po_number);
  if (data.po_vendor) fd.append('po_vendor', String(data.po_vendor));
  if (data.po_document) fd.append('po_document', data.po_document);
  if (data.po_amount) fd.append('po_amount', data.po_amount);
  const response = await api.post(`${BASE}/${slug}/cp-approve/`, fd);
  return response.data;
};

export const cpReject = async ({
  slug,
  data,
}: {
  slug: string;
  data: CpRejectData;
}): Promise<Workrequest> => {
  const response = await api.post(`${BASE}/${slug}/cp-reject/`, data);
  return response.data;
};

// --- Step 3: Reviewer actions ---

export const reviewerApprove = async (slug: string): Promise<Workrequest> => {
  const response = await api.post(`${BASE}/${slug}/reviewer-approve/`, {});
  return response.data;
};

export const reviewerReject = async ({
  slug,
  data,
}: {
  slug: string;
  data: ReviewerRejectData;
}): Promise<Workrequest> => {
  const response = await api.post(`${BASE}/${slug}/reviewer-reject/`, data);
  return response.data;
};

// --- Step 4: Approver actions ---

export const finalApprove = async ({
  slug,
  data,
}: {
  slug: string;
  data: FinalApproveData;
}): Promise<Workrequest> => {
  const response = await api.post(`${BASE}/${slug}/final-approve/`, data);
  return response.data;
};

export const finalReject = async ({
  slug,
  data,
}: {
  slug: string;
  data: FinalRejectData;
}): Promise<Workrequest> => {
  const response = await api.post(`${BASE}/${slug}/final-reject/`, data);
  return response.data;
};

// --- Resubmit after rejection ---

export const resubmitWorkrequest = async (slug: string): Promise<Workrequest> => {
  const response = await api.post(`${BASE}/${slug}/resubmit/`, {});
  return response.data;
};
