import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  fetchBankaccounts,
  getBankaccount,
  createBankaccount,
  updateBankaccount,
  deleteBankaccount,
  BankaccountQueryParams
} from '@/services/bankaccountsApi';
import { Bankaccount } from '@/types/bankaccount';
import React from 'react';

// Key factory for consistent query keys
export const bankaccountKeys = {
  all: ['bankaccounts'] as const,
  lists: () => [...bankaccountKeys.all, 'list'] as const,
  list: (params: BankaccountQueryParams) => [...bankaccountKeys.lists(), params] as const,
  details: () => [...bankaccountKeys.all, 'detail'] as const,
  detail: (slug: string) => [...bankaccountKeys.details(), slug] as const,
};

// Hook for fetching bankaccounts list
export const useBankaccountsQuery = () => {
  return useQuery({
    queryKey: bankaccountKeys.all,
    queryFn: fetchBankaccounts,
    staleTime: 30000, // Consider data fresh for 30 seconds
    placeholderData: { count: 0, next: null, previous: null, results: [] }, // Provide fallback data
  });
};

// Hook for fetching a single bankaccount
export const useBankaccountQuery = (slug: string | undefined) => {
  return useQuery({
    queryKey: bankaccountKeys.detail(slug as string),
    queryFn: () => getBankaccount(slug as string),
    enabled: !!slug,
    staleTime: 30000,
  });
};

// Hook for creating a bankaccount
export const useCreateBankaccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createBankaccount,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: bankaccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bankaccountKeys.all });
      toast.success('Bankaccount created successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to create bankaccount', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"})
        // icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Create bankaccount error:', error);
    },
  });
};

// Hook for updating a bankaccount
export const useUpdateBankaccount = (slug: string | undefined) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateBankaccount,
    onSuccess: (data) => {
    //   queryClient.invalidateQueries({ queryKey: bankaccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bankaccountKeys.all });
      queryClient.invalidateQueries({ queryKey: bankaccountKeys.detail(slug as string) });
      toast.success('Bankaccount updated successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to update bankaccount', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Update bankaccount error:', error);
    },
  });
};

// Hook for deleting a bankaccount
export const useDeleteBankaccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteBankaccount,
    onSuccess: () => {
    //   queryClient.invalidateQueries({ queryKey: bankaccountKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bankaccountKeys.all });
      toast.success('Bankaccount deleted successfully', {
        duration: 3000,
        icon: React.createElement(Check, { className: "h-4 w-4 text-green-500" }),
      });
    },
    onError: (error) => {
      toast.error('Failed to delete bankaccount', {
        duration: 5000,
        icon: React.createElement(X, {className: "h-4 w-4 text-red-500"}),
      });
      console.error('Delete bankaccount error:', error);
    },
  });
};