import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAssetSubcategoryQuery, useCreateAssetSubcategory, useUpdateAssetSubcategory } from '@/hooks/assetsubcategory/useAssetSubcategoryQueries';
import { useAssetCategoriesQuery } from '@/hooks/assetcategory/useAssetCategoryQueries';
import { Loader2, ArrowLeft } from 'lucide-react';

// Form schema following the exact requirements
const formSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  asset_category: z.number().min(1, 'Asset category is required'),
  is_active: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

interface AssetSubcategoryFormProps {
  isEditMode?: boolean;
}

const AssetSubcategoryForm: React.FC<AssetSubcategoryFormProps> = ({ isEditMode = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: assetSubcategory, isLoading: isLoadingAssetSubcategory } = useAssetSubcategoryQuery(isEditMode ? id : undefined);
  const { data: assetCategoriesData, isLoading: isLoadingAssetCategories } = useAssetCategoriesQuery();
  
  const createMutation = useCreateAssetSubcategory();
  const updateMutation = useUpdateAssetSubcategory(id);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      type: '',
      description: '',
      asset_category: 0,
      is_active: true,
    },
  });

  const { handleSubmit, reset, formState: { errors } } = form;

  // Populate form with asset subcategory data when editing
  useEffect(() => {
    if (isEditMode && assetSubcategory) {
      reset({
        code: assetSubcategory.code,
        name: assetSubcategory.name,
        type: assetSubcategory.type,
        description: assetSubcategory.description,
        asset_category: assetSubcategory.asset_category,
        is_active: assetSubcategory.is_active,
      });
    }
  }, [assetSubcategory, isEditMode, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          assetSubcategory: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      navigate('/dashboard/asset/inventory-reference/asset-subcategories');
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleBack = () => {
    navigate('/dashboard/asset/inventory-reference/asset-subcategories');
  };

  const isLoading = isLoadingAssetSubcategory || isLoadingAssetCategories;
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
          Back to Asset Subcategories
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isEditMode ? 'Edit Asset Subcategory' : 'Create Asset Subcategory'}
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
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter name" />
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
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="asset_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Category</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value ? field.value.toString() : ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select asset category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assetCategoriesData?.results.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Enter description" rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Active Status
                      </FormLabel>
                      <FormDescription>
                        Enable or disable this asset subcategory
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditMode ? 'Update' : 'Create'} Asset Subcategory
                </Button>
                <Button type="button" variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetSubcategoryForm; 