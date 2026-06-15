import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, FileText, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useInventoryReferenceQuery, useDeleteInventoryReference } from '@/hooks/inventoryreference/useInventoryReferenceQueries';
import { useFormatters } from '@/utils/formatters';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

export const InventoryReferenceDetailView: React.FC = () => {
  const { t } = useTypedTranslation('assets');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatDate } = useFormatters();

  const { data: inventoryReference, isLoading, error } = useInventoryReferenceQuery(id);
  const deleteMutation = useDeleteInventoryReference();

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteMutation.mutateAsync(id);
      navigate('/dashboard/asset/inventory-reference/inventory-references');
    } catch (error) {
      console.error('Error deleting inventory reference:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('inventoryRef.detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !inventoryReference) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{t('inventoryRef.detail.error')}</p>
          <Button onClick={() => window.location.reload()}>
            {t('inventoryRef.detail.tryAgain')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/asset/inventory-reference/inventory-references')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('inventoryRef.detail.backToList')}
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('inventoryRef.detail.heading', { id: inventoryReference.id })}
              </h1>
              <p className="text-gray-600 mt-1">
                {inventoryReference.category_detail.name} - {inventoryReference.subcategory_detail.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link to={`/dashboard/asset/inventory-reference/inventory-references/edit/${inventoryReference.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  {t('inventoryRef.detail.editButton')}
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('inventoryRef.detail.deleteButton')}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('common:confirmation.areYouSure')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('inventoryRef.detail.delete.description')}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common:actions.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {t('inventoryRef.detail.delete.confirm')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">{t('inventoryRef.detail.tabs.overview')}</TabsTrigger>
            <TabsTrigger value="details">{t('inventoryRef.detail.tabs.details')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('inventoryRef.detail.overviewCards.inventoryType')}</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inventoryReference.inventory_type}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('inventoryRef.detail.overviewCards.category')}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inventoryReference.category_detail.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {inventoryReference.category_detail.description}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t('inventoryRef.detail.overviewCards.subcategory')}</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{inventoryReference.subcategory_detail.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {inventoryReference.subcategory_detail.description}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{t('inventoryRef.detail.referenceInfo.title')}</CardTitle>
                <CardDescription>
                  {t('inventoryRef.detail.referenceInfo.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{t('inventoryRef.detail.referenceInfo.modelReference')}</p>
                    <p className="text-sm">{inventoryReference.model_reference}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">{t('inventoryRef.detail.referenceInfo.manufacturer')}</p>
                    <p className="text-sm">{inventoryReference.manufacturer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('inventoryRef.detail.detailedInfo.title')}</CardTitle>
                <CardDescription>
                  {t('inventoryRef.detail.detailedInfo.desc')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">{t('inventoryRef.detail.detailedInfo.refDetails')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">{t('inventoryRef.detail.detailedInfo.id')}</p>
                        <p className="text-sm">{inventoryReference.id}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">{t('inventoryRef.detail.detailedInfo.inventoryType')}</p>
                        <p className="text-sm">{inventoryReference.inventory_type}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">{t('inventoryRef.detail.detailedInfo.modelReference')}</p>
                        <p className="text-sm">{inventoryReference.model_reference}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">{t('inventoryRef.detail.detailedInfo.manufacturer')}</p>
                        <p className="text-sm">{inventoryReference.manufacturer}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">{t('inventoryRef.detail.detailedInfo.categoryInfo')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">{t('inventoryRef.detail.detailedInfo.category')}</p>
                        <p className="text-sm">{inventoryReference.category_detail.name}</p>
                        <p className="text-xs text-gray-500">{inventoryReference.category_detail.description}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">{t('inventoryRef.detail.detailedInfo.subcategory')}</p>
                        <p className="text-sm">{inventoryReference.subcategory_detail.name}</p>
                        <p className="text-xs text-gray-500">{inventoryReference.subcategory_detail.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
