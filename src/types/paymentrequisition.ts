import { Paymentitem } from "./paymentitem";
import { User } from "./user";
import { Vendor } from "./vendor";
import { Workorder } from "./workorder";

export type Status = 'Active' | 'Inactive';
export type ApprovalStatus = 'request' | 'approve';

export interface ResourceData {
    content_type: number;
    object_id: number;
    file: string;
  }

export interface Paymentrequisition {
    id: number;
    pay_to_detail: Vendor;
    request_to_detail: User[];
    work_orders_detail: Workorder[];
    items_detail: Paymentitem[];
    attachment_data: ResourceData[];
    created_at: string;
    updated_at: string;
    status: Status;
    requisition_date: string;
    requisition_number: string;
    expected_payment_date: string;
    retirement: boolean;
    remark: string;
    approval_status: ApprovalStatus;
    comment: string;
    withholding_tax: string;
    expected_payment_amount: string;
    owner: number;
    pay_to: number;
    work_orders: number[];
    request_to: number[];
    items: number[];
  }