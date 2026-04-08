export interface Zone {
  id: number;
  code: string;
  name: string;
  facility?: number;
  facility_detail?: {
    id: number;
    code: string;
    name: string;
    cluster: number;
  };
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}
