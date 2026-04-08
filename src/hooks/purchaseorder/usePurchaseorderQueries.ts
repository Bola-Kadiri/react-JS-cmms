import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchPurchaseorders,
  getPurchaseorder,
  createPurchaseorder,
  updatePurchaseorder,
  deletePurchaseorder,
  PurchaseorderQueryParams
} from '@/services/purchaseordersApi';
import { Purchaseorder } from '@/types/purchaseorder';
import React from 'react';

// Key factory for consistent query keys
export const purchaseorderKeys = {
  all: ['purchaseorders'] as const,
  lists: () => [...purchaseorderKeys.all, 'list'] as const,
  list: (params: PurchaseorderQueryParams) => [...purchaseorderKeys.lists(), params] as const,
  details: () => [...purchaseorderKeys.all, 'detail'] as const,
  detail: (id: string) => [...purchaseorderKeys.details(), id] as const,
};

// Hook for fetching purchaseorders list
export const usePurchaseordersQuery = () => {
  return useQuery({
    queryKey: purchaseorderKeys.all,
    queryFn: fetchPurchaseorders,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single purchaseorder
export const usePurchaseorderQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: purchaseorderKeys.detail(id as string),
    queryFn: () => getPurchaseorder(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a purchaseorder
export const useCreatePurchaseorder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPurchaseorder,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: purchaseorderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseorderKeys.all });
      toast.success('Purchaseorder created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create purchaseorder', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create purchaseorder error:', error);
    },
  });
};

// Hook for updating a purchaseorder
export const useUpdatePurchaseorder = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePurchaseorder,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: purchaseorderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseorderKeys.all });
      queryClient.invalidateQueries({ queryKey: purchaseorderKeys.detail(id as string) });
      toast.success('Purchaseorder updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update purchaseorder', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update purchaseorder error:', error);
    },
  });
};

// Hook for deleting a purchaseorder
export const useDeletePurchaseorder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePurchaseorder,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: purchaseorderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: purchaseorderKeys.all });
      toast.success('Purchaseorder deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete purchaseorder', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete purchaseorder error:', error);
    },
  });
};