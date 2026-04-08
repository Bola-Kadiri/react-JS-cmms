import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchModels, getModel, createModel, updateModel, deleteModel } from '@/services/modelsApi';
import { Model } from '@/types/model';
import { useToast } from '@/hooks/use-toast';

// Query keys factory
export const modelKeys = {
  all: ['models'] as const,
  lists: () => [...modelKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...modelKeys.lists(), { filters }] as const,
  details: () => [...modelKeys.all, 'detail'] as const,
  detail: (id: string) => [...modelKeys.details(), id] as const,
};

// Get all models
export const useModels = () => {
  return useQuery({
    queryKey: modelKeys.lists(),
    queryFn: () => fetchModels(),
    placeholderData: (previousData) => previousData,
  });
};

// Get single model by ID
export const useModel = (id: string) => {
  return useQuery({
    queryKey: modelKeys.detail(id),
    queryFn: () => getModel(id),
    enabled: !!id,
  });
};

// Create model mutation
export const useCreateModel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (data: Omit<Model, 'id'>) => createModel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all });
      toast({
        title: 'Success',
        description: 'Model created successfully',
        className: 'bg-green-50 border-green-200',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to create model',
        variant: 'destructive',
      });
    },
  });
};

// Update model mutation
export const useUpdateModel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, model }: { id: string; model: Partial<Model> }) => 
      updateModel({ id, model }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all });
      queryClient.setQueryData(modelKeys.detail(data.id.toString()), data);
      toast({
        title: 'Success',
        description: 'Model updated successfully',
        className: 'bg-green-50 border-green-200',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to update model',
        variant: 'destructive',
      });
    },
  });
};

// Delete model mutation
export const useDeleteModel = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => deleteModel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: modelKeys.all });
      toast({
        title: 'Success',
        description: 'Model deleted successfully',
        className: 'bg-green-50 border-green-200',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error?.response?.data?.message || 'Failed to delete model',
        variant: 'destructive',
      });
    },
  });
}; 