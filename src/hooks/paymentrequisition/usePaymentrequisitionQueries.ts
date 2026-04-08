// src/hooks/paymentrequisitions/usePaymentrequisitionQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchPaymentrequisitions,
  getPaymentrequisition,
  createPaymentrequisition,
  updatePaymentrequisition,
  deletePaymentrequisition,
  PaymentrequisitionQueryParams
} from '@/services/paymentrequisitionsApi'
import { Paymentrequisition } from '@/types/paymentrequisition';
import React from 'react';

// Key factory for consistent query keys
export const paymentrequisitionKeys = {
  all: ['paymentrequisitions'] as const,
  lists: () => [...paymentrequisitionKeys.all, 'list'] as const,
  list: (params: PaymentrequisitionQueryParams) => [...paymentrequisitionKeys.lists(), params] as const,
  details: () => [...paymentrequisitionKeys.all, 'detail'] as const,
  detail: (id: string) => [...paymentrequisitionKeys.details(), id] as const,
};

// Hook for fetching paymentrequisitions list
export const usePaymentrequisitionsQuery = () => {
  return useQuery({
    queryKey: paymentrequisitionKeys.all,
    queryFn: fetchPaymentrequisitions,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single paymentrequisition
export const usePaymentrequisitionQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: paymentrequisitionKeys.detail(id as string),
    queryFn: () => getPaymentrequisition(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a paymentrequisition
export const useCreatePaymentrequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPaymentrequisition,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.all });
      toast.success('Paymentrequisition created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create paymentrequisition', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create paymentrequisition error:', error);
    },
  });
};

// Hook for updating a paymentrequisition
export const useUpdatePaymentrequisition = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePaymentrequisition,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.detail(id as string) });
      toast.success('Paymentrequisition updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update paymentrequisition', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update paymentrequisition error:', error);
    },
  });
};

// Hook for deleting a paymentrequisition
export const useDeletePaymentrequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePaymentrequisition,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.all });
      toast.success('Paymentrequisition deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete paymentrequisition', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete paymentrequisition error:', error);
    },
  });
};