import { User } from "./user";
import { Vendor } from "./vendor";

export interface Porequisition {
  id: number;
  title: string;
  title_en?: string;
  title_fr?: string;
  title_es?: string;
  vendor: number;
  vendor_detail?: {
    id: number;
    slug?: string;
    name: string;
    type?: string;
    phone?: string;
    email?: string;
    account_name?: string;
    bank?: string;
    account_number?: string;
    currency?: string;
    status?: string;
  };
  invoice_number: string;
  sage_reference_number?: string;
  description: string;
  description_en?: string;
  description_fr?: string;
  description_es?: string;
  amount: string;
  expected_delivery_date: string;
  approver?: number;
  approver_detail?: {
    id: number;
    user_id?: string;
    slug?: string;
    email: string;
    first_name?: string;
    last_name?: string;
    roles?: string;
    status?: string;
  };
  reviewers_detail?: any[];
  attachments_data?: any[];
  review_status?: string;
  is_reviewed?: boolean;
  reviewed_at?: string | null;
  review_comment?: string | null;
  owner?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PorequisitionFormData {
  title: string;
  vendor: number;
  description: string;
  amount: string;
  expected_delivery_date: string;
  sage_reference_number?: string;
  approver?: number;
  attachment?: File[];
}

export interface PorequisitionResponse {
  success: boolean;
  message: string;
  data: Porequisition;
}

export interface PorequisitionListResponse {
  success: boolean;
  message: string;
  data: Porequisition[];
}
