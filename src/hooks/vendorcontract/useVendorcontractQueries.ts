import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchVendorContracts,
  getVendorContract,
  createVendorContract,
  updateVendorContract,
  patchVendorContract,
  deleteVendorContract,
  VendorContractQueryParams
} from '@/services/vendorcontractsApi';
import { VendorContract } from '@/types/vendorcontract';
import React from 'react';

// Key factory for consistent query keys
export const vendorcontractKeys = {
  all: ['vendorcontracts'] as const,
  lists: () => [...vendorcontractKeys.all, 'list'] as const,
  list: (params: VendorContractQueryParams) => [...vendorcontractKeys.lists(), params] as const,
  details: () => [...vendorcontractKeys.all, 'detail'] as const,
  detail: (id: string) => [...vendorcontractKeys.details(), id] as const,
};

// Hook for fetching vendor contracts list
export const useVendorContractsQuery = () => {
  return useQuery({
    queryKey: vendorcontractKeys.all,
    queryFn: fetchVendorContracts,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single vendor contract
export const useVendorContractQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: vendorcontractKeys.detail(id as string),
    queryFn: () => getVendorContract(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a vendor contract
export const useCreateVendorContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVendorContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorcontractKeys.all });
      toast.success('Vendor contract created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create vendor contract', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
      });
      console.error('Create vendor contract error:', error);
    },
  });
};

// Hook for updating a vendor contract
export const useUpdateVendorContract = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateVendorContract,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorcontractKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorcontractKeys.detail(id as string) });
      toast.success('Vendor contract updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update vendor contract', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update vendor contract error:', error);
    },
  });
};

// Hook for patching a vendor contract
export const usePatchVendorContract = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: patchVendorContract,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vendorcontractKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorcontractKeys.detail(id as string) });
      toast.success('Vendor contract updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update vendor contract', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Patch vendor contract error:', error);
    },
  });
};

// Hook for deleting a vendor contract
export const useDeleteVendorContract = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVendorContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vendorcontractKeys.all });
      toast.success('Vendor contract deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete vendor contract', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete vendor contract error:', error);
    },
  });
};

