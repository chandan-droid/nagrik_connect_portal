import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/submit" element={<SubmitGrievance />} />
          <Route path="/track" element={<TrackGrievance />} />
          <Route path="/citizen" element={<CitizenDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/officer" element={<OfficerDashboard />} />
          <Route path="/grievance/:id" element={<GrievanceDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
