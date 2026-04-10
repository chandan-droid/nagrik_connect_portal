import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultRouteForRoles, hasPermission, type FeaturePermission } from '@/lib/rbac';
import type { AppRole } from '@/lib/local-auth';

export function useRbac() {
  const { roles, hasRole } = useAuth();

  const primaryRole = useMemo<AppRole | null>(() => {
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('officer')) return 'officer';
    if (roles.includes('citizen')) return 'citizen';
    return null;
  }, [roles]);

  const defaultRoute = useMemo(() => getDefaultRouteForRoles(roles), [roles]);

  const can = (permission: FeaturePermission) => hasPermission(roles, permission);

  return {
    roles,
    primaryRole,
    defaultRoute,
    hasRole,
    can,
  };
}
