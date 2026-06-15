// src/features/asset/items/ItemDetailView.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react';
import { useItemQuery } from '@/hooks/item/useItemQueries';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const ItemDetailView = () => {
  const { t } = useTypedTranslation('assets');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: item,
    isLoading,
    isError,
    error
  } = useItemQuery(id);

  const handleBack = () => {
    navigate('/dashboard/asset/items');
  };

  const handleEdit = () => {
    navigate(`/dashboard/asset/items/edit/${id}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('item.detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('item.detail.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {error instanceof Error ? error.message : t('item.detail.errorFallback')}
        </p>
        <Button onClick={handleBack} variant="outline">
          {t('item.detail.backToList')}
        </Button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('item.detail.notFound')}</div>
        <Button onClick={handleBack} variant="outline">
          {t('item.detail.backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{t('item.detail.title')}</h1>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" /> {t('item.detail.editButton')}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Item Info Card */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t('item.detail.cards.itemInfo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{t('item.detail.fields.name')}</p>
                  <p className="text-lg">{item.name}</p>
                </div>
              </div>
              <div>
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{t('item.detail.fields.description')}</p>
                  <p className="text-lg">{item.description || t('item.detail.fields.notProvided')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ItemDetailView;
