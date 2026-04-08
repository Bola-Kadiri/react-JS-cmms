// src/hooks/ppms/usePpmQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchPpms,
  getPpm,
  createPpm,
  updatePpm,
  deletePpm,
  reviewPpm,
  rejectPpm,
  PpmQueryParams,
  fetchPpmReviewers,
  fetchPendingPpmsForReviewer,
  fetchReviewedPpms,
  fetchApprovedPpms
} from '@/services/ppmsApi';
import { Ppm } from '@/types/ppm';
import React from 'react';

// Key factory for consistent query keys
export const ppmKeys = {
  all: ['ppms'] as const,
  lists: () => [...ppmKeys.all, 'list'] as const,
  list: (params: PpmQueryParams) => [...ppmKeys.lists(), params] as const,
  details: () => [...ppmKeys.all, 'detail'] as const,
  detail: (id: string) => [...ppmKeys.details(), id] as const,
  reviewed: () => [...ppmKeys.all, 'reviewed'] as const,
  approved: () => [...ppmKeys.all, 'approved'] as const,
};

// Hook for fetching ppms list
export const usePpmsQuery = () => {
  return useQuery({
    queryKey: ppmKeys.all,
    queryFn: fetchPpms,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single ppm
export const usePpmQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ppmKeys.detail(id as string),
    queryFn: () => getPpm(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a ppm
export const useCreatePpm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPpm,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ppmKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ppmKeys.all });
      toast.success('Ppm created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create ppm', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create ppm error:', error);
    },
  });
};

// Hook for updating a ppm
export const useUpdatePpm = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePpm,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: ppmKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ppmKeys.all });
      queryClient.invalidateQueries({ queryKey: ppmKeys.detail(id as string) });
      toast.success('Ppm updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update ppm', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update ppm error:', error);
    },
  });
};

// Hook for deleting a ppm
export const useDeletePpm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePpm,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: ppmKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ppmKeys.all });
      toast.success('Ppm deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete ppm', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete ppm error:', error);
    },
  });
};

// Hook for reviewing a ppm
export const useReviewPpm = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: reviewPpm,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ppmKeys.all });
      queryClient.invalidateQueries({ queryKey: ppmKeys.detail(id as string) });
      toast.success(`PPM ${variables.review_action === 'approve' ? 'approved' : 'rejected'} successfully`, {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to review ppm', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Review ppm error:', error);
    },
  });
};

// Hook for rejecting a ppm
export const useRejectPpm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rejectPpm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ppmKeys.all });
      queryClient.invalidateQueries({ queryKey: ppmKeys.detail(data.id.toString()) });
      toast.success('PPM rejected successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to reject PPM', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Reject ppm error:', error);
    },
  });
};

// Hook for fetching reviewers (users with role REVIEWER)
export const usePpmReviewersQuery = () => {
  return useQuery({
    queryKey: [...ppmKeys.all, 'reviewers'],
    queryFn: fetchPpmReviewers,
    staleTime: 30000,
    placeholderData: [],
  });
};

// Hook for fetching PPMs pending review for current reviewer
export const usePendingPpmsForReviewerQuery = () => {
  return useQuery({
    queryKey: [...ppmKeys.all, 'pending-review'],
    queryFn: fetchPendingPpmsForReviewer,
    staleTime: 30000,
    placeholderData: { count: 0, next: null, previous: null, results: [] },
  });
};

// Hook for fetching reviewed PPMs for work order creation
export const useReviewedPpmsQuery = () => {
  return useQuery({
    queryKey: ppmKeys.reviewed(),
    queryFn: fetchReviewedPpms,
    staleTime: 30000,
    placeholderData: { count: 0, next: null, previous: null, results: [] },
  });
};

// Hook for fetching approved PPMs for work order creation
export const useApprovedPpmsQuery = () => {
  return useQuery({
    queryKey: ppmKeys.approved(),
    queryFn: fetchApprovedPpms,
    staleTime: 30000,
    placeholderData: { count: 0, next: null, previous: null, results: [] },
  });
};