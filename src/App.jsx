import { jsx, jsxs } from "react/jsx-runtime";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import SubmitGrievance from "./pages/citizen/SubmitGrievance.jsx";
import TrackGrievance from "./pages/TrackGrievance.jsx";
import CitizenDashboard from "./pages/citizen/CitizenDashboard.jsx";
import CitizenHelp from "./pages/citizen/CitizenHelp.jsx";
import CitizenWorkspace from "./pages/citizen/CitizenWorkspace.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminGrievances from "./pages/admin/AdminGrievances.jsx";
import AdminDepartments from "./pages/admin/AdminDepartments.jsx";
import AdminOfficers from "./pages/admin/AdminOfficers.jsx";
import AdminGrievanceDetail from "./pages/admin/AdminGrievanceDetail.jsx";
import OfficerDashboard from "./pages/officer/OfficerDashboard.jsx";
import OfficerQueue from "./pages/officer/OfficerQueue.jsx";
import OfficerUpdates from "./pages/officer/OfficerUpdates.jsx";
import GrievanceDetail from "./pages/shared/GrievanceDetail.jsx";
import NotFound from "./pages/NotFound.jsx";
const queryClient = new QueryClient();
const App = () => /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(TooltipProvider, { children: [
  /* @__PURE__ */ jsx(Toaster, {}),
  /* @__PURE__ */ jsx(Sonner, {}),
  /* @__PURE__ */ jsx(BrowserRouter, { children: /* @__PURE__ */ jsx(AuthProvider, { children: /* @__PURE__ */ jsxs(Routes, { children: [
    /* @__PURE__ */ jsx(Route, { path: "/", element: /* @__PURE__ */ jsx(Index, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/auth", element: /* @__PURE__ */ jsx(AuthPage, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/track", element: /* @__PURE__ */ jsx(TrackGrievance, {}) }),
    /* @__PURE__ */ jsx(Route, { path: "/submit", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "citizen", requiredPermission: "grievance.create", children: /* @__PURE__ */ jsx(SubmitGrievance, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/citizen", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "citizen", requiredPermission: "dashboard.view", children: /* @__PURE__ */ jsx(CitizenDashboard, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/citizen/track", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "citizen", requiredPermission: "grievance.view.own", children: /* @__PURE__ */ jsx(CitizenWorkspace, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/citizen/tickets", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "citizen", requiredPermission: "grievance.view.own", children: /* @__PURE__ */ jsx(CitizenWorkspace, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/citizen/help", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "citizen", requiredPermission: "citizen.help.view", children: /* @__PURE__ */ jsx(CitizenHelp, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/admin", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "admin", requiredPermission: "analytics.view", children: /* @__PURE__ */ jsx(AdminDashboard, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/admin/grievances", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "admin", requiredPermission: "grievance.view.all", children: /* @__PURE__ */ jsx(AdminGrievances, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/admin/departments", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "admin", requiredPermission: "users.manage.roles", children: /* @__PURE__ */ jsx(AdminDepartments, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/admin/officers", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "admin", requiredPermission: "users.manage.roles", children: /* @__PURE__ */ jsx(AdminOfficers, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/admin/grievances/:id", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "admin", requiredPermission: "analytics.view", children: /* @__PURE__ */ jsx(AdminGrievanceDetail, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/officer", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "officer", requiredPermission: "grievance.update.status", children: /* @__PURE__ */ jsx(OfficerDashboard, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/officer/queue", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "officer", requiredPermission: "officer.queue.view", children: /* @__PURE__ */ jsx(OfficerQueue, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/officer/updates", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRole: "officer", requiredPermission: "officer.updates.manage", children: /* @__PURE__ */ jsx(OfficerUpdates, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "/grievance/:id", element: /* @__PURE__ */ jsx(ProtectedRoute, { requiredRoles: ["citizen", "officer", "admin"], children: /* @__PURE__ */ jsx(GrievanceDetail, {}) }) }),
    /* @__PURE__ */ jsx(Route, { path: "*", element: /* @__PURE__ */ jsx(NotFound, {}) })
  ] }) }) })
] }) });
var stdin_default = App;
export {
  stdin_default as default
};
