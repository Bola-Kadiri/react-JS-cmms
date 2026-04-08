import { Category } from "./category";

export interface Asset {
  id: number;
  asset_name: string;
  asset_type: "Asset" | "Consumable"; 
  condition: "Used" | "Brand New"; 
  category_detail: Category;
  subcategory_detail: {
    id: number;
    category: number;
    title: string;
    description?: string | null;
    exclude_costing_limit: boolean;
    status: "Active" | "Inactive";
  };
  created_at: string;
  updated_at: string;
  purchase_date: string; // ISO date string
  purchased_amount: string;
  serial_number?: string;
  asset_tag: string;
  lifespan?: string;
  oem_warranty?: string;
  oem_warranty_en?: string;
  oem_warranty_fr?: string | null;
  oem_warranty_es?: string | null;
  owner: number;
  facility: number;
  zone: number;
  building: number;
  subsystem: number;
  category: number;
  subcategory: number;
}
