import UserManagement from '@/features/reference/users/UserManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const UserManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('reference')
      
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <UserManagement />
      </div>
    </>
  );
};

export default UserManagementPage;