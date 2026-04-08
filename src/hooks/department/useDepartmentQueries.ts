import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  DepartmentQueryParams
} from '@/services/departmentsApi';
import { Department } from '@/types/department';
import React from 'react';

// Key factory for consistent query keys
export const departmentKeys = {
  all: ['departments'] as const,
  lists: () => [...departmentKeys.all, 'list'] as const,
  list: (params: DepartmentQueryParams) => [...departmentKeys.lists(), params] as const,
  details: () => [...departmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...departmentKeys.details(), id] as const,
};

// Hook for fetching departments list
export const useDepartmentsQuery = () => {
  return useQuery({
    queryKey: departmentKeys.all,
    queryFn: fetchDepartments,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single department
export const useDepartmentQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: departmentKeys.detail(id as string),
    queryFn: () => getDepartment(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a department
export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success('Department created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create department', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
      });
      console.error('Create department error:', error);
    },
  });
};

// Hook for updating a department
export const useUpdateDepartment = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateDepartment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      queryClient.invalidateQueries({ queryKey: departmentKeys.detail(id as string) });
      toast.success('Department updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update department', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update department error:', error);
    },
  });
};

// Hook for deleting a department
export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: departmentKeys.all });
      toast.success('Department deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete department', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete department error:', error);
    },
  });
};