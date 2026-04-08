import { AssetCategory } from "./assetcategory";
import { AssetSubcategory } from "./assetsubcategory";
import { Item } from "./item";
import { Store } from "./store";

interface UserDetail {
  id: number;
  user_id: string; // UUID
  slug: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string; // e.g. "Super Admin"
  status: string; // e.g. "Active"
}

export interface Transfer {
  id: number;
  type: "transfer" | "return"; // e.g. "transfer"
  request_from: number;
  request_from_detail: Store;
  required_date: string; // e.g. "2025-07-06"
  requested_by: number;
  requested_by_detail: UserDetail;
  transfer_to: number;
  transfer_to_detail: Store;
  category: number;
  category_detail: AssetCategory;
  subcategory: number;
  subcategory_detail: AssetSubcategory;
  items: number[];
  items_detail: Item[];
  confirmation_required_from: number[];
  confirmation_required_from_detail: UserDetail[];
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

  