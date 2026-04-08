import { AssetCategory } from "./assetcategory";
import { AssetSubcategory } from "./assetsubcategory";
import { Facility } from "./facility";
import { Vendor } from "./vendor";

export interface Inventory {
  id: number;
  type: number;
  category: number;
  category_detail: AssetCategory;
  subcategory: number;
  subcategory_detail: AssetSubcategory;
  model: number;
  part_no: string;
  tag: string;
  serial_number: string;
  quantity: number;
  unit_price: string;
  log_value: string;
  vendor: number;
  vendor_detail: Vendor;
  purchase_number: string;
  purchase_date: string; // e.g. "2025-07-06"
  manufacture_date: string;
  expiry_date: string;
  warranty_end_date: string;
  facility: number;
  facility_detail: Facility;
  reorder_level: number;
  minimum_stock: number;
  max_stock: number;
  flags: string;
  status: "Available" | "Low Stock" | "Out of Stock" | "Discontinued";
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  total_value: string;
}
