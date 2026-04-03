import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index.tsx";
import AuthPage from "./pages/AuthPage.tsx";
import SubmitGrievance from "./pages/SubmitGrievance.tsx";
import TrackGrievance from "./pages/TrackGrievance.tsx";
import CitizenDashboard from "./pages/CitizenDashboard.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import OfficerDashboard from "./pages/OfficerDashboard.tsx";
import GrievanceDetail from "./pages/GrievanceDetail.tsx";
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
            <Route path="/submit" element={<ProtectedRoute><SubmitGrievance /></ProtectedRoute>} />
            <Route path="/citizen" element={<ProtectedRoute><CitizenDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/officer" element={<ProtectedRoute requiredRole="officer"><OfficerDashboard /></ProtectedRoute>} />
            <Route path="/grievance/:id" element={<ProtectedRoute><GrievanceDetail /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
