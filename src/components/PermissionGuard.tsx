// src/components/PermissionGuard.tsx
import React, { ReactNode } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { Feature, Permission } from '../config/permissions';

interface PermissionGuardProps {
  feature: Feature;
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
  showFallback?: boolean;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  feature,
  permission,
  children,
  fallback = null,
  showFallback = false,
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(feature, permission)) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};