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

// const endpoint = 'accounts/api/api/facilities/';

// Form schema definition
const categorySchema = z.object({
 code: z.string().min(1, 'Code is required'),
 title: z.string().min(1, 'Title is required'),
 description: z.string().min(1, 'Description is required'),
 problem_type: z.string().min(1, 'Problem type is required'),
 work_request_approved: z.enum(['create_work_order', 'close_work_request']).default('create_work_order'),
 exclude_costing_limit: z.boolean(),
 create_payment_requisition: z.boolean(),
 power: z.boolean(),
 status: z.enum(['Active', 'Inactive']).default('Active'),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

const CategoryForm = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const isEditMode = !!id;
 
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
         <p className="text-sm text-muted-foreground">Loading category details...</p>
       </div>
     </div>
   );
 }

 if (isEditMode && isCategoryError) {
   return (
     <div className="flex flex-col items-center justify-center h-64 gap-4">
       <div className="text-red-500 text-xl">Error loading category details</div>
       <p className="text-sm text-muted-foreground mb-4">
         {categoryError instanceof Error ? categoryError.message : 'An unknown error occurred'}
       </p>
       <Button onClick={handleCancel} variant="outline">
         Back to Categories
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
           {isEditMode ? 'Edit Category' : 'Create New Category'}
         </h1>
       </div>
     </div>

     <Form {...categoryForm}>
       <form onSubmit={categoryForm.handleSubmit(onSubmitBuilding)} className="space-y-6">
         <div className="space-y-4">
           {/* Category Details Section */}
           <Collapsible defaultOpen={true} className="w-full">
             <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
               <h2 className="text-lg font-medium">Category Details</h2>
               {/* <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                 Toggle
               </Button> */}
             </CollapsibleTrigger>
             
             <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 
                 <FormField
                   control={categoryForm.control}
                   name="code"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Code</FormLabel>
                       <FormControl>
                         <Input placeholder="Category code" {...field} />
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
                       <FormLabel>Title</FormLabel>
                       <FormControl>
                         <Input placeholder="Category title" {...field} />
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
                       <FormLabel>Problem Type</FormLabel>
                       <FormControl>
                         <Input placeholder="Category problem type" {...field} />
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
                          checked={!!field.value} // ensures true/false, no null
                          onCheckedChange={(checked) => field.onChange(!!checked)} // convert to boolean
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Exclude costing limit</FormLabel>
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
                          checked={!!field.value} // ensures true/false, no null
                          onCheckedChange={(checked) => field.onChange(!!checked)} // convert to boolean
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Power</FormLabel>
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
                          checked={!!field.value} // ensures true/false, no null
                          onCheckedChange={(checked) => field.onChange(!!checked)} // convert to boolean
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Create payment requisition</FormLabel>
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
                        <FormLabel>Work Request Approved</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work request approved" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="create_work_order">Create work order</SelectItem>
                            <SelectItem value="close_work_request">Close work request</SelectItem>
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
                       <FormLabel>Status</FormLabel>
                       <Select 
                         onValueChange={field.onChange} 
                         value={field.value}
                         defaultValue={field.value}
                       >
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select status" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent>
                           <SelectItem value="Active">Active</SelectItem>
                           <SelectItem value="Inactive">Inactive</SelectItem>
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
                     <FormLabel>Description</FormLabel>
                     <FormControl>
                       <Textarea 
                         placeholder="Enter category description"
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
             Cancel
           </Button>
           
           <Button 
             type="submit"
             disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
           >
             {(createCategoryMutation.isPending || updateCategoryMutation.isPending) && (
               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
             )}
             {isEditMode ? 'Update' : 'Save'}
           </Button>
         </div>
       </form>
     </Form>
   </div>
 );
};

export default CategoryForm;