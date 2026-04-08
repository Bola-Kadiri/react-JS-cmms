// src/hooks/buildings/useBuildingQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchBuildings, 
  fetchBuildingZoneByFacility,
  getBuilding, 
  createBuilding, 
  updateBuilding, 
  deleteBuilding,
  BuildingQueryParams 
} from '@/services/buildingsApi';
import { Building } from '@/types/building';
import React from 'react';

// Key factory for consistent query keys
export const buildingKeys = {
  all: ['buildings'] as const,
  lists: () => [...buildingKeys.all, 'list'] as const,
  list: (params: BuildingQueryParams) => [...buildingKeys.lists(), params] as const,
  details: () => [...buildingKeys.all, 'detail'] as const,
  detail: (id: string) => [...buildingKeys.details(), id] as const,
  zonesByFacility: () => [...buildingKeys.all, 'zonesByFacility'] as const,
  zonesByFacilityDetail: (facilityId: string) => [...buildingKeys.zonesByFacility(), facilityId] as const,
};

// Hook for fetching buildings list
export const useBuildingsQuery = () => {
  return useQuery({
    queryKey: buildingKeys.all,
    queryFn: fetchBuildings,
    staleTime: 30000, // 30000 Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching building zones by facility
export const useBuildingZonesByFacilityQuery = (facilityId: string | undefined) => {
  return useQuery({
    queryKey: buildingKeys.zonesByFacilityDetail(facilityId as string),
    queryFn: () => fetchBuildingZoneByFacility(facilityId as string),
    enabled: !!facilityId,
    staleTime: 30000,
    placeholderData: [], // Provide fallback data
  });
};

// Hook for fetching a single building
export const useBuildingQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: buildingKeys.detail(id as string),
    queryFn: () => getBuilding(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a building
export const useCreateBuilding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBuilding,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingKeys.all });
      toast.success('Building created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create building', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create building error:', error);
    },
  });
};

// Hook for updating a building
export const useUpdateBuilding = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateBuilding,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingKeys.all });
      queryClient.invalidateQueries({ queryKey: buildingKeys.detail(id as string) });
      toast.success('Building updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update building', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update building error:', error);
    },
  });
};

// Hook for deleting a building
export const useDeleteBuilding = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBuilding,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: buildingKeys.lists() });
      queryClient.invalidateQueries({ queryKey: buildingKeys.all });
      toast.success('Building deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete building', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete building error:', error);
    },
  });
};