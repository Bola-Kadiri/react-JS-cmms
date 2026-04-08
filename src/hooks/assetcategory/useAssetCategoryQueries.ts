import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchAssetCategories, 
  getAssetCategory, 
  createAssetCategory, 
  updateAssetCategory, 
  deleteAssetCategory,
  AssetCategoryQueryParams 
} from '@/services/assetCategoriesApi';
import { AssetCategory } from '@/types/assetcategory';
import React from 'react';

// Key factory for consistent query keys
export const assetCategoryKeys = {
  all: ['assetCategories'] as const,
  lists: () => [...assetCategoryKeys.all, 'list'] as const,
  list: (params: AssetCategoryQueryParams) => [...assetCategoryKeys.lists(), params] as const,
  details: () => [...assetCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...assetCategoryKeys.details(), id] as const,
};

// Hook for fetching asset categories list
export const useAssetCategoriesQuery = () => {
  return useQuery({
    queryKey: assetCategoryKeys.all,
    queryFn: fetchAssetCategories,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single asset category
export const useAssetCategoryQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: assetCategoryKeys.detail(id as string),
    queryFn: () => getAssetCategory(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating an asset category
export const useCreateAssetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetCategoryKeys.all });
      toast.success('Asset category created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create asset category', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
      });
      console.error('Create asset category error:', error);
    },
  });
};

// Hook for updating an asset category
export const useUpdateAssetCategory = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateAssetCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: assetCategoryKeys.all });
      queryClient.invalidateQueries({ queryKey: assetCategoryKeys.detail(id as string) });
      toast.success('Asset category updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update asset category', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update asset category error:', error);
    },
  });
};

// Hook for deleting an asset category
export const useDeleteAssetCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteAssetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assetCategoryKeys.all });
      toast.success('Asset category deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete asset category', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete asset category error:', error);
    },
  });
}; 