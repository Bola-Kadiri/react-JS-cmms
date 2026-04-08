// src/hooks/ppmitem/usePpmitemQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchPPMItems,
  getPPMItem,
  createPPMItem,
  updatePPMItem,
  patchPPMItem,
  deletePPMItem,
  PPMItemQueryParams
} from '@/services/ppmitemsApi';
import { PPMItem } from '@/types/ppmitem';
import React from 'react';

// Key factory for consistent query keys
export const ppmitemKeys = {
  all: ['ppmitems'] as const,
  lists: () => [...ppmitemKeys.all, 'list'] as const,
  list: (params: PPMItemQueryParams) => [...ppmitemKeys.lists(), params] as const,
  details: () => [...ppmitemKeys.all, 'detail'] as const,
  detail: (id: string) => [...ppmitemKeys.details(), id] as const,
};

// Hook for fetching ppm items list
export const usePPMItemsQuery = () => {
  return useQuery({
    queryKey: ppmitemKeys.all,
    queryFn: fetchPPMItems,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single ppm item
export const usePPMItemQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: ppmitemKeys.detail(id as string),
    queryFn: () => getPPMItem(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a ppm item
export const useCreatePPMItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPPMItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ppmitemKeys.all });
      toast.success('PPM Item created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create PPM Item', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create PPM Item error:', error);
    },
  });
};

// Hook for updating a ppm item (PUT)
export const useUpdatePPMItem = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePPMItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ppmitemKeys.all });
      queryClient.invalidateQueries({ queryKey: ppmitemKeys.detail(id as string) });
      toast.success('PPM Item updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update PPM Item', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update PPM Item error:', error);
    },
  });
};

// Hook for patching a ppm item (PATCH)
export const usePatchPPMItem = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: patchPPMItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ppmitemKeys.all });
      queryClient.invalidateQueries({ queryKey: ppmitemKeys.detail(id as string) });
      toast.success('PPM Item updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update PPM Item', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Patch PPM Item error:', error);
    },
  });
};

// Hook for deleting a ppm item
export const useDeletePPMItem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePPMItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ppmitemKeys.all });
      toast.success('PPM Item deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete PPM Item', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete PPM Item error:', error);
    },
  });
};
