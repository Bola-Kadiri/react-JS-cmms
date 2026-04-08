import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useManufacturer } from '@/hooks/manufacturer/useManufacturerQueries';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const ManufacturerDetailView: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { data: manufacturer, isLoading, error } = useManufacturer(id || '');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading manufacturer details...</p>
        </div>
      </div>
    );
  }

  if (error || !manufacturer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Manufacturer Not Found</h2>
          <p className="text-gray-500 mb-4">
            The manufacturer you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate('/dashboard/asset/inventory-reference/manufacturers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manufacturers
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/asset/inventory-reference/manufacturers')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Building2 className="h-6 w-6 mr-2" />
              {manufacturer.name}
            </h1>
            <p className="text-gray-500">Manufacturer Details</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={manufacturer.is_active ? "default" : "secondary"}>
            {manufacturer.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button
            onClick={() => navigate(`/dashboard/asset/inventory-reference/manufacturers/${manufacturer.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">ID</label>
                <p className="text-lg font-semibold">{manufacturer.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-semibold">{manufacturer.name}</p>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge variant={manufacturer.is_active ? "default" : "secondary"}>
                  {manufacturer.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Information */}
        <Card>
          <CardHeader>
            <CardTitle>Status Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                manufacturer.is_active ? 'bg-green-500' : 'bg-gray-400'
              }`} />
              <div>
                <p className="font-medium">
                  {manufacturer.is_active ? 'Active' : 'Inactive'}
                </p>
                <p className="text-sm text-gray-500">
                  {manufacturer.is_active 
                    ? 'This manufacturer is currently active and available for use.'
                    : 'This manufacturer is inactive and not available for use.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              onClick={() => navigate(`/dashboard/asset/inventory-reference/manufacturers/${manufacturer.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Manufacturer
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/asset/inventory-reference/manufacturers')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 