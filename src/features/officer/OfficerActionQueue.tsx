import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const queueSteps = [
  'Accept and verify assigned grievance',
  'Update status with field notes',
  'Notify citizen on milestone changes',
  'Escalate blocked cases to admin',
];

export default function OfficerActionQueue() {
  return (
    <Card className="mb-6 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">Officer Action Queue</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {queueSteps.map((step, index) => (
          <div key={step} className="rounded-md bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            {index + 1}. {step}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
