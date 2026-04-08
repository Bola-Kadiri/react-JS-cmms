import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api, tokenManager } from '../services/apiClient';
import { extractUserFromToken, isTokenExpired, User } from '../utils/tokenUtils';

interface AuthState {
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
  login: (accessToken: string, refreshToken: string) => void;
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

  // Local state for authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from tokens at mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Initializing auth state...');
      const accessToken = tokenManager.getAccessToken();
      const refreshToken = tokenManager.getRefreshToken();

      console.log('[AuthContext] Tokens on init:', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });

      if (accessToken && refreshToken) {
        if (!isTokenExpired(accessToken)) {
          console.log('[AuthContext] Access token valid on init.');
          setUser(extractUserFromToken(accessToken));
          setIsAuthenticated(true);
        } else {
          console.log('[AuthContext] Access token expired on init, attempting refresh...');
          // Try to refresh token if access token is expired on mount
          try {
            const { data } = await api.post('auth/token/refresh/', {
              refresh: refreshToken
            });
            const newAccessToken = data.access;
            tokenManager.setTokens(newAccessToken, refreshToken);
            setUser(extractUserFromToken(newAccessToken));
            setIsAuthenticated(true);
            console.log('[AuthContext] Token refreshed successfully on init.');
          } catch (error) {
            console.error('[AuthContext] Failed to refresh token on init:', error);
            tokenManager.clearTokens();
            setIsAuthenticated(false);
            setUser(null);
          }
        }
      } else {
        console.log('[AuthContext] No tokens found on init.');
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
      console.log('[AuthContext] Initial auth state set:', { isAuthenticated, isLoading: false, user: user?.email });
    };
    initializeAuth();
  }, []);

  // Login function - updates local state and token manager
  const login = useCallback((accessToken: string, refreshToken: string) => {
    console.log('[AuthContext] Login function called.');
    tokenManager.setTokens(accessToken, refreshToken);
    const newUser = extractUserFromToken(accessToken);
    setUser(newUser);
    setIsAuthenticated(true);
    console.log('[AuthContext] Local state updated after login:', { isAuthenticated: true, user: newUser?.email });
    // Invalidate and refetch auth query to ensure background sync
    // queryClient.invalidateQueries({queryKey: ['auth']}); // Removed immediate invalidation
  }, [queryClient]);

  // Logout function - clears local state and token manager
  const logout = useCallback(() => {
    console.log('[AuthContext] Logout function called.');
    tokenManager.clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    queryClient.invalidateQueries({queryKey: ['auth']});
    navigate('/login');
    console.log('[AuthContext] Local state updated after logout.');
  }, [queryClient, navigate]);

  // This useQuery will now primarily serve to validate tokens periodically in the background
  // and keep the cache fresh. The main isAuthenticated and user states are local.
  useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      console.log('[AuthContext] useQuery queryFn running...');
      const accessToken = tokenManager.getAccessToken();
      const refreshToken = tokenManager.getRefreshToken();

      console.log('[AuthContext] useQuery tokens:', { hasAccess: !!accessToken, hasRefresh: !!refreshToken });

      if (!accessToken || !refreshToken) {
        console.log('[AuthContext] useQuery: No tokens, forcing logout.');
        // If tokens are missing, ensure local state is logged out and throw error to prevent retry
        if (isAuthenticated) {
          logout(); // Use the memoized logout
        }
        throw new Error("No authentication tokens available.");
      }

      if (isTokenExpired(accessToken)) {
        console.log('[AuthContext] useQuery: Access token expired, attempting refresh.');
        try {
          const { data } = await api.post('auth/token/refresh/', {
            refresh: refreshToken
          });
          const newAccessToken = data.access;
          tokenManager.setTokens(newAccessToken, refreshToken);
          const refreshedUser = extractUserFromToken(newAccessToken);
          setUser(refreshedUser); // Update local user state on successful refresh
          setIsAuthenticated(true); // Ensure local auth state is true
          console.log('[AuthContext] useQuery: Token refreshed, state updated.');
          return { user: refreshedUser, tokens: { access: newAccessToken, refresh: refreshToken } };
        } catch (error) {
          console.error('[AuthContext] useQuery: Token refresh failed:', error);
          logout(); // Use the memoized logout on refresh failure
          throw error;
        }
      } else {
        console.log('[AuthContext] useQuery: Access token valid.');
        const currentUser = extractUserFromToken(accessToken);
        setUser(currentUser); // Update local user state if token is valid
        setIsAuthenticated(true); // Ensure local auth state is true
        return { user: currentUser, tokens: { access: accessToken, refresh: refreshToken } };
      }
    },
    // Do not enable this query immediately if we are already authenticated via local state
    // or if tokens are missing. It will be enabled once `initializeAuth` completes and sets `isLoading` to false
    enabled: !isLoading && tokenManager.hasTokens(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 1, // Retry once
    // Removed onError as it's handled within queryFn and not a direct option here
  });

  // Log authentication state for debugging
  useEffect(() => {
    console.log('[AuthContext] Render state:', {
      isAuthenticated,
      isLoading,
      user: user?.email,
      hasTokens: tokenManager.hasTokens()
    });

    // Handle post-login redirection if authenticated and not loading
    if (isAuthenticated && !isLoading) {
      // Check if we're on the login page or landing page, and redirect to dashboard
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '/login') {
        console.log('[AuthContext] Redirecting authenticated user from', currentPath, 'to /dashboard');
        navigate('/dashboard', { replace: true });
      } else if (currentPath === '/unauthorized') {
        // If user was redirected to unauthorized, send them to dashboard now that they are authenticated
        console.log('[AuthContext] Redirecting authenticated user from /unauthorized to /dashboard');
        navigate('/dashboard', { replace: true });
      }
      // No explicit redirect for other paths; assume ProtectedRoute handles it correctly.
    }

  }, [isAuthenticated, isLoading, user, navigate]);

  const contextValue = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);