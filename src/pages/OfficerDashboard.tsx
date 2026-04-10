import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Clock, CheckCircle2, MessageSquare, Send, AlertTriangle,
  ChevronRight, Filter, Search, X, TrendingUp, Zap, User, MapPin, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import StatusBadge from '@/components/grievance/StatusBadge';
import { mockGrievances, statusLabels, type GrievanceStatus } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const slaConfig = (createdAt: string) => {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days >= 7) return { label: `${days}d — Overdue`, cls: 'sla-overdue', icon: AlertTriangle };
  if (days >= 5) return { label: `${days}d — Due Soon`, cls: 'sla-due-soon', icon: Clock };
  return { label: `${days}d — On Track`, cls: 'sla-on-track', icon: CheckCircle2 };
};

const priorityCls: Record<string, string> = {
  critical: 'priority-critical', high: 'priority-high', medium: 'priority-medium', low: 'priority-low',
};

export default function OfficerDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState<GrievanceStatus | ''>('');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { toast } = useToast();

  const assigned = mockGrievances.filter((g) => g.assignedOfficer);
  const active = assigned.filter((g) => !['resolved', 'closed'].includes(g.status));
  const resolved = assigned.filter((g) => ['resolved', 'closed'].includes(g.status));
  const selected = assigned.find((g) => g.id === selectedId);

  const filterItems = (items: typeof assigned) =>
    items
      .filter((g) => priorityFilter === 'all' || g.priority === priorityFilter)
      .filter((g) => !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.ticketId?.toLowerCase().includes(search.toLowerCase()));

  const handleUpdate = () => {
    if (!newStatus && !comment.trim()) {
      toast({ title: 'Nothing to update', description: 'Please select a status or add a comment.', variant: 'destructive' });
      return;
    }
    toast({ title: '✅ Updated Successfully', description: `Grievance ${selected?.ticketId} has been updated.` });
    setComment('');
    setNewStatus('');
    setSelectedId(null);
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main">
        {/* Top bar */}
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Officer Workstation</h1>
            <p className="text-xs text-muted-foreground">Manage assigned grievances and submit field updates</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
            <span className="hidden sm:inline">{active.length} active cases</span>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: 'Assigned', value: assigned.length, color: 'bg-primary/10 text-primary' },
              { icon: Clock, label: 'Active', value: active.length, color: 'bg-amber-500/10 text-amber-600' },
              { icon: CheckCircle2, label: 'Resolved', value: resolved.length, color: 'bg-secondary/10 text-secondary' },
              { icon: MessageSquare, label: 'Awaiting Info', value: 1, color: 'bg-info/10 text-info' },
            ].map((kpi, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card group">
                <div className={`w-10 h-10 rounded-xl ${kpi.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <kpi.icon className="w-5 h-5" />
                </div>
                <p className="font-heading font-bold text-2xl text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Master-detail layout */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* List panel — 3/5 */}
            <div className="lg:col-span-3 space-y-4">
              {/* Search + filter */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input className="pl-8 h-9 text-sm" placeholder="Search grievances..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-32 h-9 text-sm">
                    <Filter className="w-3.5 h-3.5 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['all', 'critical', 'high', 'medium', 'low'].map((p) => (
                      <SelectItem key={p} value={p} className="capitalize">{p === 'all' ? 'All Priority' : p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
                </TabsList>

                {(['active', 'resolved'] as const).map((tab) => {
                  const items = filterItems(tab === 'active' ? active : resolved);
                  return (
                    <TabsContent key={tab} value={tab}>
                      <div className="space-y-3">
                        {items.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground text-sm">No cases match your filters.</div>
                        ) : items.map((g, i) => {
                          const sla = slaConfig(g.createdAt);
                          const SlaIcon = sla.icon;
                          return (
                            <motion.div
                              key={g.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedId(g.id === selectedId ? null : g.id)}
                              className={cn(
                                'p-4 rounded-2xl border cursor-pointer transition-all duration-200',
                                selectedId === g.id
                                  ? 'border-primary/40 bg-primary/[0.04] shadow-md'
                                  : 'border-border/60 bg-card hover:border-primary/20 hover:shadow-sm hover:-translate-y-0.5'
                              )}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-mono text-muted-foreground mb-1">{g.ticketId}</p>
                                  <h3 className="font-heading font-semibold text-foreground text-sm truncate">{g.title}</h3>
                                </div>
                                <StatusBadge status={g.status} />
                              </div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className={priorityCls[g.priority] || 'priority-low'}>{g.priority}</span>
                                <span className={sla.cls}><SlaIcon className="w-3 h-3 inline mr-1" />{sla.label}</span>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </div>

            {/* Detail panel — 2/5 */}
            <div className="lg:col-span-2">
              <div className="sticky top-[73px]">
                {selected ? (
                  <motion.div
                    key={selected.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="elevated-card p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground">{selected.ticketId}</p>
                        <h3 className="font-heading font-semibold text-foreground mt-1">{selected.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={selected.status} />
                        <button onClick={() => setSelectedId(null)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{selected.description}</p>

                    <div className="grid grid-cols-1 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{selected.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                        <User className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{selected.citizenName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/40 rounded-lg px-3 py-2">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>Filed: {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <h4 className="font-heading text-sm font-semibold text-foreground">Update Status</h4>
                      <Select value={newStatus} onValueChange={(v) => setNewStatus(v as GrievanceStatus)}>
                        <SelectTrigger><SelectValue placeholder="Select new status..." /></SelectTrigger>
                        <SelectContent>
                          {(['under-review', 'in-progress', 'resolved'] as GrievanceStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Textarea
                        className="min-h-[100px] resize-none text-sm"
                        placeholder="Add a public update note for the citizen..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button
                        onClick={handleUpdate}
                        className="w-full gradient-primary text-white shadow-sm font-semibold"
                        disabled={!newStatus && !comment.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" /> Submit Update
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 text-sm"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" /> Escalate Case
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="elevated-card p-10 text-center text-muted-foreground">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-7 h-7 text-muted-foreground/40" />
                    </div>
                    <p className="font-medium text-foreground mb-1">No case selected</p>
                    <p className="text-sm">Click on any grievance from the list to view details and take action.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
