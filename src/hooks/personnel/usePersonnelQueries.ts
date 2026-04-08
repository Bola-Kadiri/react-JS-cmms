// src/hooks/personnels/usePersonnelQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchPersonnels, 
  getPersonnel, 
  createPersonnel, 
  updatePersonnel, 
  deletePersonnel,
  PersonnelQueryParams 
} from '@/services/personnelsApi';
import { Personnel } from '@/types/personnel';
import React from 'react';

// Key factory for consistent query keys
export const personnelKeys = {
  all: ['personnels'] as const,
  lists: () => [...personnelKeys.all, 'list'] as const,
  list: (params: PersonnelQueryParams) => [...personnelKeys.lists(), params] as const,
  details: () => [...personnelKeys.all, 'detail'] as const,
  detail: (slug: string) => [...personnelKeys.details(), slug] as const,
};

// Hook for fetching personnels list
export const usePersonnelsQuery = () => {
  return useQuery({
    queryKey: personnelKeys.all,
    queryFn: fetchPersonnels,
    staleTime: 30000, // 30000 Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single personnel
export const usePersonnelQuery = (slug: string | undefined) => {
  return useQuery({
    queryKey: personnelKeys.detail(slug as string),
    queryFn: () => getPersonnel(slug as string),
    enabled: !!slug,
    staleTime: 30000,
  });
};

// Hook for creating a personnel
export const useCreatePersonnel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPersonnel,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: personnelKeys.lists() });
      queryClient.invalidateQueries({ queryKey: personnelKeys.all });
      toast.success('Personnel created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create personnel', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create personnel error:', error);
    },
  });
};

// Hook for updating a personnel
export const useUpdatePersonnel = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updatePersonnel,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: personnelKeys.lists() });
      queryClient.invalidateQueries({ queryKey: personnelKeys.all });
      queryClient.invalidateQueries({ queryKey: personnelKeys.detail(slug as string) });
      toast.success('Personnel updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update personnel', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update personnel error:', error);
    },
  });
};

// Hook for deleting a personnel
export const useDeletePersonnel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePersonnel,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: personnelKeys.lists() });
      queryClient.invalidateQueries({ queryKey: personnelKeys.all });
      toast.success('Personnel deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete personnel', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete personnel error:', error);
    },
  });
};