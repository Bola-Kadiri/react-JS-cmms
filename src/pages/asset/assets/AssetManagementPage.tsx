import AssetManagement from "@/features/asset/asset/AssetManagement";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Navigate } from "react-router-dom";

const AssetManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('asset_register')
    
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <AssetManagement />
      </div>
    </>
  );
};

export default AssetManagementPage;