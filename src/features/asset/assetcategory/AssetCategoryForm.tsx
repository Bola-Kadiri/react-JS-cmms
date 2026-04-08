import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AssetCategory } from '@/types/assetcategory';
import { useAssetCategoryQuery, useCreateAssetCategory, useUpdateAssetCategory } from '@/hooks/assetcategory/useAssetCategoryQueries';

// Form schema definition matching the AssetCategory interface
const assetCategorySchema = z.object({
  type: z.string().min(1, 'Type is required'),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  salvage_value_percent: z.string().min(1, 'Salvage value percent is required'),
  useful_life_year: z.number().min(1, 'Useful life year must be at least 1'),
  description: z.string().min(1, 'Description is required'),
});

type AssetCategoryFormValues = z.infer<typeof assetCategorySchema>;

const AssetCategoryForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Asset category form setup
  const assetCategoryForm = useForm<AssetCategoryFormValues>({
    resolver: zodResolver(assetCategorySchema),
    defaultValues: {
      type: '',
      code: '',
      name: '',
      salvage_value_percent: '',
      useful_life_year: 1,
      description: '',
    }
  });

  // Fetch asset category data for edit mode using our custom hook
  const { 
    data: assetCategoryData, 
    isLoading: isLoadingAssetCategory, 
    isError: isAssetCategoryError,
    error: assetCategoryError
  } = useAssetCategoryQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createAssetCategoryMutation = useCreateAssetCategory();
  const updateAssetCategoryMutation = useUpdateAssetCategory(id);

  // Handle asset category data loading
  useEffect(() => {
    if (assetCategoryData && isEditMode) {
      // Reset the form with asset category data
      assetCategoryForm.reset({
        type: assetCategoryData.type,
        code: assetCategoryData.code,
        name: assetCategoryData.name,
        salvage_value_percent: assetCategoryData.salvage_value_percent,
        useful_life_year: assetCategoryData.useful_life_year,
        description: assetCategoryData.description,
      });
    }
  }, [assetCategoryData, isEditMode, assetCategoryForm]);

  const onSubmitAssetCategory = (data: AssetCategoryFormValues) => {
    if (isEditMode && id) {
      updateAssetCategoryMutation.mutate(
        { id, assetCategory: data },
        { onSuccess: () => navigate('/dashboard/asset/inventory-reference/asset-categories') }
      );
    } else {
      createAssetCategoryMutation.mutate(
        data as Omit<AssetCategory, 'id'>,
        { onSuccess: () => navigate('/dashboard/asset/inventory-reference/asset-categories') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/inventory-reference/asset-categories');
  };

  if (isEditMode && isLoadingAssetCategory) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading asset category details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isAssetCategoryError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading asset category details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {assetCategoryError instanceof Error ? assetCategoryError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Asset Categories
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditMode ? 'Edit Asset Category' : 'Create Asset Category'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? 'Update asset category information' : 'Fill in the details to create a new asset category'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border">
        <div className="p-6">
          <Form {...assetCategoryForm}>
            <form onSubmit={assetCategoryForm.handleSubmit(onSubmitAssetCategory)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Type Field */}
                <FormField
                  control={assetCategoryForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter asset category type" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Code Field */}
                <FormField
                  control={assetCategoryForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter asset category code" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name Field */}
                <FormField
                  control={assetCategoryForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter asset category name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Salvage Value Percent Field */}
                <FormField
                  control={assetCategoryForm.control}
                  name="salvage_value_percent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salvage Value Percent *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter salvage value percentage" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Useful Life Year Field */}
                <FormField
                  control={assetCategoryForm.control}
                  name="useful_life_year"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Useful Life Year *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Enter useful life in years" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Field */}
              <FormField
                control={assetCategoryForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter asset category description"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createAssetCategoryMutation.isPending || updateAssetCategoryMutation.isPending}
                >
                  {(createAssetCategoryMutation.isPending || updateAssetCategoryMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Asset Category' : 'Create Asset Category'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AssetCategoryForm; 