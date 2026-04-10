import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Building2, ArrowLeft, Star, CheckCircle2,
  Share2, MessageSquare, Tag, Calendar, AlertTriangle, FileImage, ExternalLink, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import StatusBadge from '@/components/grievance/StatusBadge';
import { categoryLabels } from '@/lib/mock-data';
import {
  getLocalGrievanceById,
  getLocalTimelineByGrievanceId,
  type LocalGrievance,
  type LocalTimelineEvent,
} from '@/lib/local-grievances';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

// Leaflet
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const statusOrder = ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'];
const statusDisplay: Record<string, string> = {
  submitted: 'Submitted', under_review: 'Under Review', in_progress: 'In Progress', resolved: 'Resolved', closed: 'Closed',
};

const customIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `<div style="color: hsl(0, 84%, 60%); display: flex; justify-content: center; align-items: center; width: 36px; height: 36px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="hsl(0, 84%, 60%)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange?.(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className={cn('transition-transform hover:scale-110', onChange ? 'cursor-pointer' : 'cursor-default')}
        >
          <Star className={`w-6 h-6 ${s <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

export default function GrievanceDetail() {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [grievance, setGrievance] = useState<LocalGrievance | null>(null);
  const [timeline, setTimeline] = useState<LocalTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    setGrievance(getLocalGrievanceById(id));
    setTimeline(getLocalTimelineByGrievanceId(id));
    setLoading(false);
  }, [id]);

  const copyTicketId = () => {
    if (grievance) {
      navigator.clipboard.writeText(grievance.ticket_id).then(() => {
        toast({ title: 'Copied!', description: 'Ticket ID copied to clipboard.' });
      });
    }
  };

  const handleFeedback = () => {
    if (!userRating) { toast({ title: 'Please rate the service', variant: 'destructive' }); return; }
    setFeedbackSubmitted(true);
    toast({ title: '✅ Feedback Submitted', description: 'Thank you for rating our service!' });
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="dashboard-main flex items-center justify-center bg-muted/10">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </main>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="dashboard-main bg-muted/10">
          <div className="dashboard-topbar">
            <div>
              <h1 className="font-heading font-bold text-lg text-foreground">Ticket Details</h1>
            </div>
            <Link to="/citizen/tickets"><Button variant="outline" size="sm">Back to List</Button></Link>
          </div>
          <div className="p-8 text-center flex flex-col items-center justify-center min-h-[50vh]">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-2">Grievance Not Found</h2>
            <p className="text-muted-foreground mb-6">The item you're looking for doesn't exist or may have been removed.</p>
            <Link to="/citizen/tickets"><Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Tickets</Button></Link>
          </div>
        </main>
      </div>
    );
  }

  const currentIdx = statusOrder.indexOf(grievance.status);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main bg-muted/10 relative">
        <div className="dashboard-topbar justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
             <Link to="/citizen/tickets" className="hidden sm:flex text-muted-foreground hover:text-foreground shrink-0 border border-border/60 bg-muted/30 p-2 rounded-lg transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-semibold text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded cursor-pointer hover:bg-muted/70 transition-colors" onClick={copyTicketId} title="Click to copy">
                  {grievance.ticket_id}
                </span>
                <StatusBadge status={grievance.status.replace('_', '-') as any} />
              </div>
              <h1 className="font-heading font-bold text-lg text-foreground truncate">{grievance.title}</h1>
            </div>
            <Button variant="outline" size="sm" className="gap-2 shrink-0 hidden sm:flex" onClick={copyTicketId}>
              <Share2 className="w-4 h-4" /> Share URL
            </Button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Main Info Card */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="elevated-card bg-card overflow-hidden">
              <div className={cn("px-6 py-4 border-b", grievance.status === 'resolved' ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/30 border-border/50")}>
                {/* Step progress bar */}
                <div>
                  <div className="flex gap-1.5 mb-2">
                    {statusOrder.map((s, i) => (
                      <div key={s} className={cn('flex-1 h-3 rounded-full transition-all duration-500 shadow-sm', i <= currentIdx ? (grievance.status === 'resolved' ? 'bg-emerald-500' : 'bg-secondary') : 'bg-muted border border-border/50')} />
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px] font-semibold text-muted-foreground px-1">
                    {statusOrder.map((s, i) => (
                      <span key={s} className={cn(i <= currentIdx ? (grievance.status === 'resolved' ? 'text-emerald-700 dark:text-emerald-400' : 'text-foreground') : 'text-muted-foreground/50')}>
                        {statusDisplay[s]}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2.5 mb-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border border-border/60 shadow-sm">
                    <Tag className="w-3.5 h-3.5" />
                    {categoryLabels[grievance.category.replace('_', '-') as keyof typeof categoryLabels] || grievance.category}
                  </span>
                  <span className={cn(
                    'inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide',
                    grievance.priority === 'critical' ? 'priority-critical' :
                    grievance.priority === 'high' ? 'priority-high' :
                    grievance.priority === 'medium' ? 'priority-medium' : 'priority-low'
                  )}>
                    {grievance.priority} Priority
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-card text-muted-foreground border border-border">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(grievance.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-muted/10 border border-border/50 mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{grievance.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/60">
                   {/* Maps & Location Data */}
                   <div>
                     <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                       <MapPin className="w-4 h-4 text-primary" /> Location Intelligence
                     </h3>
                     
                     <div className="space-y-3">
                       {grievance.location && (
                          <div className="text-sm p-3 rounded-xl bg-muted/30 border border-border text-muted-foreground">
                            <span className="font-semibold text-foreground/80 block mb-0.5 text-xs uppercase tracking-wide">Address / Landmark</span>
                            {grievance.location}
                          </div>
                       )}
                       {grievance.coordinates && (
                         <div className="rounded-2xl overflow-hidden border-2 border-border shadow-sm h-[180px] w-full relative z-0">
                           <MapContainer 
                              center={grievance.coordinates} 
                              zoom={15} 
                              style={{ width: '100%', height: '100%' }}
                              zoomControl={false}
                              dragging={false}
                              scrollWheelZoom={false}
                              doubleClickZoom={false}
                           >
                             <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                             <Marker position={grievance.coordinates} icon={customIcon} />
                           </MapContainer>
                           <a 
                             href={`https://www.openstreetmap.org/?mlat=${grievance.coordinates[0]}&mlon=${grievance.coordinates[1]}#map=16/${grievance.coordinates[0]}/${grievance.coordinates[1]}`} 
                             target="_blank" rel="noreferrer"
                             className="absolute bottom-2 right-2 z-[999] bg-background/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-foreground border border-border flex items-center gap-1.5 hover:bg-muted transition-colors shadow-sm cursor-pointer"
                           >
                             <ExternalLink className="w-3 h-3" /> View Map
                           </a>
                         </div>
                       )}
                     </div>
                   </div>

                   {/* Photographic Evidence */}
                   <div>
                     <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                       <FileImage className="w-4 h-4 text-primary" /> Field Evidence
                     </h3>
                     {grievance.images && grievance.images.length > 0 ? (
                       <div className="grid grid-cols-2 gap-3">
                         {grievance.images.map((img, i) => (
                           <div key={i} className="aspect-video rounded-xl border border-border overflow-hidden bg-muted group cursor-pointer relative" onClick={() => setExpandedImage(img)}>
                             <img src={img} alt={`Evidence ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                               <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
                             </div>
                           </div>
                         ))}
                       </div>
                     ) : (
                       <div className="h-[180px] rounded-2xl border border-dashed border-border bg-muted/10 flex flex-col items-center justify-center text-muted-foreground">
                         <FileImage className="w-8 h-8 opacity-20 mb-2" />
                         <p className="text-xs">No photos attached</p>
                       </div>
                     )}
                   </div>
                </div>

              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Timeline */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-3 elevated-card bg-card p-6 md:p-8">
                <h2 className="font-heading font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" /> Activity Timeline
                </h2>
                {timeline.length === 0 ? (
                  <div className="text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-border">
                    <MessageSquare className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-foreground mb-1">No activity yet</p>
                    <p className="text-xs text-muted-foreground">Updates will appear here as your grievance progresses.</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {timeline.map((event, i) => (
                      <div key={event.id} className="timeline-item pb-7 group">
                        {i < timeline.length - 1 && <div className="timeline-line group-hover:bg-primary/20 transition-colors" />}
                        <div className={cn(
                          'timeline-dot z-10',
                          i === timeline.length - 1
                            ? 'border-secondary bg-secondary/10 shadow-sm shadow-secondary/20 ring-4 ring-secondary/5'
                            : 'border-primary/20 bg-card'
                        )}>
                          <CheckCircle2 className={cn('w-4 h-4', i === timeline.length - 1 ? 'text-secondary' : 'text-primary/40')} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5 pl-2">
                          <StatusBadge status={event.status.replace('_', '-') as any} />
                          <div className="mt-3 p-4 rounded-xl bg-muted/20 border border-border/50 group-hover:border-primary/20 transition-colors shadow-sm">
                            <p className="text-sm font-medium text-foreground leading-relaxed">{event.message}</p>
                            <p className="text-[11px] text-muted-foreground mt-2 font-mono bg-background inline-block px-2 py-0.5 rounded border border-border">
                              {new Date(event.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

               {/* Feedback section (shown if resolved) */}
               {['resolved', 'closed'].includes(grievance.status) && (
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
                  <div className="elevated-card p-6 border-emerald-500/20 bg-emerald-500/[0.02]">
                    <h2 className="font-heading font-bold text-lg text-foreground mb-1 flex items-center gap-2">
                      <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Rate Resolution
                    </h2>
                    <p className="text-xs text-muted-foreground mb-6">How satisfied are you with how this grievance was handled by our officers?</p>
                    
                    {feedbackSubmitted ? (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">Response Recorded</p>
                        <p className="text-xs text-emerald-600/70 mt-1">Thank you for your valuable feedback!</p>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <div className="flex justify-center p-3 bg-card rounded-xl border border-border shadow-sm">
                          <StarRating value={userRating} onChange={setUserRating} />
                        </div>
                        <div>
                          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Direct Comments <span className="font-normal opacity-70">(Optional)</span></Label>
                          <Textarea
                            className="min-h-[100px] resize-none text-sm bg-card"
                            placeholder="Share your experience or highlight any specific officers..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                          />
                        </div>
                        <Button 
                           onClick={handleFeedback} 
                           className="w-full gradient-primary text-white font-semibold shadow-md"
                           disabled={!userRating}
                        >
                          Submit Review
                        </Button>
                      </div>
                    )}
                  </div>
                 </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Image Lightbox */}
      <AnimatePresence>
        {expandedImage && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setExpandedImage(null)}
          >
            <button className="absolute top-6 right-6 p-2 rounded-full bg-muted/50 text-foreground hover:bg-destructive hover:text-white transition-colors" onClick={() => setExpandedImage(null)}>
               <X className="w-6 h-6" />
            </button>
            <motion.img 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              src={expandedImage} 
              alt="Expanded evidence" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
