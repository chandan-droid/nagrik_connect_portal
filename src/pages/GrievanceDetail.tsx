import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, User, Building2, ArrowLeft, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import StatusBadge from '@/components/grievance/StatusBadge';
import { mockGrievances, categoryLabels, statusLabels } from '@/lib/mock-data';

export default function GrievanceDetail() {
  const { id } = useParams();
  const grievance = mockGrievances.find((g) => g.id === id);

  if (!grievance) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center flex-1">
          <p className="text-muted-foreground">Grievance not found.</p>
          <Link to="/citizen"><Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const statusOrder = ['submitted', 'under-review', 'in-progress', 'resolved', 'closed'] as const;
  const currentIdx = statusOrder.indexOf(grievance.status);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/citizen" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>

          <div className="elevated-card p-6 md:p-8 mb-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{grievance.ticketId}</p>
                <h1 className="font-heading text-xl md:text-2xl font-bold text-foreground mt-1">{grievance.title}</h1>
                <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {categoryLabels[grievance.category]}
                </span>
              </div>
              <StatusBadge status={grievance.status} />
            </div>

            {/* Progress */}
            <div className="flex items-center gap-1 mb-2">
              {statusOrder.map((s, i) => (
                <div key={s} className={`h-2.5 rounded-full flex-1 transition-colors ${i <= currentIdx ? 'bg-secondary' : 'bg-muted'}`} />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mb-6">
              {statusOrder.map((s) => <span key={s}>{statusLabels[s]}</span>)}
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{grievance.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" /> {grievance.location}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" /> Filed: {new Date(grievance.createdAt).toLocaleDateString('en-IN')}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4 text-primary" /> {grievance.citizenName}
              </div>
              {grievance.department && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="w-4 h-4 text-primary" /> {grievance.department}
                </div>
              )}
            </div>

            {grievance.satisfaction && (
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Satisfaction:</span>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={`w-4 h-4 ${s <= grievance.satisfaction! ? 'text-accent fill-accent' : 'text-muted'}`} />
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="elevated-card p-6 md:p-8">
            <h2 className="font-heading font-semibold text-lg text-foreground mb-5">Activity Timeline</h2>
            <div className="space-y-5">
              {grievance.timeline.map((event, i) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3.5 h-3.5 rounded-full border-2 ${i === grievance.timeline.length - 1 ? 'bg-secondary border-secondary' : 'bg-card border-primary/30'}`} />
                    {i < grievance.timeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-5">
                    <StatusBadge status={event.status} />
                    <p className="text-sm font-medium text-foreground mt-2">{event.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.timestamp).toLocaleString('en-IN')} · by {event.by}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
