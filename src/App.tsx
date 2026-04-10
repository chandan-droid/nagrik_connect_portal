import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import SubmitGrievance from "./pages/citizen/SubmitGrievance.tsx";
import TrackGrievance from "./pages/TrackGrievance.tsx";
import CitizenDashboard from "./pages/citizen/CitizenDashboard.tsx";
import CitizenTickets from "./pages/citizen/CitizenTickets.tsx";
import CitizenHelp from "./pages/citizen/CitizenHelp.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.tsx";
import AdminAccess from "./pages/admin/AdminAccess.tsx";
import OfficerDashboard from "./pages/officer/OfficerDashboard.tsx";
import OfficerQueue from "./pages/officer/OfficerQueue.tsx";
import OfficerUpdates from "./pages/officer/OfficerUpdates.tsx";
import GrievanceDetail from "./pages/shared/GrievanceDetail.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/track" element={<TrackGrievance />} />
            <Route path="/submit" element={<ProtectedRoute requiredRole="citizen" requiredPermission="grievance.create"><SubmitGrievance /></ProtectedRoute>} />
            <Route path="/citizen" element={<ProtectedRoute requiredRole="citizen" requiredPermission="dashboard.view"><CitizenDashboard /></ProtectedRoute>} />
            <Route path="/citizen/tickets" element={<ProtectedRoute requiredRole="citizen" requiredPermission="grievance.view.own"><CitizenTickets /></ProtectedRoute>} />
            <Route path="/citizen/help" element={<ProtectedRoute requiredRole="citizen" requiredPermission="citizen.help.view"><CitizenHelp /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin" requiredPermission="analytics.view"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin" requiredPermission="analytics.view"><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/access" element={<ProtectedRoute requiredRole="admin" requiredPermission="users.manage.roles"><AdminAccess /></ProtectedRoute>} />
            <Route path="/officer" element={<ProtectedRoute requiredRole="officer" requiredPermission="grievance.update.status"><OfficerDashboard /></ProtectedRoute>} />
            <Route path="/officer/queue" element={<ProtectedRoute requiredRole="officer" requiredPermission="officer.queue.view"><OfficerQueue /></ProtectedRoute>} />
            <Route path="/officer/updates" element={<ProtectedRoute requiredRole="officer" requiredPermission="officer.updates.manage"><OfficerUpdates /></ProtectedRoute>} />
            <Route path="/grievance/:id" element={<ProtectedRoute requiredRoles={["citizen", "officer", "admin"]}><GrievanceDetail /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
