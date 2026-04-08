// src/utils/permissions.ts
import { ROLE_FEATURES, Role, Feature, Permission } from '../config/permissions';

export class PermissionManager {
  private userRole: Role | null = null;

  setUserRole(role: Role | null) {
    this.userRole = role;
  }

  getUserRole(): Role | null {
    return this.userRole;
  }

  hasPermission(feature: Feature, permission: Permission): boolean {
    if (!this.userRole) return false;
    
    const rolePermissions = ROLE_FEATURES[this.userRole];
    const featurePermissions = rolePermissions?.[feature];
    
    return featurePermissions?.includes(permission) || false;
  }

  canView(feature: Feature): boolean {
    return this.hasPermission(feature, 'view');
  }

  canEdit(feature: Feature): boolean {
    return this.hasPermission(feature, 'edit');
  }

  getFeaturePermissions(feature: Feature): Permission[] {
    if (!this.userRole) return [];
    
    const rolePermissions = ROLE_FEATURES[this.userRole];
    return rolePermissions?.[feature] || [];
  }

  getAllUserPermissions(): { [key in Feature]?: Permission[] } {
    if (!this.userRole) return {};
    
    return ROLE_FEATURES[this.userRole];
  }

  isSuperAdmin(): boolean {
    return this.userRole === 'SUPER ADMIN';
  }

  isAdmin(): boolean {
    return this.userRole === 'SUPER ADMIN' || this.userRole === 'ADMIN';
  }

  isReadOnly(): boolean {
    return this.userRole === 'Facility View' || 
           this.userRole === 'Facility Auditor' || 
           this.userRole === 'Facility Account';
  }
}

// Create a singleton instance
export const permissionManager = new PermissionManager();

// Utility functions for easy use
export const hasPermission = (feature: Feature, permission: Permission): boolean => {
  return permissionManager.hasPermission(feature, permission);
};

export const canView = (feature: Feature): boolean => {
  return permissionManager.canView(feature);
};

export const canEdit = (feature: Feature): boolean => {
  return permissionManager.canEdit(feature);
};