import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { roleFeatureLabels } from '@/lib/rbac';

export default function AdminFeatureList() {
  return (
    <Card className="mb-6 border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base">Admin Features</CardTitle>
          <Badge variant="secondary">RBAC: admin</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {roleFeatureLabels.admin.map((item) => (
            <li key={item} className="rounded-md bg-muted/30 px-3 py-2">{item}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
