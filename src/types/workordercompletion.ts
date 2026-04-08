import { User } from "./user";
import { Workorder } from "./workorder";

export interface WorkOrderCompletion {
  id: number;
  work_order_detail: Workorder;
  approved_by_detail: User;
  reviewers_detail: User[];
  is_reviewed: boolean;
  approver_detail: User;
  due_status: string;
  resources: string[];
  resources_data: ResourceData[];
  created_at: string;
  updated_at: string;
  approval_status: "Pending" | "Approved" | "Rejected";
  start_date: string;
  due_date: string;
  owner: number;
  work_order: number;
  approved_by: number;
  approver: number;
  reviewers: number[];
}
  
  export interface ResourceData {
    content_type: number;
    object_id: number;
    file: string;
  }