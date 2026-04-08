// src/contexts/PermissionsContext.tsx
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { PermissionManager, permissionManager } from '../utils/permissions';
import { Feature, Permission, Role } from '../config/permissions';

interface PermissionsContextType {
  permissionManager: PermissionManager;
  hasPermission: (feature: Feature, permission: Permission) => boolean;
  canView: (feature: Feature) => boolean;
  canEdit: (feature: Feature) => boolean;
  userRole: Role | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isReadOnly: boolean;
}

const PermissionsContext = createContext<PermissionsContextType>({
  permissionManager,
  hasPermission: () => false,
  canView: () => false,
  canEdit: () => false,
  userRole: null,
  isSuperAdmin: false,
  isAdmin: false,
  isReadOnly: false,
});

interface PermissionsProviderProps {
  children: ReactNode;
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('PermissionsProvider rendered with user:', JSON.stringify(user, null, 2), 'isAuthenticated:', isAuthenticated);

  // Update permission manager when user changes
  useEffect(() => {
    if (isAuthenticated && user?.role) {
      permissionManager.setUserRole(user.role as Role);
    } else {
      permissionManager.setUserRole(null);
    }
  }, [user, isAuthenticated]);

  const contextValue: PermissionsContextType = {
    permissionManager,
    hasPermission: (feature: Feature, permission: Permission) => 
      permissionManager.hasPermission(feature, permission),
    canView: (feature: Feature) => permissionManager.canView(feature),
    canEdit: (feature: Feature) => permissionManager.canEdit(feature),
    userRole: user?.role as Role || null,
    isSuperAdmin: permissionManager.isSuperAdmin(),
    isAdmin: permissionManager.isAdmin(),
    isReadOnly: permissionManager.isReadOnly(),
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionsContext);
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider');
  }
  return context;
};