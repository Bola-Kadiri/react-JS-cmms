// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, tokenManager } from '../services/apiClient';

interface User {
  id: string;
  email: string;
  // Add other user properties as needed
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens?: {
    access: string;
    refresh: string;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (accessToken: string, refreshToken: string, userData?: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Get cached auth state from React Query
  const cachedAuthState = queryClient.getQueryData<AuthState>(['auth']);

  // Initialize tokens from cache if available
  useEffect(() => {
    if (cachedAuthState?.tokens) {
      tokenManager.setTokens(
        cachedAuthState.tokens.access,
        cachedAuthState.tokens.refresh
      );
    }
  }, []);

  // Auth state query with persistence
  const { 
    data: authState, 
    isLoading,
    error: authError,
    refetch: refetchAuth
  } = useQuery({
    queryKey: ['auth'],
    queryFn: async (): Promise<AuthState> => {
      // If we already have cached state with tokens, use it first
      if (cachedAuthState?.isAuthenticated && cachedAuthState?.tokens) {
        // Verify the token is still valid
        try {
          // Extract user info from token verification
          await api.post('auth/token/verify/', {
            token: cachedAuthState.tokens.access
          });
          
          // Set the tokens in the token manager
          tokenManager.setTokens(
            cachedAuthState.tokens.access,
            cachedAuthState.tokens.refresh
          );
          
          return cachedAuthState;
        } catch (error) {
          // Token is invalid, try refresh
          try {
            const { data } = await api.post('auth/token/refresh/', {
              refresh: cachedAuthState.tokens.refresh
            });
            
            // Update tokens
            const newState = {
              ...cachedAuthState,
              tokens: {
                access: data.access,
                refresh: cachedAuthState.tokens.refresh
              }
            };
            
            // Set the updated tokens
            tokenManager.setTokens(
              data.access,
              cachedAuthState.tokens.refresh
            );
            
            return newState;
          } catch (refreshError) {
            // Refresh failed, user needs to log in again
            tokenManager.clearTokens();
            return { isAuthenticated: false, user: null };
          }
        }
      }

      // No cached state or cached state is invalid
      // Check if we have tokens from a previous session
      const accessToken = tokenManager.getAccessToken();
      const refreshToken = tokenManager.getRefreshToken();
      
      if (!accessToken || !refreshToken) {
        return { isAuthenticated: false, user: null };
      }
      
      try {
        // Verify the token
        const { data } = await api.post('auth/token/verify/', {
          token: accessToken
        });
        
        // Return authenticated state with user data
        return {
          isAuthenticated: true,
          user: data.user || { id: 'authenticated', email: 'authenticated' },
          tokens: {
            access: accessToken,
            refresh: refreshToken
          }
        };
      } catch (error) {
        // Token verification failed, try refresh
        try {
          const { data } = await api.post('auth/token/refresh/', {
            refresh: refreshToken
          });
          
          // Update token in manager
          tokenManager.setTokens(data.access, refreshToken);
          
          return {
            isAuthenticated: true,
            user: data.user || { id: 'authenticated', email: 'authenticated' },
            tokens: {
              access: data.access,
              refresh: refreshToken
            }
          };
        } catch (refreshError) {
          // Refresh failed, user needs to log in again
          tokenManager.clearTokens();
          return { isAuthenticated: false, user: null };
        }
      }
    },
    // Use initialData to prevent loading state if we have cached data
    // initialData: cachedAuthState,
    placeholderData: cachedAuthState,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: false,
  });

  // Add login and logout functions to context
  const login = (accessToken: string, refreshToken: string, userData?: User) => {
    // Update tokens in token manager
    tokenManager.setTokens(accessToken, refreshToken);
    
    // Create new auth state
    const newAuthState: AuthState = {
      isAuthenticated: true,
      user: userData || { id: 'authenticated', email: 'authenticated' },
      tokens: {
        access: accessToken,
        refresh: refreshToken
      }
    };
    
    // Update auth state in React Query cache
    queryClient.setQueryData(['auth'], newAuthState);
    
    // Refetch to ensure everything is in sync
    refetchAuth();
  };
  
  const logout = () => {
    // Clear tokens from token manager
    tokenManager.clearTokens();
    
    // Clear auth state in React Query cache
    queryClient.setQueryData(['auth'], { isAuthenticated: false, user: null });
    queryClient.invalidateQueries({queryKey: ['auth']});
    
    // Navigate to login
    navigate('/login');
  };

  // Handle authentication errors
  useEffect(() => {
    if (authError) {
      console.error('Auth error:', authError);
      const status = (authError as any)?.response?.status;
      if (status === 401 || status === 403) {
        // Only redirect if not already on auth pages
        const currentPath = window.location.pathname;
        if (!['/login', '/register', '/forgot-password'].includes(currentPath)) {
          navigate('/login');
        }
      }
    }
  }, [authError, navigate]);

  // Determine final auth state
  const isAuthenticated = authState?.isAuthenticated || false;

  // Log authentication state for debugging
  useEffect(() => {
    console.log('[AuthContext] Auth state:', {
      isAuthenticated,
      isLoading,
      user: authState?.user,
      hasTokens: tokenManager.hasTokens()
    });
  }, [isAuthenticated, isLoading, authState]);

  const contextValue = {
    isAuthenticated,
    isLoading,
    user: authState?.user || null,
    login,
    logout
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);