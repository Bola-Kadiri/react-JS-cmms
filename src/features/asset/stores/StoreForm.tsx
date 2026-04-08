// src/features/asset/stores/StoreForm.tsx
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
import { Store } from '@/types/store';
import { useStoreQuery, useCreateStore, useUpdateStore } from '@/hooks/store/useStoreQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { useWarehousesQuery } from '@/hooks/warehouse/useWarehouseQueries';


// Form schema definition
const storeSchema = z.object({
  facility: z.number().min(1, 'Facility is required'),
  warehouse: z.number().min(1, 'Warehouse is required'),
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  capacity: z.number().min(0, 'Capacity must be a positive number'),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['Active', 'Inactive'], {
    required_error: 'Status is required',
  }),
});

type StoreFormValues = z.infer<typeof storeSchema>;

const StoreForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Store form setup
  const storeForm = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      facility: 0,
      warehouse: 0,
      name: '',
      code: '',
      capacity: 0,
      location: '',
      status: 'Active',
    }
  });

  // Fetch store data for edit mode using our custom hook
  const { 
    data: storeData, 
    isLoading: isLoadingStore, 
    isError: isStoreError,
    error: storeError
  } = useStoreQuery(isEditMode ? id : undefined);

  // Fetch facilities and warehouses for dropdowns
  const { data: facilitiesData, isLoading: isLoadingFacilities } = useFacilitiesQuery();
  const { data: warehousesData, isLoading: isLoadingWarehouses } = useWarehousesQuery();

  // Use our custom mutation hooks
  const createStoreMutation = useCreateStore();
  const updateStoreMutation = useUpdateStore(id);

  // Handle store data loading
  useEffect(() => {
    if (storeData && isEditMode) {
      // Reset the form with store data
      storeForm.reset({
        facility: storeData.facility,
        warehouse: storeData.warehouse,
        name: storeData.name,
        code: storeData.code,
        capacity: storeData.capacity,
        location: storeData.location,
        status: storeData.status as 'Active' | 'Inactive',
      });
    }
  }, [storeData, isEditMode, storeForm]);

  const onSubmitStore = (data: StoreFormValues) => {
    const formattedData = {
      ...data,
      facility: parseInt(data.facility.toString(), 10),
      warehouse: parseInt(data.warehouse.toString(), 10),
      capacity: parseInt(data.capacity.toString(), 10),
    };

    if (isEditMode && id) {
      updateStoreMutation.mutate(
        { id, store: formattedData },
        { onSuccess: () => navigate('/dashboard/asset/stores') }
      );
    } else {
      createStoreMutation.mutate(
        formattedData,
        { onSuccess: () => navigate('/dashboard/asset/stores') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/stores');
  };

  if (isEditMode && isLoadingStore) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading store details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isStoreError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading store details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {storeError instanceof Error ? storeError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Stores
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
            {isEditMode ? 'Edit Store' : 'Create New Store'}
          </h1>
        </div>
      </div>

      <Form {...storeForm}>
        <form onSubmit={storeForm.handleSubmit(onSubmitStore)} className="space-y-6">
          <div className="space-y-4">
            {/* Store Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-50 border-2 border-gray-100 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Store Details</h2>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={storeForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility</FormLabel>
                        <Select
                          value={field.value ? field.value.toString() : ''}
                          onValueChange={(value) => field.onChange(parseInt(value, 10))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select facility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingFacilities ? (
                              <SelectItem value="loading" disabled>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading facilities...
                              </SelectItem>
                            ) : facilitiesData?.results?.length ? (
                              facilitiesData.results.map((facility) => (
                                <SelectItem key={facility.id} value={facility.id.toString()}>
                                  {facility.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-facilities" disabled>
                                No facilities available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storeForm.control}
                    name="warehouse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warehouse</FormLabel>
                        <Select
                          value={field.value ? field.value.toString() : ''}
                          onValueChange={(value) => field.onChange(parseInt(value, 10))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingWarehouses ? (
                              <SelectItem value="loading" disabled>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading warehouses...
                              </SelectItem>
                            ) : warehousesData?.results?.length ? (
                              warehousesData.results.map((warehouse) => (
                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                  {warehouse.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-warehouses" disabled>
                                No warehouses available
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={storeForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Store name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={storeForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Store code (e.g. JXF-20)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={storeForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Capacity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter capacity"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={storeForm.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="Store location" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={storeForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
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
              disabled={createStoreMutation.isPending || updateStoreMutation.isPending}
            >
              {(createStoreMutation.isPending || updateStoreMutation.isPending) && (
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

export default StoreForm;