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
  approvePaymentrequisitionAction,
  rejectPaymentrequisitionAction,
  disbursePaymentrequisitionAction,
  closePaymentrequisitionAction,
  PaymentrequisitionQueryParams
} from '@/services/paymentrequisitionsApi'
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

// Hook for approving a paymentrequisition — calls the real backend `approve`
// action (role- and approval-limit-checked), not a generic PUT. Replaces the
// previous implementation, which set approval_status via a raw PUT and never
// actually enforced the approval matrix.
export const useApprovePaymentrequisition = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => approvePaymentrequisitionAction(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.detail(id as string) });
      toast.success('Payment requisition approved successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to approve payment requisition', {
        duration: 6000,
        icon: React.createElement(X, { className: "h-4 w-4 text-red-500" }),
      });
    },
  });
};

// Hook for rejecting a paymentrequisition — comment is mandatory.
export const useRejectPaymentrequisition = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (comment: string) => rejectPaymentrequisitionAction({ id: id as string, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.detail(id as string) });
      toast.success('Payment requisition rejected', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to reject payment requisition', {
        duration: 6000,
        icon: React.createElement(X, { className: "h-4 w-4 text-red-500" }),
      });
    },
  });
};

// Hook for Finance to disburse a paymentrequisition — permanently locks the
// record against further edits once this succeeds.
export const useDisbursePaymentrequisition = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => disbursePaymentrequisitionAction(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.detail(id as string) });
      toast.success('Payment disbursed. This record is now locked.', {
        duration: 5000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to disburse payment', {
        duration: 6000,
        icon: React.createElement(X, { className: "h-4 w-4 text-red-500" }),
      });
    },
  });
};

// Hook for the Requester to close a paymentrequisition out — only possible
// once Finance has already disbursed it.
export const useClosePaymentrequisition = (id: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => closePaymentrequisitionAction(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.all });
      queryClient.invalidateQueries({ queryKey: paymentrequisitionKeys.detail(id as string) });
      toast.success('Payment requisition closed.', {
        duration: 5000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to close payment requisition', {
        duration: 6000,
        icon: React.createElement(X, { className: "h-4 w-4 text-red-500" }),
      });
    },
  });
};