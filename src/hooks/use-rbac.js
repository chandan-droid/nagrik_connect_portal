import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultRouteForRoles, hasPermission } from "@/lib/rbac";
function useRbac() {
  const { roles, hasRole } = useAuth();
  const primaryRole = useMemo(() => {
    if (roles.includes("admin")) return "admin";
    if (roles.includes("officer")) return "officer";
    if (roles.includes("citizen")) return "citizen";
    return null;
  }, [roles]);
  const defaultRoute = useMemo(() => getDefaultRouteForRoles(roles), [roles]);
  const can = (permission) => hasPermission(roles, permission);
  return {
    roles,
    primaryRole,
    defaultRoute,
    hasRole,
    can
  };
}
export {
  useRbac
};
