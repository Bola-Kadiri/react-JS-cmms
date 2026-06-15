import axios from 'axios';
import { isTokenExpired } from '../utils/tokenUtils';

const baseURL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with base URL
export const api = axios.create({
    baseURL,
});

// Simplified AuthTokenManager - now only cares about the current session
class AuthTokenManager {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    constructor() {
        this.loadTokensFromStorage();
    }

    private loadTokensFromStorage() {
        this.accessToken = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
        if (this.accessToken) {
            this.updateAuthHeader(this.accessToken);
        }
    }

    setTokens(accessToken: string, refreshToken: string) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        this.updateAuthHeader(accessToken);
    }

    getAccessToken() {
        return this.accessToken;
    }

    getRefreshToken() {
        return this.refreshToken;
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        this.updateAuthHeader(null);
    }

    hasTokens() {
        return !!this.accessToken && !!this.refreshToken && !this.isTokenExpired();
    }

    // Check if current token is expired
    isTokenExpired() {
        if (!this.accessToken) return true;
        return isTokenExpired(this.accessToken);
    }

    updateAuthHeader(token: string | null) {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete api.defaults.headers.common['Authorization'];
        }
    }
}

// Create a singleton instance
export const tokenManager = new AuthTokenManager();

// Global abort controller — aborted and reset on logout to cancel all in-flight requests
let globalAbortController = new AbortController();

export const cancelAllRequests = () => {
    globalAbortController.abort();
    globalAbortController = new AbortController();
};

// Attach the global abort signal to every outgoing request
api.interceptors.request.use((config) => {
    config.signal = globalAbortController.signal;
    return config;
});

// Add an interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is 401 and we haven't tried to refresh token yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Get refresh token from memory
          const refreshToken = tokenManager.getRefreshToken();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          // Call the refresh token endpoint
          const { data } = await api.post('auth/token/refresh/', {
            refresh: refreshToken
          });
          
          // Get new access token
          const { access } = data;
          
          // Update tokens
          tokenManager.setTokens(access, refreshToken);
          
          // Retry the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh token is invalid, log user out
          tokenManager.clearTokens();
          return Promise.reject(refreshError);
        }
      }
      
      return Promise.reject(error);
    }
);