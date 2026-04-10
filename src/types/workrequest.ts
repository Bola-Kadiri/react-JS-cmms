import { Asset } from './asset';
import { Category } from './category';
import { Department } from './department';
import { Facility } from './facility';
import { Subcategory } from './subcategory';
import { User } from './user';
import { Vendor } from './vendor';

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
  suggested_vendor_detail: Vendor;
  due_status: string;
  created_at: string;
  updated_at: string;
  type: 'Work' | 'Procurement';
  work_request_number: string;
  slug: string;
  require_mobilization_fee: boolean;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  attachment: string;
  require_quotation: boolean;
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  follow_up_notes: string;
  payment_requisition: boolean;
  vendor_description: string;
  currency: 'USD' | 'EUR' | 'NGN';
  cost: string;
  attach_po: string;
  category: number;
  subcategory: number;
  department: number;
  requester: number;
  facility: number;
  building: number;
  asset: number;
  suggested_vendor: number;
  approver: number;
  reviewers: number[];
  procurement_officers: number[];
}

export interface ResourceData {
  content_type: number;
  object_id: number;
  file: string;
}
