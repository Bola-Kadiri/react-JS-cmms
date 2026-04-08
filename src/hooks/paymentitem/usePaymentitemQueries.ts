// src/hooks/paymentitems/usePaymentitemQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchPaymentitems,
  getPaymentitem,
  createPaymentitem,
  updatePaymentitem,
  deletePaymentitem,
  PaymentitemQueryParams
} from '@/services/paymentitemsApi'
import { Paymentitem } from '@/types/paymentitem';
import React from 'react';

// Key factory for consistent query keys
export const paymentitemKeys = {
  all: ['paymentitems'] as const,
  lists: () => [...paymentitemKeys.all, 'list'] as const,
  list: (params: PaymentitemQueryParams) => [...paymentitemKeys.lists(), params] as const,
  details: () => [...paymentitemKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentitemKeys.details(), id] as const,
};

// Hook for fetching paymentitems list
export const usePaymentitemsQuery = () => {
  return useQuery({
    queryKey: paymentitemKeys.all,
    queryFn: fetchPaymentitems,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single paymentitem
export const usePaymentitemQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: paymentitemKeys.detail(id as string),
    queryFn: () => getPaymentitem(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a paymentitem
export const useCreatePaymentitem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPaymentitem,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: paymentitemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentitemKeys.all });
      toast.success('Paymentitem created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create paymentitem', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create paymentitem error:', error);
    },
  });
};

// Hook for updating a paymentitem
export const useUpdatePaymentitem = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePaymentitem,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: paymentitemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentitemKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentitemKeys.detail(id as string) });
      toast.success('Paymentitem updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update paymentitem', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update paymentitem error:', error);
    },
  });
};

// Hook for deleting a paymentitem
export const useDeletePaymentitem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePaymentitem,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: paymentitemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentitemKeys.all });
      toast.success('Paymentitem deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete paymentitem', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete paymentitem error:', error);
    },
  });
};