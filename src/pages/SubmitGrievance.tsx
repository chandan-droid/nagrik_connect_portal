import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Upload, ArrowLeft, ArrowRight, Check, Sparkles,
  Droplets, Bolt, Truck, BookOpen, HeartPulse, Shield, Building2,
  AlertCircle, X, FileImage, Info, LocateFixed, Navigation, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { categoryLabels } from '@/lib/mock-data';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { addLocalGrievance, getAllLocalGrievances, type LocalGrievance } from '@/lib/local-grievances';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// Leaflet
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

type GrievanceCategory = 'water' | 'electricity' | 'roads' | 'sanitation' | 'public_safety' | 'education' | 'healthcare' | 'other';
type GrievancePriority = 'low' | 'medium' | 'high' | 'critical';

const stepTitles = ['Category & Type', 'Details & Location', 'Evidence', 'Review & Submit'];

const categoryIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  water: { icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-500/10 border-blue-500/30' },
  electricity: { icon: Bolt, color: 'text-amber-600', bg: 'bg-amber-500/10 border-amber-500/30' },
  roads: { icon: Truck, color: 'text-orange-600', bg: 'bg-orange-500/10 border-orange-500/30' },
  sanitation: { icon: Building2, color: 'text-green-600', bg: 'bg-green-500/10 border-green-500/30' },
  public_safety: { icon: Shield, color: 'text-red-600', bg: 'bg-red-500/10 border-red-500/30' },
  education: { icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-500/10 border-purple-500/30' },
  healthcare: { icon: HeartPulse, color: 'text-pink-600', bg: 'bg-pink-500/10 border-pink-500/30' },
  other: { icon: Sparkles, color: 'text-gray-600', bg: 'bg-gray-500/10 border-gray-500/30' },
};

const priorityConfig: Record<GrievancePriority, { label: string; desc: string; color: string }> = {
  low: { label: 'Low', desc: 'Non-urgent, can wait 7-10 days', color: 'border-border text-muted-foreground' },
  medium: { label: 'Medium', desc: 'Needs attention within 5-7 days', color: 'border-blue-500/40 text-blue-600' },
  high: { label: 'High', desc: 'Urgent, needs attention within 3 days', color: 'border-amber-500/40 text-amber-600' },
  critical: { label: 'Critical', desc: 'Emergency — immediate action required', color: 'border-destructive/40 text-destructive' },
};

// Map Utilities
function deg2rad(deg: number) { return deg * (Math.PI/180); }
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2-lat1); 
  const dLon = deg2rad(lon2-lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; 
}

// Icons
const primaryMarkerIcon = L.divIcon({
  className: 'custom-map-marker-primary',
  html: `<div style="color: hsl(0, 84%, 60%); display: flex; justify-content: center; align-items: center; width: 36px; height: 36px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="hsl(0, 84%, 60%)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

const secondaryMarkerIcon = L.divIcon({
  className: 'custom-map-marker-secondary',
  html: `<div style="color: hsl(215, 90%, 55%); display: flex; justify-content: center; align-items: center; width: 24px; height: 24px; opacity: 0.85;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="hsl(215, 90%, 55%)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});

// Map Logic Sub-components
function MapController({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { animate: true, duration: 1 });
  }, [position, map]);
  return null;
}

