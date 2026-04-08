// src/hooks/transfers/useTransferQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchTransfers, 
  getTransfer, 
  createTransfer, 
  updateTransfer, 
  deleteTransfer,
  TransferQueryParams 
} from '@/services/transfersApi';
import { Transfer } from '@/types/transfer';
import React from 'react';

// Key factory for consistent query keys
export const transferKeys = {
  all: ['transfers'] as const,
  lists: () => [...transferKeys.all, 'list'] as const,
  list: (params: TransferQueryParams) => [...transferKeys.lists(), params] as const,
  details: () => [...transferKeys.all, 'detail'] as const,
  detail: (id: string) => [...transferKeys.details(), id] as const,
};

// Hook for fetching transfers list
export const useTransfersQuery = () => {
  return useQuery({
    queryKey: transferKeys.all,
    queryFn: fetchTransfers,
    staleTime: 30000, // 30000 Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single transfer
export const useTransferQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: transferKeys.detail(id as string),
    queryFn: () => getTransfer(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a transfer
export const useCreateTransfer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      toast.success('Transfer created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create transfer', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create transfer error:', error);
    },
  });
};

// Hook for updating a transfer
export const useUpdateTransfer = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateTransfer,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      queryClient.invalidateQueries({ queryKey: transferKeys.detail(id as string) });
      toast.success('Transfer updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update transfer', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update transfer error:', error);
    },
  });
};

// Hook for deleting a transfer
export const useDeleteTransfer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTransfer,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: transferKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transferKeys.all });
      toast.success('Transfer deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete transfer', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete transfer error:', error);
    },
  });
};