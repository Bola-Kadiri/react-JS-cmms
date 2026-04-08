import { AssetCategory } from "./assetcategory";

export interface AssetSubcategory {
  id: number;
  code: string;
  name: string;
  type: string;
  description: string;
  asset_category: number;
  asset_category_detail: AssetCategory;
  is_active: boolean;
}
