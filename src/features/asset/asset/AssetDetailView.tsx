// src/features/asset/assets/AssetDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Loader2, 
  Package, 
  Calendar, 
  Tag, 
  Hash, 
  DollarSign, 
  MapPin, 
  ShieldCheck,
  User,
  Bookmark,
  Building,
  Settings,
  Clock
} from 'lucide-react';
import { useAssetQuery } from '@/hooks/asset/useAssetQueries';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useToast } from '@/components/ui/use-toast';
import { PermissionGuard } from '@/components/PermissionGuard';

const AssetDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Using our custom hook instead of direct query
  const { 
    data: asset, 
    isLoading, 
    isError,
    error 
  } = useAssetQuery(id);

  // Fetch asset categories and subcategories for proper display
  const { data: assetCategoriesResponse } = useAssetCategoriesQuery();
  const { data: assetSubcategoriesResponse } = useAssetSubcategoriesQuery();
  
  const assetCategories = assetCategoriesResponse?.results || [];
  const assetSubcategories = assetSubcategoriesResponse?.results || [];

  // Helper functions to get category and subcategory details
  const getCategoryDetails = (categoryId: number) => {
    return assetCategories.find(cat => cat.id === categoryId);
  };

  const getSubcategoryDetails = (subcategoryId: number) => {
    return assetSubcategories.find(sub => sub.id === subcategoryId);
  };

  // Handle back button click
  const handleBack = () => {
    navigate('/dashboard/asset/assets');
  };

  // Handle edit button click
  const handleEdit = () => {
    navigate(`/asset/assets/edit/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'brand new':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'used':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getAssetTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'asset':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'consumable':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    try {
      return format(parseISO(dateString), 'PPP'); // Format: 'April 29, 2025'
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount: string | number) => {
    if (!amount) return '₦0.00';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(Number(amount));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading asset details...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading asset details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleBack} variant="outline">
          Back to Assets
        </Button>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Asset not found</div>
        <Button onClick={handleBack} variant="outline">
          Back to Assets
        </Button>
      </div>
    );
  }

  // Get category and subcategory details for this asset
  const categoryDetails = getCategoryDetails(asset.category);
  const subcategoryDetails = getSubcategoryDetails(asset.subcategory);

  return (
    <div className="container mx-auto py-6 max-w-6xl">
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
              {asset.asset_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Asset #{asset.id} • {asset.asset_tag}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getAssetTypeColor(asset.asset_type)}>
            {asset.asset_type}
          </Badge>
          <Badge className={getConditionColor(asset.condition)}>
            {asset.condition}
          </Badge>
          <PermissionGuard feature='asset_register' permission='edit'>
            <Button onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit Asset
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Asset Details</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="category">Category</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> 
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Asset Name</p>
                      <p className="text-lg font-semibold">{asset.asset_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Asset Type</p>
                      <Badge className={getAssetTypeColor(asset.asset_type)}>
                        {asset.asset_type}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Condition</p>
                      <Badge className={getConditionColor(asset.condition)}>
                        {asset.condition}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Asset Tag</p>
                      <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded text-center max-w-fit">
                        {asset.asset_tag}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Serial Number</p>
                      <p className="text-base font-mono">
                        {asset.serial_number || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Owner</p>
                      <p className="text-base">Owner ID: {asset.owner}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Purchase Date</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-base">{formatDate(asset.purchase_date)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Purchased Amount</p>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(asset.purchased_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" /> 
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">Purchase Value</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(asset.purchased_amount)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Purchased on {formatDate(asset.purchase_date)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lifespan</p>
                    <p className="text-base">{asset.lifespan || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">OEM Warranty</p>
                    <p className="text-base">{asset.oem_warranty || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> 
                Location Hierarchy
              </CardTitle>
              <CardDescription>
                Asset location within the facility structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Facility</p>
                  </div>
                  <p className="text-lg font-bold text-blue-800">ID: {asset.facility}</p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">Zone</p>
                  </div>
                  <p className="text-lg font-bold text-green-800">ID: {asset.zone}</p>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">Building</p>
                  </div>
                  <p className="text-lg font-bold text-orange-800">ID: {asset.building}</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-purple-600" />
                    <p className="text-sm font-medium text-purple-800">Subsystem</p>
                  </div>
                  <p className="text-lg font-bold text-purple-800">ID: {asset.subsystem}</p>
                </div>
              </div>
              
              {/* Location Path */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-2">Location Path</p>
                <div className="flex items-center text-sm text-gray-600">
                  <span>Facility {asset.facility}</span>
                  <span className="mx-2">→</span>
                  <span>Zone {asset.zone}</span>
                  <span className="mx-2">→</span>
                  <span>Building {asset.building}</span>
                  <span className="mx-2">→</span>
                  <span>Subsystem {asset.subsystem}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="category" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset Category Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bookmark className="h-5 w-5 text-primary" /> 
                  Asset Category Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryDetails ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Category</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-medium">
                          {categoryDetails.code}
                        </Badge>
                        <p className="text-lg font-semibold">{categoryDetails.name}</p>
                      </div>
                      {categoryDetails.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {categoryDetails.description}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-base mt-1">{categoryDetails.type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={`mt-1 ${categoryDetails.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {categoryDetails.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Category information not available</p>
                    <p className="text-sm text-muted-foreground">Category ID: {asset.category}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Asset Subcategory Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> 
                  Asset Subcategory Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subcategoryDetails ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Subcategory</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="font-medium">
                          {subcategoryDetails.code}
                        </Badge>
                        <p className="text-lg font-semibold">{subcategoryDetails.name}</p>
                      </div>
                      {subcategoryDetails.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {subcategoryDetails.description}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-base mt-1">{subcategoryDetails.type}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={`mt-1 ${subcategoryDetails.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {subcategoryDetails.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Parent Category</p>
                      <p className="text-base mt-1">
                        {categoryDetails?.name || `Category ID: ${subcategoryDetails.asset_category}`}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Subcategory information not available</p>
                    <p className="text-sm text-muted-foreground">Subcategory ID: {asset.subcategory}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Related Subcategories */}
          {categoryDetails && (
            <Card>
              <CardHeader>
                <CardTitle>Related Asset Subcategories</CardTitle>
                <CardDescription>
                  Other subcategories under the "{categoryDetails.name}" category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assetSubcategories
                    .filter(sub => sub.asset_category === asset.category)
                    .map((subcat) => (
                      <div 
                        key={subcat.id} 
                        className={`p-3 rounded-lg border ${
                          subcat.id === asset.subcategory 
                            ? 'bg-primary/10 border-primary' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{subcat.name}</p>
                          {subcat.id === asset.subcategory && (
                            <Badge variant="default" className="text-xs">Current</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {subcat.code}
                          </Badge>
                          <Badge className={`text-xs ${subcat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {subcat.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {subcat.description && (
                          <p className="text-xs text-muted-foreground">{subcat.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssetDetailView;