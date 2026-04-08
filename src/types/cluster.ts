import { Region } from "./region";

export interface Cluster {
  id: number;
  region: number;
  region_detail: Region;
  name: string;
  select_manager: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}
