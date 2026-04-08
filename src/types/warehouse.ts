import { Facility } from "./facility";

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  description: string;
  address: string;
  capacity: string;
  facility: number;
  facility_detail: Facility;
  is_active: boolean;
}
