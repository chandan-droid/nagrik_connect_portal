import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Upload, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { categoryLabels, type GrievanceCategory } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';

const stepTitles = ['Category & Title', 'Details & Location', 'Attachments & Review'];

export default function SubmitGrievance() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '',
    category: '' as GrievanceCategory | '',
    description: '',
    location: '',
    name: '',
    email: '',
    phone: '',
    anonymous: false,
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = () => {
    const ticketId = `NGP-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    toast({
      title: 'Grievance Submitted!',
      description: `Your ticket ID is ${ticketId}. You can track it from your dashboard.`,
    });
    navigate('/citizen');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-10 flex-1 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-2">File a Grievance</h1>
          <p className="text-muted-foreground text-sm mb-8">Help us address your concern. Fill in the details below.</p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {stepTitles.map((title, i) => (
              <div key={i} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i < step ? 'bg-secondary text-secondary-foreground' : i === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {i < step ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs text-muted-foreground hidden sm:block truncate">{title}</span>
                {i < 2 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-secondary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>

          <div className="elevated-card p-6 md:p-8">
            {step === 0 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-foreground">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as GrievanceCategory })}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground">Title of Problem</Label>
                  <Input className="mt-1.5" placeholder="Brief title describing the issue" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label className="text-foreground">Your Name</Label>
                  <Input className="mt-1.5" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Email</Label>
                    <Input className="mt-1.5" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <Label className="text-foreground">Phone</Label>
                    <Input className="mt-1.5" type="tel" placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-foreground">Description</Label>
                  <Textarea className="mt-1.5 min-h-[120px]" placeholder="Provide a detailed description of the problem..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div>
                  <Label className="text-foreground">Location</Label>
                  <div className="relative mt-1.5">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Enter address or landmark" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 h-48 flex items-center justify-center text-sm text-muted-foreground">
                  <MapPin className="w-5 h-5 mr-2" /> Map integration placeholder
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <Label className="text-foreground">Upload Evidence (optional)</Label>
                  <div className="mt-1.5 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/40 transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Drag & drop images/videos or click to browse</p>
                    <p className="text-xs text-muted-foreground mt-1">Max 10MB each. JPG, PNG, MP4 supported.</p>
                  </div>
                </div>
                <div className="elevated-card p-4 space-y-2">
                  <h3 className="font-heading font-semibold text-foreground">Review Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="text-foreground font-medium">{form.category ? categoryLabels[form.category] : '—'}</span>
                    <span className="text-muted-foreground">Title:</span>
                    <span className="text-foreground font-medium">{form.title || '—'}</span>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground font-medium">{form.name || '—'}</span>
                    <span className="text-muted-foreground">Location:</span>
                    <span className="text-foreground font-medium">{form.location || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              {step < 2 ? (
                <Button onClick={() => setStep(step + 1)} className="bg-primary text-primary-foreground">
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                  Submit Grievance <Check className="w-4 h-4 ml-1" />
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
