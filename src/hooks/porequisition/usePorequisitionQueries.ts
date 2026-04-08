import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchPorequisitions,
  getPorequisition,
  createPorequisition,
  updatePorequisition,
  deletePorequisition,
  PorequisitionQueryParams
} from '@/services/porequisitionsApi';
import { Porequisition } from '@/types/porequisition';
import React from 'react';

// Key factory for consistent query keys
export const porequisitionKeys = {
  all: ['porequisitions'] as const,
  lists: () => [...porequisitionKeys.all, 'list'] as const,
  list: (params: PorequisitionQueryParams) => [...porequisitionKeys.lists(), params] as const,
  details: () => [...porequisitionKeys.all, 'detail'] as const,
  detail: (id: string) => [...porequisitionKeys.details(), id] as const,
};

// Hook for fetching porequisitions list
export const usePorequisitionsQuery = () => {
  return useQuery({
    queryKey: porequisitionKeys.all,
    queryFn: fetchPorequisitions,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single porequisition
export const usePorequisitionQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: porequisitionKeys.detail(id as string),
    queryFn: () => getPorequisition(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a porequisition
export const useCreatePorequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPorequisition,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: porequisitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: porequisitionKeys.all });
      toast.success('Porequisition created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create porequisition', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create porequisition error:', error);
    },
  });
};

// Hook for updating a porequisition
export const useUpdatePorequisition = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePorequisition,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: porequisitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: porequisitionKeys.all });
      queryClient.invalidateQueries({ queryKey: porequisitionKeys.detail(id as string) });
      toast.success('Porequisition updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update porequisition', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update porequisition error:', error);
    },
  });
};

// Hook for deleting a porequisition
export const useDeletePorequisition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePorequisition,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: porequisitionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: porequisitionKeys.all });
      toast.success('Porequisition deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete porequisition', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete porequisition error:', error);
    },
  });
};