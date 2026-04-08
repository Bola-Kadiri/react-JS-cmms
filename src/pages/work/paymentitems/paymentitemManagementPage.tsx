import PaymentitemManagement from '@/features/work/paymentitems/PaymentitemManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const PaymentitemManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('requisition')
    
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <PaymentitemManagement />
      </div>
    </>
  );
};

export default PaymentitemManagementPage;