function MapClicker({ onPositionChange }: { onPositionChange: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function SubmitGrievance() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ file: File; url: string }[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [nearbyTickets, setNearbyTickets] = useState<LocalGrievance[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const fallbackMapCenter: [number, number] = [20.5937, 78.9629]; // Center of India
  
  const [form, setForm] = useState({
    title: '',
    category: '' as GrievanceCategory | '',
    description: '',
    location: '',
    coordinates: null as [number, number] | null,
    priority: 'medium' as GrievancePriority,
    anonymous: false,
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Geo-Search Effect
  useEffect(() => {
    if (!form.coordinates) {
      setNearbyTickets([]);
      return;
    }
    const all = getAllLocalGrievances();
    const active = all.filter(g => ['submitted', 'under_review', 'in_progress'].includes(g.status));
    
    // Find tickets within 2km threshold
    const nearby = active.filter(g => {
      if (!g.coordinates) return false;
      const dist = getDistanceFromLatLonInKm(
        form.coordinates![0], form.coordinates![1],
        g.coordinates[0], g.coordinates[1]
      );
      return dist <= 2.0; 
    });
    
    setNearbyTickets(nearby);
  }, [form.coordinates]);

  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({ title: "GeoLocation Disabled", description: "Browser does not support location.", variant: "destructive" });
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({ ...prev, coordinates: [pos.coords.latitude, pos.coords.longitude] }));
        setErrors(prev => ({ ...prev, location: '' }));
        setIsLocating(false);
        toast({ title: "Location Found", description: "Your pin has been successfully dropped." });
      },
      (err) => {
        toast({ title: "Location Denied", description: "Please manually click on the map to pin your location.", variant: "destructive" });
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const validateStep = (s: number) => {
    const errs: Record<string, string> = {};
    if (s === 0) {
      if (!form.category) errs.category = 'Please select a category';
      if (!form.title.trim()) errs.title = 'Title is required';
      if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters';
    }
    if (s === 1) {
      if (!form.description.trim()) errs.description = 'Description is required';
      if (form.description.trim().length < 20) errs.description = 'Please provide at least 20 characters of description';
      if (!form.coordinates && !form.location.trim()) errs.location = 'Please pin the location on the map or type an address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(Math.min(3, step + 1));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.size <= 10 * 1024 * 1024);
    if (valid.length < files.length) {
      toast({ title: 'Some files skipped', description: 'Files exceeding 10MB were not added.', variant: 'destructive' });
    }
    const newFiles = valid.map(file => ({
      file,
      url: URL.createObjectURL(file) // Create local blob URL for preview/storage simulation
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => uploadedFiles.forEach(f => URL.revokeObjectURL(f.url));
  }, [uploadedFiles]);

  const handleSubmit = async () => {
    if (!user || !form.category) return;
    setLoading(true);
    try {
      const created = addLocalGrievance({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        coordinates: form.coordinates || undefined,
        images: uploadedFiles.map(f => f.url),
        priority: form.priority,
        citizenId: user.id,
        anonymous: form.anonymous,
      });
      toast({
        title: '✅ Grievance Submitted!',
        description: `Ticket ID: ${created.ticket_id}. You can track it from your dashboard.`,
      });
      navigate('/citizen');
    } catch {
      toast({ title: 'Submission Failed', description: 'Unable to save grievance. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [Sparkles, MapPin, Upload, Check];

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main bg-muted/10">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">File a Grievance</h1>
            <p className="text-xs text-muted-foreground">Report civic issues directly to the authorities</p>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              
              {/* Progress stepper */}
              <div className="flex items-center gap-2 mb-8">
                {stepTitles.map((title, i) => {
                  const StepIcon = stepIcons[i];
                  const done = i < step;
                  const current = i === step;
                  return (
                    <div key={i} className="flex items-center gap-2 flex-1">
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-400 shadow-sm',
                        done ? 'gradient-emerald text-white scale-95' :
                        current ? 'gradient-primary text-white ring-4 ring-primary/20 scale-105' :
                        'bg-muted border border-border text-muted-foreground'
                      )}>
                        {done ? <Check className="w-4 h-4" /> : <StepIcon className="w-4 h-4" />}
                      </div>
                      <span className={cn('text-[11px] font-semibold hidden sm:block truncate', current ? 'text-foreground' : 'text-muted-foreground')}>{title}</span>
                      {i < 3 && <div className={cn('flex-1 h-0.5 rounded-full transition-all duration-400 min-w-[8px]', i < step ? 'bg-secondary' : 'bg-border')} />}
                    </div>
                  );
                })}
              </div>

              {/* Form card */}
              <div className="elevated-card bg-card p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {/* Step 0: Category & Type */}
                  {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-6">
                      <div>
                        <p className="form-label mb-3">Select Category *</p>
                        {errors.category && <p className="form-error mb-2"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {Object.entries(categoryIcons).map(([key, cfg]) => {
                            const CatIcon = cfg.icon;
                            const active = form.category === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => { setForm({ ...form, category: key as GrievanceCategory }); setErrors({ ...errors, category: '' }); }}
                                className={cn(
                                  'flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm',
                                  active ? `${cfg.bg} ${cfg.color} shadow-sm border-current` : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30 hover:bg-muted/30'
                                )}
                              >
                                <CatIcon className={cn('w-6 h-6 transition-transform', active ? cfg.color : 'text-muted-foreground')} />
                                {categoryLabels[key.replace('_', '-') as keyof typeof categoryLabels] || key}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="form-field">
                        <Label className="form-label">Grievance Title *</Label>
                        <Input
                          className={cn('mt-1.5 h-11', errors.title ? 'border-destructive' : '')}
                          placeholder="Brief title describing the issue (min 5 chars)"
                          value={form.title}
                          maxLength={120}
                          onChange={(e) => { setForm({ ...form, title: e.target.value }); setErrors({ ...errors, title: '' }); }}
                        />
                        <div className="flex items-center justify-between mt-1">
                          {errors.title ? <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.title}</p> : <span />}
                          <span className="text-xs text-muted-foreground">{form.title.length}/120</span>
                        </div>
                      </div>

                      <div className="form-field">
                        <Label className="form-label">Priority Level</Label>
                        <div className="grid grid-cols-2 gap-2.5 mt-1.5">
                          {(Object.keys(priorityConfig) as GrievancePriority[]).map((p) => {
                            const pc = priorityConfig[p];
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setForm({ ...form, priority: p })}
                                className={cn(
                                  'flex flex-col items-start gap-0.5 p-3 rounded-xl border-2 text-left transition-all',
                                  form.priority === p ? `border-current ${pc.color} bg-current/5` : 'border-border bg-muted/10 text-muted-foreground hover:border-primary/30'
                                )}
                              >
                                <span className="text-sm font-semibold">{pc.label}</span>
                                <span className="text-[11px] opacity-70 leading-tight">{pc.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 1: Details & Location */}
                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-6">
                      <div className="form-field">
                        <div className="flex items-center justify-between">
                          <Label className="form-label">Detailed Description *</Label>
                          <span className="text-xs text-muted-foreground">{form.description.length}/2000</span>
                        </div>
                        <Textarea
                          className={cn('mt-1.5 min-h-[120px] resize-none text-sm', errors.description ? 'border-destructive' : '')}
                          placeholder="Describe the problem in detail..."
                          value={form.description}
                          maxLength={2000}
                          onChange={(e) => { setForm({ ...form, description: e.target.value }); setErrors({ ...errors, description: '' }); }}
                        />
                        {errors.description && <p className="form-error mt-1"><AlertCircle className="w-3 h-3" />{errors.description}</p>}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Label className="form-label mb-0">Pin Geo-Location *</Label>
                            {form.coordinates && (
                              <span className="text-[10px] ml-2 inline-block font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                {form.coordinates[0].toFixed(4)}, {form.coordinates[1].toFixed(4)}
                              </span>
                            )}
                          </div>
                          <Button type="button" size="sm" variant="outline" onClick={handleLocateMe} disabled={isLocating} className="h-8 shadow-sm">
                            {isLocating ? <span className="animate-spin w-3 h-3 border-2 border-foreground border-t-transparent rounded-full mr-2" /> : <Navigation className="w-3.5 h-3.5 mr-1.5 text-primary" />}
                            Locate Me
                          </Button>
                        </div>
                        
                        <div className="relative h-[250px] w-full rounded-2xl overflow-hidden border-2 border-border shadow-sm">
                          <MapContainer 
                            center={form.coordinates || fallbackMapCenter} 
                            zoom={form.coordinates ? 15 : 4} 
                            style={{ height: '100%', width: '100%', zIndex: 1 }}
                          >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                            <MapClicker onPositionChange={(pos) => { setForm({ ...form, coordinates: pos }); setErrors({ ...errors, location: '' }); }} />
                            <MapController position={form.coordinates} />
                            
                            {/* Primary Pin */}
                            {form.coordinates && <Marker position={form.coordinates} icon={primaryMarkerIcon} />}
                            
                            {/* Nearby Open Grievances */}
                            {nearbyTickets.map((tc) => (
                              <Marker key={tc.id} position={tc.coordinates!} icon={secondaryMarkerIcon}>
                                <Popup className="text-xs">
                                  <strong>{tc.ticket_id}</strong><br/>
                                  {tc.title}<br/>
                                  <span className="uppercase text-[10px] text-muted-foreground">{tc.status.replace('_',' ')}</span>
                                </Popup>
                              </Marker>
                            ))}
                          </MapContainer>
                          {!form.coordinates && (
                            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-background/30 pointer-events-none backdrop-blur-[1px]">
                              <div className="px-4 py-2 bg-card rounded-full shadow-lg border border-border flex items-center gap-2">
                                <LocateFixed className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold">Click map to drop a pin</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {nearbyTickets.length > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex gap-3 text-sm text-blue-700 dark:text-blue-400">
                             <Map className="w-5 h-5 shrink-0 mt-0.5" />
                             <div>
                               <strong>{nearbyTickets.length} open ticket(s) found near your location.</strong>
                               <p className="opacity-80 text-xs mt-0.5">Check the blue pins on the map above to ensure you are not submitting a duplicate grievance for the same issue.</p>
                             </div>
                          </motion.div>
                        )}

                        {errors.location && <p className="form-error mt-1"><AlertCircle className="w-3 h-3" />{errors.location}</p>}

                        <div className="form-field pt-2">
                          <Label className="form-label">Street Address / Landmark</Label>
                          <div className="relative mt-1.5">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              className="pl-10 h-11 text-sm"
                              placeholder="Nearest landmark or exact address..."
                              value={form.location}
                              onChange={(e) => { setForm({ ...form, location: e.target.value }); setErrors({ ...errors, location: '' }); }}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Evidence upload */}
                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-6">
                      <div>
                        <p className="form-label mb-1">Upload Photo Evidence <span className="text-muted-foreground font-normal">(optional)</span></p>
                        <p className="text-xs text-muted-foreground mb-3">Attach vivid photos to ensure prompt verification. Max 5 images.</p>

                        <div
                          className={cn(
                            'border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer',
                            dragOver ? 'border-primary/60 bg-primary/5' : 'border-border/70 bg-muted/10 hover:border-primary/40 hover:bg-muted/30'
                          )}
                          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFileUpload(e.dataTransfer.files); }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="w-10 h-10 text-primary/40 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-foreground">Drag & drop photos here</p>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG — Max 10MB each</p>
                        </div>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" multiple onChange={(e) => handleFileUpload(e.target.files)} />

                        {uploadedFiles.length > 0 && (
                          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {uploadedFiles.map((fileObj, i) => (
                              <div key={i} className="relative group rounded-xl overflow-hidden border border-border aspect-video bg-muted">
                                <img src={fileObj.url} alt={`Upload ${i}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                  <button onClick={() => setUploadedFiles((prev) => prev.filter((_, j) => j !== i))} className="p-2 rounded-full bg-destructive text-white hover:scale-110 transition-transform shadow-md">
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <label className="flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-card cursor-pointer hover:bg-muted/10 transition-colors shadow-sm">
                        <input
                          type="checkbox"
                          checked={form.anonymous}
                          onChange={(e) => setForm({ ...form, anonymous: e.target.checked })}
                          className="mt-0.5 rounded cursor-pointer"
                        />
                        <div>
                          <p className="text-sm font-bold text-foreground">Submit Anonymously</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Your identity will be hidden from the public and field officers. Note: You will have limited direct communication capabilities.</p>
                        </div>
                      </label>
                    </motion.div>
                  )}

                  {/* Step 3: Review & Submit */}
                  {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="space-y-5">
                      <div className="flex items-center gap-3 text-sm text-info bg-info/10 border border-info/20 rounded-xl px-4 py-3">
                        <Info className="w-5 h-5 shrink-0" />
                        <span className="font-medium text-info-foreground">Please review your grievance carefully before submitting. Content cannot be edited post-submission.</span>
                      </div>

                      <div className="rounded-2xl border border-border bg-card shadow-sm divide-y divide-border/60">
                        {[
                          { label: 'Category', value: categoryLabels[form.category!.replace('_', '-') as keyof typeof categoryLabels] || form.category },
                          { label: 'Title', value: form.title || '—' },
                          { label: 'Priority', value: priorityConfig[form.priority].label },
                          { label: 'Location', value: form.location || (form.coordinates ? `${form.coordinates[0].toFixed(4)}, ${form.coordinates[1].toFixed(4)}` : 'Not specified') },
                          { label: 'Anonymous', value: form.anonymous ? 'Yes' : 'No' },
                          { label: 'Evidence', value: uploadedFiles.length > 0 ? `${uploadedFiles.length} photo(s) attached` : 'None' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                            <span className="text-xs font-semibold text-muted-foreground w-28 shrink-0">{label}</span>
                            <span className="text-sm text-foreground font-medium flex-1">{value}</span>
                          </div>
                        ))}
                        {form.description && (
                          <div className="px-5 py-4 bg-muted/5">
                            <span className="text-xs font-semibold text-muted-foreground block mb-2">Description</span>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{form.description}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Navigation buttons */}
                <div className="flex justify-between mt-8 pt-6 border-t border-border">
                  <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="shadow-sm border-border">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  {step < 3 ? (
                    <Button onClick={handleNext} className="gradient-primary text-white shadow-md font-semibold px-6">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button onClick={handleSubmit} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md font-semibold px-6" disabled={loading || !form.title || !form.description || !form.category}>
                      {loading ? (
                        <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" /> Submitting...</span>
                      ) : (
                        <><Check className="w-4 h-4 mr-2" /> Submit Grievance</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
