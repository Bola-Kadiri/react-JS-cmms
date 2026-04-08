import PpmitemManagement from '@/features/work/ppmitems/PpmitemManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const PpmitemManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('ppm_item')
      
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <PpmitemManagement />
      </div>
    </>
  );
};

export default PpmitemManagementPage;
