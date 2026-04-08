import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchVendors,
  getVendor,
  createVendor,
  updateVendor,
  deleteVendor,
  VendorQueryParams
} from '@/services/vendorsApi';
import { Vendor } from '@/types/vendor';
import React from 'react';

// Key factory for consistent query keys
export const vendorKeys = {
  all: ['vendors'] as const,
  lists: () => [...vendorKeys.all, 'list'] as const,
  list: (params: VendorQueryParams) => [...vendorKeys.lists(), params] as const,
  details: () => [...vendorKeys.all, 'detail'] as const,
  detail: (slug: string) => [...vendorKeys.details(), slug] as const,
};

// Hook for fetching vendors list
export const useVendorsQuery = () => {
  return useQuery({
    queryKey: vendorKeys.all,
    queryFn: fetchVendors,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single vendor
export const useVendorQuery = (slug: string | undefined) => {
  return useQuery({
    queryKey: vendorKeys.detail(slug as string),
    queryFn: () => getVendor(slug as string),
    enabled: !!slug,
    staleTime: 30000,
  });
};

// Hook for creating a vendor
export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createVendor,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create vendor', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create vendor error:', error);
    },
  });
};

// Hook for updating a vendor
export const useUpdateVendor = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateVendor,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      queryClient.invalidateQueries({ queryKey: vendorKeys.detail(slug as string) });
      toast.success('Vendor updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update vendor', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update vendor error:', error);
    },
  });
};

// Hook for deleting a vendor
export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteVendor,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: vendorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vendorKeys.all });
      toast.success('Vendor deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete vendor', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete vendor error:', error);
    },
  });
};