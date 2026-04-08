import { Navigate } from 'react-router-dom';
import InvoiceitemManagement from '@/features/work/invoiceitems/InvoiceitemManagement';
// import { useFeatureAccess } from '@/contexts/PermissionsContext';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const InvoiceitemManagementPage = () => {
  const hasAccess = useFeatureAccess('work_order');

  if (!hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <InvoiceitemManagement />;
};

export default InvoiceitemManagementPage; 