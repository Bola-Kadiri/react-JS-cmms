import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ADMIN_ROLES = new Set(['SUPER ADMIN', 'ADMIN']);

const AdminRoute = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = user?.role?.trim().toUpperCase() ?? '';
  if (!ADMIN_ROLES.has(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
