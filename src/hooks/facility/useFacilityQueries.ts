// src/hooks/facilities/useFacilityQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchFacilities,
  fetchUserFacilities,
  getFacility,
  createFacility,
  updateFacility,
  deleteFacility,
  FacilityQueryParams
} from '@/services/facilitiesApi';
import { Facility } from '@/types/facility';
import React from 'react';

// Key factory for consistent query keys
export const facilityKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityKeys.all, 'list'] as const,
  list: (params: FacilityQueryParams) => [...facilityKeys.lists(), params] as const,
  details: () => [...facilityKeys.all, 'detail'] as const,
  detail: (code: string) => [...facilityKeys.details(), code] as const,
};

// Hook for fetching facilities list
export const useFacilitiesQuery = () => {
  return useQuery({
    queryKey: facilityKeys.all,
    queryFn: fetchFacilities,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching facilities assigned to the authenticated user
export const useUserFacilitiesQuery = () => {
  return useQuery({
    queryKey: [...facilityKeys.all, 'user-facilities'],
    queryFn: fetchUserFacilities,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single facility
export const useFacilityQuery = (code: string | undefined) => {
  return useQuery({
    queryKey: facilityKeys.detail(code as string),
    queryFn: () => getFacility(code as string),
    enabled: !!code,
    staleTime: 30000,
  });
};

// Hook for creating a facility
export const useCreateFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createFacility,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      toast.success('Facility created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create facility', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create facility error:', error);
    },
  });
};

// Hook for updating a facility
export const useUpdateFacility = (code: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateFacility,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      queryClient.invalidateQueries({ queryKey: facilityKeys.detail(code as string) });
      toast.success('Facility updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update facility', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update facility error:', error);
    },
  });
};

// Hook for deleting a facility
export const useDeleteFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteFacility,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: facilityKeys.lists() });
      queryClient.invalidateQueries({ queryKey: facilityKeys.all });
      toast.success('Facility deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete facility', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete facility error:', error);
    },
  });
};