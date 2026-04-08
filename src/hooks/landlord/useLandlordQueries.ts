// src/hooks/landlords/useBuildingQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchLandlords, 
  getLandlord, 
  createLandlord, 
  updateLandlord, 
  deleteLandlord,
  LandlordQueryParams 
} from '@/services/landlordsApi';
import { Landlord } from '@/types/landlord';
import React from 'react';

// Key factory for consistent query keys
export const landlordKeys = {
  all: ['landlords'] as const,
  lists: () => [...landlordKeys.all, 'list'] as const,
  list: (params: LandlordQueryParams) => [...landlordKeys.lists(), params] as const,
  details: () => [...landlordKeys.all, 'detail'] as const,
  detail: (id: string) => [...landlordKeys.details(), id] as const,
};

// Hook for fetching landlords list
export const useLandlordsQuery = () => {
  return useQuery({
    queryKey: landlordKeys.all,
    queryFn: fetchLandlords,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single landlord
export const useLandlordQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: landlordKeys.detail(id as string),
    queryFn: () => getLandlord(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a landlord
export const useCreateLandlord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createLandlord,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: landlordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.all });
      toast.success('Landlord created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create landlord', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create landlord error:', error);
    },
  });
};

// Hook for updating a landlord
export const useUpdateLandlord = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateLandlord,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: landlordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.all });
      queryClient.invalidateQueries({ queryKey: landlordKeys.detail(id as string) });
      toast.success('Landlord updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update landlord', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update landlord error:', error);
    },
  });
};

// Hook for deleting a landlord
export const useDeleteLandlord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteLandlord,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: landlordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: landlordKeys.all });
      
      toast.success('Landlord deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete landlord', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete landlord error:', error);
    },
  });
};