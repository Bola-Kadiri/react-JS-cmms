import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateManufacturer, useUpdateManufacturer } from '@/hooks/manufacturer/useManufacturerQueries';
import { Manufacturer } from '@/types/manufacturer';
import { Loader2, Save, X } from 'lucide-react';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

interface ManufacturerFormProps {
  manufacturer?: Manufacturer;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const ManufacturerForm: React.FC<ManufacturerFormProps> = ({
  manufacturer,
  onCancel,
  onSuccess
}) => {
  const { t } = useTypedTranslation('assets');

  const manufacturerSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    is_active: z.boolean(),
  });

  type ManufacturerFormData = z.infer<typeof manufacturerSchema>;

  const isEditing = Boolean(manufacturer);
  const createManufacturer = useCreateManufacturer();
  const updateManufacturer = useUpdateManufacturer();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ManufacturerFormData>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      name: '',
      is_active: true,
    },
  });

  const isActive = watch('is_active');

  useEffect(() => {
    if (manufacturer) {
      reset({
        name: manufacturer.name,
        is_active: manufacturer.is_active,
      });
    }
  }, [manufacturer, reset]);

  const onSubmit = async (data: ManufacturerFormData) => {
    try {
      if (isEditing && manufacturer) {
        await updateManufacturer.mutateAsync({
          id: manufacturer.id.toString(),
          manufacturer: data,
        });
      } else {
        await createManufacturer.mutateAsync(data as Omit<Manufacturer, 'id'>);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting manufacturer:', error);
    }
  };

  const isLoading = createManufacturer.isPending || updateManufacturer.isPending;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? t('manufacturer.form.editTitle') : t('manufacturer.form.createTitle')}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? t('manufacturer.form.editDesc')
            : t('manufacturer.form.createDesc')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('manufacturer.form.fields.name')}</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter manufacturer name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Is Active Switch */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active">{t('manufacturer.form.fields.active')}</Label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              {t('manufacturer.form.cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? t('manufacturer.form.updating') : t('manufacturer.form.creating')}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? t('manufacturer.form.update') : t('manufacturer.form.create')}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
