import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { api } from '@/services/apiClient';
import { useState } from 'react';
import { toast } from 'sonner';

// Generic type for entity with a flexible identifier
export type Entity = {
  [key: string]: any;
};

// Type for specifying different identifier options
export type IdentifierOptions = {
  field: string;  // The name of the identifier field (id, slug, uuid, etc.)
  param?: string; // Optional API parameter name if different from field
};

/**
 * Hook for fetching a list of items with pagination
 */
export function useList<T extends Entity>(
  resource: string,
  endpoint: string,
  {
    page = 1,
    pageSize = 10,
    queryOptions,
    identifierField = 'id',
  }: {
    page?: number;
    pageSize?: number;
    queryOptions?: Omit<UseQueryOptions<{
      data: T[];
      total: number;
    }>, 'queryKey' | 'queryFn'>;
    identifierField?: string;
  } = {}
) {
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(1);

  const query = useQuery<{ data: T[]; total: number }>({
    queryKey: [resource, 'list', currentPage, pageSize, identifierField],
    queryFn: async () => {
      try {
        const response = await api.get(`/${endpoint}`, {
          params: { page: currentPage, limit: pageSize }
        });
        
        // Handle different API response formats
        const items = response.data.results || response.data;
        const total = response.data.total || response.data.count || items.length;
        
        setTotalPages(Math.ceil(total / pageSize) || 1);
        
        return {
          data: items,
          total
        };
      } catch (error: any) {
        // Here we're actually doing something in the catch block - showing a toast
        // before rethrowing, so this try/catch is necessary
        toast.error(`Failed to load ${resource}: ${error.message || 'Unknown error'}`);
        throw error;
      }
    },
    ...queryOptions
  });

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    data: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    currentPage,
    totalPages,
    handlePageChange,
    refetch: query.refetch
  };
}

/**
 * Hook for fetching a single item by identifier
 */
export function useItem<T extends Entity>(
  resource: string,
  endpoint: string,
  identifier: string | undefined,
  identifierField: string = 'id',
  queryOptions?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: [resource, identifierField, identifier],
    queryFn: async () => {
      if (!identifier) throw new Error(`${identifierField} is required`);
      try {
        // const response = await api.get(`/${endpoint}/${identifier}`);
        // return response.data;
                // Ensure endpoint has correct formatting for URLs
        const url = endpoint.endsWith('/') 
        ? `/${endpoint}${identifier}` 
        : `/${endpoint}/${identifier}`;
        
        const response = await api.get(url);
        return response.data;
      } catch (error: any) {
        // Here we're doing something useful in the catch block - showing a toast
        toast.error(`Failed to load ${resource}: ${error.message || 'Unknown error'}`);
        throw error;
      }
    },
    enabled: !!identifier,
    ...queryOptions
  });
}

/**
 * Hook for creating a new item
 */
export function useCreate<T extends Entity>(
  resource: string,
  endpoint: string,
  identifierField: string = 'id'
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<T, typeof identifierField>) => {
      const response = await api.post(`/${endpoint}`, data);
      return response.data;
    },
    onSuccess: (newItem) => {
      // Show success toast
      toast.success(`${resource} created successfully`);
      
      // Use exact match for query key structure to match useList
      queryClient.invalidateQueries({ 
        queryKey: [resource, 'list'] 
      });
      
      // If we have the new item with its identifier, invalidate that specific item
      if (newItem && identifierField in newItem) {
        const identifier = newItem[identifierField];
        queryClient.invalidateQueries({ 
          queryKey: [resource, identifierField, identifier] 
        });
      }
    },
    onError: (error: any) => {
      // Show error toast with specific message if available
      const errorMessage = error.response?.data?.message || error.message || `Failed to create ${resource}`;
      toast.error(errorMessage);
    }
  });
}

/**
 * Hook for updating an existing item
 */
export function useUpdate<T extends Entity, K extends string = 'id'>(
  resource: string,
  endpoint: string,
  idField: K = 'id' as K
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ identifier, data }: { identifier: string; data: Partial<T> }) => {
      // const response = await api.put(`/${endpoint}${identifier}/`, data);
      // return response.data;

      // Ensure endpoint has correct formatting for URLs
      const url = endpoint.endsWith('/') 
        ? `/${endpoint}${identifier}/` 
        : `/${endpoint}/${identifier}/`;
      
      const response = await api.put(url, data);
      return response.data;
    },
    onSuccess: (updatedItem, variables) => {
      // Show success toast
      toast.success(`${resource} updated successfully`);
      
      // Use exact match for query key structure to match useList
      queryClient.invalidateQueries({ 
        queryKey: [resource, 'list'] 
      });
      
      // Invalidate the specific item query
      queryClient.invalidateQueries({ 
        queryKey: [resource, idField, variables.identifier] 
      });
      
      // If the response includes the item with a different identifier value,
      // invalidate that query too (in case the identifier was changed)
      if (updatedItem && idField in updatedItem && 
          updatedItem[idField] !== variables.identifier) {
        queryClient.invalidateQueries({ 
          queryKey: [resource, idField, updatedItem[idField]] 
        });
      }
    },
    onError: (error: any) => {
      // Show error toast with specific message if available
      const errorMessage = error.response?.data?.message || error.message || `Failed to update ${resource}`;
      toast.error(errorMessage);
    }
  });
}

/**
 * Hook for deleting an item
 */
export function useDelete<K extends string = 'id'>(
  resource: string,
  endpoint: string,
  identifierField: K = 'id' as K
) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (identifier: string) => {
      // await api.delete(`/${endpoint}${identifier}/`);
      // return identifier;

      // Ensure endpoint has correct formatting for URLs
      const url = endpoint.endsWith('/') 
        ? `/${endpoint}${identifier}/` 
        : `/${endpoint}/${identifier}/`;
      
      await api.delete(url);
      return identifier;
    },
    onSuccess: (identifier) => {
      // Show success toast
      toast.success(`${resource} deleted successfully`);
      
      // Use exact match for query key structure to match useList
      queryClient.invalidateQueries({ 
        queryKey: [resource, 'list'] 
      });
      
      // Invalidate the specific item query
      queryClient.invalidateQueries({ 
        queryKey: [resource, identifierField, identifier] 
      });
    },
    onError: (error: any) => {
      // Show error toast with specific message if available
      const errorMessage = error.response?.data?.message || error.message || `Failed to delete ${resource}`;
      toast.error(errorMessage);
    }
  });
}