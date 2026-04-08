import { api } from './apiClient';
import { User } from '@/types/user';

const USERS_API_BASE = '/accounts/api/users';

export interface UsersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface UserQueryParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Fetch all users without filtering parameters
export const fetchUsers = async (): Promise<UsersResponse> => {
  try {
    const response = await api.get(`${USERS_API_BASE}/`);
    
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
    console.error('Error fetching users:', error);
    return {
      count: 0,
      next: null,
      previous: null,
      results: []
    };
  }
};

// Get a single user by SLUG
export const getUser = async (slug: string): Promise<User> => {
  const response = await api.get(`${USERS_API_BASE}/${slug}/`);
  return response.data;
};

// Create a new user
export const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  const response = await api.post(USERS_API_BASE + '/', user);
  return response.data;
};

// Update an existing user
export const updateUser = async ({ slug, user }: { slug: string; user: Partial<User> }): Promise<User> => {
  const response = await api.put(`${USERS_API_BASE}/${slug}/`, user);
  return response.data;
};

// Accept FormData instead of Partial<User>
// export const updateUser = async ({ slug, formData }: { slug: string; formData: FormData }): Promise<User> => {
//   const response = await api.put(`${USERS_API_BASE}/${slug}/`, formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// Delete a user
export const deleteUser = async (slug: string): Promise<void> => {
  await api.delete(`${USERS_API_BASE}/${slug}/`);
};