// src/features/facility/zones/ZoneForm.tsx
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Zone } from '@/types/zone';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useZoneQuery, useCreateZone, useUpdateZone } from '@/hooks/zone/useZoneQueries';
import { Facility } from '@/types/facility';

const facilityEndpoint = 'facility/api/api/facilities/';

// Form schema definition
const zoneSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  facility: z.number().optional(),
});

type ZoneFormValues = z.infer<typeof zoneSchema>;

const ZoneForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Zone form setup
  const zoneForm = useForm<ZoneFormValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      code: '',
      name: '',
      facility: undefined,
    }
  });

  // Fetch all facilities
  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);

  // Fetch zone data for edit mode using our custom hook
  const { 
    data: zoneData, 
    isLoading: isLoadingZone, 
    isError: isZoneError,
    error: zoneError
  } = useZoneQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createZoneMutation = useCreateZone();
  const updateZoneMutation = useUpdateZone(id);

  // Handle zone data loading
  useEffect(() => {
    if (zoneData && isEditMode) {
      // Reset the form with zone data
      zoneForm.reset({
        code: zoneData.code,
        name: zoneData.name,
        facility: zoneData.facility,
      });
    }
  }, [zoneData, isEditMode, zoneForm]);

  const onSubmitZone = (data: ZoneFormValues) => {
    if (isEditMode && id) {
      updateZoneMutation.mutate(
        { id, zone: data },
        { onSuccess: () => navigate('/dashboard/facility/zones') }
      );
    } else {
      createZoneMutation.mutate(
        data as Omit<Zone, 'id'>,
        { onSuccess: () => navigate('/dashboard/facility/zones') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/facility/zones');
  };

  if (isEditMode && isLoadingZone) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading zone details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isZoneError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading zone details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {zoneError instanceof Error ? zoneError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Zones
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
            {isEditMode ? 'Edit Zone' : 'Create New Zone'}
          </h1>
        </div>
      </div>

      <Form {...zoneForm}>
        <form onSubmit={zoneForm.handleSubmit(onSubmitZone)} className="space-y-6">
          <div className="space-y-4">
            {/* Zone Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Zone Details</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  Toggle
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                  
                  <FormField
                    control={zoneForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Zone code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={zoneForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Zone name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={zoneForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility (Optional)</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value ? Number(value) : undefined)} 
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Facility" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
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
              disabled={createZoneMutation.isPending || updateZoneMutation.isPending}
            >
              {(createZoneMutation.isPending || updateZoneMutation.isPending) && (
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

export default ZoneForm;