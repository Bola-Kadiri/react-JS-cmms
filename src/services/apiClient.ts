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

// Shared refresh promise — prevents multiple simultaneous refresh calls when
// several requests fail with 401 at the same time (e.g. on page load).
let refreshingPromise: Promise<string> | null = null;

// Add an interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // Skip refresh attempt for auth endpoints (login, token refresh) — no token exists yet
      const isAuthEndpoint = originalRequest.url?.includes('auth/token');
      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        originalRequest._retry = true;

        try {
          const refreshToken = tokenManager.getRefreshToken();

          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // If a refresh is already in-flight, wait for it instead of firing another
          if (!refreshingPromise) {
            refreshingPromise = api
              .post('auth/token/refresh/', { refresh: refreshToken })
              .then(({ data }) => {
                tokenManager.setTokens(data.access, refreshToken);
                return data.access;
              })
              .finally(() => {
                refreshingPromise = null;
              });
          }

          const newAccessToken = await refreshingPromise;

          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token is expired or invalid — clear session and send to login
          refreshingPromise = null;
          tokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
);