import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { InventoryReference } from '@/types/inventoryreference';
import {
  fetchInventoryReferences,
  getInventoryReference,
  createInventoryReference,
  updateInventoryReference,
  deleteInventoryReference,
  InventoryReferencesResponse
} from '@/services/inventoryReferencesApi';

export const inventoryReferenceKeys = {
  all: ['inventory-references'] as const,
  lists: () => [...inventoryReferenceKeys.all, 'list'] as const,
  list: (filters: string) => [...inventoryReferenceKeys.lists(), { filters }] as const,
  details: () => [...inventoryReferenceKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryReferenceKeys.details(), id] as const,
};

export const useInventoryReferencesQuery = () => {
  return useQuery<InventoryReferencesResponse, Error>({
    queryKey: inventoryReferenceKeys.lists(),
    queryFn: fetchInventoryReferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useInventoryReferenceQuery = (id: string | undefined) => {
  return useQuery<InventoryReference, Error>({
    queryKey: inventoryReferenceKeys.detail(id!),
    queryFn: () => getInventoryReference(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateInventoryReference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createInventoryReference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryReferenceKeys.lists() });
      toast({
        title: 'Success',
        description: 'Inventory reference created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create inventory reference',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateInventoryReference = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ inventoryReference }: { inventoryReference: Partial<Omit<InventoryReference, 'id' | 'category_detail' | 'subcategory_detail'>> }) =>
      updateInventoryReference({ id: id!, inventoryReference }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryReferenceKeys.lists() });
      if (id) {
        queryClient.invalidateQueries({ queryKey: inventoryReferenceKeys.detail(id) });
      }
      toast({
        title: 'Success',
        description: 'Inventory reference updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update inventory reference',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteInventoryReference = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInventoryReference,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryReferenceKeys.lists() });
      toast({
        title: 'Success',
        description: 'Inventory reference deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete inventory reference',
        variant: 'destructive',
      });
    },
  });
}; 