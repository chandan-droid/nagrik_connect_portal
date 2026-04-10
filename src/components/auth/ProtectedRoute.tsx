import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { AppRole } from '@/lib/local-auth';
import { getDefaultRouteForRoles, hasPermission, type FeaturePermission } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: AppRole;
  requiredRoles?: AppRole[];
  requiredPermission?: FeaturePermission;
}

export default function ProtectedRoute({ children, requiredRole, requiredRoles, requiredPermission }: ProtectedRouteProps) {
  const { user, loading, hasRole, roles } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to={getDefaultRouteForRoles(roles)} replace />;
  }

  if (requiredRoles && !requiredRoles.some((role) => hasRole(role))) {
    return <Navigate to={getDefaultRouteForRoles(roles)} replace />;
  }

  if (requiredPermission && !hasPermission(roles, requiredPermission)) {
    return <Navigate to={getDefaultRouteForRoles(roles)} replace />;
  }

  return <>{children}</>;
}
