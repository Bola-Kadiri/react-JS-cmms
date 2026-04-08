import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchWorkrequests,
  getWorkrequest,
  createWorkrequest,
  updateWorkrequest,
  deleteWorkrequest,
  getAssetsByFacility,
  getBuildingsByFacility,
  getProcurementUsers,
  approveWorkrequest,
  rejectWorkrequest,
  addProcurementDetails,
  fetchProcurementWorkrequests,
  fetchApprovedWorkrequests,
  WorkrequestQueryParams,
  ApproveWorkrequestData,
  ProcurementData,
  ProcurementWorkrequestsResponse
} from '@/services/workrequestsApi';
import { Workrequest } from '@/types/workrequest';
import React from 'react';

// Key factory for consistent query keys
export const workrequestKeys = {
  all: ['workrequests'] as const,
  lists: () => [...workrequestKeys.all, 'list'] as const,
  list: (params: WorkrequestQueryParams) => [...workrequestKeys.lists(), params] as const,
  details: () => [...workrequestKeys.all, 'detail'] as const,
  detail: (slug: string) => [...workrequestKeys.details(), slug] as const,
  assetsByFacility: (facility_id: number) => [...workrequestKeys.all, 'assets-by-facility', facility_id] as const,
  buildingsByFacility: (facility_id: number) => [...workrequestKeys.all, 'buildings-by-facility', facility_id] as const,
  procurementUsers: () => [...workrequestKeys.all, 'procurement-users'] as const,
  procurementAssigned: () => [...workrequestKeys.all, 'procurement-assigned'] as const,
  approved: () => [...workrequestKeys.all, 'approved'] as const,
};

// Hook for fetching workrequests list
export const useWorkrequestsQuery = () => {
  return useQuery({
    queryKey: workrequestKeys.all,
    queryFn: fetchWorkrequests,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching procurement assigned workrequests
export const useProcurementWorkrequestsQuery = () => {
  return useQuery({
    queryKey: workrequestKeys.procurementAssigned(),
    queryFn: fetchProcurementWorkrequests,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single workrequest
export const useWorkrequestQuery = (slug: string | undefined) => {
  return useQuery({
    queryKey: workrequestKeys.detail(slug as string),
    queryFn: () => getWorkrequest(slug as string),
    enabled: !!slug,
    staleTime: 30000,
  });
};

// Hook for creating a workrequest
export const useCreateWorkrequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createWorkrequest,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: workrequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      toast.success('Workrequest created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create workrequest', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create workrequest error:', error);
    },
  });
};

// Hook for updating a workrequest
export const useUpdateWorkrequest = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateWorkrequest,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: workrequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      queryClient.invalidateQueries({ queryKey: workrequestKeys.detail(slug as string) });
      toast.success('Workrequest updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update workrequest', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update workrequest error:', error);
    },
  });
};

// Hook for deleting a workrequest
export const useDeleteWorkrequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteWorkrequest,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: workrequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      toast.success('Workrequest deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete workrequest', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete workrequest error:', error);
    },
  });
};

// Hook for fetching assets by facility
export const useAssetsByFacilityQuery = (facility_id: number | undefined) => {
  return useQuery({
    queryKey: workrequestKeys.assetsByFacility(facility_id as number),
    queryFn: () => getAssetsByFacility(facility_id as number),
    enabled: !!facility_id,
    staleTime: 30000,
  });
};

// Hook for fetching buildings by facility
export const useBuildingsByFacilityQuery = (facility_id: number | undefined) => {
  return useQuery({
    queryKey: workrequestKeys.buildingsByFacility(facility_id as number),
    queryFn: () => getBuildingsByFacility(facility_id as number),
    enabled: !!facility_id,
    staleTime: 30000,
  });
};

// Hook for fetching procurement users
export const useProcurementUsersQuery = () => {
  return useQuery({
    queryKey: workrequestKeys.procurementUsers(),
    queryFn: getProcurementUsers,
    staleTime: 30000,
  });
};

// Hook for approving a workrequest
export const useApproveWorkrequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: approveWorkrequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      queryClient.invalidateQueries({ queryKey: workrequestKeys.detail(data.slug) });
      toast.success('Workrequest approved successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to approve workrequest', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Approve workrequest error:', error);
    },
  });
};

// Hook for rejecting a workrequest
export const useRejectWorkrequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: rejectWorkrequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      queryClient.invalidateQueries({ queryKey: workrequestKeys.detail(data.slug) });
      toast.success('Workrequest rejected successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to reject workrequest', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Reject workrequest error:', error);
    },
  });
};

// Hook for adding procurement details to a workrequest
export const useAddProcurementDetails = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addProcurementDetails,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: workrequestKeys.all });
      queryClient.invalidateQueries({ queryKey: workrequestKeys.detail(data.slug) });
      toast.success('Procurement details added successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to add procurement details', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Add procurement details error:', error);
    },
  });
};

// Hook for fetching approved work requests for work order creation
export const useApprovedWorkrequestsQuery = () => {
  return useQuery({
    queryKey: workrequestKeys.approved(),
    queryFn: fetchApprovedWorkrequests,
    staleTime: 30000,
    placeholderData: [],
  });
};