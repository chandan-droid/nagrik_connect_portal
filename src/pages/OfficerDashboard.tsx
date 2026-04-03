import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GrievanceCard from '@/components/grievance/GrievanceCard';
import StatCard from '@/components/grievance/StatCard';
import StatusBadge from '@/components/grievance/StatusBadge';
import { mockGrievances, statusLabels, type GrievanceStatus } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

export default function OfficerDashboard() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState<GrievanceStatus | ''>('');
  const { toast } = useToast();

  const assigned = mockGrievances.filter((g) => g.assignedOfficer);
  const active = assigned.filter((g) => !['resolved', 'closed'].includes(g.status));
  const resolved = assigned.filter((g) => ['resolved', 'closed'].includes(g.status));
  const selected = assigned.find((g) => g.id === selectedId);

  const handleUpdate = () => {
    toast({ title: 'Status Updated', description: `Grievance ${selected?.ticketId} updated successfully.` });
    setComment('');
    setNewStatus('');
    setSelectedId(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 flex-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6">
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">Officer Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome, Amit Sharma — Water Department</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatCard icon={FileText} label="Assigned" value={assigned.length} />
            <StatCard icon={Clock} label="Active" value={active.length} colorClass="text-accent" />
            <StatCard icon={CheckCircle2} label="Resolved" value={resolved.length} colorClass="text-secondary" />
            <StatCard icon={MessageSquare} label="Awaiting Info" value={1} colorClass="text-info" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="active">
                <TabsList className="mb-4">
                  <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved ({resolved.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                  <div className="space-y-3">
                    {active.map((g) => (
                      <div key={g.id} onClick={() => setSelectedId(g.id)} className="cursor-pointer">
                        <GrievanceCard grievance={g} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="resolved">
                  <div className="space-y-3">
                    {resolved.map((g) => (
                      <div key={g.id} onClick={() => setSelectedId(g.id)} className="cursor-pointer">
                        <GrievanceCard grievance={g} />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Detail / Action Panel */}
            <div className="lg:col-span-1">
              {selected ? (
                <div className="elevated-card p-5 sticky top-20 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">{selected.ticketId}</p>
                      <h3 className="font-heading font-semibold text-foreground mt-1">{selected.title}</h3>
                    </div>
                    <StatusBadge status={selected.status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{selected.description}</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📍 {selected.location}</p>
                    <p>👤 {selected.citizenName}</p>
                    <p>📅 {new Date(selected.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>

                  <div className="border-t border-border pt-4">
                    <h4 className="font-heading text-sm font-semibold text-foreground mb-2">Update Status</h4>
                    <Select value={newStatus} onValueChange={(v) => setNewStatus(v as GrievanceStatus)}>
                      <SelectTrigger><SelectValue placeholder="Change status" /></SelectTrigger>
                      <SelectContent>
                        {(['under-review', 'in-progress', 'resolved'] as GrievanceStatus[]).map((s) => (
                          <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Textarea className="mt-3" placeholder="Add a comment or update..." value={comment} onChange={(e) => setComment(e.target.value)} />
                    <Button onClick={handleUpdate} className="w-full mt-3 bg-primary text-primary-foreground" disabled={!newStatus && !comment}>
                      <Send className="w-4 h-4 mr-1" /> Submit Update
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="elevated-card p-8 text-center text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Select a grievance to view details and take action</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
