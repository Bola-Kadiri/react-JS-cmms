// src/services/clustersApi.ts
import { api } from './apiClient';
import { Cluster } from '@/types/cluster';

const CLUSTERS_API_BASE = '/facility/api/api/clusters';

export interface ClustersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Cluster[];
}

export interface ClusterQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  facility?: string;
}

// Fetch all clusters without filtering parameters
export const fetchClusters = async (): Promise<ClustersResponse> => {
  try {
    const response = await api.get(`${CLUSTERS_API_BASE}/`);
    
    // Check if the response has pagination data
    if (response.data && typeof response.data === 'object') {
      // If the API returns an array directly instead of a paginated response
      if (Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data
        };
      }
      
      // If the API returns paginated data
      if (Array.isArray(response.data.results)) {
        return {
          count: response.data.count || response.data.results.length,
          next: response.data.next || null,
          previous: response.data.previous || null,
          results: response.data.results
        };
      }
    }
    
    // Default fallback if the structure doesn't match expected format
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
    
  } catch (error) {
    console.error('Error fetching clusters:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single cluster by ID
export const getCluster = async (id: string): Promise<Cluster> => {
  const response = await api.get(`${CLUSTERS_API_BASE}/${id}/`);
  return response.data;
};

// Create a new cluster
export const createCluster = async (cluster: Omit<Cluster, 'id'>): Promise<Cluster> => {
  const response = await api.post(CLUSTERS_API_BASE + '/', cluster);
  return response.data;
};

// Update an existing cluster
export const updateCluster = async ({ id, cluster }: { id: string; cluster: Partial<Cluster> }): Promise<Cluster> => {
  const response = await api.put(`${CLUSTERS_API_BASE}/${id}/`, cluster);
  return response.data;
};

// Delete a cluster
export const deleteCluster = async (id: string): Promise<void> => {
  await api.delete(`${CLUSTERS_API_BASE}/${id}/`);
};