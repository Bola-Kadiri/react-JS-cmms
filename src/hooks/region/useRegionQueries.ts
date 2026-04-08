// src/hooks/regions/useRegionQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchRegions, 
  getRegion, 
  createRegion, 
  updateRegion, 
  deleteRegion,
  RegionQueryParams 
} from '@/services/regionsApi';
import { Region } from '@/types/region';
import React from 'react';

// Key factory for consistent query keys
export const regionKeys = {
  all: ['regions'] as const,
  lists: () => [...regionKeys.all, 'list'] as const,
  list: (params: RegionQueryParams) => [...regionKeys.lists(), params] as const,
  details: () => [...regionKeys.all, 'detail'] as const,
  detail: (id: string) => [...regionKeys.details(), id] as const,
};

// Hook for fetching regions list
export const useRegionsQuery = () => {
  return useQuery({
    queryKey: regionKeys.all,
    queryFn: fetchRegions,
    staleTime: 30000, // 30000 Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single region
export const useRegionQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: regionKeys.detail(id as string),
    queryFn: () => getRegion(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a region
export const useCreateRegion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRegion,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionKeys.all });
      toast.success('Region created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create region', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create region error:', error);
    },
  });
};

// Hook for updating a region
export const useUpdateRegion = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateRegion,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionKeys.all });
      queryClient.invalidateQueries({ queryKey: regionKeys.detail(id as string) });
      toast.success('Region updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update region', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update region error:', error);
    },
  });
};

// Hook for deleting a region
export const useDeleteRegion = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: regionKeys.all });
      toast.success('Region deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete region', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete region error:', error);
    },
  });
};