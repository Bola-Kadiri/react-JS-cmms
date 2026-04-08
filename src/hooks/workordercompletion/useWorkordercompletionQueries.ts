import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchWorkOrderCompletions,
  getWorkOrderCompletion,
  createWorkOrderCompletion,
  updateWorkOrderCompletion,
  deleteWorkOrderCompletion,
  approveByApprover,
  rejectByApprover,
  approveByReviewer,
  rejectByReviewer,
  fetchAvailableWorkOrders,
  fetchWorkOrderCompletionsByRequester,
  fetchRaisePaymentWorkOrders,
  WorkOrderCompletionQueryParams,
  AvailableWorkOrdersResponse,
  WorkOrderCompletionsResponse,
  RaisePaymentWorkOrdersResponse
} from '@/services/workordercompletionsApi';
import { WorkOrderCompletion } from '@/types/workordercompletion';
import React from 'react';

// Key factory for consistent query keys
export const workOrderCompletionKeys = {
  all: ['workOrderCompletions'] as const,
  lists: () => [...workOrderCompletionKeys.all, 'list'] as const,
  list: (params: WorkOrderCompletionQueryParams) => [...workOrderCompletionKeys.lists(), params] as const,
  details: () => [...workOrderCompletionKeys.all, 'detail'] as const,
  detail: (id: number) => [...workOrderCompletionKeys.details(), id] as const,
  availableWorkOrders: () => [...workOrderCompletionKeys.all, 'available-work-orders'] as const,
  byRequester: (requesterId: number) => [...workOrderCompletionKeys.all, 'by-requester', requesterId] as const,
  raisePaymentWorkOrders: () => [...workOrderCompletionKeys.all, 'raise-payment-work-orders'] as const,
};

// Hook for fetching work order completions list
export const useWorkOrderCompletionsQuery = (params?: WorkOrderCompletionQueryParams) => {
  return useQuery({
    queryKey: workOrderCompletionKeys.list(params || {}),
    queryFn: () => fetchWorkOrderCompletions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching a single work order completion
export const useWorkOrderCompletionQuery = (id: number) => {
  return useQuery({
    queryKey: workOrderCompletionKeys.detail(id),
    queryFn: () => getWorkOrderCompletion(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching available work orders
export const useAvailableWorkOrdersQuery = () => {
  return useQuery<AvailableWorkOrdersResponse>({
    queryKey: workOrderCompletionKeys.availableWorkOrders(),
    queryFn: fetchAvailableWorkOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching work order completions by requester
export const useWorkOrderCompletionsByRequesterQuery = (requesterId: number) => {
  return useQuery<WorkOrderCompletionsResponse>({
    queryKey: workOrderCompletionKeys.byRequester(requesterId),
    queryFn: () => fetchWorkOrderCompletionsByRequester(requesterId),
    enabled: !!requesterId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching raise payment work orders
export const useRaisePaymentWorkOrdersQuery = () => {
  return useQuery<RaisePaymentWorkOrdersResponse>({
    queryKey: workOrderCompletionKeys.raisePaymentWorkOrders(),
    queryFn: fetchRaisePaymentWorkOrders,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for creating a work order completion
export const useCreateWorkOrderCompletionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FormData | Partial<WorkOrderCompletion>) => createWorkOrderCompletion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.all });
      toast.success('Work Order Completion created successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error creating work order completion:', error);
      toast.error(error?.response?.data?.message || 'Failed to create work order completion', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for updating a work order completion
export const useUpdateWorkOrderCompletionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FormData | Partial<WorkOrderCompletion> }) =>
      updateWorkOrderCompletion(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.all });
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.detail(id) });
      toast.success('Work Order Completion updated successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error updating work order completion:', error);
      toast.error(error?.response?.data?.message || 'Failed to update work order completion', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for deleting a work order completion
export const useDeleteWorkOrderCompletionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkOrderCompletion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.all });
      toast.success('Work Order Completion deleted successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error deleting work order completion:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete work order completion', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for approving work order completion by approver
export const useApproveByApproverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveByApprover,
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.all });
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.detail(id) });
      toast.success(response.message || 'Work Order Completion approved successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error approving work order completion:', error);
      toast.error(error?.response?.data?.message || 'Failed to approve work order completion', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for rejecting work order completion by approver
export const useRejectByApproverMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => rejectByApprover(id, notes),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.all });
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.detail(id) });
      toast.success(response.message || 'Work Order Completion rejected successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error rejecting work order completion:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject work order completion', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for approving work order completion by reviewer
export const useApproveByReviewerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveByReviewer,
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.all });
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.detail(id) });
      toast.success(response.message || 'Work Order Completion reviewed successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error reviewing work order completion:', error);
      toast.error(error?.response?.data?.message || 'Failed to review work order completion', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
};

// Hook for rejecting work order completion by reviewer
export const useRejectByReviewerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) => rejectByReviewer(id, notes),
    onSuccess: (response, { id }) => {
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.all });
      queryClient.invalidateQueries({ queryKey: workOrderCompletionKeys.detail(id) });
      toast.success(response.message || 'Work Order Completion rejected successfully', {
        icon: React.createElement(Check, { className: 'h-4 w-4' }),
      });
    },
    onError: (error: any) => {
      console.error('Error rejecting work order completion:', error);
      toast.error(error?.response?.data?.message || 'Failed to reject work order completion', {
        icon: React.createElement(X, { className: 'h-4 w-4' }),
      });
    },
  });
}; 