// src/hooks/paymentcomments/usePaymentcommentQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchPaymentcomments,
  getPaymentcomment,
  createPaymentcomment,
  updatePaymentcomment,
  deletePaymentcomment,
  PaymentcommentQueryParams
} from '@/services/paymentcommentApi'
// import { Paymentcomment } from '@/types/paymentComment';
import React from 'react';

//

// Key factory for consistent query keys
export const paymentcommentKeys = {
  all: ['paymentcomments'] as const,
  lists: () => [...paymentcommentKeys.all, 'list'] as const,
  list: (params: PaymentcommentQueryParams) => [...paymentcommentKeys.lists(), params] as const,
  details: () => [...paymentcommentKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentcommentKeys.details(), id] as const,
};

// Hook for fetching paymentcomments list
export const usePaymentcommentsQuery = () => {
  return useQuery({
    queryKey: paymentcommentKeys.all,
    queryFn: fetchPaymentcomments,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single paymentcomment
export const usePaymentcommentQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: paymentcommentKeys.detail(id as string),
    queryFn: () => getPaymentcomment(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a paymentcomment
export const useCreatePaymentcomment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPaymentcomment,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: paymentcommentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentcommentKeys.all });
      toast.success('Paymentcomment created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create paymentcomment', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create paymentcomment error:', error);
    },
  });
};

// Hook for updating a paymentcomment
export const useUpdatePaymentcomment = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePaymentcomment,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: paymentcommentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentcommentKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentcommentKeys.detail(id as string) });
      toast.success('Paymentcomment updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update paymentcomment', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update paymentcomment error:', error);
    },
  });
};

// Hook for deleting a paymentcomment
export const useDeletePaymentcomment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePaymentcomment,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: paymentcommentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentcommentKeys.all });
      toast.success('Paymentcomment deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete paymentcomment', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete paymentcomment error:', error);
    },
  });
};