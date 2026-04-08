// src/components/PermissionRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../contexts/PermissionsContext';
import { Feature, Permission } from '../config/permissions';

interface PermissionRouteProps {
  feature: Feature;
  permission: Permission;
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({
  feature,
  permission,
  children,
  redirectTo = '/unauthorized',
  fallback,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(feature, permission)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};