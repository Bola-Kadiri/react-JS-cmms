import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchInventoryTypes, 
  getInventoryType, 
  createInventoryType, 
  updateInventoryType, 
  deleteInventoryType,
  InventoryTypeQueryParams 
} from '@/services/inventoryTypesApi';
import { InventoryType } from '@/types/inventorytype';
import React from 'react';

// Key factory for consistent query keys
export const inventoryTypeKeys = {
  all: ['inventoryTypes'] as const,
  lists: () => [...inventoryTypeKeys.all, 'list'] as const,
  list: (params: InventoryTypeQueryParams) => [...inventoryTypeKeys.lists(), params] as const,
  details: () => [...inventoryTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryTypeKeys.details(), id] as const,
};

// Hook for fetching inventory types list
export const useInventoryTypesQuery = () => {
  return useQuery({
    queryKey: inventoryTypeKeys.all,
    queryFn: fetchInventoryTypes,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single inventory type
export const useInventoryTypeQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: inventoryTypeKeys.detail(id as string),
    queryFn: () => getInventoryType(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating an inventory type
export const useCreateInventoryType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createInventoryType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryTypeKeys.all });
      toast.success('Inventory type created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create inventory type', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
      });
      console.error('Create inventory type error:', error);
    },
  });
};

// Hook for updating an inventory type
export const useUpdateInventoryType = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateInventoryType,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: inventoryTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryTypeKeys.detail(id as string) });
      toast.success('Inventory type updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update inventory type', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update inventory type error:', error);
    },
  });
};

// Hook for deleting an inventory type
export const useDeleteInventoryType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteInventoryType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryTypeKeys.all });
      toast.success('Inventory type deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete inventory type', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete inventory type error:', error);
    },
  });
}; 