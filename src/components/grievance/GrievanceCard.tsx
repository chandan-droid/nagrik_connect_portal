import { MapPin, Clock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { categoryLabels, type Grievance } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const priorityCls: Record<string, string> = {
  critical: 'priority-critical',
  high: 'priority-high',
  medium: 'priority-medium',
  low: 'priority-low',
};

export default function GrievanceCard({ grievance }: { grievance: Grievance }) {
  const date = new Date(grievance.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">{grievance.ticketId}</p>
          </div>
          <h3 className="font-heading font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{grievance.title}</h3>
        </div>
        <StatusBadge status={grievance.status} />
      </div>

      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">{grievance.description}</p>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap">
        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary shrink-0" />{grievance.location}</span>
        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 shrink-0" />{date}</span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-muted text-muted-foreground">
            {categoryLabels[grievance.category]}
          </span>
          {grievance.priority && (
            <span className={priorityCls[grievance.priority] || 'priority-low'}>
              {grievance.priority}
            </span>
          )}
        </div>
        <Link
          to={`/grievance/${grievance.id}`}
          className="text-xs font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all hover:gap-1.5 duration-200"
        >
          View <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
