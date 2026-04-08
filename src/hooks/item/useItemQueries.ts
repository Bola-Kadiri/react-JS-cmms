// src/hooks/items/useItemQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem,
  ItemQueryParams 
} from '@/services/itemsApi';
import { Item } from '@/types/item';
import React from 'react';

// Key factory for consistent query keys
export const itemKeys = {
  all: ['items'] as const,
  lists: () => [...itemKeys.all, 'list'] as const,
  list: (params: ItemQueryParams) => [...itemKeys.lists(), params] as const,
  details: () => [...itemKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemKeys.details(), id] as const,
};

// Hook for fetching items list
export const useItemsQuery = () => {
  return useQuery({
    queryKey: itemKeys.all,
    queryFn: fetchItems,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single item
export const useItemQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: itemKeys.detail(id as string),
    queryFn: () => getItem(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating an item
export const useCreateItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createItem,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success('Item created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create item', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create item error:', error);
    },
  });
};

// Hook for updating an item
export const useUpdateItem = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateItem,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      queryClient.invalidateQueries({ queryKey: itemKeys.detail(id as string) });
      toast.success('Item updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update item', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update item error:', error);
    },
  });
};

// Hook for deleting an item
export const useDeleteItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: itemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: itemKeys.all });
      toast.success('Item deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete item', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete item error:', error);
    },
  });
};