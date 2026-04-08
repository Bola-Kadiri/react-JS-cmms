import AssetCategoryManagement from "@/features/asset/assetcategory/AssetCategoryManagement";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Navigate } from "react-router-dom";

const AssetCategoryManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('asset_register')
    
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <AssetCategoryManagement />
      </div>
    </>
  );
};

export default AssetCategoryManagementPage; 