import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, AlertTriangle, Plus, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatCard from '@/components/grievance/StatCard';
import StatusBadge from '@/components/grievance/StatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { categoryLabels as catLabelsMap } from '@/lib/mock-data';

type GrievanceRow = Database['public']['Tables']['grievances']['Row'];

const statusDisplay: Record<string, string> = {
  submitted: 'Submitted', under_review: 'Under Review', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
};

export default function CitizenDashboard() {
  const { user, profile } = useAuth();
  const [grievances, setGrievances] = useState<GrievanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from('grievances').select('*').eq('citizen_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setGrievances(data || []); setLoading(false); });
  }, [user]);

  const pending = grievances.filter((g) => !['resolved', 'closed'].includes(g.status));
  const resolved = grievances.filter((g) => ['resolved', 'closed'].includes(g.status));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Welcome back, {profile?.full_name || user?.email}</p>
            </div>
            <Link to="/submit">
              <Button className="bg-primary text-primary-foreground shadow-md hover:shadow-lg transition-shadow">
                <Plus className="w-4 h-4 mr-1.5" /> New Grievance
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
            <StatCard icon={FileText} label="Total Filed" value={grievances.length} />
            <StatCard icon={Clock} label="Pending" value={pending.length} colorClass="text-accent" />
            <StatCard icon={CheckCircle2} label="Resolved" value={resolved.length} colorClass="text-secondary" />
            <StatCard icon={AlertTriangle} label="Critical" value={grievances.filter((g) => g.priority === 'critical').length} colorClass="text-destructive" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : grievances.length === 0 ? (
            <div className="elevated-card p-12 text-center">
              <Inbox className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-heading font-semibold text-foreground mb-1">No grievances yet</h3>
              <p className="text-sm text-muted-foreground mb-4">File your first complaint and we'll make sure it reaches the right department.</p>
              <Link to="/submit"><Button className="bg-primary text-primary-foreground">File a Grievance</Button></Link>
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-5">
                <TabsTrigger value="all">All ({grievances.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
                <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
              </TabsList>
              {['all', 'pending', 'resolved'].map((tab) => {
                const items = tab === 'all' ? grievances : tab === 'pending' ? pending : resolved;
                return (
                  <TabsContent key={tab} value={tab}>
                    <div className="space-y-3">
                      {items.map((g) => (
                        <Link key={g.id} to={`/grievance/${g.id}`} className="block">
                          <div className="stat-card group flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">{g.ticket_id}</span>
                                <StatusBadge status={g.status.replace('_', '-') as any} />
                              </div>
                              <h3 className="font-heading font-semibold text-foreground truncate">{g.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{g.location || 'No location specified'} · {new Date(g.created_at).toLocaleDateString('en-IN')}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">
                                {catLabelsMap[g.category.replace('_', '-') as keyof typeof catLabelsMap] || g.category}
                              </span>
                              <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                                g.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
                                g.priority === 'high' ? 'bg-accent/10 text-accent' :
                                'bg-muted text-muted-foreground'
                              }`}>
                                {g.priority}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
