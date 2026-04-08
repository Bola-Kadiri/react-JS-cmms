import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ManufacturerManagement } from '@/features/asset/manufacturer/ManufacturerManagement';
import { ManufacturerForm } from '@/features/asset/manufacturer/ManufacturerForm';
import { ManufacturerDetailView } from '@/features/asset/manufacturer/ManufacturerDetailView';
import { useManufacturer } from '@/hooks/manufacturer/useManufacturerQueries';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

type PageMode = 'list' | 'create' | 'edit' | 'view';

interface ManufacturerPageProps {
  mode: PageMode;
}

const ManufacturerManagementPage: React.FC<ManufacturerPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { data: manufacturer, isLoading: isLoadingManufacturer } = useManufacturer(id || '');
  
  const { hasViewPermission } = useFeatureAccess('asset_register');

  // Show access denied if user doesn't have permission
  if (!hasViewPermission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              You don't have permission to access the manufacturer management feature.
            </p>
            <p className="text-sm text-gray-500">
              Please contact your administrator if you believe this is an error.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuccess = () => {
    navigate('/dashboard/asset/inventory-reference/manufacturers');
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/inventory-reference/manufacturers');
  };

  // Loading state for edit mode
  if (mode === 'edit' && isLoadingManufacturer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading manufacturer...</p>
        </div>
      </div>
    );
  }

  // Error state for edit mode
  if (mode === 'edit' && !manufacturer && !isLoadingManufacturer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">Manufacturer Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              The manufacturer you're trying to edit doesn't exist or has been deleted.
            </p>
            <button 
              onClick={handleCancel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Back to Manufacturers
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render appropriate component based on mode
  switch (mode) {
    case 'list':
      return <ManufacturerManagement />;
    
    case 'create':
      return (
        <ManufacturerForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      );
    
    case 'edit':
      return (
        <ManufacturerForm 
          manufacturer={manufacturer}
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      );
    
    case 'view':
      return <ManufacturerDetailView />;
    
    default:
      return <ManufacturerManagement />;
  }
};

export default ManufacturerManagementPage; 