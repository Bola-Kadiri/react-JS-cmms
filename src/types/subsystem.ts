export interface Subsystem {
  id: number;
  name: string;
  building: number;
  building_detail: {
    id: number;
    code: string;
    name: string;
  };
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}
