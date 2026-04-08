import PaymentrequisitionManagement from '@/features/work/paymentrequisitions/PaymentrequisitionManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const PaymentrequisitionManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('requisition')
      
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <PaymentrequisitionManagement />
      </div>
    </>
  );
};

export default PaymentrequisitionManagementPage;