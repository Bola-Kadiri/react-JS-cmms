import TransferManagement from "@/features/asset/transfer/TransferManagement";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { Navigate } from "react-router-dom";

const TransferManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('transfer_form')
        
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <TransferManagement />
      </div>
    </>
  );
};

export default TransferManagementPage;