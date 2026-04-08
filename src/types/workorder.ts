import { Apartment } from "./apartment";
import { Asset } from "./asset";
import { Building } from "./building";
import { Category } from "./category";
import { Department } from "./department";
import { Facility } from "./facility";
import { Subcategory } from "./subcategory";
import { User } from "./user";

export type Status = 'Active' | 'Inactive';
export type WorkOrderType = 'Unplanned' | 'Planned';
export type Priority = 'Low' | 'Medium' | 'High';
export type PpmType = 'Scheduled' | 'Unscheduled';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected'
export type Currency = 'USD' | 'EUR' | 'NGN'

export interface ResourceData {
    content_type: number;
    object_id: number;
    file: string;
}

// export interface Workorder {
//     id: number;
//     requester_detail: User;
//     request_to_detail: User;
//     category_detail: Category;
//     subcategory_detail: Subcategory;
//     department_detail: Department;
//     facility_detail: Facility;
//     apartment_detail: Apartment;
//     asset_detail: Asset;
//     resources: string[];
//     resources_data: ResourceData[];
//     created_at: string;
//     updated_at: string;
//     status: Status;
//     type: WorkOrderType;
//     work_order_number: string;
//     sub_type: string;
//     priority: Priority;
//     ppm_type: PpmType;
//     title: string;
//     description: string;
//     expected_start_date: string;
//     expected_start_time: string;
//     duration: string;
//     approved: boolean;
//     mobilization_fee_required: boolean;
//     po_required: boolean;
//     is_approved: boolean;
//     remark: string;
//     item_cost: string;
//     payment_requisition: boolean;
//     approval_status: ApprovalStatus;
//     currency: Currency;
//     exclude_management_fee: boolean;
//     add_discount: boolean;
//     slug: string;
//     require_mobilization_fee: boolean;
//     follow_up_notes: string;
//     invoice_no: string;
//     owner: number;
//     facility: number;
//     apartment: number;
//     category: number;
//     subcategory: number;
//     department: number;
//     requester: number;
//     work_owner: number;
//     request_to: number;
//     follow_up: number;
//     asset: number;
//     files: number[];
//   }

  export interface Workorder {
  id: number;
  requester_detail: User;
  request_to_detail: User;
  reviewers_detail: User[];
  category_detail: Category;
  subcategory_detail: Subcategory;
  facility_detail: Facility;
  building_detail: Building;
  asset_detail: Asset;
  resources_data?: ResourceData[];
  created_at: string;
  updated_at: string;
  status: Status;
  type: 'FROM-PPM' | 'FROM-WORK-REQUEST' | 'RAISE-PAYMENT';
  title: string;
  expected_start_date: string;
  description: string;
  due_status: string;
  priority: Priority;
  cost: string;
  currency: Currency;
  approval_status: ApprovalStatus;
  is_reviewed: boolean;
  is_approved: boolean;
  require_quotation: boolean;
  payment_requisition: boolean;
  wo_required: boolean;
  work_order_number: string;
  slug: string;
  owner: number;
  source_ppm: number;
  source_work_request: number;
  category: number;
  subcategory: number;
  facility: number;
  building: number;
  requester: number;
  department: number;
  asset: number;
  reviewers: number[];
  approver: number;
}
