import { Asset } from './asset';
import { Category } from './category';
import { Department } from './department';
import { Facility } from './facility';
import { Subcategory } from './subcategory';
import { User } from './user';
import { Vendor } from './vendor';

export type WorkrequestApprovalStatus =
  | 'Pending Review'
  | 'CP Approved'
  | 'Reviewed'
  | 'Fully Approved'
  | 'Rejected – Vendor Changed'
  | 'Reviewer Rejected'
  | 'Approver Rejected';

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

export interface Workrequest {
  id: number;
  requester_detail: User;
  request_to_detail: User[];
  category_detail: Category;
  subcategory_detail: Subcategory;
  facility_detail: Facility;
  asset_detail: Asset;
  department_detail: Department;
  reviewers_detail: User[];
  approver_detail: User;
  vendor_detail: Vendor | null;
  po_vendor_detail: Vendor | null;
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
  is_locked: boolean;
  po_number: string | null;
  po_document: string | null;
  po_amount: string | null;
  cp_reason: string | null;
  reviewer_reason: string | null;
  approver_reason: string | null;
  digital_signature: string | null;
  fully_approved_at: string | null;
  follow_up_notes: string;
  payment_requisition: boolean;
  invoice_no: string | null;
  currency: 'USD' | 'EUR' | 'NGN';
  cost: string;
  vendor: number | null;
  po_vendor: number | null;
  category: number;
  subcategory: number;
  department: number;
  requester: number;
  facility: number;
  building: number;
  asset: number;
  approver: number;
  reviewers: number[];
  request_to: number[];
}

export interface ResourceData {
  content_type: number;
  object_id: number;
  file: string;
}
