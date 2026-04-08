export interface Region {
  id: number;
  name: string;
  country: string;
  select_manager: number;
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
}
