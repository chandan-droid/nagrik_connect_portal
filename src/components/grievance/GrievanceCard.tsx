import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { categoryLabels, type Grievance } from '@/lib/mock-data';

export default function GrievanceCard({ grievance }: { grievance: Grievance }) {
  const date = new Date(grievance.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <div className="stat-card group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-mono text-muted-foreground">{grievance.ticketId}</p>
          <h3 className="font-heading font-semibold text-foreground mt-1 line-clamp-1">{grievance.title}</h3>
        </div>
        <StatusBadge status={grievance.status} />
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{grievance.description}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{grievance.location}</span>
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{date}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
          {categoryLabels[grievance.category]}
        </span>
        <Link
          to={`/grievance/${grievance.id}`}
          className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          View Details <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
