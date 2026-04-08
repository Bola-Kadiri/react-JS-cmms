import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchManufacturers, getManufacturer, createManufacturer, updateManufacturer, deleteManufacturer } from '@/services/manufacturersApi';
import { Manufacturer } from '@/types/manufacturer';
import { useToast } from '@/hooks/use-toast';

// Query keys factory
export const manufacturerKeys = {
  all: ['manufacturers'] as const,
  lists: () => [...manufacturerKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...manufacturerKeys.lists(), { filters }] as const,
  details: () => [...manufacturerKeys.all, 'detail'] as const,
  detail: (id: string) => [...manufacturerKeys.details(), id] as const,
};

// Get all manufacturers
export const useManufacturers = () => {
  return useQuery({
    queryKey: manufacturerKeys.lists(),
    queryFn: () => fetchManufacturers(),
    placeholderData: (previousData) => previousData,
  });
};

// Get single manufacturer by ID
export const useManufacturer = (id: string) => {
  return useQuery({
    queryKey: manufacturerKeys.detail(id),
    queryFn: () => getManufacturer(id),
    enabled: !!id,
  });
};

// Create manufacturer mutation
export const useCreateManufacturer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Manufacturer, 'id'>) => createManufacturer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.all });
      toast({
        title: 'Success',
        description: 'Manufacturer created successfully',
        className: 'bg-green-50 border-green-200',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create manufacturer',
        variant: 'destructive',
      });
    },
  });
};

// Update manufacturer mutation
export const useUpdateManufacturer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, manufacturer }: { id: string; manufacturer: Partial<Manufacturer> }) => 
      updateManufacturer({ id, manufacturer }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.all });
      queryClient.setQueryData(manufacturerKeys.detail(data.id.toString()), data);
      toast({
        title: 'Success',
        description: 'Manufacturer updated successfully',
        className: 'bg-green-50 border-green-200',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update manufacturer',
        variant: 'destructive',
      });
    },
  });
};

// Delete manufacturer mutation
export const useDeleteManufacturer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteManufacturer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manufacturerKeys.all });
      toast({
        title: 'Success',
        description: 'Manufacturer deleted successfully',
        className: 'bg-green-50 border-green-200',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete manufacturer',
        variant: 'destructive',
      });
    },
  });
}; 