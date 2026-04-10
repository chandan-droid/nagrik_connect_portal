import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, AlertTriangle, Plus, Inbox, TrendingUp, Bell, ChevronRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import StatusBadge from '@/components/grievance/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { categoryLabels as catLabelsMap } from '@/lib/mock-data';
import { getLocalGrievancesByCitizen, type LocalGrievance } from '@/lib/local-grievances';
import { cn } from '@/lib/utils';

const statusDisplay: Record<string, string> = {
  submitted: 'Submitted', under_review: 'Under Review', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
};

const priorityConfig: Record<string, { label: string; cls: string }> = {
  critical: { label: 'Critical', cls: 'priority-critical' },
  high: { label: 'High', cls: 'priority-high' },
  medium: { label: 'Medium', cls: 'priority-medium' },
  low: { label: 'Low', cls: 'priority-low' },
};

function KPICard({ icon: Icon, label, value, color, trend }: { icon: React.ElementType; label: string; value: number | string; color: string; trend?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card group"
    >
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="font-heading font-bold text-2xl text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {trend && <p className="text-[11px] text-secondary flex items-center gap-1 mt-1.5"><TrendingUp className="w-3 h-3" />{trend}</p>}
    </motion.div>
  );
}

export default function CitizenDashboard() {
  const { user, profile } = useAuth();
  const [grievances, setGrievances] = useState<LocalGrievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    setGrievances(getLocalGrievancesByCitizen(user.id));
    setLoading(false);
  }, [user]);

  const pending = grievances.filter((g) => !['resolved', 'closed'].includes(g.status));
  const resolved = grievances.filter((g) => ['resolved', 'closed'].includes(g.status));
  const critical = grievances.filter((g) => g.priority === 'critical');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const filteredByTab = activeTab === 'all' ? grievances : activeTab === 'pending' ? pending : resolved;
  const filtered = filteredByTab.filter((g) =>
    !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.ticket_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main">
        {/* Top bar */}
        <div className="dashboard-topbar">
          <div>
            <p className="text-xs text-muted-foreground">{greeting} 👋</p>
            <h1 className="font-heading font-bold text-lg text-foreground">{profile?.full_name || user?.email?.split('@')[0]}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/submit">
              <Button className="gradient-primary text-white shadow-md hover:opacity-90 font-semibold" size="sm">
                <Plus className="w-4 h-4 mr-1.5" /> New Grievance
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Critical alert banner */}
          {critical.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-2xl px-5 py-4"
            >
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-destructive">
                  {critical.length} Critical Grievance{critical.length > 1 ? 's' : ''} Pending
                </p>
                <p className="text-xs text-destructive/70 mt-0.5">These require urgent attention. Check your tickets below.</p>
              </div>
              <Link to="/citizen/tickets">
                <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10 shrink-0">
                  View <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Button>
              </Link>
            </motion.div>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard icon={FileText} label="Total Filed" value={grievances.length} color="bg-primary/10 text-primary" />
            <KPICard icon={Clock} label="Pending" value={pending.length} color="bg-amber-500/10 text-amber-600" />
            <KPICard icon={CheckCircle2} label="Resolved" value={resolved.length} color="bg-secondary/10 text-secondary" trend={resolved.length > 0 ? 'Great progress!' : undefined} />
            <KPICard icon={AlertTriangle} label="Critical" value={critical.length} color="bg-destructive/10 text-destructive" />
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'File a New Grievance', desc: 'Report a civic issue in minutes', path: '/submit', color: 'gradient-primary', icon: Plus },
              { label: 'Track by Ticket ID', desc: 'Check status without logging in', path: '/track', color: 'bg-muted hover:bg-muted/70', icon: Search },
              { label: 'View All Tickets', desc: 'See full history and timeline', path: '/citizen/tickets', color: 'bg-muted hover:bg-muted/70', icon: FileText },
            ].map((action) => (
              <Link key={action.path} to={action.path}>
                <div className={cn(
                  'flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all hover:-translate-y-0.5 hover:shadow-md',
                  action.color.startsWith('gradient') ? 'border-transparent text-white' : 'border-border text-foreground'
                )}
                  style={action.color.startsWith('gradient') ? { background: 'var(--gradient-primary)' } : {}}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    action.color.startsWith('gradient') ? 'bg-white/20' : 'bg-muted'
                  )}>
                    <action.icon className={cn('w-5 h-5', action.color.startsWith('gradient') ? 'text-white' : 'text-foreground')} />
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold', action.color.startsWith('gradient') ? 'text-white' : 'text-foreground')}>{action.label}</p>
                    <p className={cn('text-xs', action.color.startsWith('gradient') ? 'text-white/70' : 'text-muted-foreground')}>{action.desc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Grievances list */}
          <div className="elevated-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <h2 className="font-heading font-bold text-lg text-foreground">My Grievances</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-9 w-full sm:w-56 text-sm"
                  placeholder="Search by title / ticket ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : grievances.length === 0 ? (
              <div className="text-center py-16">
                <Inbox className="w-14 h-14 text-muted-foreground/20 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-foreground mb-1">No grievances yet</h3>
                <p className="text-sm text-muted-foreground mb-5">File your first complaint and we'll make sure it reaches the right department.</p>
                <Link to="/submit"><Button className="gradient-primary text-white">File a Grievance</Button></Link>
              </div>
            ) : (
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All ({grievances.length})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
                </TabsList>
                {['all', 'pending', 'resolved'].map((tab) => (
                  <TabsContent key={tab} value={tab}>
                    {filtered.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">No grievances found.</div>
                    ) : (
                      <div className="space-y-3">
                        {filtered.map((g, i) => (
                          <motion.div
                            key={g.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                          >
                            <Link to={`/grievance/${g.id}`} className="block">
                              <div className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border border-border/60 bg-card hover:shadow-md hover:border-primary/20 transition-all duration-200 hover:-translate-y-0.5">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{g.ticket_id}</span>
                                    <StatusBadge status={g.status.replace('_', '-') as any} />
                                  </div>
                                  <h3 className="font-heading font-semibold text-foreground truncate group-hover:text-primary transition-colors">{g.title}</h3>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                    {g.location || 'No location specified'} · {new Date(g.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
                                    {catLabelsMap[g.category.replace('_', '-') as keyof typeof catLabelsMap] || g.category}
                                  </span>
                                  <span className={priorityConfig[g.priority]?.cls || 'priority-low'}>
                                    {priorityConfig[g.priority]?.label || g.priority}
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
