import { Apartment } from "./apartment";
import { Asset } from "./asset";
import { Category } from "./category";
import { Facility } from "./facility";
import { Paymentitem } from "./paymentitem";
import { PPMItem } from "./ppmitem";
import { Subcategory } from "./subcategory";

interface Item {
  id: number;
  ppm: number;
  description: string;
  qty: number;
  unit_price: string;  // looks like a money value stored as string
  unit: string;
  total_price: number;
}

  export interface Ppm {
    id: number;
    category_detail: Category;
    subcategory_detail: Subcategory;
    assets_detail: Asset[];
    facilities_detail: Facility[];
    items_detail: Item[];
    create_work_order_now: boolean;
    work_order_priority: 'Low' | 'Medium' | 'High';
    work_order_approved: boolean;
    created_at: string;
    updated_at: string;
    status: 'Active' | 'Inactive';
    description: string;
    start_date: string;
    end_date: string;
    frequency: number;
    frequency_unit: 'Hours' | 'Days' | 'Weeks' | 'Months';
    notify_before_due: number;
    notify_unit: 'Hours' | 'Days' | 'Weeks' | 'Months';
    send_reminder_every: number; 
    reminder_unit: 'Hours' | 'Days' | 'Weeks' | 'Months';
    currency: 'NGN' | 'USD' | 'EUR';
    review_action: 'approve' | 'reject';
    review_status: 'Pending' | 'Reviewed' | 'Rejected';
    reviewer: number;
    reviewed_at: string;
    total_amount: string;
    auto_create_work_order: boolean;
    create_work_order_as_approved: boolean;
    activities_safety_tips: string;
    owner: number;
    category: number;
    subcategory: number;
    assets: number[];
    facilities: number[];
    buildings: number[];
    items: number[];
  }
  