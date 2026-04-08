import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchItemRequests, 
  getItemRequest, 
  createItemRequest, 
  updateItemRequest, 
  deleteItemRequest,
  submitRequestApproval,
  ItemRequestQueryParams 
} from '@/services/itemRequestApi';
import { ItemRequest } from '@/types/itemrequest';
import React from 'react';

// Key factory for consistent query keys
export const itemRequestKeys = {
  all: ['itemRequests'] as const,
  lists: () => [...itemRequestKeys.all, 'list'] as const,
  list: (params: ItemRequestQueryParams) => [...itemRequestKeys.lists(), params] as const,
  details: () => [...itemRequestKeys.all, 'detail'] as const,
  detail: (id: string) => [...itemRequestKeys.details(), id] as const,
};

// Hook for fetching item requests list
export const useItemRequestsQuery = (params?: ItemRequestQueryParams) => {
  return useQuery({
    queryKey: itemRequestKeys.list(params || {}),
    queryFn: () => fetchItemRequests(params),
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single item request
export const useItemRequestQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: itemRequestKeys.detail(id as string),
    queryFn: () => getItemRequest(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating an item request
export const useCreateItemRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createItemRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemRequestKeys.all });
      toast.success('Item request created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create item request', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
      });
      console.error('Create item request error:', error);
    },
  });
};

// Hook for updating an item request
export const useUpdateItemRequest = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateItemRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: itemRequestKeys.all });
      queryClient.invalidateQueries({ queryKey: itemRequestKeys.detail(id as string) });
      toast.success('Item request updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update item request', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update item request error:', error);
    },
  });
};

// Hook for deleting an item request
export const useDeleteItemRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteItemRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemRequestKeys.all });
      toast.success('Item request deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete item request', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete item request error:', error);
    },
  });
};

// Hook for submitting request approval
export const useSubmitRequestApproval = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: submitRequestApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: itemRequestKeys.all });
      toast.success('Request approval submitted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to submit request approval', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Submit request approval error:', error);
    },
  });
}; 