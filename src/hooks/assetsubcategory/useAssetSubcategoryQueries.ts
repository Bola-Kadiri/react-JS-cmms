import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchAssetSubcategories, 
  getAssetSubcategory, 
  createAssetSubcategory, 
  updateAssetSubcategory, 
  deleteAssetSubcategory,
  AssetSubcategoryQueryParams 
} from '@/services/assetSubcategoriesApi';
import { AssetSubcategory } from '@/types/assetsubcategory';
import React from 'react';

// Key factory for consistent query keys
export const assetSubcategoryKeys = {
  all: ['assetSubcategories'] as const,
  lists: () => [...assetSubcategoryKeys.all, 'list'] as const,
  list: (params: AssetSubcategoryQueryParams) => [...assetSubcategoryKeys.lists(), params] as const,
  details: () => [...assetSubcategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetSubcategoryKeys.details(), id] as const,
};

// Hook for fetching asset subcategories list
export const useAssetSubcategoriesQuery = () => {
  return useQuery({
    queryKey: assetSubcategoryKeys.all,
    queryFn: fetchAssetSubcategories,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single asset subcategory
export const useAssetSubcategoryQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: assetSubcategoryKeys.detail(id as string),
    queryFn: () => getAssetSubcategory(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating an asset subcategory
export const useCreateAssetSubcategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAssetSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetSubcategoryKeys.all });
      toast.success('Asset subcategory created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create asset subcategory', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
      });
      console.error('Create asset subcategory error:', error);
    },
  });
};

// Hook for updating an asset subcategory
export const useUpdateAssetSubcategory = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAssetSubcategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assetSubcategoryKeys.all });
      queryClient.invalidateQueries({ queryKey: assetSubcategoryKeys.detail(id as string) });
      toast.success('Asset subcategory updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update asset subcategory', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update asset subcategory error:', error);
    },
  });
};

// Hook for deleting an asset subcategory
export const useDeleteAssetSubcategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAssetSubcategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetSubcategoryKeys.all });
      toast.success('Asset subcategory deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete asset subcategory', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete asset subcategory error:', error);
    },
  });
}; 