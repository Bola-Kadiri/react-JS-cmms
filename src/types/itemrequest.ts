import { AssetCategory } from "./assetcategory";
import { AssetSubcategory } from "./assetsubcategory";
import { InventoryReference } from "./inventoryreference";
import { InventoryType } from "./inventorytype";
import { Store } from "./store";
import { Department } from "./department";
import { Facility } from "./facility";
import { Building } from "./building";
import { Model } from "./model";

interface UserDetail {
  id: number;
  user_id: string;
  slug: string;
  first_name: string;
  last_name: string;
  email: string;
  roles: string; // e.g. "Super Admin"
  status: string;
}

export interface ItemRequestItem {
  item_id: number;
  quantity: number;
  description: string;
  category: number;
  subcategory: number;
  model: number;
}

export interface ItemRequest {
  id: number;
  name: string;
  description: string;
  request_from: number;
  required_date: string; // ISO date string
  requested_by: number;
  department?: number;
  type: "for_use" | "for_store";
  facility?: number;
  building?: number;
  comment: string;
  approved_by: number;
  items: ItemRequestItem[];
  
  // Detail objects for display (optional since API might not always return them)
  request_from_detail?: Store;
  requested_by_detail?: UserDetail;
  department_detail?: Department;
  facility_detail?: Facility;
  building_detail?: Building;
  approved_by_detail?: UserDetail;
}
