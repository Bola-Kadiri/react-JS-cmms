import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionsContext';
import { Feature } from '@/config/permissions';

interface FeatureRouteProps {
  feature: Feature;
}

const FeatureRoute = ({ feature }: FeatureRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { canView } = usePermissions();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!canView(feature)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
};

export default FeatureRoute;
