import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, TrendingDown, Target, Building2, MapPin } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { getAllLocalGrievances } from '@/lib/local-grievances';

export default function AdminAnalytics() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const all = getAllLocalGrievances();
  const open = all.filter((g) => !['resolved', 'closed'].includes(g.status));
  const resolved = all.filter((g) => ['resolved', 'closed'].includes(g.status));
  const critical = all.filter((g) => g.priority === 'critical');

  const resolutionRate = all.length > 0 ? Math.round((resolved.length / all.length) * 100) : 0;

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Advanced Analytics</h1>
            <p className="text-xs text-muted-foreground">Macro performance data and bottleneck analysis</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">System Total</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl font-bold">{all.length}</p>
                <div className="flex items-center text-secondary text-xs font-semibold mb-1"><TrendingUp className="w-3 h-3 mr-0.5" /> 8%</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">Resolution Rate</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl font-bold text-primary">{resolutionRate}%</p>
                <div className="flex items-center text-secondary text-xs font-semibold mb-1"><Target className="w-3 h-3 mr-0.5" /> On SLA</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <p className="text-xs text-muted-foreground mb-1">Open Cases</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl font-bold text-amber-600">{open.length}</p>
                <div className="flex items-center text-destructive text-xs font-semibold mb-1"><TrendingUp className="w-3 h-3 mr-0.5" /> 4%</div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="stat-card bg-destructive/5 border-destructive/20">
              <p className="text-xs text-destructive mb-1">Critical Alerts</p>
              <div className="flex items-end justify-between">
                <p className="font-heading text-3xl font-bold text-destructive">{critical.length}</p>
                <div className="flex items-center text-secondary text-xs font-semibold mb-1"><TrendingDown className="w-3 h-3 mr-0.5" /> -2%</div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="elevated-card p-6 min-h-[300px] flex flex-col items-center justify-center border-dashed bg-muted/10">
               <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
               <h3 className="font-semibold text-foreground">Department Flow Analytics</h3>
               <p className="text-sm text-muted-foreground max-w-sm text-center mt-2">Detailed charts for department specific workloads will be populated here.</p>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="elevated-card p-6 min-h-[300px] flex flex-col items-center justify-center border-dashed bg-muted/10">
               <MapPin className="w-12 h-12 text-muted-foreground/30 mb-4" />
               <h3 className="font-semibold text-foreground">Geospatial Hotspots</h3>
               <p className="text-sm text-muted-foreground max-w-sm text-center mt-2">Map integrations visualizing grievance concentration areas are pending API connection.</p>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
