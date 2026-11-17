import { ReactNode } from 'react';
import { usePermissions } from '@/contexts/PermissionsContext';

/**
 * Renders its children only for a Super Admin (plus any roles listed in
 * `alsoRoles`). Used for add / edit / delete on reference data that drives
 * payments (categories, subcategories, vendors) — everyone else can view it.
 * The backend enforces the same rule.
 */
export const SuperAdminOnly = ({ children, alsoRoles = [] }: { children: ReactNode; alsoRoles?: string[] }) => {
  const { userRole } = usePermissions();
  return userRole === 'SUPER ADMIN' || alsoRoles.includes(userRole) ? <>{children}</> : null;
};

export default SuperAdminOnly;
