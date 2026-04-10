import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, Search, Clock, Filter, AlertTriangle, ArrowRight, Inbox } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import StatusBadge from '@/components/grievance/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { getLocalGrievancesByCitizen } from '@/lib/local-grievances';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { categoryLabels } from '@/lib/mock-data';

const priorityConfig: Record<string, { label: string; cls: string }> = {
  critical: { label: 'Critical', cls: 'priority-critical' },
  high: { label: 'High', cls: 'priority-high' },
  medium: { label: 'Medium', cls: 'priority-medium' },
  low: { label: 'Low', cls: 'priority-low' },
};

export default function CitizenTickets() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuth();

  const tickets = user ? getLocalGrievancesByCitizen(user.id) : [];

  const filteredTickets = tickets
    .filter((t) => statusFilter === 'all' || t.status === statusFilter)
    .filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.ticket_id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">My Tickets</h1>
            <p className="text-xs text-muted-foreground">Comprehensive history of all your filed grievances</p>
          </div>
          <Link to="/submit">
            <Button className="gradient-primary text-white shadow-md text-sm h-9">File New Ticket</Button>
          </Link>
        </div>

        <div className="p-6 space-y-5">
          <div className="elevated-card p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="flex gap-2 w-full md:max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-10 text-sm w-full"
                    placeholder="Search by title or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 h-10">
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/10 overflow-hidden">
              <div className="grid grid-cols-12 gap-3 px-5 py-3.5 bg-muted/30 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <span className="col-span-3 sm:col-span-2">Ticket ID</span>
                <span className="col-span-6 md:col-span-4">Issue Title</span>
                <span className="hidden md:block col-span-3">Category</span>
                <span className="col-span-3 md:col-span-2">Status</span>
                <span className="hidden sm:block col-span-1 text-center">Action</span>
              </div>
              
              {filteredTickets.length === 0 ? (
                <div className="py-16 text-center">
                  <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-heading font-semibold text-foreground mb-1">No tickets found</p>
                  <p className="text-sm text-muted-foreground">Adjust your filters or file a new grievance.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/60">
                  {filteredTickets.map((ticket, i) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group flex items-center bg-card hover:bg-muted/10 transition-colors"
                    >
                      <Link to={`/grievance/${ticket.id}`} className="grid grid-cols-12 gap-3 px-5 py-4 w-full items-center text-sm">
                        <span className="col-span-3 sm:col-span-2 font-mono text-xs text-muted-foreground px-2 py-1 rounded bg-muted/50 truncate">
                          {ticket.ticket_id}
                        </span>
                        <div className="col-span-6 md:col-span-4 truncate pr-4">
                          <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{ticket.title}</p>
                          <p className="text-xs text-muted-foreground truncate hidden sm:block mt-0.5">{new Date(ticket.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div className="hidden md:flex col-span-3 items-center gap-2">
                          <span className="truncate text-muted-foreground">
                            {categoryLabels[ticket.category.replace('_', '-') as keyof typeof categoryLabels] || ticket.category}
                          </span>
                          {ticket.priority && (
                            <span className={cn('text-[10px] uppercase font-bold shrink-0', priorityConfig[ticket.priority]?.cls)}>
                              {ticket.priority}
                            </span>
                          )}
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <StatusBadge status={ticket.status.replace('_', '-') as any} />
                        </div>
                        <div className="hidden sm:flex col-span-1 justify-center">
                          <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
