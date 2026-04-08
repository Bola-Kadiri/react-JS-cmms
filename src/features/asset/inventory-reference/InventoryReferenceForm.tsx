import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, X } from 'lucide-react';
import { 
  useCreateInventoryReference, 
  useUpdateInventoryReference, 
  useInventoryReferenceQuery 
} from '@/hooks/inventoryreference/useInventoryReferenceQueries';
import { useInventoryTypesQuery } from '@/hooks/inventorytype/useInventoryTypeQueries';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { useAssetSubcategoriesQuery } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useModels } from '@/hooks/model/useModelQueries';
import { useManufacturers } from '@/hooks/manufacturer/useManufacturerQueries';

const formSchema = z.object({
  inventory_type: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(1, 'Inventory type is required')
  ),
  category: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(1, 'Category is required')
  ),
  subcategory: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(1, 'Subcategory is required')
  ),
  model_reference: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(1, 'Model reference is required')
  ),
  manufacturer: z.preprocess(
    (val) => val ? Number(val) : undefined,
    z.number().min(1, 'Manufacturer is required')
  ),
});

type FormData = z.infer<typeof formSchema>;

interface InventoryReferenceFormProps {
  mode: 'create' | 'edit';
}

export const InventoryReferenceForm: React.FC<InventoryReferenceFormProps> = ({ mode }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { data: inventoryReference, isLoading: loadingInventoryReference } = useInventoryReferenceQuery(mode === 'edit' ? id : undefined);
  const { data: inventoryTypesData, isLoading: loadingInventoryTypes } = useInventoryTypesQuery();
  const { data: categoriesData, isLoading: loadingCategories } = useAssetCategoriesQuery();
  const { data: subcategoriesData, isLoading: loadingSubcategories } = useAssetSubcategoriesQuery();
  const { data: modelsData, isLoading: loadingModels } = useModels();
  const { data: manufacturersData, isLoading: loadingManufacturers } = useManufacturers();

  const createMutation = useCreateInventoryReference();
  const updateMutation = useUpdateInventoryReference(id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inventory_type: undefined,
      category: undefined,
      subcategory: undefined,
      model_reference: undefined,
      manufacturer: undefined,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && inventoryReference) {
      reset({
        inventory_type: inventoryReference.inventory_type,
        category: inventoryReference.category,
        subcategory: inventoryReference.subcategory,
        model_reference: inventoryReference.model_reference,
        manufacturer: inventoryReference.manufacturer,
      });
    }
  }, [mode, inventoryReference, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(data);
      } else {
        await updateMutation.mutateAsync({ inventoryReference: data });
      }
      navigate('/dashboard/asset/inventory-reference/inventory-references');
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/inventory-reference/inventory-references');
  };

  const isLoading = loadingInventoryReference || loadingInventoryTypes || loadingCategories || 
                   loadingSubcategories || loadingModels || loadingManufacturers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory References
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Inventory Reference' : 'Edit Inventory Reference'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'create' 
              ? 'Create a new inventory reference entry' 
              : 'Update the inventory reference information'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Reference Details</CardTitle>
            <CardDescription>
              Enter the details for the inventory reference
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Type */}
                <div className="space-y-2">
                  <Label htmlFor="inventory_type">Inventory Type *</Label>
                  <Select
                    value={watch('inventory_type') ? String(watch('inventory_type')) : ''}
                    onValueChange={(value) => setValue('inventory_type', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select inventory type" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryTypesData?.results.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type?.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.inventory_type && (
                    <p className="text-sm text-red-600">{errors.inventory_type.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={watch('category') ? String(watch('category')) : ''}
                    onValueChange={(value) => setValue('category', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesData?.results.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                {/* Subcategory */}
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory *</Label>
                  <Select
                    value={watch('subcategory') ? String(watch('subcategory')) : ''}
                    onValueChange={(value) => setValue('subcategory', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategoriesData?.results.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id.toString()}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.subcategory && (
                    <p className="text-sm text-red-600">{errors.subcategory.message}</p>
                  )}
                </div>

                {/* Model Reference */}
                <div className="space-y-2">
                  <Label htmlFor="model_reference">Model Reference *</Label>
                  <Select
                    value={watch('model_reference') ? String(watch('model_reference')) : ''}
                    onValueChange={(value) => setValue('model_reference', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select model reference" />
                    </SelectTrigger>
                    <SelectContent>
                      {modelsData?.results.map((model) => (
                        <SelectItem key={model.id} value={model.id.toString()}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.model_reference && (
                    <p className="text-sm text-red-600">{errors.model_reference.message}</p>
                  )}
                </div>

                {/* Manufacturer */}
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Manufacturer *</Label>
                  <Select
                    value={watch('manufacturer') ? String(watch('manufacturer')) : ''}
                    onValueChange={(value) => setValue('manufacturer', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manufacturer" />
                    </SelectTrigger>
                    <SelectContent>
                      {manufacturersData?.results.map((manufacturer) => (
                        <SelectItem key={manufacturer.id} value={manufacturer.id.toString()}>
                          {manufacturer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.manufacturer && (
                    <p className="text-sm text-red-600">{errors.manufacturer.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Inventory Reference' : 'Update Inventory Reference'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 