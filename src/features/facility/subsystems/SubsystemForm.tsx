// src/features/facility/subsystems/SubsystemForm.tsx
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
import { Subsystem } from '@/types/subsystem';
import { useList } from '@/hooks/crud/useCrudOperations';
import { useSubsystemQuery, useCreateSubsystem, useUpdateSubsystem } from '@/hooks/subsystem/useSubsystemQueries';
import { Building } from '@/types/building';

const buildingEndpoint = 'facility/api/api/buildings/';

// Form schema definition
const subsystemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  building: z.number().min(1, 'Building is required'),
});

type SubsystemFormValues = z.infer<typeof subsystemSchema>;

const SubsystemForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Subsystem form setup
  const subsystemForm = useForm<SubsystemFormValues>({
    resolver: zodResolver(subsystemSchema),
    defaultValues: {
      name: '',
      building: 0,
    }
  });

  // Fetch all buildings
  const { data: buildings = [] } = useList<Building>('buildings', buildingEndpoint);

  // Fetch subsystem data for edit mode using our custom hook
  const { 
    data: subsystemData, 
    isLoading: isLoadingSubsystem, 
    isError: isSubsystemError,
    error: subsystemError
  } = useSubsystemQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createSubsystemMutation = useCreateSubsystem();
  const updateSubsystemMutation = useUpdateSubsystem(id);

  // Handle subsystem data loading
  useEffect(() => {
    if (subsystemData && isEditMode) {
      // Reset the form with subsystem data
      subsystemForm.reset({
        name: subsystemData.name,
        building: subsystemData.building,
      });
    }
  }, [subsystemData, isEditMode, subsystemForm]);

  const onSubmitSubsystem = (data: SubsystemFormValues) => {
    if (isEditMode && id) {
      updateSubsystemMutation.mutate(
        { id, subsystem: data },
        { onSuccess: () => navigate('/dashboard/facility/subsystems') }
      );
    } else {
      createSubsystemMutation.mutate(
        data as Omit<Subsystem, 'id'>,
        { onSuccess: () => navigate('/dashboard/facility/subsystems') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/facility/subsystems');
  };

  if (isEditMode && isLoadingSubsystem) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading subsystem details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isSubsystemError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading subsystem details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {subsystemError instanceof Error ? subsystemError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Subsystems
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
            {isEditMode ? 'Edit Subsystem' : 'Create New Subsystem'}
          </h1>
        </div>
      </div>

      <Form {...subsystemForm}>
        <form onSubmit={subsystemForm.handleSubmit(onSubmitSubsystem)} className="space-y-6">
          <div className="space-y-4">
            {/* Subsystem Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Subsystem Details</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  Toggle
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                  
                  <FormField
                    control={subsystemForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Subsystem name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={subsystemForm.control}
                    name="building"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Building</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Building" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {buildings.map(building => (
                              <SelectItem key={building.id} value={String(building.id)}>
                                {building.name}
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
              disabled={createSubsystemMutation.isPending || updateSubsystemMutation.isPending}
            >
              {(createSubsystemMutation.isPending || updateSubsystemMutation.isPending) && (
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

export default SubsystemForm;