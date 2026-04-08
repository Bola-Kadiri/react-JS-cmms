import PaymentcommentManagement from '@/features/work/paymentcomments/PaymentcommentManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const PaymentcommentManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('requisition')
    
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <PaymentcommentManagement />
      </div>
    </>
  );
};

export default PaymentcommentManagementPage;