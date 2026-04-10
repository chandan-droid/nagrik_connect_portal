import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const governanceItems = [
  'Role governance policy review',
  'Department SLA exception audit',
  'Cross-department escalation review',
  'Operational analytics approval',
];

export default function AdminGovernancePanel() {
  return (
    <Card className="mb-6 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">Governance Controls</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {governanceItems.map((item) => (
          <div key={item} className="rounded-md bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {item}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
