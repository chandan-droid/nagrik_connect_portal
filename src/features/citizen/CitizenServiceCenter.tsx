import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList, PlusCircle, Search } from 'lucide-react';

export default function CitizenServiceCenter() {
  return (
    <Card className="mb-6 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="font-heading text-base">Citizen Service Center</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <Link to="/submit">
          <Button className="w-full justify-start bg-primary text-primary-foreground">
            <PlusCircle className="w-4 h-4 mr-2" /> File New Grievance
          </Button>
        </Link>
        <Link to="/track">
          <Button variant="outline" className="w-full justify-start">
            <Search className="w-4 h-4 mr-2" /> Track Ticket Status
          </Button>
        </Link>
        <Link to="/citizen">
          <Button variant="outline" className="w-full justify-start">
            <ClipboardList className="w-4 h-4 mr-2" /> View My Cases
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
