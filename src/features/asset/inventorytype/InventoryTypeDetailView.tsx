import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventoryTypeQuery } from '@/hooks/inventorytype/useInventoryTypeQueries';
import { ArrowLeft, Edit, Tag, Hash, Ruler } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface InventoryTypeDetailViewProps {
  className?: string;
}

const InventoryTypeDetailView: React.FC<InventoryTypeDetailViewProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: inventoryType, isLoading, error } = useInventoryTypeQuery(id);

  const handleBack = () => {
    navigate('/dashboard/asset/inventory-reference/inventory-types');
  };

  const handleEdit = () => {
    navigate(`/dashboard/asset/inventory-reference/inventory-types/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !inventoryType) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading inventory type details</p>
          <Button onClick={handleBack} variant="outline">
            Back to List
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Inventory Types
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Title Section */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{inventoryType.type}</h1>
            <p className="text-gray-600 mt-1">Inventory Type Details</p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Code</p>
                <p className="text-lg font-semibold">{inventoryType.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Type</p>
                <p className="text-lg">{inventoryType.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Unit of Measurement</p>
                <p className="text-lg">{inventoryType.unit_of_measurement}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{inventoryType.code}</div>
                <div className="text-sm text-blue-600">Code</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{inventoryType.type}</div>
                <div className="text-sm text-green-600">Type</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{inventoryType.unit_of_measurement}</div>
                <div className="text-sm text-purple-600">Unit of Measurement</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-orange-500" />
            <CardTitle className="text-lg">Details</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">ID</p>
              <p className="text-lg font-semibold">{inventoryType.id}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Code</p>
              <p className="text-lg">{inventoryType.code}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Measurement Unit</p>
              <p className="text-lg">{inventoryType.unit_of_measurement}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryTypeDetailView; 