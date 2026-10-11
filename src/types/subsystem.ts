export interface Subsystem {
  id: number;
  name: string;
  zone?: number | null;
  zone_detail?: {
    id: number;
    code: string;
    name: string;
  } | null;
  building?: number | null;
  building_detail?: {
    id: number;
    code: string;
    name: string;
  } | null;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}
