// src/hooks/apartmenttypes/useApartmenttypeQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchApartmenttypes,
  getApartmenttype,
  createApartmenttype,
  updateApartmenttype,
  deleteApartmenttype,
  ApartmenttypeQueryParams
} from '@/services/apartmenttypesApi';
import { Apartmenttype } from '@/types/apartmenttype';
import React from 'react';

// Key factory for consistent query keys
export const apartmenttypeKeys = {
  all: ['apartmenttypes'] as const,
  lists: () => [...apartmenttypeKeys.all, 'list'] as const,
  list: (params: ApartmenttypeQueryParams) => [...apartmenttypeKeys.lists(), params] as const,
  details: () => [...apartmenttypeKeys.all, 'detail'] as const,
  detail: (slug: string) => [...apartmenttypeKeys.details(), slug] as const,
};

// Hook for fetching apartmenttypes list
export const useApartmenttypesQuery = () => {
  return useQuery({
    queryKey: apartmenttypeKeys.all,
    queryFn: fetchApartmenttypes,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single apartmenttype
export const useApartmenttypeQuery = (slug: string | undefined) => {
  return useQuery({
    queryKey: apartmenttypeKeys.detail(slug as string),
    queryFn: () => getApartmenttype(slug as string),
    enabled: !!slug,
    staleTime: 30000,
  });
};

// Hook for creating an apartmenttype
export const useCreateApartmenttype = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createApartmenttype,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: apartmenttypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apartmenttypeKeys.all });
      toast.success('Apartmenttype created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create apartmenttype', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create apartmenttype error:', error);
    },
  });
};

// Hook for updating an apartmenttype
export const useUpdateApartmenttype = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateApartmenttype,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: apartmenttypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apartmenttypeKeys.all });
      queryClient.invalidateQueries({ queryKey: apartmenttypeKeys.detail(slug as string) });
      toast.success('Apartmenttype updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update apartmenttype', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update apartmenttype error:', error);
    },
  });
};

// Hook for deleting an apartmenttype
export const useDeleteApartmenttype = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteApartmenttype,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: apartmenttypeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apartmenttypeKeys.all });
      toast.success('Apartmenttype deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete apartmenttype', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete apartmenttype error:', error);
    },
  });
};