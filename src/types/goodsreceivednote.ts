import { Facility } from "./facility";
import { Vendor } from "./vendor";
import { User } from "./user";

export interface GRNAttachment {
  id: number;
  content_type: number;
  object_id: number;
  file: string;
  file_url: string;
}

export interface PurchaseOrderDetail {
  id: number;
  facility_detail: Facility;
  vendor_detail: Vendor;
  requested_by_detail: User;
  reviewers_detail: User[];
  attachments_data: GRNAttachment[];
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
  status: string;
  review_status: string;
  is_reviewed: boolean;
  reviewed_at: string | null;
  review_comment: string | null;
  owner: number | null;
  facility: number;
  department: number;
  requested_by: number;
  vendor: number;
}

export interface Goodsreceivednote {
  id: number;
  facility_detail: Facility;
  vendor_detail: Vendor;
  received_by_detail: User | null;
  confirmed_by_detail: User | null;
  purchase_order_detail: PurchaseOrderDetail;
  reviewers_detail: User[];
  attachments_data: GRNAttachment[];
  created_at: string;
  updated_at: string;
  grn_number: string;
  date_of_receipt: string;
  delivery_note_number: string;
  invoice_number: string;
  confirmed_at: string | null;
  review_status: string;
  is_reviewed: boolean;
  reviewed_at: string | null;
  review_comment: string | null;
  owner: number | null;
  purchase_order: number;
  vendor: number;
  facility: number;
  received_by: number;
  confirmed_by: number | null;
}

export interface GoodsreceivednoteFormData {
  date_of_receipt: string;
  purchase_order: number;
  vendor: number;
  delivery_note_number: string;
  invoice_number: string;
  facility: number;
  received_by: number;
}

export interface GoodsreceivednoteResponse {
  success: boolean;
  message: string;
  data: Goodsreceivednote;
}

export interface GoodsreceivednoteListResponse {
  success: boolean;
  message: string;
  data: Goodsreceivednote[];
}
