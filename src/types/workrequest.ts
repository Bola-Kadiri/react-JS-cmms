import { Asset } from './asset';
import { Category } from './category';
import { Department } from './department';
import { Facility } from './facility';
import { Subcategory } from './subcategory';
import { User } from './user';
import { Vendor } from './vendor';
import { Zone } from './zone';
import { Subsystem } from './subsystem';

export type WorkrequestApprovalStatus =
  | 'Pending Review'
  | 'CP Approved'
  | 'Reviewed'
  | 'Fully Approved'
  | 'Rejected – Vendor Changed'
  | 'Reviewer Rejected'
  | 'Approver Rejected'
  // Five-stage flow
  | 'Awaiting Review'
  | 'Sent Back'
  | 'Awaiting Client'
  | 'Client Rejected';

export const REJECTED_STATUSES: WorkrequestApprovalStatus[] = [
  'Rejected – Vendor Changed',
  'Reviewer Rejected',
  'Approver Rejected',
];

export interface ShortUser {
  id: number;
  name: string;
  email: string;
}

// Work Order auto-created by the backend once the request is Fully Approved.
// Null until then. See WorkRequestViewSet._auto_create_work_order (backend).
export interface DerivedWorkOrder {
  id: number;
  slug: string;
  work_order_number: string;
  approval_status: string;
}

export interface Workrequest {
  id: number;
  requester_detail: User;
  request_to_detail: User[];
  category_detail: Category;
  subcategory_detail: Subcategory;
  facility_detail: Facility;
  zone_detail: Zone | null;
  subsystem_detail: Subsystem | null;
  asset_detail: Asset;
  department_detail: Department;
  reviewers_detail: User[];
  approver_detail: User;
  vendor_detail: Vendor | null;
  po_vendor_detail: Vendor | null;
  technician_detail: User | null;
  due_status: string;
  created_at: string;
  updated_at: string;
  type: 'Work' | 'Procument';
  work_request_number: string;
  slug: string;
  require_mobilization_fee: boolean;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  attachment: string | null;
  vendor_invoice: string | null;
  require_quotation: boolean;
  approval_status: WorkrequestApprovalStatus;
  // Which approval flow this request follows (set when raised).
  flow?: 'legacy' | 'five_stage';
  // Five-stage: the client-rejected request this one was raised again from.
  replaces?: number | null;
  is_locked: boolean;
  po_number: string | null;
  po_document: string | null;
  po_amount: string | null;
  cp_reason: string | null;
  reviewer_reason: string | null;
  approver_reason: string | null;
  digital_signature: string | null;
  fully_approved_at: string | null;
  derived_work_order: DerivedWorkOrder | null;
  follow_up_notes: string;
  payment_requisition: boolean;
  invoice_no: string | null;
  currency: 'USD' | 'EUR' | 'NGN';
  cost: string;
  vendor: number | null;
  po_vendor: number | null;
  technician: number | null;
  category: number;
  subcategory: number;
  department: number;
  requester: number;
  facility: number;
  building: number | null;
  zone: number;
  subsystem: number;
  asset: number;
  approver: number;
  reviewers: number[];
  request_to: number[];
  // Quotation entered by Procurement & Store on cp-approve. total_cost_vendor
  // is absent for a Requester (see backend WorkRequestSerializer) — always
  // optional here for the same reason as WorkrequestQuotationItem above.
  quotation_items?: WorkrequestQuotationItem[];
  total_cost_vendor?: string;
  total_cost_client?: string;
  margin?: string;
}

// A single priced line on a work request's quotation, entered by
// Procurement & Store on cp-approve. unit_cost_vendor/unit_cost_estimate are
// absent from the API response for a Requester (see backend
// WorkRequestQuotationItemSerializer) — always optional here so the UI
// degrades to "not shown" rather than crashing.
export interface WorkrequestQuotationItem {
  id: number;
  description: string;
  quantity: string;
  // Reference only — CP's initial ballpark before the approved cost below.
  unit_cost_estimate?: string;
  unit_cost_vendor?: string;
  unit_cost_client: string;
  add_vat: boolean;
}

export interface ResourceData {
  content_type: number;
  object_id: number;
  file: string;
}
