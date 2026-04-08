import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAssetSubcategoryQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { ArrowLeft, Edit, Building, Tag, FileText, Shield, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface AssetSubcategoryDetailViewProps {
  className?: string;
}

const AssetSubcategoryDetailView: React.FC<AssetSubcategoryDetailViewProps> = ({ className }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: assetSubcategory, isLoading, error } = useAssetSubcategoryQuery(id);

  const handleBack = () => {
    navigate('/dashboard/asset/inventory-reference/asset-subcategories');
  };

  const handleEdit = () => {
    navigate(`/dashboard/asset/inventory-reference/asset-subcategories/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !assetSubcategory) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error loading asset subcategory details</p>
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
            Back to Asset Subcategories
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
            <h1 className="text-3xl font-bold">{assetSubcategory.name}</h1>
            <p className="text-gray-600 mt-1">Asset Subcategory Details</p>
          </div>
          <Badge variant={assetSubcategory.is_active ? 'default' : 'secondary'} className="text-sm">
            {assetSubcategory.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Code</p>
                <p className="text-lg font-semibold">{assetSubcategory.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-lg">{assetSubcategory.name}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Type</p>
              <p className="text-lg">{assetSubcategory.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Status</p>
              <Badge variant={assetSubcategory.is_active ? 'default' : 'secondary'}>
                {assetSubcategory.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Asset Category Information */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Asset Category</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {assetSubcategory.asset_category_detail ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Category Name</p>
                  <p className="text-lg font-semibold">{assetSubcategory.asset_category_detail.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category Code</p>
                  <p className="text-lg">{assetSubcategory.asset_category_detail.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category Type</p>
                  <p className="text-lg">{assetSubcategory.asset_category_detail.type}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Salvage Value %</p>
                    <p className="text-lg font-mono">{assetSubcategory.asset_category_detail.salvage_value_percent}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Useful Life</p>
                    <p className="text-lg">{assetSubcategory.asset_category_detail.useful_life_year} years</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No asset category information available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Description</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {assetSubcategory.description || 'No description provided.'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{assetSubcategory.code}</div>
                <div className="text-sm text-blue-600">Subcategory Code</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{assetSubcategory.type}</div>
                <div className="text-sm text-green-600">Type</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {assetSubcategory.asset_category_detail?.name || 'N/A'}
                </div>
                <div className="text-sm text-purple-600">Asset Category</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetSubcategoryDetailView; 