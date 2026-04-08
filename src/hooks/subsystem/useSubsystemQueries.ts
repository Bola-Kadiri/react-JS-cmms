// src/hooks/subsystems/useSubsystemQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchSubsystems, 
  fetchSubsystemBuildingsByFacility,
  getSubsystem, 
  createSubsystem, 
  updateSubsystem, 
  deleteSubsystem,
  SubsystemQueryParams 
} from '@/services/subsystemsApi';
import { Subsystem } from '@/types/subsystem';
import React from 'react';

// Key factory for consistent query keys
export const subsystemKeys = {
  all: ['subsystems'] as const,
  lists: () => [...subsystemKeys.all, 'list'] as const,
  list: (params: SubsystemQueryParams) => [...subsystemKeys.lists(), params] as const,
  details: () => [...subsystemKeys.all, 'detail'] as const,
  detail: (id: string) => [...subsystemKeys.details(), id] as const,
  buildingsByFacility: () => [...subsystemKeys.all, 'buildingsByFacility'] as const,
  buildingsByFacilityDetail: (facilityId: string) => [...subsystemKeys.buildingsByFacility(), facilityId] as const,
};

// Hook for fetching subsystems list
export const useSubsystemsQuery = () => {
  return useQuery({
    queryKey: subsystemKeys.all,
    queryFn: fetchSubsystems,
    staleTime: 30000, // 30000 Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching subsystem buildings by facility
export const useSubsystemBuildingsByFacilityQuery = (facilityId: string | undefined) => {
  return useQuery({
    queryKey: subsystemKeys.buildingsByFacilityDetail(facilityId as string),
    queryFn: () => fetchSubsystemBuildingsByFacility(facilityId as string),
    enabled: !!facilityId,
    staleTime: 30000,
    placeholderData: [], // Provide fallback data
  });
};

// Hook for fetching a single subsystem
export const useSubsystemQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: subsystemKeys.detail(id as string),
    queryFn: () => getSubsystem(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a subsystem
export const useCreateSubsystem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createSubsystem,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: subsystemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subsystemKeys.all });
      toast.success('Subsystem created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create subsystem', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create subsystem error:', error);
    },
  });
};

// Hook for updating a subsystem
export const useUpdateSubsystem = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateSubsystem,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: subsystemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subsystemKeys.all });
      queryClient.invalidateQueries({ queryKey: subsystemKeys.detail(id as string) });
      toast.success('Subsystem updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update subsystem', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update subsystem error:', error);
    },
  });
};

// Hook for deleting a subsystem
export const useDeleteSubsystem = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteSubsystem,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: subsystemKeys.lists() });
      queryClient.invalidateQueries({ queryKey: subsystemKeys.all });
      toast.success('Subsystem deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete subsystem', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete subsystem error:', error);
    },
  });
};