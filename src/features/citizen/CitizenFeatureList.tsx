import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { roleFeatureLabels } from '@/lib/rbac';

export default function CitizenFeatureList() {
  return (
    <Card className="mb-6 border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base">Citizen Features</CardTitle>
          <Badge variant="secondary">RBAC: citizen</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {roleFeatureLabels.citizen.map((item) => (
            <li key={item} className="rounded-md bg-muted/30 px-3 py-2">{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
