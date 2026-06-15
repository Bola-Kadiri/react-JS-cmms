// src/features/asset/items/ItemForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Item } from '@/types/item';
import { useItemQuery, useCreateItem, useUpdateItem } from '@/hooks/item/useItemQueries';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const ItemForm = () => {
  const { t } = useTypedTranslation('assets');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const itemSchema = z.object({
    name: z.string().min(1, t('item.form.validation.nameRequired')),
    description: z.string(),
  });

  type ItemFormValues = z.infer<typeof itemSchema>;

  const itemForm = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  const {
    data: itemData,
    isLoading: isLoadingItem,
    isError: isItemError,
    error: itemError
  } = useItemQuery(isEditMode ? id : undefined);

  const createItemMutation = useCreateItem();
  const updateItemMutation = useUpdateItem(id);

  useEffect(() => {
    if (itemData && isEditMode) {
      itemForm.reset({
        name: itemData.name,
        description: itemData.description,
      });
    }
  }, [itemData, isEditMode, itemForm]);

  const onSubmitBuilding = (data: ItemFormValues) => {
    if (isEditMode && id) {
      updateItemMutation.mutate(
        { id, item: data },
        { onSuccess: () => navigate('/dashboard/asset/items') }
      );
    } else {
      createItemMutation.mutate(
        data as Omit<Item, 'id'>,
        { onSuccess: () => navigate('/dashboard/asset/items') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/items');
  };

  if (isEditMode && isLoadingItem) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('item.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isItemError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('item.form.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {itemError instanceof Error ? itemError.message : t('item.form.errorFallback')}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('item.form.backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? t('item.form.editTitle') : t('item.form.createTitle')}
          </h1>
        </div>
      </div>

      <Form {...itemForm}>
        <form onSubmit={itemForm.handleSubmit(onSubmitBuilding)} className="space-y-6">
          <div className="space-y-4">
            {/* Item Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('item.form.sections.itemDetails')}</h2>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid gap-4">
                  <FormField
                    control={itemForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('item.form.fields.name')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('item.form.placeholders.name')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={itemForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('item.form.fields.description')}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t('item.form.placeholders.description')}
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Form submit buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              {t('item.form.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createItemMutation.isPending || updateItemMutation.isPending}
            >
              {(createItemMutation.isPending || updateItemMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('item.form.update') : t('item.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ItemForm;
