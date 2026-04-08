// src/features/facility/buildings/LandlordForm.tsx
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
import { Landlord } from '@/types/landlord';
// import { useList } from '@/hooks/crud/useCrudOperations';
// import { Facility } from '@/pages/facility/facilities/FacilityManagementPage';
import { useLandlordQuery, useCreateLandlord, useUpdateLandlord } from '@/hooks/landlord/useLandlordQueries';

// const endpoint = 'facility/api/api/facilities/';

// Form schema definition
const landlordSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type LandlordFormValues = z.infer<typeof landlordSchema>;

const LandlordForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Landlord form setup
  const landlordForm = useForm<LandlordFormValues>({
    resolver: zodResolver(landlordSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'Active',
    }
  });

  // Fetch landlord data for edit mode using our custom hook
  const { 
    data: landlordData, 
    isLoading: isLoadingLandlord, 
    isError: isLandlordError,
    error: landlordError
  } = useLandlordQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createLandlordMutation = useCreateLandlord();
  const updateLandlordMutation = useUpdateLandlord(id);

  // Handle landlord data loading
  useEffect(() => {
    if (landlordData && isEditMode) {
      // Reset the form with landlord data
      landlordForm.reset({
        name: landlordData.name,
        email: landlordData.email,
        phone: landlordData.phone || '',
        address: landlordData.address || '',
        status: landlordData.status,
      });
    }
  }, [landlordData, isEditMode, landlordForm]);

  const onSubmitBuilding = (data: LandlordFormValues) => {
    if (isEditMode && id) {
      updateLandlordMutation.mutate(
        { id, landlord: data },
        { onSuccess: () => navigate('/facility/landlords') }
      );
    } else {
      createLandlordMutation.mutate(
        data as Omit<Landlord, 'id'>,
        { onSuccess: () => navigate('/facility/landlords') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/facility/landlords');
  };

  if (isEditMode && isLoadingLandlord) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading landlord details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isLandlordError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading landlord details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {landlordError instanceof Error ? landlordError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Landlords
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
            {isEditMode ? 'Edit Landlord' : 'Create New Landlord'}
          </h1>
        </div>
      </div>

      <Form {...landlordForm}>
        <form onSubmit={landlordForm.handleSubmit(onSubmitBuilding)} className="space-y-6">
          <div className="space-y-4">
            {/* Landlord Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Landlord Details</h2>
                {/* <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  Toggle
                </Button> */}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  <FormField
                    control={landlordForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Landlord name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={landlordForm.control}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <FormField
                    control={landlordForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={landlordForm.control}
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
                  control={landlordForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter landlord address"
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
              disabled={createLandlordMutation.isPending || updateLandlordMutation.isPending}
            >
              {(createLandlordMutation.isPending || updateLandlordMutation.isPending) && (
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

export default LandlordForm;