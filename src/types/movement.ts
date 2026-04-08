import { Inventory } from "./inventory";

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

interface StoreDetail {
  id: number;
  created_at: string;
  updated_at: string;
  status: string; // e.g. "Active"
  code: string;
  name: string;
  location: string;
  owner: number;
}

export interface Movement {
  id: number;
  inventory: number;
  inventory_detail: Inventory;
  user: number;
  user_detail: UserDetail;
  model: string;
  movement_date: string; // ISO date string
  from_store: number;
  from_store_detail: StoreDetail;
  to_store: number;
  to_store_detail: StoreDetail;
  transfer_quantity: number;
  transfer_unit_price: string;
  transfer_amount: string;
  description: string;
}
