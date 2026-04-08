// src/features/facility/clusters/ClusterForm.tsx
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
import { Cluster } from '@/types/cluster';
import { Region } from '@/types/region';
import { useList } from '@/hooks/crud/useCrudOperations';
import { User } from '@/types/user';
import { useClusterQuery, useCreateCluster, useUpdateCluster } from '@/hooks/cluster/useClusterQueries';

const userEndpoint = 'accounts/api/users/';
const regionsEndpoint = 'facility/api/api/regions/';

// Form schema definition
const clusterSchema = z.object({
  region: z.number().min(1, 'Region is required'),
  name: z.string().min(1, 'Name is required'),
  select_manager: z.number().min(1, 'Manager is required'),
});

type ClusterFormValues = z.infer<typeof clusterSchema>;

const ClusterForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  // Cluster form setup
  const clusterForm = useForm<ClusterFormValues>({
    resolver: zodResolver(clusterSchema),
    defaultValues: {
      region: 0,
      name: '',
      select_manager: 0,
    }
  });

  // Fetch all users
  const { data: users = [] } = useList<User>('users', userEndpoint);
  
  // Fetch all regions
  const { data: regions = [] } = useList<Region>('regions', regionsEndpoint);

  // Fetch cluster data for edit mode using our custom hook
  const { 
    data: clusterData, 
    isLoading: isLoadingCluster, 
    isError: isClusterError,
    error: clusterError
  } = useClusterQuery(isEditMode ? id : undefined);

  // Use our custom mutation hooks
  const createClusterMutation = useCreateCluster();
  const updateClusterMutation = useUpdateCluster(id);

  // Handle cluster data loading
  useEffect(() => {
    if (clusterData && isEditMode) {
      // Reset the form with cluster data
      clusterForm.reset({
        region: clusterData.region,
        name: clusterData.name,
        select_manager: clusterData.select_manager,
      });
    }
  }, [clusterData, isEditMode, clusterForm]);

  const onSubmitCluster = (data: ClusterFormValues) => {
    if (isEditMode && id) {
      updateClusterMutation.mutate(
        { id, cluster: data },
        { onSuccess: () => navigate('/dashboard/facility/clusters') }
      );
    } else {
      createClusterMutation.mutate(
        data as Omit<Cluster, 'id'>,
        { onSuccess: () => navigate('/dashboard/facility/clusters') }
      );
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/facility/clusters');
  };

  if (isEditMode && isLoadingCluster) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading cluster details...</p>
        </div>
      </div>
    );
  }

  if (isEditMode && isClusterError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500 text-xl">Error loading cluster details</div>
        <p className="text-sm text-muted-foreground mb-4">
          {clusterError instanceof Error ? clusterError.message : 'An unknown error occurred'}
        </p>
        <Button onClick={handleCancel} variant="outline">
          Back to Clusters
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
            {isEditMode ? 'Edit Cluster' : 'Create New Cluster'}
          </h1>
        </div>
      </div>

      <Form {...clusterForm}>
        <form onSubmit={clusterForm.handleSubmit(onSubmitCluster)} className="space-y-6">
          <div className="space-y-4">
            {/* Cluster Details Section */}
            <Collapsible defaultOpen={true} className="w-full">
              <CollapsibleTrigger className="flex justify-between items-center w-full p-3 bg-gray-200 text-black rounded-t-md">
                <h2 className="text-lg font-medium">Cluster Details</h2>
                <Button variant="ghost" size="sm" className="h-8 text-white bg-gray-500 hover:bg-gray-600 hover:text-white px-3">
                  Toggle
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="border border-t-0 rounded-b-md p-4 space-y-4 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={clusterForm.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Region" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {regions.map(region => (
                              <SelectItem key={region.id} value={String(region.id)}>
                                {region.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={clusterForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Cluster name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={clusterForm.control}
                    name="select_manager"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Manager</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          value={field.value ? String(field.value) : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Manager" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users.map(user => (
                              <SelectItem key={user.id} value={String(user.id)}>
                                {user.first_name} {user.last_name}
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
              disabled={createClusterMutation.isPending || updateClusterMutation.isPending}
            >
              {(createClusterMutation.isPending || updateClusterMutation.isPending) && (
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

export default ClusterForm;