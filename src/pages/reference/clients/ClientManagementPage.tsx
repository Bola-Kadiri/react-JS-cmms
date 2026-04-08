// src/pages/ClientManagementPage.tsx
import ClientManagement from '@/features/reference/clients/ClientManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Navigate } from 'react-router-dom';

const ClientManagementPage = () => {
  const {hasNoAccess} = useFeatureAccess('reference')
          
  if(hasNoAccess){
    return <Navigate to="/unauthorized" replace />;
  }
  return (
    <>
      <div className="container mx-auto">
        <ClientManagement />
      </div>
    </>
  );
};

export default ClientManagementPage;