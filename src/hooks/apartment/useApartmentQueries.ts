// src/hooks/apartments/useApartmentQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchApartments,
  getApartment,
  createApartment,
  updateApartment,
  deleteApartment,
  ApartmentQueryParams
} from '@/services/apartmentsApi';
import { Apartment } from '@/types/apartment';
import React from 'react';

// Key factory for consistent query keys
export const apartmentKeys = {
  all: ['apartments'] as const,
  lists: () => [...apartmentKeys.all, 'list'] as const,
  list: (params: ApartmentQueryParams) => [...apartmentKeys.lists(), params] as const,
  details: () => [...apartmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...apartmentKeys.details(), id] as const,
};

// Hook for fetching apartments list
export const useApartmentsQuery = () => {
  return useQuery({
    queryKey: apartmentKeys.all,
    queryFn: fetchApartments,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single apartment
export const useApartmentQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: apartmentKeys.detail(id as string),
    queryFn: () => getApartment(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a apartment
export const useCreateApartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createApartment,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apartmentKeys.all });
      toast.success('Apartment created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create apartment', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create apartment error:', error);
    },
  });
};

// Hook for updating a apartment
export const useUpdateApartment = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateApartment,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apartmentKeys.all });
      queryClient.invalidateQueries({ queryKey: apartmentKeys.detail(id as string) });
      toast.success('Apartment updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update apartment', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update apartment error:', error);
    },
  });
};

// Hook for deleting a apartment
export const useDeleteApartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteApartment,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: apartmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: apartmentKeys.all });
      toast.success('Apartment deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete apartment', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete apartment error:', error);
    },
  });
};