import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertTriangle, Users, FileText, ChevronRight } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import StatusBadge from '@/components/grievance/StatusBadge';
import { getAllLocalGrievances } from '@/lib/local-grievances';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OfficerQueue() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const assigned = getAllLocalGrievances().filter((g) => g.assigned_officer_id);
  const criticalCount = assigned.filter((g) => g.priority === 'critical' || g.priority === 'high').length;
  const inProgressCount = assigned.filter((g) => g.status === 'in_progress').length;

  const filtered = assigned
    .filter((g) => priorityFilter === 'all' || g.priority === priorityFilter)
    .filter((g) => !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.ticket_id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Assigned Tasks</h1>
            <p className="text-xs text-muted-foreground">Manage your assigned grievances and pending queue</p>
          </div>
          <Button variant="outline" size="sm" className="hidden sm:flex">Refresh Queue</Button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="stat-card">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Total Assigned</p>
              <p className="font-heading text-3xl font-bold text-foreground">{assigned.length}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card bg-amber-500/5 border-amber-500/20">
              <p className="text-xs text-amber-600 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> High / Critical</p>
              <p className="font-heading text-3xl font-bold text-amber-600">{criticalCount}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> In Progress</p>
              <p className="font-heading text-3xl font-bold text-primary">{inProgressCount}</p>
            </motion.div>
          </div>

          <div className="elevated-card p-5">
            <div className="flex flex-col md:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search assigned tasks..." className="pl-9 h-10 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-40 h-10">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">No tasks pending in your queue.</div>
              ) : (
                filtered.map((g, i) => (
                  <motion.div key={g.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to="/officer">
                      <div className="group flex flex-col sm:flex-row sm:items-start justify-between gap-4 p-4 rounded-xl border border-border/60 bg-muted/10 hover:bg-muted/30 transition-all cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">{g.ticket_id}</span>
                            <span className={`text-[10px] uppercase font-bold priority-${g.priority || 'low'}`}>{g.priority}</span>
                          </div>
                          <h3 className="font-heading font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">{g.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1 truncate">
                            {g.department || 'Unassigned Department'} · {new Date(g.updated_at).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                          <StatusBadge status={g.status.replace('_', '-') as any} />
                          <div className="text-xs text-primary hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Act <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
