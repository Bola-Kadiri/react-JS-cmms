import { Asset } from "./asset";
import { Building } from "./building";
import { Category, SubCat } from "./category";
import { Facility } from "./facility";
import { User } from "./user";
import { Vendor } from "./vendor";
import { WorkrequestQuotationItem } from "./workrequest";

export type Status = 'Active' | 'Inactive';
export type WorkOrderType = 'Unplanned' | 'Planned';
export type Priority = 'Low' | 'Medium' | 'High';
export type PpmType = 'Scheduled' | 'Unscheduled';
export type ApprovalStatus = 'Pending' | 'Reviewed' | 'Approved' | 'Reviewer Rejected' | 'Approver Rejected' | 'Rejected'
export type WorkStatus = 'pending' | 'closed' | 'rejected'
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
//     subcategory_detail: SubCat | null;
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
  approver_detail: User | null;
  category_detail: Category;
  subcategory_detail: SubCat | null;
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
  request_to: number | null;
  invoice_no: string | null;
  reviewer_reason: string | null;
  approver_reason: string | null;
  digital_signature: string | null;
  // Quotation/PO/invoice/attachments are never re-entered on the Work
  // Order — this carries forward the same data the source Work Request's
  // own page shows (see backend WorkOrderSerializer.get_source_work_request_detail).
  // unit_cost_vendor/total_cost_vendor/margin are absent for a Requester,
  // same masking as on the Work Request itself.
  source_work_request_detail: {
    id: number;
    work_request_number: string;
    po_number: string | null;
    po_document: string | null;
    vendor_invoice: string | null;
    attachment: string | null;
    invoice_no: string | null;
    quotation_items: WorkrequestQuotationItem[];
    total_cost_vendor?: string;
    total_cost_client: string;
    margin?: string;
  } | null;
  // Closed/Pending/Rejected tracking of the physical work, separate from
  // approval_status — managed exclusively via the set-status action.
  work_status: WorkStatus;
  // Closure fields — set via set-status, gated on an Approved
  // WorkOrderCompletion existing for this work order (see backend).
  vendor: number | null;
  vendor_detail: Vendor | null;
  technician: number | null;
  technician_detail: User | null;
  rating: number | null;
  started_at: string | null;
  completed_at: string | null;
  // The WCC submitted against this work order, and the Payment Requisition
  // raised from it — both null until they exist (see backend
  // WorkOrderSerializer.get_latest_completion / get_linked_payment_requisition).
  latest_completion: { id: number; wcc_number: string; approval_status: string } | null;
  linked_payment_requisition: { id: number; requisition_number: string; approval_status: 'request' | 'approve' | 'reject' } | null;
}
