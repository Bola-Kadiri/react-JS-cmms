import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchInvoiceItems,
  getInvoiceItem,
  createInvoiceItem,
  updateInvoiceItem,
  patchInvoiceItem,
  deleteInvoiceItem,
  approveByReviewer,
  rejectByReviewer,
  approveByApprover,
  rejectByApprover,
  InvoiceItemQueryParams
} from '@/services/invoiceitemsApi';
import { InvoiceItem } from '@/types/invoiceitem';
import React from 'react';

// Key factory for consistent query keys
export const invoiceItemKeys = {
  all: ['invoiceItems'] as const,
  lists: () => [...invoiceItemKeys.all, 'list'] as const,
  list: (params: InvoiceItemQueryParams) => [...invoiceItemKeys.lists(), params] as const,
  details: () => [...invoiceItemKeys.all, 'detail'] as const,
  detail: (slug: string | number) => [...invoiceItemKeys.details(), slug] as const,
};

// Hook for fetching invoice items list
export const useInvoiceItemsQuery = (params?: InvoiceItemQueryParams) => {
  return useQuery({
    queryKey: invoiceItemKeys.list(params || {}),
    queryFn: () => fetchInvoiceItems(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching a single invoice item
export const useInvoiceItemQuery = (slug: string | number) => {
  return useQuery({
    queryKey: invoiceItemKeys.detail(slug),
    queryFn: () => getInvoiceItem(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating an invoice item
export const useCreateInvoiceItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData | Partial<InvoiceItem>) => createInvoiceItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.all });
      toast.success('Invoice item created successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error creating invoice item:', error);
      toast.error(error?.response?.data?.message || 'Failed to create invoice item', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for updating an invoice item
export const useUpdateInvoiceItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string | number; data: FormData | Partial<InvoiceItem> }) =>
      updateInvoiceItem(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.detail(slug) });
      toast.success('Invoice item updated successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error updating invoice item:', error);
      toast.error(error?.response?.data?.message || 'Failed to update invoice item', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for partially updating an invoice item
export const usePatchInvoiceItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string | number; data: Partial<InvoiceItem> }) =>
      patchInvoiceItem(slug, data),
    onSuccess: (_, { slug }) => {
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.detail(slug) });
      toast.success('Invoice item updated successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error patching invoice item:', error);
      toast.error(error?.response?.data?.message || 'Failed to update invoice item', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for deleting an invoice item
export const useDeleteInvoiceItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteInvoiceItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.all });
      toast.success('Invoice item deleted successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error deleting invoice item:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete invoice item', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for approving invoice item by reviewer
export const useApproveByReviewerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string | number) => approveByReviewer(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.all });
      toast.success('Invoice item reviewed successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error reviewing invoice item:', error);
      toast.error(error?.response?.data?.message || 'Failed to review invoice item', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for rejecting invoice item by reviewer
export const useRejectByReviewerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string | number) => rejectByReviewer(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.all });
      toast.success('Invoice item rejected by reviewer', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error rejecting invoice item:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject invoice item', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for approving invoice item by approver
export const useApproveByApproverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string | number) => approveByApprover(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.all });
      toast.success('Invoice item approved successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error approving invoice item:', error);
      toast.error(error?.response?.data?.message || 'Failed to approve invoice item', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for rejecting invoice item by approver
export const useRejectByApproverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string | number) => rejectByApprover(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceItemKeys.all });
      toast.success('Invoice item rejected by approver', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error rejecting invoice item:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject invoice item', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
}; 