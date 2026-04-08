// src/hooks/inventories/useInventoryQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchInventories, 
  getInventory, 
  createInventory, 
  updateInventory, 
  deleteInventory,
  InventoryQueryParams 
} from '@/services/inventoriesApi';
import { Inventory } from '@/types/inventory';
import React from 'react';

// Key factory for consistent query keys
export const inventoryKeys = {
  all: ['inventories'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params: InventoryQueryParams) => [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
};

// Hook for fetching inventories list
export const useInventoriesQuery = () => {
  return useQuery({
    queryKey: inventoryKeys.all,
    queryFn: fetchInventories,
    staleTime: 30000, // 30000 Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single inventory
export const useInventoryQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id as string),
    queryFn: () => getInventory(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a inventory
export const useCreateInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createInventory,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Inventory created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create inventory', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create inventory error:', error);
    },
  });
};

// Hook for updating a inventory
export const useUpdateInventory = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateInventory,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(id as string) });
      toast.success('Inventory updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update inventory', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update inventory error:', error);
    },
  });
};

// Hook for deleting a inventory
export const useDeleteInventory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteInventory,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success('Inventory deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete inventory', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete inventory error:', error);
    },
  });
};