import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchGoodsreceivednotes,
  getGoodsreceivednote,
  createGoodsreceivednote,
  updateGoodsreceivednote,
  deleteGoodsreceivednote,
  GoodsreceivednoteQueryParams
} from '@/services/goodsreceivednotesApi';
import { Goodsreceivednote } from '@/types/goodsreceivednote';
import React from 'react';

// Key factory for consistent query keys
export const goodsreceivednoteKeys = {
  all: ['goodsreceivednotes'] as const,
  lists: () => [...goodsreceivednoteKeys.all, 'list'] as const,
  list: (params: GoodsreceivednoteQueryParams) => [...goodsreceivednoteKeys.lists(), params] as const,
  details: () => [...goodsreceivednoteKeys.all, 'detail'] as const,
  detail: (id: string) => [...goodsreceivednoteKeys.details(), id] as const,
};

// Hook for fetching goodsreceivednotes list
export const useGoodsreceivednotesQuery = () => {
  return useQuery({
    queryKey: goodsreceivednoteKeys.all,
    queryFn: fetchGoodsreceivednotes,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single goodsreceivednote
export const useGoodsreceivednoteQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: goodsreceivednoteKeys.detail(id as string),
    queryFn: () => getGoodsreceivednote(id as string),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Hook for creating a goodsreceivednote
export const useCreateGoodsreceivednote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createGoodsreceivednote,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: goodsreceivednoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goodsreceivednoteKeys.all });
      toast.success('Goodsreceivednote created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create goodsreceivednote', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create goodsreceivednote error:', error);
    },
  });
};

// Hook for updating a goodsreceivednote
export const useUpdateGoodsreceivednote = (id: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateGoodsreceivednote,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: goodsreceivednoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goodsreceivednoteKeys.all });
      queryClient.invalidateQueries({ queryKey: goodsreceivednoteKeys.detail(id as string) });
      toast.success('Goodsreceivednote updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update goodsreceivednote', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update goodsreceivednote error:', error);
    },
  });
};

// Hook for deleting a goodsreceivednote
export const useDeleteGoodsreceivednote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteGoodsreceivednote,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: goodsreceivednoteKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goodsreceivednoteKeys.all });
      toast.success('Goodsreceivednote deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete goodsreceivednote', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete goodsreceivednote error:', error);
    },
  });
};