// src/features/accounts/categories/CategoryForm.tsx
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
import { Category } from '@/types/category';
import { useCategoryQuery, useCreateCategory, useUpdateCategory } from '@/hooks/category/useCategoryQueries';
import { Checkbox } from '@/components/ui/checkbox';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const CategoryForm = () => {
  const { t } = useTypedTranslation('accounts');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  // Form schema — defined inside component so validation messages use t()
  const categorySchema = z.object({
    code: z.string().min(1, t('category.form.validation.codeRequired')),
    title: z.string().min(1, t('category.form.validation.titleRequired')),
    description: z.string().min(1, t('category.form.validation.descriptionRequired')),
    problem_type: z.string().min(1, t('category.form.validation.problemTypeRequired')),
    work_request_approved: z.enum(['create_work_order', 'close_work_request']).default('create_work_order'),
    exclude_costing_limit: z.boolean(),
    create_payment_requisition: z.boolean(),
    power: z.boolean(),
    status: z.enum(['Active', 'Inactive']).default('Active'),
  });

  type CategoryFormValues = z.infer<typeof categorySchema>;

  // Category form setup
  const categoryForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      code: '',
      title: '',
      description: '',
      problem_type: '',
      work_request_approved: 'create_work_order',
      exclude_costing_limit: false,
      create_payment_requisition: false,
      power: false,
      status: 'Active',
    }
  });

  // Fetch category data for edit mode using our custom hook
  const {
    data: categoryData,
    isLoading: isLoadingCategory,
    isError: isCategoryError,
    error: categoryError
  } = useCategoryQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory(id);

  // Handle category data loading
  useEffect(() => {
    if (categoryData && isEditMode) {
      // Reset the form with category data
      categoryForm.reset({
        code: categoryData.code,
        title: categoryData.title,
        description: categoryData.description,
        problem_type: categoryData.problem_type,
        work_request_approved: categoryData.work_request_approved,
        exclude_costing_limit: categoryData.exclude_costing_limit,
        create_payment_requisition: categoryData.create_payment_requisition,
        power: categoryData.power,
        status: categoryData.status,
      });
    }
  }, [categoryData, isEditMode, categoryForm]);

  const onSubmitBuilding = (data: CategoryFormValues) => {
    if (isEditMode && id) {
      updateCategoryMutation.mutate(
        { id, category: data },
        { onSuccess: () => navigate('/dashboard/accounts/categories') }
      );
    } else {
      createCategoryMutation.mutate(
        data as Omit<Category, 'id'>,
        { onSuccess: () => navigate('/dashboard/accounts/categories') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/accounts/categories');
  };

  if (isEditMode && isLoadingCategory) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t('category.form.loading')}</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isCategoryError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">{t('category.form.error')}</div>
        <p className="text-sm text-muted-foreground mb-4">
          {categoryError instanceof Error ? categoryError.message : t('category.form.unknownError')}
        </p>
        <Button onClick={handleCancel} variant="outline">
          {t('category.form.backToList')}
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
            {isEditMode ? t('category.form.editTitle') : t('category.form.createPageTitle')}
          </h1>
        </div>
      </div>

      <Form {...categoryForm}>
        <form onSubmit={categoryForm.handleSubmit(onSubmitBuilding)} className="space-y-6">
          <div className="space-y-4">
            {/* Category Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">{t('category.form.sections.categoryDetails')}</h2>
              </CollapsibleTrigger>

              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={categoryForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('category.form.fields.code')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('category.form.placeholders.code')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={categoryForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('category.form.fields.title')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('category.form.placeholders.title')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={categoryForm.control}
                    name="problem_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('category.form.fields.problemType')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('category.form.placeholders.problemType')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={categoryForm.control}
                    name="exclude_costing_limit"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{t('category.form.checkboxes.excludeCostingLimit')}</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={categoryForm.control}
                    name="power"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{t('category.form.checkboxes.power')}</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={categoryForm.control}
                    name="create_payment_requisition"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{t('category.form.checkboxes.createPaymentRequisition')}</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={categoryForm.control}
                    name="work_request_approved"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('category.form.fields.workRequestApproved')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('category.form.placeholders.selectWorkRequestApproved')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">{t('category.workRequestOptions.none')}</SelectItem>
                            <SelectItem value="create_work_order">{t('category.workRequestOptions.createWorkOrder')}</SelectItem>
                            <SelectItem value="close_work_request">{t('category.workRequestOptions.closeWorkRequest')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={categoryForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('category.form.fields.status')}</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={t('category.form.placeholders.selectStatus')} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Active">{t('category.status.active')}</SelectItem>
                            <SelectItem value="Inactive">{t('category.status.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={categoryForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('category.form.fields.description')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('category.form.placeholders.description')}
                          {...field}
                          className="min-h-[100px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              {t('common:actions.cancel')}
            </Button>

            <Button
              type="submit"
              disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
            >
              {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? t('category.form.update') : t('category.form.save')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CategoryForm;
