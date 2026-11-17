import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_ROLES = new Set(['SUPER ADMIN', 'ADMIN']);

// Pages inside an admin section that other roles may also open (the backend
// enforces what each role can actually do there).
const ALSO_ALLOWED: { prefix: string; roles: string[] }[] = [
  // Procurement & Store add, edit and delete vendors.
  { prefix: '/dashboard/accounts/vendors', roles: ['PROCUREMENT AND STORE'] },
];

const AdminRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { pathname } = useLocation();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.trim().toUpperCase() ?? '';
  const alsoAllowed = ALSO_ALLOWED.some(
    (rule) => pathname.startsWith(rule.prefix) && rule.roles.includes(role),
  );
  if (!ADMIN_ROLES.has(role) && !alsoAllowed) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
