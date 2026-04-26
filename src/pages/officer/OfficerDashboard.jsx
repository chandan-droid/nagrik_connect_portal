import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ListTodo,
  TrendingUp,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import GrievanceCard from "@/components/grievance/GrievanceCard";
import AdminIssuesMapPanel from "@/features/admin/AdminIssuesMapPanel";
import { getAssignedOfficerGrievances } from "@/lib/api/officer";
import { useAuth } from "@/contexts/AuthContext";

export default function OfficerDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [grievances, setGrievances] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    let mounted = true;
    async function loadAssigned() {
      setIsLoading(true);
      try {
        const response = await getAssignedOfficerGrievances();
        if (mounted) {
          setGrievances(response || []);
        }
      } catch {
        if (mounted) setGrievances([]);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }
    loadAssigned();
    return () => {
      mounted = false;
    };
  }, []);

  const { total, active, resolved, critical } = useMemo(() => {
    const activeItems = grievances.filter(g => !["resolved", "closed"].includes(g.status));
    const resolvedItems = grievances.filter(g => ["resolved", "closed"].includes(g.status));
    const criticalItems = grievances.filter(g => g.priority === "critical");
    
    return {
      total: grievances.length,
      active: activeItems,
      resolved: resolvedItems.length,
      critical: criticalItems.length
    };
  }, [grievances]);

  // Sort active grievances by priority and date
  const priorityRank = { critical: 4, high: 3, medium: 2, low: 1 };
  const topActive = [...active].sort((a, b) => {
    if (priorityRank[a.priority] !== priorityRank[b.priority]) {
      return (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  }).slice(0, 4);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Officer Workspace</h1>
            <p className="text-xs text-muted-foreground">Welcome back, {profile?.full_name || "Officer"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild size="sm" className="gradient-primary text-white text-xs gap-1.5 h-8">
              <Link to="/officer/queue">
                <ListTodo className="w-3.5 h-3.5" />
                Open Work Queue
              </Link>
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Welcome & Context Alert */}
          {critical > 0 && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-500">Action Required: {critical} Critical Grievances</p>
                <p className="text-xs text-red-500/70 mt-0.5">Please check your queue immediately to address critical assignments.</p>
              </div>
              <Button asChild size="sm" variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 shrink-0 text-xs">
                <Link to="/officer/queue">Review Now</Link>
              </Button>
            </div>
          )}

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="stat-card">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">{total}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total Assigned</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">{active.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active / Pending</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3 text-secondary">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-heading font-bold text-2xl text-foreground">{resolved}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Resolved Cases</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card border-destructive/20 bg-destructive/5">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-3 text-destructive">
                <Target className="w-5 h-5" />
              </div>
              <p className="font-heading font-bold text-2xl text-destructive">{critical}</p>
              <p className="text-xs text-destructive mt-0.5">High Priority</p>
            </motion.div>
          </div>



          {/* Interactive Map */}
          <div className="pt-2">
            <h3 className="font-heading font-semibold text-foreground mb-4">Assigned Location Intelligence</h3>
            <AdminIssuesMapPanel issues={active} fullViewPath="/officer/queue" />
          </div>
        </div>
      </main>
    </div>
  );
}
