import PersonnelManagement from '@/features/reference/personnels/PersonnelManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const PersonnelManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('reference')
        
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <PersonnelManagement />
      </div>
    </>
  );
};

export default PersonnelManagementPage;