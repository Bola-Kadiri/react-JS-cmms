import WorkordercompletionManagement from '@/features/work/work-order-completions/WorkordercompletionManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const WorkOrderCompletionManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('work_order')
  
    if(hasNoAccess){
      return <Navigate to="/unauthorized" replace />;
    }
  return (
    <>
      <div className="container mx-auto">
        <WorkordercompletionManagement />
      </div>
    </>
  );
};

export default WorkOrderCompletionManagementPage; 