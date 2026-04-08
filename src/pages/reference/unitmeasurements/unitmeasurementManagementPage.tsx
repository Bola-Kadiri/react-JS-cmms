import UnitmeasurementManagement from '@/features/reference/unitmeasurements/UnitmeasurementManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const UnitmeasurementManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('reference')
          
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <UnitmeasurementManagement />
      </div>
    </>
  );
};

export default UnitmeasurementManagementPage;