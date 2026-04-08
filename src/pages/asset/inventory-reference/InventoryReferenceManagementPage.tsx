import React from 'react';
import { useParams } from 'react-router-dom';
import { InventoryReferenceForm } from '@/features/asset/inventory-reference/InventoryReferenceForm';
import { InventoryReferenceManagement } from '@/features/asset/inventory-reference/InventoryReferenceManagement';
import { InventoryReferenceDetailView } from '@/features/asset/inventory-reference/InventoryReferenceDetailView';
import { usePermissions } from '@/contexts/PermissionsContext';

interface InventoryReferenceManagementPageProps {
  mode?: 'create' | 'edit' | 'view';
}

const InventoryReferenceManagementPage: React.FC<InventoryReferenceManagementPageProps> = ({ mode }) => {
  const { canView } = usePermissions();

  // Check if user has access to inventory reference management
  if (!canView('reference')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this feature.</p>
        </div>
      </div>
    );
  }

  switch (mode) {
    case 'create':
      return <InventoryReferenceForm mode="create" />;
    case 'edit':
      return <InventoryReferenceForm mode="edit" />;
    case 'view':
      return <InventoryReferenceDetailView />;
    default:
      return <InventoryReferenceManagement />;
  }
};

export { InventoryReferenceManagementPage };
export default InventoryReferenceManagementPage; 