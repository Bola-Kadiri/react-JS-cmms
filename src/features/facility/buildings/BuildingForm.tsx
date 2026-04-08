// src/features/facility/buildings/BuildingForm.tsx
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
import { Building } from '@/types/building';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useBuildingQuery, useBuildingZonesByFacilityQuery, useCreateBuilding, useUpdateBuilding } from '@/hooks/building/useBuildingQueries';
import { Facility } from '@/types/facility';

const facilityEndpoint = 'facility/api/api/facilities/';

// Updated form schema to match building.ts structure
const buildingSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  facility: z.number().min(1, 'Facility is required'),
  zone: z.number().min(1, 'Zone is required'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

type BuildingFormValues = z.infer<typeof buildingSchema>;

const BuildingForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Building form setup
  const buildingForm = useForm<BuildingFormValues>({
    resolver: zodResolver(buildingSchema),
    defaultValues: {
      code: '',
      name: '',
      facility: 0,
      zone: 0,
      status: 'Active',
    }
  });

  // Watch facility changes to fetch zones
  const selectedFacility = buildingForm.watch('facility');

  const { data: facilities = [] } = useList<Facility>('facilities', facilityEndpoint);
  
  // Fetch zones based on selected facility
  const { 
    data: zones = [], 
    isLoading: isLoadingZones 
  } = useBuildingZonesByFacilityQuery(selectedFacility ? String(selectedFacility) : undefined);

  // Fetch building data for edit mode using our custom hook
  const { 
    data: buildingData, 
    isLoading: isLoadingBuilding, 
    isError: isBuildingError,
    error: buildingError
  } = useBuildingQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createBuildingMutation = useCreateBuilding();
  const updateBuildingMutation = useUpdateBuilding(id);

  // Handle building data loading
  useEffect(() => {
    if (buildingData && isEditMode) {
      // Reset the form with building data
      buildingForm.reset({
        code: buildingData.code,
        name: buildingData.name,
        facility: buildingData.facility,
        zone: buildingData.zone,
        status: buildingData.status,
      });
    }
  }, [buildingData, isEditMode, buildingForm]);

  // Reset zone when facility changes
  useEffect(() => {
    if (selectedFacility && !isEditMode) {
      buildingForm.setValue('zone', 0);
    }
  }, [selectedFacility, isEditMode, buildingForm]);

  const onSubmitBuilding = (data: BuildingFormValues) => {
    if (isEditMode && id) {
      updateBuildingMutation.mutate(
        { id, building: data },
        { onSuccess: () => navigate('/dashboard/facility/buildings') }
      );
    } else {
      createBuildingMutation.mutate(
        data as Omit<Building, 'id'>,
        { onSuccess: () => navigate('/dashboard/facility/buildings') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/facility/buildings');
  };

  if (isEditMode && isLoadingBuilding) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading building details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isBuildingError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading building details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {buildingError instanceof Error ? buildingError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Buildings
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
            {isEditMode ? 'Edit Building' : 'Create New Building'}
          </h1>
        </div>
      </div>

      <Form {...buildingForm}>
        <form onSubmit={buildingForm.handleSubmit(onSubmitBuilding)} className="space-y-6">
          <div className="space-y-4">
            {/* Building Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Building Details</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  Toggle
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                  
                  <FormField
                    control={buildingForm.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Building code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={buildingForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Building name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={buildingForm.control}
                    name="facility"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Facility</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Facility" />
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
                    control={buildingForm.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zone</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value ? String(field.value) : ""}
                          disabled={!selectedFacility || isLoadingZones}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !selectedFacility 
                                  ? "Select facility first"
                                  : isLoadingZones 
                                    ? "Loading zones..."
                                    : "Select Zone"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {zones.map(zone => (
                              <SelectItem key={zone.id} value={String(zone.id)}>
                                {zone.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={buildingForm.control}
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
              disabled={createBuildingMutation.isPending || updateBuildingMutation.isPending}
            >
              {(createBuildingMutation.isPending || updateBuildingMutation.isPending) && (
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

export default BuildingForm;