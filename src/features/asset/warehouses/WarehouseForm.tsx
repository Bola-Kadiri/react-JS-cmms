// src/features/asset/warehouses/WarehouseForm.tsx
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
import { Warehouse } from '@/types/warehouse';
import { useWarehouseQuery, useCreateWarehouse, useUpdateWarehouse } from '@/hooks/warehouse/useWarehouseQueries';
import { useFacilitiesQuery } from '@/hooks/facility/useFacilityQueries';
import { Checkbox } from '@/components/ui/checkbox';

// Form schema definition matching the Warehouse interface
const warehouseSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  address: z.string().min(1, 'Address is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  facility: z.number().min(1, 'Facility is required'),
  is_active: z.boolean()    
});

type WarehouseFormValues = z.infer<typeof warehouseSchema>;

const WarehouseForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Warehouse form setup
  const warehouseForm = useForm<WarehouseFormValues>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      address: '',
      capacity: '',
      facility: 0,
      is_active: true,
    }
  });

  // Fetch facilities for dropdown
  const { data: facilitiesResponse } = useFacilitiesQuery();
  const facilities = facilitiesResponse?.results || [];

  // Fetch warehouse data for edit mode using our custom hook
  const { 
    data: warehouseData, 
    isLoading: isLoadingWarehouse, 
    isError: isWarehouseError,
    error: warehouseError
  } = useWarehouseQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createWarehouseMutation = useCreateWarehouse();
  const updateWarehouseMutation = useUpdateWarehouse(id);

  // Handle warehouse data loading
  useEffect(() => {
    if (warehouseData && isEditMode) {
      // Reset the form with warehouse data
      warehouseForm.reset({
        code: warehouseData.code,
        name: warehouseData.name,
        description: warehouseData.description,
        address: warehouseData.address,
        capacity: warehouseData.capacity,
        facility: warehouseData.facility,
        is_active: warehouseData.is_active
      });
    }
  }, [warehouseData, isEditMode, warehouseForm]);

  const onSubmitWarehouse = (data: WarehouseFormValues) => {
    if (isEditMode && id) {
      updateWarehouseMutation.mutate(
        { id, warehouse: data },
        { onSuccess: () => navigate('/dashboard/asset/warehouses') }
      );
    } else {
      createWarehouseMutation.mutate(
        data as Omit<Warehouse, 'id'>,
        { onSuccess: () => navigate('/dashboard/asset/warehouses') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/asset/warehouses');
  };

  if (isEditMode && isLoadingWarehouse) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading warehouse details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isWarehouseError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading warehouse details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {warehouseError instanceof Error ? warehouseError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Warehouses
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
          <h1 className="text-3xl font-bold">
            {isEditMode ? 'Edit Warehouse' : 'Create New Warehouse'}
          </h1>
        </div>
      </div>

      <Form {...warehouseForm}>
        <form onSubmit={warehouseForm.handleSubmit(onSubmitWarehouse)} className="space-y-6">
          <div className="space-y-4">
            {/* Warehouse Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="text-xl font-semibold text-gray-800">Warehouse Information</h2>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-lg p-6 space-y-6 bg-white shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={warehouseForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter warehouse code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={warehouseForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter warehouse name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={warehouseForm.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Capacity *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter warehouse capacity" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={warehouseForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Facility *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(Number(value))} value={String(field.value)}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select facility" />
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

                  <FormField
                    control={warehouseForm.control}
                    name="is_active"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0 pt-6">
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-medium text-gray-700">Is Active</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={warehouseForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Address *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter warehouse address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={warehouseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter warehouse description"
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
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel}
              className="px-8"
            >
              Cancel
            </Button>
            
            <Button 
              type="submit"
              disabled={createWarehouseMutation.isPending || updateWarehouseMutation.isPending}
              className="px-8"
            >
              {(createWarehouseMutation.isPending || updateWarehouseMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditMode ? 'Update Warehouse' : 'Create Warehouse'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default WarehouseForm;