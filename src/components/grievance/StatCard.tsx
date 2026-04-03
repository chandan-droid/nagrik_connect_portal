import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  colorClass?: string;
}

export default function StatCard({ icon: Icon, label, value, trend, colorClass = 'text-primary' }: StatCardProps) {
  return (
    <div className="stat-card flex items-start gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center bg-primary/10 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        {trend && <p className="text-xs text-secondary mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}
