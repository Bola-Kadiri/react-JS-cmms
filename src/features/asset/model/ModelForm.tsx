import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateModel, useUpdateModel } from '@/hooks/model/useModelQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useManufacturers } from '@/hooks/manufacturer/useManufacturerQueries';
import { Model } from '@/types/model';
import { Loader2, Save, X } from 'lucide-react';

const modelSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  subcategory: z.number().min(1, 'Subcategory is required'),
  manufacturer: z.number().min(1, 'Manufacturer is required'),
});

type ModelFormData = z.infer<typeof modelSchema>;

interface ModelFormProps {
  model?: Model;
  onCancel: () => void;
  onSuccess?: () => void;
}

export const ModelForm: React.FC<ModelFormProps> = ({ 
  model, 
  onCancel, 
  onSuccess 
}) => {
  const isEditing = Boolean(model);
  const createModel = useCreateModel();
  const updateModel = useUpdateModel();

  // Fetch subcategories and manufacturers for dropdowns
  const { data: subcategoriesResponse } = useAssetSubcategoriesQuery();
  const { data: manufacturersResponse } = useManufacturers();

  const subcategories = subcategoriesResponse?.results || [];
  const manufacturers = manufacturersResponse?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      code: '',
      name: '',
      subcategory: 0,
      manufacturer: 0,
    },
  });

  const selectedSubcategory = watch('subcategory');
  const selectedManufacturer = watch('manufacturer');

  useEffect(() => {
    if (model) {
      reset({
        code: model.code,
        name: model.name,
        subcategory: model.subcategory,
        manufacturer: model.manufacturer,
      });
    }
  }, [model, reset]);

  const onSubmit = async (data: ModelFormData) => {
    try {
      if (isEditing && model) {
        await updateModel.mutateAsync({
          id: model.id.toString(),
          model: data,
        });
      } else {
        await createModel.mutateAsync(data as Omit<Model, 'id'>);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting model:', error);
    }
  };

  const isLoading = createModel.isPending || updateModel.isPending;

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Model' : 'Create New Model'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update the model information below.'
            : 'Enter the model details below.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Code Field */}
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="Enter model code"
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>

            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter model name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Subcategory Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="subcategory">Asset Subcategory</Label>
              <Select
                value={selectedSubcategory ? selectedSubcategory.toString() : ''}
                onValueChange={(value) => setValue('subcategory', parseInt(value, 10))}
              >
                <SelectTrigger className={errors.subcategory ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => (
                    <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                      {subcategory.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.subcategory && (
                <p className="text-sm text-red-500">{errors.subcategory.message}</p>
              )}
            </div>

            {/* Manufacturer Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Select
                value={selectedManufacturer ? selectedManufacturer.toString() : ''}
                onValueChange={(value) => setValue('manufacturer', parseInt(value, 10))}
              >
                <SelectTrigger className={errors.manufacturer ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturers.map((manufacturer) => (
                    <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                      {manufacturer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.manufacturer && (
                <p className="text-sm text-red-500">{errors.manufacturer.message}</p>
              )}
            </div>
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
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}; 