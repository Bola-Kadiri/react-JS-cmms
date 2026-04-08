import ItemRequestManagement from "@/features/asset/itemrequest/ItemRequestManagement";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Navigate } from "react-router-dom";

const ItemRequestManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('asset_register')
    
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <ItemRequestManagement />
      </div>
    </>
  );
};

export default ItemRequestManagementPage; 