import { Fragment, jsx } from "react/jsx-runtime";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultRouteForRoles, hasPermission } from "@/lib/rbac";
function ProtectedRoute({ children, requiredRole, requiredRoles, requiredPermission }) {
  const { user, loading, hasRole, roles } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsx("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }) });
  }
  if (!user) return /* @__PURE__ */ jsx(Navigate, { to: "/auth", replace: true });
  if (requiredRole && !hasRole(requiredRole)) {
    return /* @__PURE__ */ jsx(Navigate, { to: getDefaultRouteForRoles(roles), replace: true });
  }
  if (requiredRoles && !requiredRoles.some((role) => hasRole(role))) {
    return /* @__PURE__ */ jsx(Navigate, { to: getDefaultRouteForRoles(roles), replace: true });
  }
  if (requiredPermission && !hasPermission(roles, requiredPermission)) {
    return /* @__PURE__ */ jsx(Navigate, { to: getDefaultRouteForRoles(roles), replace: true });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}
export {
  ProtectedRoute as default
};
