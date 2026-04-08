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

const endpoint = 'accounts/api/categories/';

// Form schema definition
const subcategorySchema = z.object({
 title: z.string().min(1, 'Title is required'),
 category: z.string(),
 exclude_costing_limit: z.boolean(),
 description: z.string().optional(),
 status: z.enum(['Active', 'Inactive']).default('Active'),
});

type SubcategoryFormValues = z.infer<typeof subcategorySchema>;

const SubcategoryForm = () => {
 const { id } = useParams<{ id: string }>();
 const navigate = useNavigate();
 const isEditMode = !!id;
 
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
         <p className="text-sm text-muted-foreground">Loading subcategory details...</p>
       </div>
     </div>
   );
 }

 if (isEditMode && isSubcategoryError) {
   return (
     <div className="flex flex-col items-center justify-center h-64 gap-4">
       <div className="text-red-500 text-xl">Error loading subcategory details</div>
       <p className="text-sm text-muted-foreground mb-4">
         {subcategoryError instanceof Error ? subcategoryError.message : 'An unknown error occurred'}
       </p>
       <Button onClick={handleCancel} variant="outline">
         Back to Subcategories
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
           {isEditMode ? 'Edit Subcategory' : 'Create New Subcategory'}
         </h1>
       </div>
     </div>

     <Form {...subcategoryForm}>
       <form onSubmit={subcategoryForm.handleSubmit(onSubmitSubcategory)} className="space-y-6">
         <div className="space-y-4">
           {/* Subcategory Details Section */}
           <Collapsible defaultOpen={true} className="w-full">
             <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
               <h2 className="text-lg font-medium">Subcategory Details</h2>
               {/* <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                 Toggle
               </Button> */}
             </CollapsibleTrigger>
             
             <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                  
                 <FormField
                   control={subcategoryForm.control}
                   name="title"
                   render={({ field }) => (
                     <FormItem>
                       <FormLabel>Title</FormLabel>
                       <FormControl>
                         <Input placeholder="Subcategory title" {...field} />
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
                       <FormLabel>Category</FormLabel>
                       <Select 
                         onValueChange={field.onChange} 
                         value={field.value}
                         defaultValue={field.value}
                       >
                         <FormControl>
                           <SelectTrigger>
                             <SelectValue placeholder="Select Category" />
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

                <FormField
                    control={subcategoryForm.control}
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
               </div>

               <FormField
                 control={subcategoryForm.control}
                 name="description"
                 render={({ field }) => (
                   <FormItem>
                     <FormLabel>Description</FormLabel>
                     <FormControl>
                       <Textarea 
                         placeholder="Enter subcategory description"
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
             disabled={createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending}
           >
             {(createSubcategoryMutation.isPending || updateSubcategoryMutation.isPending) && (
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

export default SubcategoryForm;