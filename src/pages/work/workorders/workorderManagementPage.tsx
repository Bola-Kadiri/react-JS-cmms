import WorkorderManagement from '@/features/work/workorders/WorkorderManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const WorkorderManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('work_order')
  
    if(hasNoAccess){
      return <Navigate to="/unauthorized" replace />;
    }
  return (
    <>
      <div className="container mx-auto">
        <WorkorderManagement />
      </div>
    </>
  );
};

export default WorkorderManagementPage;