import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchWorkorders,
  getWorkorder,
  createWorkorder,
  updateWorkorder,
  deleteWorkorder,
  getApprovedWorkrequests,
  getApproverUsers,
  approveWorkorderByApprover,
  approveWorkorderByReviewer,
  WorkorderQueryParams
} from '@/services/workordersApi';
import { Workorder } from '@/types/workorder';
import React from 'react';

// Key factory for consistent query keys
export const workorderKeys = {
  all: ['workorders'] as const,
  lists: () => [...workorderKeys.all, 'list'] as const,
  list: (params: WorkorderQueryParams) => [...workorderKeys.lists(), params] as const,
  details: () => [...workorderKeys.all, 'detail'] as const,
  detail: (slug: string) => [...workorderKeys.details(), slug] as const,
  approvedRequests: () => [...workorderKeys.all, 'approved-requests'] as const,
  approverUsers: () => [...workorderKeys.all, 'approver-users'] as const,
};

// Hook for fetching workorders list
export const useWorkordersQuery = () => {
  return useQuery({
    queryKey: workorderKeys.all,
    queryFn: fetchWorkorders,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single workorder
export const useWorkorderQuery = (slug: string | undefined) => {
  return useQuery({
    queryKey: workorderKeys.detail(slug as string),
    queryFn: () => getWorkorder(slug as string),
    enabled: !!slug,
    staleTime: 30000,
  });
};

// Hook for creating a workorder
export const useCreateWorkorder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWorkorder,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: workorderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workorderKeys.all });
      toast.success('Workorder created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create workorder', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create workorder error:', error);
    },
  });
};

// Hook for updating a workorder
export const useUpdateWorkorder = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateWorkorder,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: workorderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workorderKeys.all });
      queryClient.invalidateQueries({ queryKey: workorderKeys.detail(slug as string) });
      toast.success('Workorder updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update workorder', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update workorder error:', error);
    },
  });
};

// Hook for deleting a workorder
export const useDeleteWorkorder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteWorkorder,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: workorderKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workorderKeys.all });
      toast.success('Workorder deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete workorder', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete workorder error:', error);
    },
  });
};

// Hook for fetching approved work requests
export const useApprovedWorkrequestsQuery = () => {
  return useQuery({
    queryKey: workorderKeys.approvedRequests(),
    queryFn: getApprovedWorkrequests,
    staleTime: 30000,
  });
};

// Hook for fetching approver users
export const useApproverUsersQuery = () => {
  return useQuery({
    queryKey: workorderKeys.approverUsers(),
    queryFn: getApproverUsers,
    staleTime: 30000,
  });
};

// Hook for approving workorder by approver
export const useApproveByApprover = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => approveWorkorderByApprover(slug as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workorderKeys.all });
      queryClient.invalidateQueries({ queryKey: workorderKeys.detail(slug as string) });
      toast.success('Work order approved successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to approve work order', {
        duration: 5000,
        icon: React.createElement(X, { className: "h-4 w-4 text-red-500" }),
      });
      console.error('Approve workorder error:', error);
    },
  });
};

// Hook for approving workorder by reviewer
export const useApproveByReviewer = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => approveWorkorderByReviewer(slug as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workorderKeys.all });
      queryClient.invalidateQueries({ queryKey: workorderKeys.detail(slug as string) });
      toast.success('Work order reviewed successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to review work order', {
        duration: 5000,
        icon: React.createElement(X, { className: "h-4 w-4 text-red-500" }),
      });
      console.error('Review workorder error:', error);
    },
  });
};