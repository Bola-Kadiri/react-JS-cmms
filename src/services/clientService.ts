// src/services/clientService.ts
import { api } from './apiClient';

// Types
export interface Contact {
  id?: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Client {
  id: number;
  slug: string;
  type: 'Individual' | 'Company';
  code: string;
  name: string;
  email: string;
  phone: string;
  group: string;
  address: string;
  status: 'Active' | 'Inactive';
  contacts: Contact[];
  contacts_data: string;
}

export type ClientFormData = Omit<Client, 'id' | 'slug' | 'contacts_data'>;

// Client API Service
const clientService = {
  // Get all clients
  getAllClients: async (): Promise<Client[]> => {
    try {
      const response = await api.get('/accounts/api/clients/');
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Get a specific client by slug
  getClientBySlug: async (slug: string): Promise<Client> => {
    try {
      const response = await api.get(`/accounts/api/clients/${slug}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching client with slug ${slug}:`, error);
      throw error;
    }
  },

  // Create a new client
  createClient: async (client: ClientFormData): Promise<Client> => {
    try {
      const response = await api.post('/accounts/api/clients/', client);
      return response.data;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Update an existing client
  updateClient: async (slug: string, client: Partial<ClientFormData>): Promise<Client> => {
    try {
      const response = await api.patch(`/accounts/api/clients/${slug}/`, client);
      return response.data;
    } catch (error) {
      console.error(`Error updating client with slug ${slug}:`, error);
      throw error;
    }
  },

  // Delete a client
  deleteClient: async (slug: string): Promise<void> => {
    try {
      await api.delete(`/accounts/api/clients/${slug}/`);
    } catch (error) {
      console.error(`Error deleting client with slug ${slug}:`, error);
      throw error;
    }
  }
};

export default clientService;