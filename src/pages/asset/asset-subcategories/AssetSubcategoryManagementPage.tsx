import React from 'react';
import { Navigate } from 'react-router-dom';
import AssetSubcategoryManagement from '@/features/asset/assetsubcategory/AssetSubcategoryManagement';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';

const AssetSubcategoryManagementPage: React.FC = () => {
  const { canView } = useFeatureAccess('asset_register');
  
  if (!canView) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="container mx-auto p-6">
      <AssetSubcategoryManagement />
    </div>
  );
};

export default AssetSubcategoryManagementPage; 