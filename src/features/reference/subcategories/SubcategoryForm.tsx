// src/features/accounts/subcategories/SubcategoryForm.tsx
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
import { Subcategory } from '@/types/subcategory';
import { Category } from '@/types/category';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useSubcategoryQuery, useCreateSubcategory, useUpdateSubcategory } from '@/hooks/subcategory/useSubcategoryQueries';
import { Checkbox } from '@/components/ui/checkbox';
import { useTypedTranslation } from '@/hooks/useTypedTranslation';

const endpoint = 'accounts/api/categories/';

const SubcategoryForm = () => {
 const { t } = useTypedTranslation('accounts');
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const isEditMode = !!id;

 // Form schema — defined inside component so validation messages use t()
 const subcategorySchema = z.object({
   title: z.string().min(1, t('subcategory.form.validation.titleRequired')),
   category: z.string(),
   exclude_costing_limit: z.boolean(),
   description: z.string().optional(),
   status: z.enum(['Active', 'Inactive']).default('Active'),
 });

 type SubcategoryFormValues = z.infer<typeof subcategorySchema>;

 // Subcategory form setup
 const subcategoryForm = useForm<SubcategoryFormValues>({
   resolver: zodResolver(subcategorySchema),
   defaultValues: {
     title: '',
     category: '',
     description: '',
     exclude_costing_limit: false,
     status: 'Active',
   }
 });

 // Fetch all categories
 const { data: categories = [] } = useList<Category>('categories', endpoint);

 // Fetch subcategory data for edit mode using our custom hook
 const {
   data: subcategoryData,
   isLoading: isLoadingSubcategory,
   isError: isSubcategoryError,
   error: subcategoryError
 } = useSubcategoryQuery(isEditMode ? id : undefined);

 // Use our custom mutation hooks
 const createSubcategoryMutation = useCreateSubcategory();
 const updateSubcategoryMutation = useUpdateSubcategory(id);

 // Handle subcategory data loading
 useEffect(() => {
   if (subcategoryData && isEditMode) {
     // Reset the form with subcategory data
     subcategoryForm.reset({
       title: subcategoryData.title,
       category: subcategoryData.category,
       description: subcategoryData.description || '',
       exclude_costing_limit: subcategoryData.exclude_costing_limit,
       status: subcategoryData.status,
     });
   }
 }, [subcategoryData, isEditMode, subcategoryForm]);

 const onSubmitSubcategory = (data: SubcategoryFormValues) => {
   if (isEditMode && id) {
     updateSubcategoryMutation.mutate(
       { id, subcategory: data },
       { onSuccess: () => navigate('/dashboard/accounts/subcategories') }
     );
   } else {
     createSubcategoryMutation.mutate(
       data as Omit<Subcategory, 'id'>,
       { onSuccess: () => navigate('/dashboard/accounts/subcategories') }
     );
   }
 };

 const handleCancel = () => {
   navigate('/dashboard/accounts/subcategories');
 };

 if (isEditMode && isLoadingSubcategory) {
   return (
     <div className="flex justify-center items-center h-64">
       <div className="flex flex-col items-center gap-2">
         <Loader2 className="h-8 w-8 animate-spin text-primary" />
         <p className="text-sm text-muted-foreground">{t('subcategory.form.loading')}</p>
       </div>
     </div>
   );
 }

 if (isEditMode && isSubcategoryError) {
   return (
     <div className="flex flex-col items-center justify-center h-64 gap-4">
       <div className="text-red-500 text-xl">{t('subcategory.form.error')}</div>
       <p className="text-sm text-muted-foreground mb-4">
         {subcategoryError instanceof Error ? subcategoryError.message : t('subcategory.form.unknownError')}
       </p>
       <Button onClick={handleCancel} variant="outline">
         {t('subcategory.form.backToList')}
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
           {isEditMode ? t('subcategory.form.editTitle') : t('subcategory.form.createPageTitle')}
         </h1>
       </div>
     </div>

     <Form {...subcategoryForm}>
       <form onSubmit={subcategoryForm.handleSubmit(onSubmitSubcategory)} className="space-y-6">
         <div className="space-y-4">
           {/* Subcategory Details Section */}
           <Collapsible defaultOpen={true} className="w-full">
             <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
               <h2 className="text-lg font-medium">{t('subcategory.form.sections.details')}</h2>
             </CollapsibleTrigger>

             <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                   control={subcategoryForm.control}
                   name="title"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{t('subcategory.form.fields.title')}</FormLabel>
                       <FormControl>
                         <Input placeholder={t('subcategory.form.placeholders.title')} {...field} />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

               <FormField
                   control={subcategoryForm.control}
                   name="category"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{t('subcategory.form.fields.category')}</FormLabel>
                       <Select
                         onValueChange={field.onChange}
                         value={field.value}
                         defaultValue={field.value}
                       >
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder={t('subcategory.form.placeholders.selectCategory')} />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           {categories.map(category => (
                             <SelectItem key={category.id} value={String(category.id) || "0"}>
                               {category.title}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormField
                   control={subcategoryForm.control}
                   name="status"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>{t('subcategory.form.fields.status')}</FormLabel>
                       <Select
                         onValueChange={field.onChange}
                         value={field.value}
                         defaultValue={field.value}
                       >
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder={t('subcategory.form.placeholders.selectStatus')} />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="Active">{t('subcategory.status.active')}</SelectItem>
                           <SelectItem value="Inactive">{t('subcategory.status.inactive')}</SelectItem>
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                <FormField
                    control={subcategoryForm.control}
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
                        <FormLabel className="font-normal">{t('subcategory.form.fields.excludeCostingLimit')}</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </div>

               <FormField
                 control={subcategoryForm.control}
                 name="description"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>{t('subcategory.form.fields.description')}</FormLabel>
                     <FormControl>
                       <Textarea
                         placeholder={t('subcategory.form.placeholders.description')}
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
             disabled={createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending}
           >
             {(createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending) && (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             )}
             {isEditMode ? t('subcategory.form.update') : t('subcategory.form.save')}
           </Button>
         </div>
       </form>
     </Form>
   </div>
 );
};

export default SubcategoryForm;
