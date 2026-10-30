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


// Fetch workorders with optional filtering parameters
export const fetchWorkorders = async (params?: WorkorderQueryParams): Promise<WorkordersResponse> => {
  try {
    const response = await api.get(`${WORKORDERS_API_BASE}/`, { params });
    
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
  try {
    const response = await api.post(WORKORDERS_API_BASE + '/', formData);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.error('WorkOrder 400 validation error:', error.response.data);
    }
    throw error;
  }
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

// Raise Payment: who can be selected as final approver, and from what amount (NGN) it's required
export interface FinalApproversResponse {
  threshold: string;
  currency: 'NGN';
  approvers: { id: number; name: string; email: string }[];
}

/** The Approver a Raise Payment bill at this facility goes to (from the Approval Matrix), or null. */
export const getLocationApprover = async (
  facilityId: number,
): Promise<{ approver: { id: number; name: string; email: string } | null }> => {
  const response = await api.get(`${WORKORDERS_API_BASE}/location-approver/`, { params: { facility: facilityId } });
  return response.data;
};

export const getFinalApprovers = async (): Promise<FinalApproversResponse> => {
  const response = await api.get(`${WORKORDERS_API_BASE}/final-approvers/`);
  return response.data;
};

// (legacy — kept for router compat; real approval now uses approveWorkorderByApprover below)

// Approve workorder by reviewer
export const approveWorkorderByReviewer = async (slug: string): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/approve-by-reviewer/`);
  return response.data;
};

// Reject workorder by reviewer
export const rejectWorkorderByReviewer = async ({ slug, reviewer_reason }: { slug: string; reviewer_reason: string }): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/reject-by-reviewer/`, { reviewer_reason });
  return response.data;
};

// Approve workorder by approver (requires digital signature)
export const approveWorkorderByApprover = async ({ slug, digital_signature }: { slug: string; digital_signature: string }): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/approve-by-approver/`, { digital_signature });
  return response.data;
};

// Reject workorder by approver
export const rejectWorkorderByApprover = async ({ slug, approver_reason }: { slug: string; approver_reason: string }): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/reject-by-approver/`, { approver_reason });
  return response.data;
};

// Raise Payment second (final) approval — only the second approver named on the bill
// Raise Payment bills of ₦100,000 or more: Procurement & Store adds the PO and quotation, or returns the bill.
export const procurementSubmitWorkorder = async (
  slug: string,
  input: { po_number: string; po_document: File | null; quotation_amount: string; quotation_reference?: string },
): Promise<Workorder> => {
  const form = new FormData();
  form.append('po_number', input.po_number);
  if (input.po_document) form.append('po_document', input.po_document);
  form.append('quotation_amount', input.quotation_amount);
  form.append('quotation_reference', input.quotation_reference ?? '');
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/procurement-submit/`, form);
  return response.data;
};

export const procurementReturnWorkorder = async (slug: string, procurement_reason: string): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/procurement-return/`, { procurement_reason });
  return response.data;
};

export const raisePaymentResubmitWorkorder = async (slug: string): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/raise-payment-resubmit/`);
  return response.data;
};

export const finalApproveWorkorder = async (slug: string): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/final-approve/`);
  return response.data;
};

export const finalRejectWorkorder = async ({ slug, final_approver_reason }: { slug: string; final_approver_reason: string }): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/final-reject/`, { final_approver_reason });
  return response.data;
};

// Unlock resubmission — Admin only
export const unlockWorkorderResubmission = async (slug: string): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/unlock-resubmission/`);
  return response.data;
};

export interface SetStatusData {
  work_status: 'closed' | 'pending' | 'rejected';
  reason?: string;
  vendor?: number;
  technician?: number;
  rating?: number;
  started_at?: string;
  completed_at?: string;
  expected_payment_date?: string;
}

// set-status's response body overwrites the serialized Workorder's
// `payment_requisition` key (normally a boolean flag) with a reference
// object to the auto-created/reused requisition — see backend
// WorkOrderViewSet.set_status.
export type SetStatusResponse = Omit<Workorder, 'payment_requisition'> & {
  payment_requisition: { id: number; requisition_number: string } | null;
};

// Closed/Pending/Rejected tracking, separate from approval_status. Closing
// requires an approved Work Completion Certificate to already exist (backend
// enforced) and auto-creates the linked Payment Requisition.
export const setWorkorderStatus = async ({
  slug,
  data,
}: {
  slug: string;
  data: SetStatusData;
}): Promise<SetStatusResponse> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/set-status/`, data);
  return response.data;
};

// Manually raise the Payment Requisition once an Approved WCC exists — lets
// the Requester do this before closing the Work Order, instead of only at
// close time. Idempotent on the backend: calling this again after the Work
// Order is later closed just returns the same requisition.
export const createPaymentRequisitionFromWorkorder = async (
  slug: string
): Promise<{ id: number; requisition_number: string }> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/create-payment-requisition/`);
  return response.data;
};

export interface AssignRoutingData {
  reviewers?: number[];
  approver?: number;
}

// Requester assigns this Work Order's own Reviewer(s)/Approver — separate
// from the Work Request's routing. Notifies the newly-assigned people.
export const assignWorkorderRouting = async ({
  slug,
  data,
}: {
  slug: string;
  data: AssignRoutingData;
}): Promise<Workorder> => {
  const response = await api.post(`${WORKORDERS_API_BASE}/${slug}/assign-routing/`, data);
  return response.data;
};