import React from 'react';
import { Navigate } from 'react-router-dom';
import InventoryTypeManagement from '@/features/asset/inventorytype/InventoryTypeManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const InventoryTypeManagementPage: React.FC = () => {
  const { canView } = useFeatureAccess('asset_register');
  
  if (!canView) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <InventoryTypeManagement />
    </div>
  );
};

export default InventoryTypeManagementPage; 