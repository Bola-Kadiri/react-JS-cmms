// src/hooks/subcategories/useSubcategoryQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
 fetchSubcategories, 
 getSubcategory, 
 createSubcategory, 
 updateSubcategory, 
 deleteSubcategory,
 SubcategoryQueryParams 
} from '@/services/subcategoriesApi';
import { Subcategory } from '@/types/subcategory';
import React from 'react';

// Key factory for consistent query keys
export const subcategoryKeys = {
 all: ['subcategories'] as const,
 lists: () => [...subcategoryKeys.all, 'list'] as const,
 list: (params: SubcategoryQueryParams) => [...subcategoryKeys.lists(), params] as const,
 details: () => [...subcategoryKeys.all, 'detail'] as const,
 detail: (id: string) => [...subcategoryKeys.details(), id] as const,
};

// Hook for fetching subcategories list
export const useSubcategoriesQuery = () => {
 return useQuery({
   queryKey: subcategoryKeys.all,
   queryFn: fetchSubcategories,
   staleTime: 30000, // 30000 Consider data fresh for 30 seconds
   placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
 });
};

// Hook for fetching a single subcategory
export const useSubcategoryQuery = (id: string | undefined) => {
 return useQuery({
   queryKey: subcategoryKeys.detail(id as string),
   queryFn: () => getSubcategory(id as string),
   enabled: !!id,
   staleTime: 30000,
 });
};

// Hook for creating a subcategory
export const useCreateSubcategory = () => {
 const queryClient = useQueryClient();
 
 return useMutation({
   mutationFn: createSubcategory,
   onSuccess: () => {
   //   queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
     queryClient.invalidateQueries({ queryKey: subcategoryKeys.all });
     toast.success('Subcategory created successfully', {
       duration: 3000,
       icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
     });
   },
   onError: (error) => {
     toast.error('Failed to create subcategory', {
       duration: 5000,
       icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
       // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
     });
     console.error('Create subcategory error:', error);
   },
 });
};

// Hook for updating a subcategory
export const useUpdateSubcategory = (id: string | undefined) => {
 const queryClient = useQueryClient();
 
 return useMutation({
   mutationFn: updateSubcategory,
   onSuccess: (data) => {
   //   queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
     queryClient.invalidateQueries({ queryKey: subcategoryKeys.all });
     queryClient.invalidateQueries({ queryKey: subcategoryKeys.detail(id as string) });
     toast.success('Subcategory updated successfully', {
       duration: 3000,
       icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
     });
   },
   onError: (error) => {
     toast.error('Failed to update subcategory', {
       duration: 5000,
       icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
     });
     console.error('Update subcategory error:', error);
   },
 });
};

// Hook for deleting a subcategory
export const useDeleteSubcategory = () => {
 const queryClient = useQueryClient();
 
 return useMutation({
   mutationFn: deleteSubcategory,
   onSuccess: () => {
   //   queryClient.invalidateQueries({ queryKey: subcategoryKeys.lists() });
     queryClient.invalidateQueries({ queryKey: subcategoryKeys.all });
     toast.success('Subcategory deleted successfully', {
       duration: 3000,
       icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
     });
   },
   onError: (error) => {
     toast.error('Failed to delete subcategory', {
       duration: 5000,
       icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
     });
     console.error('Delete subcategory error:', error);
   },
 });
};