// src/features/facility/personnels/PersonnelForm.tsx
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
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { Personnel } from '@/types/personnel';
import { useList } from '@/hooks/crud/useCrudOperations';
import { User } from '@/types/user';
import { Facility } from '@/pages/facility/facilities/FacilityManagementPage';
import { usePersonnelQuery, useCreatePersonnel, useUpdatePersonnel } from '@/hooks/personnel/usePersonnelQueries';
import { Category } from '@/types/category';

const userEndpoint = 'accounts/api/users/';
const catEndpoint = 'accounts/api/categories/';
const facilityEndpoint = 'facility/api/api/facilities/';

// Form schema definition
const personnelSchema = z.object({
  user: z.number(),
  staff_number: z.string().min(1, 'Staff number is required'),
  facility: z.number(),
  email: z.string().email('Invalid email address'),
  phone_number: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  access_to_all_categories: z.boolean().default(false),
  categories: z.array(z.number()).default([]),
  documents: z.array(z.instanceof(File)).default([]),
});

type PersonnelFormValues = z.infer<typeof personnelSchema>;

const PersonnelForm = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;
  
  // Personnel form setup
  const personnelForm = useForm<PersonnelFormValues>({
    resolver: zodResolver(personnelSchema),
    defaultValues: {
      user: 0,
      staff_number: '',
      facility: 0,
      email: '',
      phone_number: '',
      status: 'Active',
      access_to_all_categories: false,
      categories: [],
      documents: [],
    }
  });

  // Fetch all users & facilities & categories
  const { data: users = [] } = useList<User>('users', userEndpoint);
  const { data: categories = [] } = useList<Category>('categories', catEndpoint);
  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);

  // Fetch personnel data for edit mode using our custom hook
  const { 
    data: personnelData, 
    isLoading: isLoadingPersonnel, 
    isError: isPersonnelError,
    error: personnelError
  } = usePersonnelQuery(isEditMode ? slug : undefined);

  // Use our custom mutation hooks
  const createPersonnelMutation = useCreatePersonnel();
  const updatePersonnelMutation = useUpdatePersonnel(slug);

  // Handle personnel data loading
  useEffect(() => {
    if (personnelData && isEditMode) {
      // Reset the form with personnel data
      personnelForm.reset({
        user: personnelData.user,
        staff_number: personnelData.staff_number,
        facility: personnelData.facility,
        email: personnelData.email,
        phone_number: personnelData.phone_number || '',
        status: personnelData.status,
        access_to_all_categories: personnelData.access_to_all_categories,
        categories: personnelData.categories || [],
        documents: [], // We can't prefill files
      });
    }
  }, [personnelData, isEditMode, personnelForm]);

  // Handle file selection
  const [fileNames, setFileNames] = useState<string[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      personnelForm.setValue('documents', [...personnelForm.getValues('documents'), ...filesArray]);
      setFileNames(prev => [...prev, ...filesArray.map(file => file.name)]);
    }
  };

  // Watch access_to_all_categories to disable category selection when true
  const accessToAllCategories = personnelForm.watch('access_to_all_categories');

  const onSubmitPersonnel = (data: PersonnelFormValues) => {
    // Create FormData object for multipart/form-data submission
    const formData = new FormData();
    
    // Append all form fields to FormData
    formData.append('user', data.user.toString());
    formData.append('staff_number', data.staff_number);
    formData.append('facility', data.facility.toString());
    formData.append('email', data.email);
    if (data.phone_number) formData.append('phone_number', data.phone_number);
    formData.append('status', data.status);
    formData.append('access_to_all_categories', data.access_to_all_categories.toString());
    
    // Append categories as an array
    if (data.categories.length > 0 && !data.access_to_all_categories) {
      data.categories.forEach((categoryId, index) => {
        formData.append(`categories[${index}]`, categoryId.toString());
      });
    }
    
    // Append document files
    data.documents.forEach(file => {
      formData.append('documents', file);
    });
    
    if (isEditMode && slug) {
      updatePersonnelMutation.mutate(
        { slug, personnel: formData },
        { onSuccess: () => navigate('/dashboard/accounts/personnels') }
      );
    } else {
      createPersonnelMutation.mutate(
        formData,
        { onSuccess: () => navigate('/dashboard/accounts/personnels') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/accounts/personnels');
  };

  if (isEditMode && isLoadingPersonnel) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading personnel details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isPersonnelError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading personnel details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {personnelError instanceof Error ? personnelError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Personnels
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
            {isEditMode ? 'Edit Personnel' : 'Create New Personnel'}
          </h1>
        </div>
      </div>

      <Form {...personnelForm}>
        <form onSubmit={personnelForm.handleSubmit(onSubmitPersonnel)} className="space-y-6" encType="multipart/form-data">
          <div className="space-y-4">
            {/* Personnel Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Personnel Details</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  Toggle
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                  
                  <FormField
                    control={personnelForm.control}
                    name="user"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="--Select User--" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {`${user.first_name} ${user.last_name}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personnelForm.control}
                    name="staff_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Staff Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Staff number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personnelForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(parseInt(value))} 
                          value={field.value.toString()}
                          defaultValue={field.value.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="--Select--" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {facilities.map(facility => (
                              <SelectItem key={facility.id} value={String(facility.id)}>
                                {facility.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={personnelForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={personnelForm.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={personnelForm.control}
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

                {/* Categories Section */}
                <div className="space-y-4">
                  <h3 className="font-medium">Categories</h3>
                  
                  <FormField
                    control={personnelForm.control}
                    name="access_to_all_categories"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Access to all categories</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {categories.map((category) => (
                      <FormField
                        key={category.id}
                        control={personnelForm.control}
                        name="categories"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={category.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category.id)}
                                  disabled={accessToAllCategories}
                                  onCheckedChange={(checked) => {
                                    const currentCategories = [...field.value];
                                    if (checked) {
                                      if (!currentCategories.includes(category.id)) {
                                        field.onChange([...currentCategories, category.id]);
                                      }
                                    } else {
                                      field.onChange(currentCategories.filter(id => id !== category.id));
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {category.title}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                {/* Documents Upload Section */}
                <div className="space-y-2">
                  <FormLabel>Documents</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="mb-2"
                    />
                    
                    {fileNames.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-sm font-medium mb-1">Selected files:</h4>
                        <ul className="text-sm pl-5 list-disc">
                          {fileNames.map((name, idx) => (
                            <li key={idx}>{name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
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
              disabled={createPersonnelMutation.isPending || updatePersonnelMutation.isPending}
            >
              {(createPersonnelMutation.isPending || updatePersonnelMutation.isPending) && (
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

export default PersonnelForm;