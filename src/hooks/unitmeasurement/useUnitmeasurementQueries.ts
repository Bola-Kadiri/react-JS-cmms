import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchUnitmeasurements,
  getUnitmeasurement,
  createUnitmeasurement,
  updateUnitmeasurement,
  deleteUnitmeasurement,
  UnitmeasurementQueryParams
} from '@/services/unitmeasurementsApi';
import { Unitmeasurement } from '@/types/unitmeasurement';
import React from 'react';

// Key factory for consistent query keys
export const unitmeasurementKeys = {
  all: ['unitmeasurements'] as const,
  lists: () => [...unitmeasurementKeys.all, 'list'] as const,
  list: (params: UnitmeasurementQueryParams) => [...unitmeasurementKeys.lists(), params] as const,
  details: () => [...unitmeasurementKeys.all, 'detail'] as const,
  detail: (code: string) => [...unitmeasurementKeys.details(), code] as const,
};

// Hook for fetching unitmeasurements list
export const useUnitmeasurementsQuery = () => {
  return useQuery({
    queryKey: unitmeasurementKeys.all,
    queryFn: fetchUnitmeasurements,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single unitmeasurement
export const useUnitmeasurementQuery = (code: string | undefined) => {
  return useQuery({
    queryKey: unitmeasurementKeys.detail(code as string),
    queryFn: () => getUnitmeasurement(code as string),
    enabled: !!code,
    staleTime: 30000,
  });
};

// Hook for creating a unitmeasurement
export const useCreateUnitmeasurement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createUnitmeasurement,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: unitmeasurementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitmeasurementKeys.all });
      toast.success('Unit measurement created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create unit measurement', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create unit measurement error:', error);
    },
  });
};

// Hook for updating a unitmeasurement
export const useUpdateUnitmeasurement = (code: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUnitmeasurement,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: unitmeasurementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitmeasurementKeys.all });
      queryClient.invalidateQueries({ queryKey: unitmeasurementKeys.detail(code as string) });
      toast.success('Unit measurement updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update unit measurement', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update unit measurement error:', error);
    },
  });
};

// Hook for deleting a unitmeasurement
export const useDeleteUnitmeasurement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteUnitmeasurement,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: unitmeasurementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: unitmeasurementKeys.all });
      toast.success('Unit measurement deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete unit measurement', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete unit measurement error:', error);
    },
  });
};