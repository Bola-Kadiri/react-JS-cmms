import DepartmentManagement from '@/features/reference/departments/DepartmentManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const DepartmentManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('reference')
          
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <DepartmentManagement />
      </div>
    </>
  );
};

export default DepartmentManagementPage;