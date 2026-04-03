import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GrievanceCard from '@/components/grievance/GrievanceCard';
import StatCard from '@/components/grievance/StatCard';
import { mockGrievances } from '@/lib/mock-data';

export default function CitizenDashboard() {
  const myGrievances = mockGrievances;
  const pending = myGrievances.filter((g) => !['resolved', 'closed'].includes(g.status));
  const resolved = myGrievances.filter((g) => ['resolved', 'closed'].includes(g.status));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">My Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, Rajesh Kumar</p>
            </div>
            <Link to="/submit">
              <Button className="bg-primary text-primary-foreground">
                <Plus className="w-4 h-4 mr-1" /> New Grievance
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard icon={FileText} label="Total Filed" value={myGrievances.length} />
            <StatCard icon={Clock} label="Pending" value={pending.length} colorClass="text-accent" />
            <StatCard icon={CheckCircle2} label="Resolved" value={resolved.length} colorClass="text-secondary" />
            <StatCard icon={AlertTriangle} label="Escalated" value={1} colorClass="text-destructive" />
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({myGrievances.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
              <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myGrievances.map((g) => <GrievanceCard key={g.id} grievance={g} />)}
              </div>
            </TabsContent>
            <TabsContent value="pending">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pending.map((g) => <GrievanceCard key={g.id} grievance={g} />)}
              </div>
            </TabsContent>
            <TabsContent value="resolved">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resolved.map((g) => <GrievanceCard key={g.id} grievance={g} />)}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
