import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Upload, ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { categoryLabels } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type GrievanceCategory = Database['public']['Enums']['grievance_category'];
type GrievancePriority = Database['public']['Enums']['grievance_priority'];

const stepTitles = ['Category & Title', 'Details & Location', 'Review & Submit'];

const priorityLabels: Record<GrievancePriority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical',
};

export default function SubmitGrievance() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '' as GrievanceCategory | '',
    description: '',
    location: '',
    priority: 'medium' as GrievancePriority,
    anonymous: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async () => {
    if (!user || !form.category) return;
    setLoading(true);
    const { data, error } = await supabase.from('grievances').insert({
      title: form.title,
      description: form.description,
      category: form.category,
      location: form.location,
      priority: form.priority,
      citizen_id: user.id,
      is_anonymous: form.anonymous,
      ticket_id: 'temp',
    }).select('ticket_id').single();

    setLoading(false);
    if (error) {
      toast({ title: 'Submission Failed', description: error.message, variant: 'destructive' });
    } else {
      // Also add initial timeline entry
      if (data) {
        const { data: grievanceData } = await supabase.from('grievances').select('id, ticket_id').eq('ticket_id', data.ticket_id).maybeSingle();
        if (grievanceData) {
          await supabase.from('grievance_timeline').insert({
            grievance_id: grievanceData.id,
            status: 'submitted',
            message: 'Grievance submitted by citizen',
            created_by: user.id,
          });
        }
      }
      toast({
        title: '✅ Grievance Submitted!',
        description: `Ticket ID: ${data?.ticket_id}. Track it from your dashboard.`,
      });
      navigate('/citizen');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12 flex-1 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">File a Grievance</h1>
              <p className="text-muted-foreground text-sm">Help us address your concern — it takes just a minute.</p>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 my-8">
            {stepTitles.map((title, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 shadow-sm ${
                  i < step ? 'bg-secondary text-secondary-foreground scale-95' : i === step ? 'bg-primary text-primary-foreground ring-4 ring-primary/20' : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block truncate font-medium">{title}</span>
                {i < 2 && <div className={`flex-1 h-0.5 rounded-full transition-colors ${i < step ? 'bg-secondary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          <div className="elevated-card p-6 md:p-8">
            <AnimatedStep step={step} currentStep={0}>
              <div className="space-y-5">
                <div>
                  <Label className="text-foreground font-medium">Category *</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as GrievanceCategory })}>
                    <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder="What type of issue?" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key.replace('-', '_')}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground font-medium">Title of Problem *</Label>
                  <Input className="mt-1.5 h-11" placeholder="Brief title describing the issue" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label className="text-foreground font-medium">Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as GrievancePriority })}>
                    <SelectTrigger className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AnimatedStep>

            <AnimatedStep step={step} currentStep={1}>
              <div className="space-y-5">
                <div>
                  <Label className="text-foreground font-medium">Description *</Label>
                  <Textarea className="mt-1.5 min-h-[140px]" placeholder="Provide a detailed description of the problem..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <Label className="text-foreground font-medium">Location</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-10 h-11" placeholder="Enter address or landmark" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 h-48 flex items-center justify-center text-sm text-muted-foreground">
                  <MapPin className="w-5 h-5 mr-2 opacity-50" /> Map integration placeholder
                </div>
              </div>
            </AnimatedStep>

            <AnimatedStep step={step} currentStep={2}>
              <div className="space-y-5">
                <div>
                  <Label className="text-foreground font-medium">Upload Evidence (optional)</Label>
                  <div className="mt-1.5 border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/40 transition-all duration-300 cursor-pointer hover:bg-primary/[0.02]">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Drag & drop images/videos or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 10MB each. JPG, PNG, MP4 supported.</p>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                  <h3 className="font-heading font-semibold text-foreground mb-3">📋 Review Summary</h3>
                  <div className="grid grid-cols-2 gap-y-2.5 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="text-foreground font-medium">{form.category ? categoryLabels[form.category.replace('_', '-') as keyof typeof categoryLabels] || form.category : '—'}</span>
                    <span className="text-muted-foreground">Title:</span>
                    <span className="text-foreground font-medium">{form.title || '—'}</span>
                    <span className="text-muted-foreground">Priority:</span>
                    <span className="text-foreground font-medium">{priorityLabels[form.priority]}</span>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground font-medium">{form.location || '—'}</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.anonymous} onChange={(e) => setForm({ ...form, anonymous: e.target.checked })} className="rounded" />
                  <span className="text-muted-foreground">Submit anonymously (limited tracking)</span>
                </label>
              </div>
            </AnimatedStep>

            <div className="flex justify-between mt-8 pt-6 border-t border-border/50">
              <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="shadow-sm">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-primary text-primary-foreground shadow-sm" disabled={step === 0 && (!form.category || !form.title)}>
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm" disabled={loading || !form.title || !form.description}>
                  {loading ? 'Submitting...' : 'Submit Grievance'} <Check className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

function AnimatedStep({ step, currentStep, children }: { step: number; currentStep: number; children: React.ReactNode }) {
  if (step !== currentStep) return null;
  return (
    <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
      {children}
    </motion.div>
  );
}
