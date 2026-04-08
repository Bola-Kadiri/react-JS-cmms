// src/hooks/clusters/useClusterQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { 
  fetchClusters, 
  getCluster, 
  createCluster, 
  updateCluster, 
  deleteCluster,
  ClusterQueryParams 
} from '@/services/clustersApi';
import { Cluster } from '@/types/cluster';
import React from 'react';

// Key factory for consistent query keys
export const clusterKeys = {
  all: ['clusters'] as const,
  lists: () => [...clusterKeys.all, 'list'] as const,
  list: (params: ClusterQueryParams) => [...clusterKeys.lists(), params] as const,
  details: () => [...clusterKeys.all, 'detail'] as const,
  detail: (id: string) => [...clusterKeys.details(), id] as const,
};

// Hook for fetching clusters list
export const useClustersQuery = () => {
  return useQuery({
    queryKey: clusterKeys.all,
    queryFn: fetchClusters,
    staleTime: 30000, // 30000 Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single cluster
export const useClusterQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: clusterKeys.detail(id as string),
    queryFn: () => getCluster(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a cluster
export const useCreateCluster = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCluster,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: clusterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clusterKeys.all });
      toast.success('Cluster created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create cluster', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create cluster error:', error);
    },
  });
};

// Hook for updating a cluster
export const useUpdateCluster = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCluster,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: clusterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clusterKeys.all });
      queryClient.invalidateQueries({ queryKey: clusterKeys.detail(id as string) });
      toast.success('Cluster updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update cluster', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update cluster error:', error);
    },
  });
};

// Hook for deleting a cluster
export const useDeleteCluster = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCluster,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: clusterKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clusterKeys.all });
      toast.success('Cluster deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete cluster', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete cluster error:', error);
    },
  });
};