import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useInventoryTypeQuery, useCreateInventoryType, useUpdateInventoryType } from '@/hooks/inventorytype/useInventoryTypeQueries';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

interface InventoryTypeFormProps {
  isEditMode?: boolean;
}

const InventoryTypeForm: React.FC<InventoryTypeFormProps> = ({ isEditMode = false }) => {
  const { t } = useTypedTranslation('assets');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Form schema following the exact requirements
  const formSchema = z.object({
    code: z.string().min(1, 'Code is required'),
    type: z.string().min(1, 'Type is required'),
    unit_of_measurement: z.string().min(1, 'Unit of measurement is required'),
  });

  type FormData = z.infer<typeof formSchema>;

  const { data: inventoryType, isLoading: isLoadingInventoryType } = useInventoryTypeQuery(isEditMode ? id : undefined);

  const createMutation = useCreateInventoryType();
  const updateMutation = useUpdateInventoryType(id);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      type: '',
      unit_of_measurement: '',
    },
  });

  const { handleSubmit, reset, formState: { errors } } = form;

  // Populate form with inventory type data when editing
  useEffect(() => {
    if (isEditMode && inventoryType) {
      reset({
        code: inventoryType.code,
        type: inventoryType.type,
        unit_of_measurement: inventoryType.unit_of_measurement,
      });
    }
  }, [inventoryType, isEditMode, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          inventoryType: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/dashboard/asset/inventory-reference/inventory-types');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/asset/inventory-reference/inventory-types');
  };

  const isLoading = isLoadingInventoryType;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {t('inventoryType.form.backToList')}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? t('inventoryType.form.editTitle') : t('inventoryType.form.createTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('inventoryType.form.fields.code')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('inventoryType.form.placeholders.code')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('inventoryType.form.fields.type')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('inventoryType.form.placeholders.type')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit_of_measurement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('inventoryType.form.fields.unitOfMeasurement')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('inventoryType.form.placeholders.unitOfMeasurement')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? t('inventoryType.form.update') : t('inventoryType.form.create')}
                </Button>
                <Button type="button" variant="outline" onClick={handleBack}>
                  {t('inventoryType.form.cancel')}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryTypeForm;
