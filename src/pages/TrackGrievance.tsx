import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Clock, AlertCircle, XCircle, FileText, MapPin, Calendar, Share2, Copy, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatusBadge from '@/components/grievance/StatusBadge';
import { statusLabels } from '@/lib/mock-data';
import { getAllLocalGrievances } from '@/lib/local-grievances';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type TrackResult = {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  location?: string;
  status: 'submitted' | 'under-review' | 'in-progress' | 'resolved' | 'closed';
  timeline: Array<{ id: string; message: string; timestamp: string; by: string }>;
};

function normalizeStatus(s: string): TrackResult['status'] {
  if (s === 'under_review') return 'under-review';
  if (s === 'in_progress') return 'in-progress';
  return s as TrackResult['status'];
}

const statusOrder = ['submitted', 'under-review', 'in-progress', 'resolved', 'closed'] as const;

const statusIcons: Record<string, React.ElementType> = {
  submitted: FileText,
  'under-review': Clock,
  'in-progress': AlertCircle,
  resolved: CheckCircle2,
  closed: XCircle,
};

const statusStepColors: Record<string, string> = {
  submitted: 'bg-info text-info-foreground',
  'under-review': 'bg-accent text-accent-foreground',
  'in-progress': 'bg-primary text-primary-foreground',
  resolved: 'bg-secondary text-secondary-foreground',
  closed: 'bg-muted text-muted-foreground',
};

export default function TrackGrievance() {
  const [ticketId, setTicketId] = useState('');
  const [found, setFound] = useState<TrackResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!ticketId.trim()) return;
    setSearching(true);
    setSearched(false);
    // Simulate brief async search
    await new Promise((r) => setTimeout(r, 500));
    setSearched(true);
    const all = getAllLocalGrievances();
    const match = all.find((g) => g.ticket_id.toLowerCase() === ticketId.trim().toLowerCase());
    if (!match) { setFound(null); setSearching(false); return; }

    setFound({
      id: match.id,
      ticketId: match.ticket_id,
      title: match.title,
      description: match.description,
      location: match.location,
      status: normalizeStatus(match.status),
      timeline: [
        { id: `t1-${match.id}`, message: 'Grievance submitted successfully by citizen', timestamp: match.created_at, by: 'System' },
        { id: `t2-${match.id}`, message: 'Assigned to concerned department for review', timestamp: new Date(new Date(match.created_at).getTime() + 2 * 60 * 60 * 1000).toISOString(), by: 'Auto-Router' },
      ],
    });
    setSearching(false);
  };

  const copyTicketId = () => {
    if (found) {
      navigator.clipboard.writeText(found.ticketId).then(() => toast({ title: 'Copied!', description: 'Ticket ID copied to clipboard.' }));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <div className="gradient-hero py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="container mx-auto max-w-2xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-semibold mb-5 border border-white/10">
              <Search className="w-3.5 h-3.5" /> Real-Time Tracking
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">Track Your Grievance</h1>
            <p className="text-white/60 mb-8 text-base">Enter your unique ticket ID to see real-time status updates and activity timeline.</p>

            {/* Search bar */}
            <div className="relative flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary focus-visible:border-white/40 text-base"
                  placeholder="e.g. NGP-2026-0001"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || !ticketId.trim()}
                className="h-12 px-6 bg-secondary text-white hover:bg-secondary/90 font-semibold shadow-lg"
              >
                {searching ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Track'}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 flex-1 max-w-2xl">
        <AnimatePresence>
          {/* Not found */}
          {searched && !found && !searching && (
            <motion.div key="notfound" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="elevated-card p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-lg mb-2">Ticket Not Found</h3>
              <p className="text-muted-foreground text-sm mb-2">No grievance found with ticket ID: <strong className="font-mono">{ticketId}</strong></p>
              <p className="text-xs text-muted-foreground">Double-check the ID format (e.g. <span className="font-mono">NGP-2026-0001</span>) or try filing a new grievance.</p>
            </motion.div>
          )}

          {/* Found result */}
          {found && (
            <motion.div key="found" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              {/* Main card */}
              <div className="elevated-card overflow-hidden">
                {/* Status gradient header */}
                <div className="gradient-hero px-6 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-white/70 bg-white/10 px-2.5 py-1 rounded-lg">{found.ticketId}</span>
                        <button onClick={copyTicketId} className="text-white/40 hover:text-white transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h2 className="font-heading font-bold text-white text-xl">{found.title}</h2>
                    </div>
                    <StatusBadge status={found.status} />
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Step progress */}
                  <div>
                    <div className="flex gap-1 mb-2">
                      {statusOrder.map((s, i) => {
                        const ci = statusOrder.indexOf(found.status);
                        const done = i < ci;
                        const active = i === ci;
                        const SIcon = statusIcons[s];
                        return (
                          <div key={s} className="flex-1 flex flex-col items-center gap-1">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all',
                              active ? statusStepColors[s] + ' shadow-md scale-110' :
                              done ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground'
                            )}>
                              {done ? <CheckCircle2 className="w-4 h-4" /> : <SIcon className="w-3.5 h-3.5" />}
                            </div>
                            <span className={cn('text-[9px] text-center leading-tight hidden sm:block', active ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
                              {statusLabels[s]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {statusOrder.map((s, i) => {
                        const ci = statusOrder.indexOf(found.status);
                        return <div key={s} className={cn('flex-1 h-1.5 rounded-full transition-all', i <= ci ? 'bg-secondary' : 'bg-muted')} />;
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  {found.description && <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{found.description}</p>}

                  {/* Meta info */}
                  {found.location && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-muted/40 rounded-xl px-3 py-2.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0" /> {found.location}
                    </div>
                  )}

                  {/* Share button */}
                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={copyTicketId}>
                    <Share2 className="w-4 h-4" /> Share Ticket Status
                  </Button>
                </div>
              </div>

              {/* Timeline */}
              <div className="elevated-card p-6">
                <h3 className="font-heading font-semibold text-foreground mb-5">Activity Timeline</h3>
                <div className="space-y-0">
                  {found.timeline.map((event, i) => (
                    <div key={event.id} className="timeline-item pb-5">
                      {i < found.timeline.length - 1 && <div className="timeline-line" />}
                      <div className={cn(
                        'timeline-dot border-2 bg-card',
                        i === found.timeline.length - 1 ? 'border-secondary bg-secondary/10' : 'border-primary/30 bg-primary/5'
                      )}>
                        <CheckCircle2 className={cn('w-4 h-4', i === found.timeline.length - 1 ? 'text-secondary' : 'text-primary/30')} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5">
                        <p className="text-sm font-semibold text-foreground">{event.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString('en-IN')}</p>
                          <span className="text-muted-foreground/30">·</span>
                          <p className="text-xs text-muted-foreground">{event.by}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prompt if nothing searched yet */}
        {!searched && !searching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Search className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-lg font-heading font-semibold text-foreground">Enter your ticket ID above</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">Ticket IDs are shared via SMS/email when you submit a grievance. Format: <span className="font-mono">NGP-2026-XXXX</span></p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
