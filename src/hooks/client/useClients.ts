// src/features/clients/useClients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import clientService, { Client, ClientFormData, Contact } from '../../services/clientService';

// Custom hooks for client data management
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: clientService.getAllClients,
  });
};

export const useClient = (slug: string, options = {}) => {
  return useQuery({
    queryKey: ['client', slug],
    queryFn: () => clientService.getClientBySlug(slug),
    enabled: !!slug,
    ...options,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ slug, client }: { slug: string; client: Partial<ClientFormData> }) => 
      clientService.updateClient(slug, client),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', data.slug] });
    },
  });
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

// Re-export types
export type { Client, ClientFormData, Contact };