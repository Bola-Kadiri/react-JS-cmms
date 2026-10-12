import { ReactNode } from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';

/**
 * Renders its children only for a Super Admin. Used for add / edit / delete on
 * reference data that drives payments (categories, subcategories, vendors) —
 * everyone else can view it. The backend enforces the same rule.
 */
export const SuperAdminOnly = ({ children }: { children: ReactNode }) => {
  const { userRole } = usePermissions();
  return userRole === 'SUPER ADMIN' ? <>{children}</> : null;
};

export default SuperAdminOnly;
