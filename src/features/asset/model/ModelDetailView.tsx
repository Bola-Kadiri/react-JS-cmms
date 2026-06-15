import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useModel } from '@/hooks/model/useModelQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useManufacturers } from '@/hooks/manufacturer/useManufacturerQueries';
import {
  ArrowLeft,
  Edit,
  Loader2,
  Package,
  AlertTriangle
} from 'lucide-react';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

export const ModelDetailView: React.FC = () => {
  const { t } = useTypedTranslation('assets');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: model, isLoading, error } = useModel(id || '');
  const { data: subcategoriesResponse } = useAssetSubcategoriesQuery();
  const { data: manufacturersResponse } = useManufacturers();

  const subcategories = subcategoriesResponse?.results || [];
  const manufacturers = manufacturersResponse?.results || [];

  const getSubcategoryName = (subcategoryId: number) => {
    const subcategory = subcategories.find(s => s.id === subcategoryId);
    return subcategory?.name || 'Unknown';
  };

  const getManufacturerName = (manufacturerId: number) => {
    const manufacturer = manufacturers.find(m => m.id === manufacturerId);
    return manufacturer?.name || 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">{t('model.detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">{t('model.detail.notFound')}</h2>
          <p className="text-gray-500 mb-4">
            {t('model.detail.notFoundDesc')}
          </p>
          <Button onClick={() => navigate('/dashboard/asset/inventory-reference/models')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('model.detail.backToList')}
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
            onClick={() => navigate('/dashboard/asset/inventory-reference/models')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('model.detail.backButton')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Package className="h-6 w-6 mr-2" />
              {model.name}
            </h1>
            <p className="text-gray-500">{t('model.detail.subtitle')}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => navigate(`/dashboard/asset/inventory-reference/models/${model.id}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            {t('model.detail.editButton')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('model.detail.cards.basicInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('model.detail.fields.id')}</label>
                <p className="text-lg font-semibold">{model.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('model.detail.fields.code')}</label>
                <p className="text-lg font-semibold">{model.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('model.detail.fields.name')}</label>
                <p className="text-lg font-semibold">{model.name}</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('model.detail.fields.subcategory')}</label>
                <p className="text-lg font-semibold">{getSubcategoryName(model.subcategory)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('model.detail.fields.manufacturer')}</label>
                <p className="text-lg font-semibold">{getManufacturerName(model.manufacturer)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t('model.detail.cards.relatedInfo')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">{t('model.detail.fields.assetSubcategory')}</label>
              <div className="mt-1 p-2 bg-gray-50 rounded">
                <p className="font-medium">{getSubcategoryName(model.subcategory)}</p>
                <p className="text-sm text-gray-600">ID: {model.subcategory}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">{t('model.detail.fields.manufacturer')}</label>
              <div className="mt-1 p-2 bg-gray-50 rounded">
                <p className="font-medium">{getManufacturerName(model.manufacturer)}</p>
                <p className="text-sm text-gray-600">ID: {model.manufacturer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t('model.detail.cards.actionsCard')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button
              onClick={() => navigate(`/dashboard/asset/inventory-reference/models/${model.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('model.detail.actions.edit')}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard/asset/inventory-reference/models')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('model.detail.actions.backToList')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
