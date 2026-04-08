// src/hooks/zone/useZoneQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchZones, 
  fetchZonesByFacility,
  getZone, 
  createZone, 
  updateZone, 
  deleteZone,
  ZoneQueryParams 
} from '@/services/zonesApi';
import { Zone } from '@/types/zone';
import React from 'react';

// Key factory for consistent query keys
export const zoneKeys = {
  all: ['zones'] as const,
  lists: () => [...zoneKeys.all, 'list'] as const,
  list: (params: ZoneQueryParams) => [...zoneKeys.lists(), params] as const,
  details: () => [...zoneKeys.all, 'detail'] as const,
  detail: (id: string) => [...zoneKeys.details(), id] as const,
  byFacility: () => [...zoneKeys.all, 'byFacility'] as const,
  byFacilityDetail: (facilityId: string) => [...zoneKeys.byFacility(), facilityId] as const,
};

// Hook for fetching zones list
export const useZonesQuery = () => {
  return useQuery({
    queryKey: zoneKeys.all,
    queryFn: fetchZones,
    staleTime: 30000, // 30000 Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching zones by facility
export const useZonesByFacilityQuery = (facilityId: string | undefined) => {
  return useQuery({
    queryKey: zoneKeys.byFacilityDetail(facilityId as string),
    queryFn: () => fetchZonesByFacility(facilityId as string),
    enabled: !!facilityId,
    staleTime: 30000,
    placeholderData: [], // Provide fallback data
  });
};

// Hook for fetching a single zone
export const useZoneQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: zoneKeys.detail(id as string),
    queryFn: () => getZone(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a zone
export const useCreateZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createZone,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
      toast.success('Zone created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create zone', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create zone error:', error);
    },
  });
};

// Hook for updating a zone
export const useUpdateZone = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateZone,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(id as string) });
      toast.success('Zone updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update zone', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update zone error:', error);
    },
  });
};

// Hook for deleting a zone
export const useDeleteZone = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteZone,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
      queryClient.invalidateQueries({ queryKey: zoneKeys.all });
      toast.success('Zone deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete zone', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete zone error:', error);
    },
  });
};