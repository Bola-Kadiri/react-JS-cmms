import { Department } from "./department";
import { Facility } from "./facility";
import { User } from "./user";
import { Vendor } from "./vendor";

export interface EnhancedVendor {
  id: number;
  slug: string;
  name: string;
  type: string;
  phone: string;
  email: string;
  account_name: string;
  bank: string;
  account_number: string;
  currency: string;
  status: string;
}

export interface EnhancedUser {
  id: number;
  user_id: string;
  slug: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string;
  status: string;
}

export interface AttachmentData {
  id: number;
  content_type: number;
  object_id: number;
  file: string;
  file_url: string;
}

export interface Purchaseorder {
  id: number;
  facility_detail: Facility;
  department_detail?: Department;
  vendor_detail: EnhancedVendor;
  requested_by_detail: EnhancedUser;
  reviewers_detail: EnhancedUser[];
  attachments?: string[];
  attachments_data: AttachmentData[];
  items?: PurchaseOrderItem[];
  approvals?: PurchaseOrderApproval[];
  comments?: PurchaseOrderComment[];
  created_at: string;
  updated_at: string;
  type: string;
  type_en: string;
  type_fr: string | null;
  type_es: string | null;
  requested_date: string;
  contact_person: string;
  expected_delivery_date: string;
  ship_to: string;
  terms_and_conditions: string;
  terms_and_conditions_en: string;
  terms_and_conditions_fr: string | null;
  terms_and_conditions_es: string | null;
  status: 'Draft' | 'Pending' | 'Sent' | 'Delivered' | 'Cancelled';
  review_status: 'Approved' | 'Rejected' | 'Pending';
  is_reviewed: boolean;
  reviewed_at: string | null;
  review_comment: string | null;
  owner: number;
  facility: number;
  department?: number;
  requested_by: number;
  vendor: number;
}

interface PurchaseOrderItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  specification: string;
  purchase_order: number;
}

interface PurchaseOrderApproval {
  id: number;
  purchase_order: number;
  approver: number;
  approver_detail: User;
  approved: boolean;
  comment: string;
  decision_date: string;
}

interface PurchaseOrderComment {
  id: number;
  purchase_order: number;
  user: number;
  user_detail: User;
  comment: string;
  created_at: string;
}
