// src/components/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { tokenManager } from '../services/apiClient';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth(); // Destructure isLoading and user from useAuth
  const location = useLocation();

  console.log('[ProtectedRoute] Render:', {
    isAuthenticated,
    isLoading,
    user: user?.email,
    pathname: location.pathname
  });

  // Show loading state while AuthContext is still determining authentication status
  if (isLoading) {
    console.log('[ProtectedRoute] Loading: AuthContext is still loading.');
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to /login.');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated and trying to access the root path, redirect to dashboard
  if (location.pathname === '/') {
    console.log('[ProtectedRoute] Authenticated on /, redirecting to /dashboard.');
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected content
  console.log('[ProtectedRoute] Authenticated, rendering Outlet.');
  return <Outlet />;
};

export default ProtectedRoute;