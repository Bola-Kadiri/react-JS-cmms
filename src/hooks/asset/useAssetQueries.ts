// src/hooks/assets/useAssetQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
 fetchAssets, 
 getAsset, 
 createAsset, 
 updateAsset, 
 deleteAsset,
 AssetQueryParams 
} from '@/services/assetsApi';
import { Asset } from '@/types/asset';
import React from 'react';

// Key factory for consistent query keys
export const assetKeys = {
 all: ['assets'] as const,
 lists: () => [...assetKeys.all, 'list'] as const,
 list: (params: AssetQueryParams) => [...assetKeys.lists(), params] as const,
 details: () => [...assetKeys.all, 'detail'] as const,
 detail: (id: string) => [...assetKeys.details(), id] as const,
};

// Hook for fetching assets list
export const useAssetsQuery = () => {
 return useQuery({
   queryKey: assetKeys.all,
   queryFn: fetchAssets,
   staleTime: 30000, // 30000 Consider data fresh for 30 seconds
   placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
 });
};

// Hook for fetching a single asset
export const useAssetQuery = (id: string | undefined) => {
 return useQuery({
   queryKey: assetKeys.detail(id as string),
   queryFn: () => getAsset(id as string),
   enabled: !!id,
   staleTime: 30000,
 });
};

// Hook for creating a asset
export const useCreateAsset = () => {
 const queryClient = useQueryClient();
 
 return useMutation({
   mutationFn: createAsset,
   onSuccess: () => {
   //   queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
     queryClient.invalidateQueries({ queryKey: assetKeys.all });
     toast.success('Asset created successfully', {
       duration: 3000,
       icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
     });
   },
   onError: (error) => {
     toast.error('Failed to create asset', {
       duration: 5000,
       icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
       // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
     });
     console.error('Create asset error:', error);
   },
 });
};

// Hook for updating a asset
export const useUpdateAsset = (id: string | undefined) => {
 const queryClient = useQueryClient();
 
 return useMutation({
   mutationFn: updateAsset,
   onSuccess: (data) => {
   //   queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
     queryClient.invalidateQueries({ queryKey: assetKeys.all });
     queryClient.invalidateQueries({ queryKey: assetKeys.detail(id as string) });
     toast.success('Asset updated successfully', {
       duration: 3000,
       icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
     });
   },
   onError: (error) => {
     toast.error('Failed to update asset', {
       duration: 5000,
       icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
     });
     console.error('Update asset error:', error);
   },
 });
};

// Hook for deleting a asset
export const useDeleteAsset = () => {
 const queryClient = useQueryClient();
 
 return useMutation({
   mutationFn: deleteAsset,
   onSuccess: () => {
   //   queryClient.invalidateQueries({ queryKey: assetKeys.lists() });
     queryClient.invalidateQueries({ queryKey: assetKeys.all });
     toast.success('Asset deleted successfully', {
       duration: 3000,
       icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
     });
   },
   onError: (error) => {
     toast.error('Failed to delete asset', {
       duration: 5000,
       icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
     });
     console.error('Delete asset error:', error);
   },
 });
};