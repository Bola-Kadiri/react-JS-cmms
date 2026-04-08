// src/features/facility/facilities/FacilityForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Facility } from '@/types/facility';
import { Cluster } from '@/types/cluster';
import { User } from '@/types/user';
import { useFacilityQuery, useCreateFacility, useUpdateFacility } from '@/hooks/facility/useFacilityQueries';
import { useList } from '@/hooks/crud/useCrudOperations';

const clusterEndpoint = 'facility/api/api/clusters/';
const userEndpoint = 'accounts/api/users/';

// Form schema definition
const facilitySchema = z.object({
  cluster: z.number().min(1, 'Cluster is required'),
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  address_gps: z.string().min(1, 'Address GPS is required'),
  type: z.string().min(1, 'Type is required'),
  manager: z.number().min(1, 'Manager is required'),
});

type FacilityFormValues = z.infer<typeof facilitySchema>;

const FacilityForm = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const isEditMode = !!code;
  
  // Facility form setup
  const facilityForm = useForm<FacilityFormValues>({
    resolver: zodResolver(facilitySchema),
    defaultValues: {
      cluster: 0,
      code: '',
      name: '',
      address_gps: '',
      type: '',
      manager: 0,
    }
  });

  const { data: clusters = [] } = useList<Cluster>('clusters', clusterEndpoint);
  const { data: users = [] } = useList<User>('users', userEndpoint);

  // Fetch facility data for edit mode using our custom hook
  const { 
    data: facilityData, 
    isLoading: isLoadingFacility, 
    isError: isFacilityError,
    error: facilityError
  } = useFacilityQuery(isEditMode ? code : undefined);

  // Use our custom mutation hooks
  const createFacilityMutation = useCreateFacility();
  const updateFacilityMutation = useUpdateFacility(code);

  // Handle facility data loading
  useEffect(() => {
    if (facilityData && isEditMode) {
      // Reset the form with facility data
      facilityForm.reset({
        cluster: facilityData.cluster,
        code: facilityData.code,
        name: facilityData.name,
        address_gps: facilityData.address_gps,
        type: facilityData.type,
        manager: facilityData.manager,
      });
    }
  }, [facilityData, isEditMode, facilityForm]);

  const onSubmitFacility = (data: FacilityFormValues) => {
    if (isEditMode && code) {
      updateFacilityMutation.mutate(
        { code, facility: data },
        { onSuccess: () => navigate('/dashboard/facility/list') }
      );
    } else {
      createFacilityMutation.mutate(
        data as Omit<Facility, 'id'>,
        { onSuccess: () => navigate('/dashboard/facility/list') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/facility/list');
  };

  if (isEditMode && isLoadingFacility) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading facility details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isFacilityError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading facility details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {facilityError instanceof Error ? facilityError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Facilities
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
            {isEditMode ? 'Edit Facility' : 'Create New Facility'}
          </h1>
        </div>
      </div>

      <Form {...facilityForm}>
        <form onSubmit={facilityForm.handleSubmit(onSubmitFacility)} className="space-y-6">
          <div className="space-y-4">
            {/* Facility Information Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Facility Information</h2>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={facilityForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Facility name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={facilityForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Facility code (e.g. FAC-001)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={facilityForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select facility type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Residentials">Residentials</SelectItem>
                            <SelectItem value="Commercial">Commercial</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Mall">Mall</SelectItem>
                            <SelectItem value="Warehouse">Warehouse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={facilityForm.control}
                    name="cluster"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cluster</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select cluster" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clusters.map((cluster) => (
                              <SelectItem key={cluster.id} value={String(cluster.id)}>
                                {cluster.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={facilityForm.control}
                    name="manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select manager" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map((user) => (
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
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={facilityForm.control}
                    name="address_gps"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address GPS</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter the detailed address of the facility including GPS coordinates if available"
                            {...field}
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide the complete physical address and GPS coordinates of the facility
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
              disabled={createFacilityMutation.isPending || updateFacilityMutation.isPending}
            >
              {(createFacilityMutation.isPending || updateFacilityMutation.isPending) && (
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

export default FacilityForm;