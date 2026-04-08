import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Tag, 
  Hash, 
  FileText,
  Percent,
  Calendar,
  Settings
} from 'lucide-react';
import { useAssetCategoryQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';

const AssetCategoryDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Using our custom hook
  const { 
    data: assetCategory, 
    isLoading, 
    isError,
    error 
  } = useAssetCategoryQuery(id);

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/asset/inventory-reference/asset-categories');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/dashboard/asset/inventory-reference/asset-categories/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading asset category details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading asset category details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Asset Categories
        </Button>
      </div>
    );
  }

  if (!assetCategory) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Asset category not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Asset Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {assetCategory.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Asset Category #{assetCategory.id} • {assetCategory.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            {assetCategory.type}
          </Badge>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit Asset Category
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" /> 
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-lg font-semibold">{assetCategory.type}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Code</p>
                <div className="flex items-center gap-2 mt-1">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-semibold">{assetCategory.code}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{assetCategory.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial & Lifecycle Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" /> 
              Financial & Lifecycle
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Salvage Value Percentage</p>
                <div className="flex items-center gap-2 mt-1">
                  <Percent className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-semibold">
                    {assetCategory.salvage_value_percent}%
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground">Useful Life</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-lg font-semibold">
                    {assetCategory.useful_life_year} {assetCategory.useful_life_year === 1 ? 'year' : 'years'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> 
              Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">
                {assetCategory.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{assetCategory.useful_life_year}</div>
          <div className="text-sm text-blue-600">Years Useful Life</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{assetCategory.salvage_value_percent}%</div>
          <div className="text-sm text-green-600">Salvage Value</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{assetCategory.type}</div>
          <div className="text-sm text-purple-600">Category Type</div>
        </div>
      </div>
    </div>
  );
};

export default AssetCategoryDetailView; 