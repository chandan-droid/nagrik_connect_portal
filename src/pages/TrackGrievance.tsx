import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatusBadge from '@/components/grievance/StatusBadge';
import { mockGrievances, statusLabels } from '@/lib/mock-data';

export default function TrackGrievance() {
  const [ticketId, setTicketId] = useState('');
  const [found, setFound] = useState<typeof mockGrievances[0] | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const match = mockGrievances.find((g) => g.ticketId.toLowerCase() === ticketId.trim().toLowerCase());
    setFound(match || null);
  };

  const statusOrder = ['submitted', 'under-review', 'in-progress', 'resolved', 'closed'] as const;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 flex-1 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">Track Your Grievance</h1>
          <p className="text-muted-foreground text-sm mb-8">Enter your ticket ID to see real-time status updates.</p>

          <div className="flex gap-2 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="e.g. NGP-2026-0001" value={ticketId} onChange={(e) => setTicketId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
            </div>
            <Button onClick={handleSearch} className="bg-primary text-primary-foreground">Track</Button>
          </div>

          {searched && !found && (
            <div className="elevated-card p-8 text-center">
              <p className="text-muted-foreground">No grievance found with this ticket ID. Please check and try again.</p>
              <p className="text-xs text-muted-foreground mt-2">Try: NGP-2026-0001</p>
            </div>
          )}

          {found && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="elevated-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs font-mono text-muted-foreground">{found.ticketId}</p>
                    <h2 className="font-heading font-bold text-lg text-foreground mt-1">{found.title}</h2>
                  </div>
                  <StatusBadge status={found.status} />
                </div>
                <p className="text-sm text-muted-foreground mb-4">{found.description}</p>

                {/* Status progress bar */}
                <div className="flex items-center gap-1 mb-6">
                  {statusOrder.map((s, i) => {
                    const currentIdx = statusOrder.indexOf(found.status);
                    const active = i <= currentIdx;
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`h-2 rounded-full flex-1 ${active ? 'bg-secondary' : 'bg-muted'}`} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  {statusOrder.map((s) => (
                    <span key={s}>{statusLabels[s]}</span>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="elevated-card p-6">
                <h3 className="font-heading font-semibold text-foreground mb-4">Activity Timeline</h3>
                <div className="space-y-4">
                  {found.timeline.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${i === found.timeline.length - 1 ? 'bg-secondary' : 'bg-primary/30'}`} />
                        {i < found.timeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-4">
                        <p className="text-sm font-medium text-foreground">{event.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(event.timestamp).toLocaleString('en-IN')} · {event.by}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
