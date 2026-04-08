import { Facility } from "./facility";
import { Warehouse } from "./warehouse";

export interface Store {
  id: number;
  facility: number;
  facility_detail: Facility;
  warehouse: number;
  warehouse_detail: Warehouse;
  name: string;
  code: string;
  capacity: number;
  location: string;
  status: "Active" | "Inactive"; // e.g. "Active"
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
