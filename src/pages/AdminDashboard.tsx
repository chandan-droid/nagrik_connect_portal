import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Clock, CheckCircle2, AlertTriangle, TrendingUp, Users,
  Building2, Download, BarChart3, Activity, ArrowUpRight, Filter,
  RefreshCw, Bell, Shield
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { Button } from '@/components/ui/button';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import GrievanceCard from '@/components/grievance/GrievanceCard';
import { mockGrievances, departmentStats, monthlyTrends } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const pieData = [
  { name: 'Submitted', value: 32, color: 'hsl(200, 80%, 50%)' },
  { name: 'Under Review', value: 28, color: 'hsl(38, 90%, 55%)' },
  { name: 'In Progress', value: 45, color: 'hsl(218, 72%, 38%)' },
  { name: 'Resolved', value: 120, color: 'hsl(162, 63%, 41%)' },
  { name: 'Closed', value: 20, color: 'hsl(218, 20%, 70%)' },
];

const officerWorkload = [
  { name: 'Rajesh Kumar', dept: 'Water', assigned: 12, resolved: 9, rating: 4.8 },
  { name: 'Anita Singh', dept: 'Roads', assigned: 8, resolved: 6, rating: 4.5 },
  { name: 'Sunil Sharma', dept: 'Power', assigned: 15, resolved: 11, rating: 4.2 },
  { name: 'Deepa Nair', dept: 'Health', assigned: 6, resolved: 5, rating: 4.9 },
];

const recentActivity = [
  { time: '2 min ago', event: 'New critical grievance filed', dept: 'Water Supply', type: 'new' },
  { time: '15 min ago', event: 'Grievance NGP-2026-0034 resolved', dept: 'Roads', type: 'resolved' },
  { time: '1 hr ago', event: 'SLA breach alert — 3 cases overdue', dept: 'Sanitation', type: 'alert' },
  { time: '2 hr ago', event: 'Grievance NGP-2026-0021 escalated', dept: 'Electricity', type: 'escalated' },
];

export default function AdminDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const totalResolutionRate = Math.round((152 / 245) * 100);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main">
        {/* Top bar */}
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Command Center</h1>
            <p className="text-xs text-muted-foreground">System-wide grievance operations & oversight</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
            <Button size="sm" className="gradient-primary text-white text-xs gap-1.5 h-8">
              <Download className="w-3.5 h-3.5" /> Export Report
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* SLA breach alert */}
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-5 py-4">
            <Bell className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">3 SLA Breaches Detected</p>
              <p className="text-xs text-amber-600/70 mt-0.5">Cases in Sanitation dept have exceeded 7-day resolution window. Immediate reassignment required.</p>
            </div>
            <Button size="sm" variant="outline" className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10 shrink-0 text-xs">
              Review
            </Button>
          </div>

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'Total Complaints', value: '245', color: 'bg-primary/10 text-primary', trend: '+12% this month', trendUp: true },
              { icon: Clock, label: 'Pending', value: '73', color: 'bg-amber-500/10 text-amber-600', trend: undefined },
              { icon: CheckCircle2, label: 'Resolved', value: '152', color: 'bg-secondary/10 text-secondary', trend: `${totalResolutionRate}% SLA met`, trendUp: true },
              { icon: AlertTriangle, label: 'Escalated', value: '20', color: 'bg-destructive/10 text-destructive', trend: undefined },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card group">
                <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <p className="font-heading font-bold text-2xl text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
                {kpi.trend && (
                  <p className={cn('text-[11px] mt-1.5 flex items-center gap-1', kpi.trendUp ? 'text-secondary' : 'text-muted-foreground')}>
                    {kpi.trendUp && <TrendingUp className="w-3 h-3" />}{kpi.trend}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Monthly trends */}
            <div className="lg:col-span-2 elevated-card p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-heading font-semibold text-foreground">Monthly Trends</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">Last 6 months</span>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyTrends}>
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
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(218,22%,87%)', fontSize: 12 }} />
                  <Legend iconSize={10} />
                  <Area type="monotone" dataKey="submitted" stroke="hsl(218, 72%, 28%)" strokeWidth={2.5} fill="url(#colorSubmitted)" dot={{ r: 4, fill: 'hsl(218, 72%, 28%)' }} name="Submitted" />
                  <Area type="monotone" dataKey="resolved" stroke="hsl(162, 63%, 41%)" strokeWidth={2.5} fill="url(#colorResolved)" dot={{ r: 4, fill: 'hsl(162, 63%, 41%)' }} name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Status distribution */}
            <div className="elevated-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-5">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map((d, i) => (
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

          {/* Department performance */}
          <div className="elevated-card p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-foreground">Department Performance</h3>
              <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5"><Filter className="w-3.5 h-3.5" /> Filter</Button>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 15%, 55%)" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(218,22%,87%)', fontSize: 12 }} />
                <Legend iconSize={10} />
                <Bar dataKey="resolved" fill="hsl(162, 63%, 41%)" radius={[5, 5, 0, 0]} name="Resolved" />
                <Bar dataKey="pending" fill="hsl(38, 98%, 54%)" radius={[5, 5, 0, 0]} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom row: Officer workload + Activity feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Officer workload */}
            <div className="elevated-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Officer Workload</h3>
              <div className="space-y-3">
                {officerWorkload.map((o, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors">
                    <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {o.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{o.name}</p>
                      <p className="text-xs text-muted-foreground">{o.dept} Dept · ⭐ {o.rating}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-foreground">{o.resolved}/{o.assigned}</p>
                      <p className="text-[10px] text-muted-foreground">resolved</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div className="elevated-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading font-semibold text-foreground">Live Activity Feed</h3>
                <span className="flex items-center gap-1.5 text-xs text-secondary"><Activity className="w-3 h-3" /> Live</span>
              </div>
              <div className="space-y-3">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card hover:bg-muted/20 transition-colors">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      a.type === 'new' ? 'bg-primary/10 text-primary' :
                      a.type === 'resolved' ? 'bg-secondary/10 text-secondary' :
                      a.type === 'alert' ? 'bg-destructive/10 text-destructive' :
                      'bg-amber-500/10 text-amber-600'
                    )}>
                      {a.type === 'new' ? <FileText className="w-4 h-4" /> :
                       a.type === 'resolved' ? <CheckCircle2 className="w-4 h-4" /> :
                       a.type === 'alert' ? <AlertTriangle className="w-4 h-4" /> :
                       <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{a.event}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{a.dept}</span>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="text-xs text-muted-foreground">{a.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent grievances */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-foreground">Recent Grievances</h3>
              <Button variant="outline" size="sm" className="text-xs h-8">View All</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockGrievances.slice(0, 3).map((g) => <GrievanceCard key={g.id} grievance={g} />)}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
