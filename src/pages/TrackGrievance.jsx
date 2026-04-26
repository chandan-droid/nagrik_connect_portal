import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigate } from "react-router-dom";
import { Search, CheckCircle2, Clock, AlertCircle, XCircle, FileText, MapPin, Calendar, Share2, Copy, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import StatusBadge from "@/components/grievance/StatusBadge";
import { statusLabels } from "@/lib/mock-data";
import { trackPublicGrievance } from "@/lib/api/public";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useRbac } from "@/hooks/use-rbac";

function normalizeStatus(s) {
  if (s === "under_review") return "under-review";
  if (s === "in_progress") return "in-progress";
  return s;
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getLocationLines(grievance) {
  const location = grievance.locationDetails || {};
  const lines = [location.area, location.city, location.state].filter(Boolean);
  if (location.pincode) lines.push(`PIN ${location.pincode}`);
  return lines;
}

const statusOrder = ["submitted", "under-review", "in-progress", "resolved", "closed"];
const statusIcons = {
  submitted: FileText,
  "under-review": Clock,
  "in-progress": AlertCircle,
  resolved: CheckCircle2,
  closed: XCircle
};

const statusStepColors = {
  submitted: "bg-info text-info-foreground",
  "under-review": "bg-accent text-accent-foreground",
  "in-progress": "bg-primary text-primary-foreground",
  resolved: "bg-secondary text-secondary-foreground",
  closed: "bg-muted text-muted-foreground"
};

const getTimelineColors = (status) => {
  const s = normalizeStatus(status);
  switch (s) {
    case "submitted": return { border: "border-info/50", bg: "bg-info/10", text: "text-info" };
    case "under-review": return { border: "border-accent/50", bg: "bg-accent/10", text: "text-accent" };
    case "in-progress": return { border: "border-primary/50", bg: "bg-primary/10", text: "text-primary" };
    case "resolved": return { border: "border-secondary/50", bg: "bg-secondary/10", text: "text-secondary" };
    case "closed": return { border: "border-destructive/50", bg: "bg-destructive/10", text: "text-destructive" };
    default: return { border: "border-primary/30", bg: "bg-primary/5", text: "text-primary/50" };
  }
};

export default function TrackGrievance() {
  const [ticketId, setTicketId] = useState("");
  const [found, setFound] = useState(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { primaryRole } = useRbac();

  if (user) {
    if (primaryRole === "citizen") return <Navigate to="/citizen/track" replace />;
    if (primaryRole === "admin") return <Navigate to="/admin" replace />;
    if (primaryRole === "officer") return <Navigate to="/officer" replace />;
  }

  const buildFallbackTimeline = (grievance) => [
    {
      id: `t1-${grievance.id}`,
      message: "Grievance submitted successfully by citizen",
      timestamp: grievance.created_at || new Date().toISOString(),
      by: "System",
      status: "submitted"
    },
    {
      id: `t2-${grievance.id}`,
      message: "Assigned to concerned department for review",
      timestamp: grievance.created_at ? new Date(new Date(grievance.created_at).getTime() + 2 * 60 * 60 * 1000).toISOString() : new Date().toISOString(),
      by: "Auto-Router",
      status: "under-review"
    }
  ];

  const toViewModel = (grievance, timeline = []) => {
    const mappedTimeline = timeline.map((item) => ({
      id: item.id,
      message: item.message,
      timestamp: item.created_at || item.timestamp || new Date().toISOString(),
      by: item.created_by || item.by || "System",
      status: item.status || "under-review"
    }));

    const finalTimeline = mappedTimeline.length > 0 ? mappedTimeline : buildFallbackTimeline(grievance);
    
    finalTimeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      id: grievance.id,
      ticketId: grievance.ticket_id || grievance.ticketId,
      title: grievance.title,
      description: grievance.description,
      location: grievance.location || grievance.location_label,
      locationDetails: grievance.location_details || grievance.locationDetails || null,
      status: normalizeStatus(grievance.status),
      attachments: Array.isArray(grievance.attachments) ? grievance.attachments : [],
      timeline: finalTimeline
    };
  };

  const handleSearch = async () => {
    if (!ticketId.trim()) return;
    setSearching(true);
    setSearched(false);

    try {
      const response = await trackPublicGrievance(ticketId.trim());
      if (response && response.grievance) {
        setFound(toViewModel(response.grievance, response.timeline));
      } else {
        setFound(null);
      }
    } catch (error) {
      console.error("Error tracking grievance:", error);
      setFound(null);
    } finally {
      setSearched(true);
      setSearching(false);
    }
  };

  const copyTicketId = () => {
    if (found) {
      navigator.clipboard.writeText(found.ticketId).then(() => {
        toast({ title: "Copied!", description: "Ticket ID copied to clipboard." });
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="gradient-hero py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        
        <div className="container mx-auto max-w-2xl relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-semibold mb-5 border border-white/10">
              <Search className="w-3.5 h-3.5" />
              Public Ticket Tracking
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
              Track Your Grievance
            </h1>
            <p className="text-white/60 mb-8 text-base">
              No login required. Enter your unique ticket ID to see real-time status updates and timeline.
            </p>
            
            <div className="relative flex gap-2 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  className="pl-10 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary focus-visible:border-white/40 text-base"
                  placeholder="e.g. NGP-2026-0001"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searching || !ticketId.trim()}
                className="h-12 px-6 bg-secondary text-white hover:bg-secondary/90 font-semibold shadow-lg"
              >
                {searching ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Track"}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className={cn("container mx-auto px-4 py-10 flex-1 transition-all duration-500", found ? "max-w-5xl lg:max-w-6xl" : "max-w-2xl")}>
        <AnimatePresence mode="wait">
          {searched && !found && !searching && (
            <motion.div
              key="notfound"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="elevated-card p-10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="font-heading font-semibold text-foreground text-lg mb-2">Ticket Not Found</h3>
              <p className="text-muted-foreground text-sm mb-2">
                No grievance found with ticket ID: <strong className="font-mono">{ticketId}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Double-check the ID format (e.g. <span className="font-mono">NGP-2026-0001</span>) or try filing a new grievance.
              </p>
            </motion.div>
          )}

          {found && (
            <motion.div
              key="found"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start"
            >
              {/* Left Column: Details */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                <div className="elevated-card overflow-hidden">
                <div className="gradient-hero px-6 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-white/70 bg-white/10 px-2.5 py-1 rounded-lg">
                          {found.ticketId}
                        </span>
                        <button onClick={copyTicketId} className="text-white/40 hover:text-white transition-colors">
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h2 className="font-heading font-bold text-white text-xl">{found.title}</h2>
                    </div>
                    <StatusBadge status={found.status} />
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <div className="flex gap-1 mb-2">
                      {statusOrder.map((s, i) => {
                        const ci = statusOrder.indexOf(found.status);
                        const done = i < ci;
                        const active = i === ci;
                        const SIcon = statusIcons[s];
                        return (
                          <div key={s} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all",
                                active ? statusStepColors[s] + " shadow-md scale-110" : done ? "bg-secondary text-white" : "bg-muted text-muted-foreground"
                              )}
                            >
                              {done ? <CheckCircle2 className="w-4 h-4" /> : <SIcon className="w-3.5 h-3.5" />}
                            </div>
                            <span className={cn("text-[9px] text-center leading-tight hidden sm:block", active ? "text-foreground font-semibold" : "text-muted-foreground")}>
                              {statusLabels[s]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-0.5 mt-1">
                      {statusOrder.map((s, i) => {
                        const ci = statusOrder.indexOf(found.status);
                        return <div key={s} className={cn("flex-1 h-1.5 rounded-full transition-all", i <= ci ? "bg-secondary" : "bg-muted")} />;
                      })}
                    </div>
                  </div>

                  {found.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                      {found.description}
                    </p>
                  )}

                  {found.location && (
                    <div className="flex items-center gap-2.5 text-sm text-muted-foreground bg-muted/40 rounded-xl px-3 py-2.5">
                      <MapPin className="w-4 h-4 text-primary shrink-0" /> {found.location}
                    </div>
                  )}

                  {getLocationLines(found).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getLocationLines(found).map((line) => (
                        <span key={line} className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/60">
                          {line}
                        </span>
                      ))}
                    </div>
                  )}

                  {found.attachments && found.attachments.length > 0 && (
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Attachments</h4>
                      <div className="space-y-2">
                        {found.attachments.map((attachment) => (
                          <a
                            key={attachment.id}
                            href={attachment.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2 hover:bg-background transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{attachment.file_name}</p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                {attachment.file_type || "File"}
                                {attachment.file_size ? ` · ${formatFileSize(attachment.file_size)}` : ""}
                              </p>
                            </div>
                            <span className="text-[11px] font-semibold text-primary shrink-0">Open</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={copyTicketId}>
                    <Share2 className="w-4 h-4" /> Share Ticket Status
                  </Button>
                </div>
              </div>
              </div>

              {/* Right Column: Timeline */}
              <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8">
                <div className="elevated-card p-6 border border-border/50 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                  <h3 className="font-heading font-semibold text-foreground mb-6 flex items-center gap-2 relative z-10">
                    <Activity className="w-5 h-5 text-primary" />
                    Activity Timeline
                  </h3>
                <div className="space-y-0 relative">
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-border/50 z-0" />
                  {found.timeline.map((event, i) => {
                    const colors = getTimelineColors(event.status);
                    return (
                      <div key={event.id} className="pb-6 relative z-10 flex gap-4 items-start">
                        <div className={cn("w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 bg-background relative z-10", colors.border)}>
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center", colors.bg)}>
                            <CheckCircle2 className={cn("w-3.5 h-3.5", colors.text)} />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <p className="text-sm font-semibold text-foreground">{event.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{new Date(event.timestamp).toLocaleString("en-IN")}</p>
                            <span className="text-muted-foreground/30">·</span>
                            <p className="text-xs text-muted-foreground">{event.by}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!searched && !searching && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 text-muted-foreground">
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-5">
              <Search className="w-10 h-10 text-muted-foreground/30" />
            </div>
            <p className="text-lg font-heading font-semibold text-foreground">Enter your ticket ID above</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
              Ticket IDs are shared via SMS/email when you submit a grievance. Format: <span className="font-mono">NGP-2026-XXXX</span>
            </p>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
