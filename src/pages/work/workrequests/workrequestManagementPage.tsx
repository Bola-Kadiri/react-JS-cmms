import WorkrequestManagement from '@/features/work/workrequests/WorkrequestManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const WorkrequestManagementPage = () => {
  const {canView, hasNoAccess} = useFeatureAccess('work_request')

  // if (!canView) {
  //   return (
  //     <div className="flex justify-center items-center h-64">
  //       <div className="text-center">
  //         <h3 className="text-lg font-semibold text-gray-900">Access Denied</h3>
  //         <p className="text-gray-600">You don't have permission to view work requests.</p>
  //       </div>
  //     </div>
  //   );
  // }

  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <>
      <div className="container mx-auto">
        <WorkrequestManagement />
      </div>
    </>
  );
};

export default WorkrequestManagementPage;