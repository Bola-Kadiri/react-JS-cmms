import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchRequestquotations,
  getRequestquotation,
  createRequestquotation,
  updateRequestquotation,
  deleteRequestquotation,
  RequestquotationQueryParams
} from '@/services/requestquotationsApi';
import { Requestquotation } from '@/types/requestquotation';
import React from 'react';

// Key factory for consistent query keys
export const requestquotationKeys = {
  all: ['requestquotations'] as const,
  lists: () => [...requestquotationKeys.all, 'list'] as const,
  list: (params: RequestquotationQueryParams) => [...requestquotationKeys.lists(), params] as const,
  details: () => [...requestquotationKeys.all, 'detail'] as const,
  detail: (id: string) => [...requestquotationKeys.details(), id] as const,
};

// Hook for fetching requestquotations list
export const useRequestquotationsQuery = () => {
  return useQuery({
    queryKey: requestquotationKeys.all,
    queryFn: fetchRequestquotations,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single requestquotation
export const useRequestquotationQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: requestquotationKeys.detail(id as string),
    queryFn: () => getRequestquotation(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a requestquotation
export const useCreateRequestquotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createRequestquotation,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: requestquotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestquotationKeys.all });
      toast.success('Requestquotation created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create requestquotation', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create requestquotation error:', error);
    },
  });
};

// Hook for updating a requestquotation
export const useUpdateRequestquotation = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateRequestquotation,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: requestquotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestquotationKeys.all });
      queryClient.invalidateQueries({ queryKey: requestquotationKeys.detail(id as string) });
      toast.success('Requestquotation updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update requestquotation', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update requestquotation error:', error);
    },
  });
};

// Hook for deleting a requestquotation
export const useDeleteRequestquotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteRequestquotation,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: requestquotationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: requestquotationKeys.all });
      toast.success('Requestquotation deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete requestquotation', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete requestquotation error:', error);
    },
  });
};