import InventoryManagement from "@/features/asset/inventory/InventoryManagement";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Navigate } from "react-router-dom";

const InventoryManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('inventory_register')
      
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <InventoryManagement />
      </div>
    </>
  );
};

export default InventoryManagementPage;