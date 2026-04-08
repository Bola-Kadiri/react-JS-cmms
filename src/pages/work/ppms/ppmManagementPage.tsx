import PpmManagement from '@/features/work/ppms/PpmManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const PpmManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('requisition')
      
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <PpmManagement />
      </div>
    </>
  );
};

export default PpmManagementPage;