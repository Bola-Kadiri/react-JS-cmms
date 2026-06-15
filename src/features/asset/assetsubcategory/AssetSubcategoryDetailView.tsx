import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAssetSubcategoryQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { ArrowLeft, Edit, Building, Tag, FileText, Shield, User } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

interface AssetSubcategoryDetailViewProps {
  className?: string;
}

const AssetSubcategoryDetailView: React.FC<AssetSubcategoryDetailViewProps> = ({ className }) => {
  const { t } = useTypedTranslation('assets');
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
          <p className="text-red-500 mb-2">{t('assetSubcategory.detail.error')}</p>
          <Button onClick={handleBack} variant="outline">
            {t('assetSubcategory.detail.backToListShort')}
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
            {t('assetSubcategory.detail.backToList')}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleEdit} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            {t('assetSubcategory.detail.editButton')}
          </Button>
        </div>
      </div>

      {/* Title Section */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{assetSubcategory.name}</h1>
            <p className="text-gray-600 mt-1">{t('assetSubcategory.detail.subtitle')}</p>
          </div>
          <Badge variant={assetSubcategory.is_active ? 'default' : 'secondary'} className="text-sm">
            {assetSubcategory.is_active ? t('assetSubcategory.detail.badge.active') : t('assetSubcategory.detail.badge.inactive')}
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
              <CardTitle className="text-lg">{t('assetSubcategory.detail.cards.basicInfo')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.code')}</p>
                <p className="text-lg font-semibold">{assetSubcategory.code}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.name')}</p>
                <p className="text-lg">{assetSubcategory.name}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.type')}</p>
              <p className="text-lg">{assetSubcategory.type}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.status')}</p>
              <Badge variant={assetSubcategory.is_active ? 'default' : 'secondary'}>
                {assetSubcategory.is_active ? t('assetSubcategory.detail.badge.active') : t('assetSubcategory.detail.badge.inactive')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Asset Category Information */}
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">{t('assetSubcategory.detail.cards.assetCategory')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {assetSubcategory.asset_category_detail ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.categoryName')}</p>
                  <p className="text-lg font-semibold">{assetSubcategory.asset_category_detail.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.categoryCode')}</p>
                  <p className="text-lg">{assetSubcategory.asset_category_detail.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.categoryType')}</p>
                  <p className="text-lg">{assetSubcategory.asset_category_detail.type}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.salvageValuePercent')}</p>
                    <p className="text-lg font-mono">{assetSubcategory.asset_category_detail.salvage_value_percent}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('assetSubcategory.detail.fields.usefulLife')}</p>
                    <p className="text-lg">{assetSubcategory.asset_category_detail.useful_life_year} {t('assetSubcategory.detail.years')}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('assetSubcategory.detail.noCategoryInfo')}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">{t('assetSubcategory.detail.cards.description')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {assetSubcategory.description || t('assetSubcategory.detail.noDescription')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <CardTitle className="text-lg">{t('assetSubcategory.detail.cards.summary')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{assetSubcategory.code}</div>
                <div className="text-sm text-blue-600">{t('assetSubcategory.detail.fields.subcategoryCode')}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{assetSubcategory.type}</div>
                <div className="text-sm text-green-600">{t('assetSubcategory.detail.fields.type')}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {assetSubcategory.asset_category_detail?.name || t('assetSubcategory.detail.na')}
                </div>
                <div className="text-sm text-purple-600">{t('assetSubcategory.detail.fields.assetCategory')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetSubcategoryDetailView;
