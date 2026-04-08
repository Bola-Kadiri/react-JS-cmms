import { AssetCategory } from "./assetcategory";
import { AssetSubcategory } from "./assetsubcategory";

export interface InventoryReference {
  id: number;
  category_detail: AssetCategory;
  subcategory_detail: AssetSubcategory;
  inventory_type: number;
  category: number;
  subcategory: number;
  model_reference: number;
  manufacturer: number;
}