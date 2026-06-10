import { Asset } from "./asset";
import { Category, SubCat } from "./category";
import { Facility } from "./facility";

interface Item {
  id: number;
  ppm: number;
  description: string;
  qty: number;
  unit_price: string;
  unit: string;
  total_price: number;
}

export interface Ppm {
  id: number;
  category_detail: Category;
  subcategory_detail: SubCat | null;
  assets_detail: Asset[];
  facilities_detail: Facility[];
  items_detail: Item[];
  created_at: string;
  updated_at: string;
  status: 'Active' | 'Inactive';
  description: string;
  frequency: number;
  frequency_unit: 'Hours' | 'Days' | 'Weeks' | 'Months';
  notify_before_due: number | null;
  notify_unit: 'Hours' | 'Days' | 'Weeks' | 'Months';
  send_reminder_every: number | null;
  reminder_unit: 'Hours' | 'Days' | 'Weeks' | 'Months';
  currency: 'NGN' | 'USD' | 'EUR';
  approval_status: 'Pending' | 'Approved' | 'Rejected';
  rejection_reason: string | null;
  auto_create_work_order: boolean;
  create_work_order_as_approved: boolean;
  activities_safety_tips: string;
  owner: number;
  approver: number | null;
  approver_detail: { id: number; name: string; email: string } | null;
  category: number;
  subcategory: number | null;
  assets: number[];
  facilities: number[];
  buildings: number[];
  items: number[];
}
