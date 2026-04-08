import BankaccountManagement from '@/features/reference/bankaccounts/BankaccountManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const BankaccountManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('reference')
          
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <BankaccountManagement />
      </div>
    </>
  );
};

export default BankaccountManagementPage;