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
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const AssetDetailView = () => {
  const { t } = useTypedTranslation('assets');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    data: asset,
    isLoading,
    isError,
    error
  } = useAssetQuery(id);

  const { data: assetCategoriesResponse } = useAssetCategoriesQuery();
  const { data: assetSubcategoriesResponse } = useAssetSubcategoriesQuery();

  const assetCategories = assetCategoriesResponse?.results || [];
  const assetSubcategories = assetSubcategoriesResponse?.results || [];

  const getCategoryDetails = (categoryId: number) => {
    return assetCategories.find(cat => cat.id === categoryId);
  };

  const getSubcategoryDetails = (subcategoryId: number) => {
    return assetSubcategories.find(sub => sub.id === subcategoryId);
  };

  const handleBack = () => {
    navigate('/dashboard/asset/assets');
  };

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
    if (!dateString) return t('detail.notProvided');
    try {
      return format(parseISO(dateString), 'PPP');
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
          <p className="text-sm text-muted-foreground">{t('messages.loadingDetails')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('detail.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : t('detail.errorFallback')}
        </p>
        <Button onClick={handleBack} variant="outline">
          {t('detail.backToAssets')}
        </Button>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('messages.notFound')}</div>
        <Button onClick={handleBack} variant="outline">
          {t('detail.backToAssets')}
        </Button>
      </div>
    );
  }

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
              <Edit className="mr-2 h-4 w-4" /> {t('actions.editAsset')}
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="details">{t('detail.tabs.details')}</TabsTrigger>
          <TabsTrigger value="location">{t('detail.tabs.location')}</TabsTrigger>
          <TabsTrigger value="category">{t('detail.tabs.category')}</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information Card */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  {t('detail.basicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.assetName')}</p>
                      <p className="text-lg font-semibold">{asset.asset_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.assetType')}</p>
                      <Badge className={getAssetTypeColor(asset.asset_type)}>
                        {asset.asset_type}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.condition')}</p>
                      <Badge className={getConditionColor(asset.condition)}>
                        {asset.condition}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.assetTag')}</p>
                      <p className="text-base font-mono bg-gray-100 px-2 py-1 rounded text-center max-w-fit">
                        {asset.asset_tag}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.serialNumber')}</p>
                      <p className="text-base font-mono">
                        {asset.serial_number || t('detail.notProvided')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.ownerLabel')}</p>
                      <p className="text-base">{t('detail.ownerId', { id: asset.owner })}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.purchaseDate')}</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <p className="text-base">{formatDate(asset.purchase_date)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.purchasedAmount')}</p>
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
                  {t('detail.financial')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">{t('detail.purchaseValue')}</p>
                  <p className="text-2xl font-bold text-green-800">
                    {formatCurrency(asset.purchased_amount)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {t('detail.purchasedOn', { date: formatDate(asset.purchase_date) })}
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('detail.lifespan')}</p>
                    <p className="text-base">{asset.lifespan || t('detail.notSpecified')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{t('detail.oemWarranty')}</p>
                    <p className="text-base">{asset.oem_warranty || t('detail.notSpecified')}</p>
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
                {t('detail.locationTitle')}
              </CardTitle>
              <CardDescription>
                {t('detail.locationDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">{t('detail.facilityLabel')}</p>
                  </div>
                  <p className="text-lg font-bold text-blue-800">{t('detail.idLabel', { id: asset.facility })}</p>
                </div>

                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">{t('detail.zoneLabel')}</p>
                  </div>
                  <p className="text-lg font-bold text-green-800">{t('detail.idLabel', { id: asset.zone })}</p>
                </div>

                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">{t('detail.buildingLabel')}</p>
                  </div>
                  <p className="text-lg font-bold text-orange-800">{t('detail.idLabel', { id: asset.building })}</p>
                </div>

                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-purple-600" />
                    <p className="text-sm font-medium text-purple-800">{t('detail.subsystemLabel')}</p>
                  </div>
                  <p className="text-lg font-bold text-purple-800">{t('detail.idLabel', { id: asset.subsystem })}</p>
                </div>
              </div>

              {/* Location Path */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-medium text-gray-700 mb-2">{t('detail.locationPath')}</p>
                <div className="flex items-center text-sm text-gray-600">
                  {t('detail.locationPathValue', {
                    facility: asset.facility,
                    zone: asset.zone,
                    building: asset.building,
                    subsystem: asset.subsystem
                  })}
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
                  {t('detail.categoryTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categoryDetails ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.categoryLabel')}</p>
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
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.typeLabel')}</p>
                      <p className="text-base mt-1">{categoryDetails.type}</p>
                    </div>

                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">{t('detail.categoryNotAvailable')}</p>
                    <p className="text-sm text-muted-foreground">{t('detail.categoryIdLabel', { id: asset.category })}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Asset Subcategory Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  {t('detail.subcategoryTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subcategoryDetails ? (
                  <>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.subcategoryLabel')}</p>
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
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.typeLabel')}</p>
                      <p className="text-base mt-1">{subcategoryDetails.type}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.statusLabel')}</p>
                      <Badge className={`mt-1 ${subcategoryDetails.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {subcategoryDetails.is_active ? t('detail.activeStatus') : t('detail.inactiveStatus')}
                      </Badge>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{t('detail.parentCategoryLabel')}</p>
                      <p className="text-base mt-1">
                        {categoryDetails?.name || t('detail.categoryIdLabel', { id: subcategoryDetails.asset_category })}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">{t('detail.subcategoryNotAvailable')}</p>
                    <p className="text-sm text-muted-foreground">{t('detail.subcategoryIdLabel', { id: asset.subcategory })}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Related Subcategories */}
          {categoryDetails && (
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.relatedSubcategoriesTitle')}</CardTitle>
                <CardDescription>
                  {t('detail.relatedSubcategoriesDesc', { category: categoryDetails.name })}
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
                            <Badge variant="default" className="text-xs">{t('detail.currentBadge')}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {subcat.code}
                          </Badge>
                          <Badge className={`text-xs ${subcat.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {subcat.is_active ? t('detail.activeStatus') : t('detail.inactiveStatus')}
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
