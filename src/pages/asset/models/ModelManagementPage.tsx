import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ModelManagement } from '@/features/asset/model/ModelManagement';
import { ModelForm } from '@/features/asset/model/ModelForm';
import { ModelDetailView } from '@/features/asset/model/ModelDetailView';
import { useModel } from '@/hooks/model/useModelQueries';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PageMode = 'list' | 'create' | 'edit' | 'view';

interface ModelPageProps {
  mode: PageMode;
}

const ModelManagementPage: React.FC<ModelPageProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { data: model, isLoading: isLoadingModel } = useModel(id || '');
  
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
              You don't have permission to access the model management feature.
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
    navigate('/dashboard/asset/inventory-reference/models');
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/inventory-reference/models');
  };

  // Loading state for edit mode
  if (mode === 'edit' && isLoadingModel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading model...</p>
        </div>
      </div>
    );
  }

  // Error state for edit mode
  if (mode === 'edit' && !model && !isLoadingModel) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-xl text-red-600">Model Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              The model you're trying to edit doesn't exist or has been deleted.
            </p>
            <button 
              onClick={handleCancel}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Back to Models
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render appropriate component based on mode
  switch (mode) {
    case 'list':
      return (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => navigate("create")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create Model
            </Button>
          </div>
          <ModelManagement />
        </>
      );
    
    case 'create':
      return (
        <ModelForm 
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      );
    
    case 'edit':
      return (
        <ModelForm 
          model={model}
          onSuccess={handleSuccess} 
          onCancel={handleCancel} 
        />
      );
    
    case 'view':
      return <ModelDetailView />;
    
    default:
      return (
        <ModelManagement 
          createButton={
            <Button
              onClick={() => navigate("create")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Create Model
            </Button>
          }
        />
      );
  }
};

export default ModelManagementPage; 