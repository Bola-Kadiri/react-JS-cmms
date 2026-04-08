import { api } from './apiClient';
import { Personnel } from '@/types/personnel';

const PERSONNELS_API_BASE = '/accounts/api/personnels';

export interface PersonnelsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Personnel[];
}

export interface PersonnelQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  facility?: string;
}

// Fetch all personnels without filtering parameters
export const fetchPersonnels = async (): Promise<PersonnelsResponse> => {
  try {
    const response = await api.get(`${PERSONNELS_API_BASE}/`);
    
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
    console.error('Error fetching personnels:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single personnel by ID
export const getPersonnel = async (slug: string): Promise<Personnel> => {
  const response = await api.get(`${PERSONNELS_API_BASE}/${slug}/`);
  return response.data;
};

// Create a new personnel
// export const createPersonnel = async (personnel: Omit<Personnel, 'id'>): Promise<Personnel> => {
//   const response = await api.post(PERSONNELS_API_BASE + '/', personnel);
//   return response.data;
// };

export const createPersonnel = async (personnel: FormData): Promise<Personnel> => {
    const response = await api.post(PERSONNELS_API_BASE + '/', personnel, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    return response.data;
  };

// Update an existing personnel
// export const updatePersonnel = async ({ slug, personnel }: { slug: string; personnel: Partial<Personnel> }): Promise<Personnel> => {
//   const response = await api.put(`${PERSONNELS_API_BASE}/${slug}/`, personnel);
//   return response.data;
// };

// Accept FormData instead of Partial<Workorder>
export const updatePersonnel = async ({ slug, personnel }: { slug: string; personnel: FormData }): Promise<Personnel> => {
  const response = await api.put(`${PERSONNELS_API_BASE}/${slug}/`, personnel, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete a personnel
export const deletePersonnel = async (slug: string): Promise<void> => {
  await api.delete(`${PERSONNELS_API_BASE}/${slug}/`);
};