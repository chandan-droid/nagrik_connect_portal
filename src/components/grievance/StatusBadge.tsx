import { statusLabels, statusColors, type GrievanceStatus } from '@/lib/mock-data';

export default function StatusBadge({ status }: { status: GrievanceStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
