export interface AssetCategory {
  id: number;
  type: string;
  code: string;
  name: string;
  salvage_value_percent: string;
  useful_life_year: number;
  description: string;
  // Admin-managed: allowed on known-cost payment work orders (EKEDC, waste…).
  is_known_cost?: boolean;
}
