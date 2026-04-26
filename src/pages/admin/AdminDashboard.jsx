import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Download,
  Activity,
  ArrowUpRight,
  Filter,
  RefreshCw,
  Bell,
  Building2,
  Users,
  MapPin,
  BadgeCheck,
  ChevronRight,
  Target,
  TrendingDown
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import GrievanceCard from "@/components/grievance/GrievanceCard";
import AdminIssuesMapPanel from "@/features/admin/AdminIssuesMapPanel";
import { cn } from "@/lib/utils";
import { 
  getAllAdminGrievances,
  getDashboardMonthlyTrends,
  getDashboardStatusDistribution,
  getDashboardDepartmentPerformance
} from "@/lib/api/admin";

const STATUS_COLORS = {
  "submitted": "hsl(200, 80%, 50%)",
  "under_review": "hsl(38, 90%, 55%)",
  "in_progress": "hsl(218, 72%, 38%)",
  "resolved": "hsl(162, 63%, 41%)",
  "closed": "hsl(218, 20%, 70%)",
  "reopened": "hsl(340, 70%, 50%)"
};

const officerWorkload = [
  { name: "Rajesh Kumar", dept: "Water", assigned: 12, resolved: 9, rating: 4.8 },
  { name: "Anita Singh", dept: "Roads", assigned: 8, resolved: 6, rating: 4.5 },
  { name: "Sunil Sharma", dept: "Power", assigned: 15, resolved: 11, rating: 4.2 },
  { name: "Deepa Nair", dept: "Health", assigned: 6, resolved: 5, rating: 4.9 }
];

