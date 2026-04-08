import { Facility } from "./facility";
import { User } from "./user";
import { Vendor } from "./vendor";

export interface RFQAttachment {
  id: number;
  content_type: number;
  object_id: number;
  file: string;
  file_url: string;
}

export interface Requestquotation {
  id: number;
  facility_detail: Facility | null;
  vendors_detail: Vendor[];
  requester_detail: User | null;
  attachments_data: RFQAttachment[];
  items?: RFQItem[];
  approvals?: RFQApproval[];
  comments?: RFQComment[];
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  type: string;
  title: string | null;
  title_en: string | null;
  title_fr: string | null;
  title_es: string | null;
  currency: string;
  deadline_date?: string; // ISO date string
  deadline_time?: string;
  terms: string | null;
  terms_en: string | null;
  terms_fr: string | null;
  terms_es: string | null;
  status?: 'Draft' | 'Pending' | 'Sent' | 'Closed';
  owner: number | null;
  requester: number | null;
  facility: number | null;
  vendors: number[];
}

export interface RFQItem {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  specification: string;
  rfq: number;
}

export interface RFQApproval {
  id: number;
  rfq: number;
  approver: number;
  approver_detail: User;
  approved: boolean;
  comment: string;
  decision_date: string; // ISO date string
}

export interface RFQComment {
  id: number;
  rfq: number;
  user: number;
  user_detail: User;
  comment: string;
  created_at: string; // ISO date string
}