const recentActivity = [
  { time: "2 min ago", event: "New critical grievance filed", dept: "Water Supply", type: "new" },
  { time: "15 min ago", event: "Grievance NGP-2026-0034 resolved", dept: "Roads", type: "resolved" },
  { time: "1 hr ago", event: "SLA breach alert — 3 cases overdue", dept: "Sanitation", type: "alert" },
  { time: "2 hr ago", event: "Grievance NGP-2026-0021 escalated", dept: "Electricity", type: "escalated" }
];
export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allIssues, setAllIssues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // New API states
  const [trendData, setTrendData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function loadDashboardData() {
      setIsLoading(true);
      try {
        const [
          issues,
          trendsRes,
          statusRes,
          deptRes
        ] = await Promise.all([
          getAllAdminGrievances(),
          getDashboardMonthlyTrends(6),
          getDashboardStatusDistribution(),
          getDashboardDepartmentPerformance()
        ]);
        
        if (mounted) {
          setAllIssues(issues);
          
          // Map Monthly Trends
          if (trendsRes && trendsRes.labels) {
            const mappedTrends = trendsRes.labels.map((label, idx) => ({
              month: label,
              submitted: trendsRes.submittedCounts[idx] || 0,
              resolved: trendsRes.resolvedCounts[idx] || 0
            }));
            setTrendData(mappedTrends);
          }

          // Map Status Distribution
          if (Array.isArray(statusRes)) {
            const mappedStatus = statusRes.map(item => ({
              name: item.status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
              value: item.count,
              color: STATUS_COLORS[item.status.toLowerCase()] || "hsl(215, 20%, 65%)"
            }));
            setStatusData(mappedStatus);
          }

          // Map Department Performance
          if (Array.isArray(deptRes)) {
            const mappedDept = deptRes.map(item => ({
              name: item.departmentName,
              pending: item.pendingCount,
              resolved: item.resolvedCount
            }));
            setDepartmentData(mappedDept);
          }
        }
      } catch {
        if (mounted) {
          setAllIssues([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadDashboardData();
    return () => {
      mounted = false;
    };
  }, []);

  const totalResolutionRate = useMemo(() => {
    if (allIssues.length === 0) return 0;
    const resolvedCount = allIssues.filter((item) => ["resolved", "closed"].includes(item.status)).length;
    return Math.round((resolvedCount / allIssues.length) * 100);
  }, [allIssues]);

  const pendingCount = allIssues.filter((item) => !["resolved", "closed"].includes(item.status)).length;
  const resolvedCount = allIssues.filter((item) => ["resolved", "closed"].includes(item.status)).length;
  const escalatedCount = allIssues.filter((item) => item.is_escalated).length;
  const criticalCount = allIssues.filter((item) => item.priority === "critical").length;

  const recentCards = allIssues.slice(0, 3).map((item) => ({
    id: item.id,
    ticketId: item.ticket_id,
    title: item.title,
    description: item.description,
    location: item.location,
    status: item.status.replace("_", "-"),
    category: item.category.replace("_", "-"),
    priority: item.priority,
    createdAt: item.created_at,
  }));

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Command Center</h1>
            <p className="text-xs text-muted-foreground">System-wide grievance operations & analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>

          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* SLA Alerts */}
          {criticalCount > 0 && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
              <Bell className="w-5 h-5 text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-500">{criticalCount} Critical Issues Detected</p>
                <p className="text-xs text-red-500/70 mt-0.5">Immediate attention and reassignment required.</p>
              </div>
              <Button size="sm" variant="outline" className="border-red-500/30 text-red-500 hover:bg-red-500/10 shrink-0 text-xs">
                Review
              </Button>
            </div>
          )}

          {/* Top KPIs (Merged from Analytics) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">System Total</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl font-bold">{allIssues.length}</p>
                <div className="flex items-center text-secondary text-xs font-semibold mb-1">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> 8%
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">Resolution Rate</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl font-bold text-primary">{totalResolutionRate}%</p>
                <div className="flex items-center text-secondary text-xs font-semibold mb-1">
                  <Target className="w-3 h-3 mr-0.5" /> On SLA
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">Open Cases</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl font-bold text-amber-500">{pendingCount}</p>
                <div className="flex items-center text-destructive text-xs font-semibold mb-1">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> 4%
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card bg-destructive/5 border-destructive/20">
              <p className="text-xs text-destructive mb-1">Escalated</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl font-bold text-destructive">{escalatedCount}</p>
                <div className="flex items-center text-secondary text-xs font-semibold mb-1">
                  <TrendingDown className="w-3 h-3 mr-0.5" /> -2%
                </div>
              </div>
            </motion.div>
          </div>

          {/* Corrected Layout for Map View */}
          <div className="grid grid-cols-1 gap-6">
            <AdminIssuesMapPanel issues={allIssues} />
          </div>

          {/* Core Analytics Suite */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly Trends */}
            <div className="lg:col-span-2 elevated-card p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold text-foreground">Monthly Trends</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(218, 72%, 28%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(218, 72%, 28%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(162, 63%, 41%)" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(162, 63%, 41%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(218,22%,87%)", fontSize: 12 }} />
                  <Legend iconSize={10} />
                  <Area type="monotone" dataKey="submitted" stroke="hsl(218, 72%, 28%)" strokeWidth={2.5} fill="url(#colorSubmitted)" dot={{ r: 4, fill: "hsl(218, 72%, 28%)" }} name="Submitted" />
                  <Area type="monotone" dataKey="resolved" stroke="hsl(162, 63%, 41%)" strokeWidth={2.5} fill="url(#colorResolved)" dot={{ r: 4, fill: "hsl(162, 63%, 41%)" }} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status Distribution */}
            <div className="elevated-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-5">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold text-foreground">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Department Analytics */}
          <div className="elevated-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-foreground">Department Performance</h3>
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                <Filter className="w-3.5 h-3.5" /> Filter
              </Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid hsl(218,22%,87%)", fontSize: 12 }} />
                <Legend iconSize={10} />
                <Bar dataKey="resolved" fill="hsl(162, 63%, 41%)" radius={[5, 5, 0, 0]} name="Resolved" />
                <Bar dataKey="pending" fill="hsl(38, 98%, 54%)" radius={[5, 5, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
