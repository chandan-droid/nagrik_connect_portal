import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  CalendarClock, 
  FileText, 
  MapPin, 
  Search, 
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  Paperclip
} from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/grievance/StatusBadge";
import { categoryLabels } from "@/lib/mock-data";
import { assignOfficerToGrievance, getAllAdminGrievances, getAdminGrievanceDetail, getAllOfficers } from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function parseDate(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminGrievances() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [grievances, setGrievances] = useState([]);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(searchParams.get("id") || "");
  
  const [grievanceDetail, setGrievanceDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [officers, setOfficers] = useState([]);

  const [officerId, setOfficerId] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const { toast } = useToast();

  const loadGrievances = async () => {
    try {
      const [list, officerList] = await Promise.all([
        getAllAdminGrievances(),
        getAllOfficers()
      ]);
      const sorted = [...list].sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
      setGrievances(sorted);
      setOfficers(Array.isArray(officerList) ? officerList : []);
      const queryId = searchParams.get("id");
      if (queryId) {
        setSelectedId(queryId);
      } else if (!selectedId && sorted.length > 0) {
        setSelectedId(sorted[0]?.id || "");
      }
    } catch {
      setGrievances([]);
      if (!selectedId) setSelectedId("");
    }
  };

  useEffect(() => {
    let mounted = true;
    async function initialize() {
      setLoading(true);
      try {
        const [list, officerList] = await Promise.all([
          getAllAdminGrievances(),
          getAllOfficers()
        ]);
        const sorted = [...list].sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
        if (!mounted) return;
        setGrievances(sorted);
        setOfficers(Array.isArray(officerList) ? officerList : []);
        setSelectedId(sorted[0]?.id || "");
      } catch {
        if (!mounted) return;
        setGrievances([]);
        setSelectedId("");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initialize();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadDetail() {
      if (!selectedId) {
        setGrievanceDetail(null);
        return;
      }
      setLoadingDetail(true);
      try {
        const detail = await getAdminGrievanceDetail(selectedId);
        if (mounted) setGrievanceDetail(detail);
      } catch {
        if (mounted) setGrievanceDetail(null);
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    }
    loadDetail();
    return () => { mounted = false; };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return grievances;
    return grievances.filter((g) => {
      const blob = [g.ticket_id, g.title, g.description, g.location, g.status, g.priority]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(query);
    });
  }, [grievances, searchQuery]);

  const selected = grievanceDetail || filtered.find((g) => String(g.id) === String(selectedId)) || grievances.find((g) => String(g.id) === String(selectedId)) || null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!officerId) {
      toast({ title: "Officer Selection Required", description: "Select an officer from the dropdown to assign this grievance.", variant: "destructive" });
      return;
    }

    setAssigning(true);
    try {
      const updated = await assignOfficerToGrievance(selected.id, officerId.trim());
      setGrievances((prev) => prev.map((item) => String(item.id) === String(updated.id) ? updated : item));
      if (grievanceDetail) setGrievanceDetail({ ...grievanceDetail, ...updated });
      toast({ title: "Assigned", description: `Grievance ${updated.ticket_id} assigned successfully.` });
      setOfficerId("");
      setNote("");
    } catch (error) {
      toast({ title: "Assignment failed", description: error.message || "Unable to assign grievance.", variant: "destructive" });
    } finally {
      setAssigning(false);
    }
  };

  const attachmentCount = grievanceDetail?.attachments?.length || 0;
  const locationLines = useMemo(() => {
    if (!grievanceDetail) return [];
    const lines = [grievanceDetail.area, grievanceDetail.city, grievanceDetail.state].filter(Boolean);
    if (grievanceDetail.pincode) lines.push(`PIN ${grievanceDetail.pincode}`);
    return lines;
  }, [grievanceDetail]);

  const availableOfficers = useMemo(() => {
    if (!selected) return [];
    
    // First try matching by exact department ID if available
    if (selected.department_id) {
      const filteredById = officers.filter(o => 
        String(o.departmentId) === String(selected.department_id) || 
        String(o.department_id) === String(selected.department_id)
      );
      if (filteredById.length > 0) return filteredById;
    }

    // Fallback to name matching if no ID matched
    const deptName = selected.department?.toLowerCase();
    if (deptName) {
      const filteredByName = officers.filter(o => 
        (o.departmentName || "").toLowerCase() === deptName
      );
      if (filteredByName.length > 0) return filteredByName;
    }

    return officers;
  }, [selected, officers]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="dashboard-main flex items-center justify-center bg-muted/10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow-navy" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading grievances...</p>
          </div>
        </main>
      </div>
    );
  }

  const activeCount = grievances.filter(g => !['resolved', 'closed', 'rejected'].includes(g.status)).length;

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="dashboard-main bg-background relative overflow-hidden">
        
        {/* Dynamic Background */}
        <div className="absolute top-0 inset-x-0 h-[300px] gradient-hero opacity-10 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="dashboard-topbar bg-background/60 backdrop-blur-xl border-b border-border/50">
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
              Grievance Console
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold">Live</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Comprehensive view of all citizen issues and operations.</p>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-6 relative z-10 max-w-[1800px] mx-auto">
          
          {/* Header Stats & Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="glass-card px-4 py-3 min-w-[140px]">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total Issues</p>
                <p className="text-2xl font-heading font-bold text-foreground mt-1">{grievances.length}</p>
              </div>
              <div className="glass-card px-4 py-3 min-w-[140px] border-amber-500/20">
                <p className="text-[10px] uppercase tracking-widest text-amber-600/80 font-semibold">Active</p>
                <p className="text-2xl font-heading font-bold text-amber-600 mt-1">{activeCount}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ticket, location, description..."
                  className="pl-10 h-11 rounded-xl border-border/60 bg-card/50 backdrop-blur-sm focus-visible:ring-primary/30"
                />
              </div>
              <Button onClick={loadGrievances} variant="outline" className="h-11 rounded-xl bg-card/50 backdrop-blur-sm border-border/60 hover:bg-muted/50 transition-all">
                <CalendarClock className="w-4 h-4 mr-2 text-primary" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[450px_1fr] 2xl:grid-cols-[500px_1fr] gap-6">
            
            {/* List Section */}
            <section className="elevated-card overflow-hidden flex flex-col h-[calc(100vh-240px)] min-h-[500px]">
              <div className="p-4 md:p-5 border-b border-border/40 bg-muted/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <h2 className="font-heading font-semibold text-foreground text-sm md:text-base">Grievance Feed</h2>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">{filtered.length} found</span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 custom-scrollbar bg-card/30">
                <AnimatePresence initial={false}>
                  {filtered.length > 0 ? (
                    filtered.map((g, idx) => {
                      const active = String(g.id) === String(selected?.id);
                      return (
                        <motion.button
                          key={g.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: Math.min(idx * 0.05, 0.3) }}
                          type="button"
                          onClick={() => setSelectedId(g.id)}
                          className={cn(
                            "w-full text-left rounded-2xl border p-4 transition-all duration-200 group relative overflow-hidden",
                            active 
                              ? "border-primary/40 bg-primary/5 shadow-md ring-1 ring-primary/20" 
                              : "border-border/60 bg-card hover:border-primary/30 hover:shadow-sm"
                          )}
                        >
                          {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-2xl" />}
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                                  {g.ticket_id}
                                </span>
                                {g.priority === 'critical' || g.priority === 'high' ? (
                                  <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                                ) : null}
                              </div>
                              <h3 className={cn(
                                "font-heading font-semibold text-sm md:text-base line-clamp-1 transition-colors",
                                active ? "text-primary" : "text-foreground group-hover:text-primary"
                              )}>
                                {g.title}
                              </h3>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                {g.description}
                              </p>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-2">
                              <StatusBadge status={g.status.replace("_", "-")} />
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(g.created_at).split(',')[0]}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap gap-2 text-[11px]">
                            <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-muted-foreground max-w-[200px] truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{g.location || "Location not provided"}</span>
                            </span>
                            <span className="inline-flex rounded-md bg-muted/50 px-2 py-1 text-muted-foreground capitalize">
                              {categoryLabels[g.category?.replace("_", "-")] || g.category}
                            </span>
                            <span className={cn(
                              "inline-flex rounded-md px-2 py-1 capitalize font-medium",
                              g.priority === 'critical' ? 'bg-destructive/10 text-destructive' :
                              g.priority === 'high' ? 'bg-amber-500/10 text-amber-600' :
                              'bg-muted/50 text-muted-foreground'
                            )}>
                              {g.priority || "medium"}
                            </span>
                          </div>
                        </motion.button>
                      );
                    })
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-full py-16 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <h3 className="font-heading font-semibold text-foreground">No Grievances Found</h3>
                      <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                        Try adjusting your search filters or clear the query to see all results.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Comprehensive Detail Section */}
            <aside className="h-[calc(100vh-240px)] min-h-[500px]">
              <div className="glass-panel h-full flex flex-col overflow-hidden relative shadow-lg border border-border/50">
                {selected ? (
                  <>
                    <div className="p-5 md:p-6 border-b border-border/40 bg-gradient-to-br from-primary/5 via-transparent to-transparent flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="text-[11px] font-mono font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {selected.ticket_id}
                          </p>
                          <span className={cn("text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded",
                            selected.priority === "critical" ? "bg-red-500/10 text-red-500" :
                            selected.priority === "high" ? "bg-orange-500/10 text-orange-500" :
                            selected.priority === "medium" ? "bg-yellow-500/10 text-yellow-600" :
                            "bg-emerald-500/10 text-emerald-500"
                          )}>
                            {selected.priority || "Medium"} Priority
                          </span>
                        </div>
                        <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground leading-tight">
                          {selected.title}
                        </h2>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-2">
                        <StatusBadge status={selected.status.replace("_", "-")} />
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(selected.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar relative">
                      {loadingDetail && (
                        <div className="absolute inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                           <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        
                        {/* Left Column: Details & Actions */}
                        <div className="space-y-6">
                          {/* Description */}
                          <div className="space-y-2">
                            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5" /> Description
                            </h4>
                            <div className="rounded-xl border border-border/50 bg-muted/10 p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                              {selected.description || "No description provided."}
                            </div>
                          </div>

                          {/* Activity Timeline */}
                          {selected.updates && selected.updates.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-border/40">
                              <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" /> Activity Timeline
                              </h4>
                              <div className="space-y-0 pl-1">
                                {[...selected.updates].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((update, i, arr) => (
                                  <div key={update.id} className="relative pl-6 pb-6 last:pb-0">
                                    {i < arr.length - 1 && (
                                      <div className="absolute left-1.5 top-5 bottom-0 w-px bg-border/60" />
                                    )}
                                    <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 border-primary/30 bg-background z-10 flex items-center justify-center">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                    </div>
                                    <div className="bg-muted/10 rounded-xl p-3 border border-border/50">
                                      <div className="flex justify-between items-start gap-4 mb-1">
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-primary/80">
                                          {update.update_type.replace("_", " ")}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                          {formatDate(update.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                        {update.message || "No message provided."}
                                      </p>
                                      {update.updated_by_name && (
                                        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                          <UserCheck className="w-3 h-3" /> By {update.updated_by_name}
                                        </p>
                                      )}
                                      
                                      {/* Inline Attachments */}
                                      {update.attachments && update.attachments.length > 0 && (
                                        <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
                                          {update.images?.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                              {update.images.map((imgUrl, idx) => (
                                                <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-border/50 group relative">
                                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                    <ArrowRight className="text-white w-4 h-4" />
                                                  </div>
                                                  <img src={imgUrl} alt="Update Attachment" className="w-full h-16 object-cover transition-transform group-hover:scale-105" />
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                          {update.attachments.map((att) => {
                                            if (update.images?.includes(att.file_url)) return null;
                                            return (
                                              <a key={att.id || att.file_name} href={att.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/40 hover:bg-muted/50 transition-colors">
                                                <Paperclip className="w-3.5 h-3.5 text-primary" />
                                                <div className="min-w-0 flex-1">
                                                  <p className="text-[11px] font-medium text-foreground truncate">{att.file_name}</p>
                                                </div>
                                              </a>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Location Info */}
                          <div className="space-y-2">
                            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Location Address
                            </h4>
                            <div className="rounded-xl border border-border/50 bg-muted/10 p-4 space-y-2">
                              <p className="text-sm text-foreground">{selected.location || "Location not provided"}</p>
                              {locationLines.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                                  {locationLines.map(line => (
                                    <span key={line} className="text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/60">{line}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions: Assign / Resolve */}
                          <div className="space-y-2">
                            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5" /> Assignment & Actions
                            </h4>
                            {selected.status.toLowerCase() === "submitted" ? (
                              <form onSubmit={handleAssign} className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-xs font-semibold text-foreground/80">Select Officer</Label>
                                    <select
                                      value={officerId}
                                      onChange={(e) => setOfficerId(e.target.value)}
                                      className="flex h-10 w-full mt-1 rounded-xl border border-primary/20 bg-background px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                                    >
                                      <option value="">Choose an officer...</option>
                                      {availableOfficers.map(officer => (
                                        <option key={officer.id} value={officer.id}>
                                          {officer.fullName || "Unnamed"} ({officer.designation || "Officer"})
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-semibold text-foreground/80">Admin Note (Internal)</Label>
                                    <Textarea 
                                      placeholder="Add an internal note..." 
                                      value={note}
                                      onChange={(e) => setNote(e.target.value)}
                                      className="min-h-[80px] mt-1 bg-background resize-none border-primary/20" 
                                    />
                                  </div>
                                  <Button type="submit" disabled={assigning} className="w-full h-10 shadow-md">
                                    {assigning ? "Updating..." : "Accept & Assign Officer"}
                                  </Button>
                                </div>
                              </form>
                            ) : (
                              <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <AlertCircle className="w-4 h-4 text-primary" />
                                  <p className="text-sm font-semibold text-foreground">Assignment Details</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground">Assigned Officer</p>
                                  <p className="text-sm font-medium text-foreground">
                                    {selected.assigned_officer_name || selected.assigned_officer_id ? (
                                      <span className="flex items-center gap-2">
                                        <UserCheck className="w-4 h-4 text-emerald-500" />
                                        {selected.assigned_officer_name || "Unknown Officer"} 
                                        {selected.assigned_officer_id && <span className="text-muted-foreground text-xs font-mono">({selected.assigned_officer_id})</span>}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground italic">Pending System Assignment</span>
                                    )}
                                  </p>
                                </div>
                                <p className="text-[10px] text-muted-foreground border-t border-border/40 pt-2 mt-2">
                                  Status: <strong className="uppercase">{selected.status.replace("_", " ")}</strong>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right Column: Map & Attachments */}
                        <div className="space-y-6">
                          
                          {/* Map Widget */}
                          <div className="space-y-2">
                            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" /> Coordinates
                            </h4>
                            <div className="rounded-xl border border-border/50 bg-muted/10 overflow-hidden h-[220px] relative">
                              {selected.latitude && selected.longitude ? (
                                <MapContainer 
                                  center={[selected.latitude, selected.longitude]} 
                                  zoom={15} 
                                  className="h-full w-full z-0"
                                >
                                  <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap"
                                  />
                                  <Marker position={[selected.latitude, selected.longitude]} icon={defaultIcon}>
                                    <Popup>{selected.ticket_id}</Popup>
                                  </Marker>
                                </MapContainer>
                              ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-card/50">
                                  <MapPin className="w-8 h-8 opacity-20 mb-2" />
                                  <span className="text-xs uppercase tracking-widest font-semibold opacity-50">No Coordinates Provided</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Attachments */}
                          <div className="space-y-2">
                            <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <Paperclip className="w-3.5 h-3.5" /> Media & Attachments
                              </span>
                              <span className="bg-muted px-2 py-0.5 rounded text-[10px]">{attachmentCount}</span>
                            </h4>
                            
                            <div className="rounded-xl border border-border/50 bg-muted/10 p-3 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                              {selected.images?.length > 0 && (
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  {selected.images.map((imgUrl, idx) => (
                                    <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-border/50 group relative">
                                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                        <ArrowRight className="text-white w-4 h-4" />
                                      </div>
                                      <img src={imgUrl} alt="Attachment Preview" className="w-full h-24 object-cover transition-transform group-hover:scale-105" />
                                    </a>
                                  ))}
                                </div>
                              )}
                              
                              {attachmentCount > 0 ? (
                                grievanceDetail.attachments.map((attachment) => {
                                  if (selected.images?.includes(attachment.file_url)) return null; // skip images already previewed
                                  return (
                                    <a 
                                      key={attachment.id || attachment.file_name}
                                      href={attachment.file_url} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2 hover:bg-muted/50 transition-colors group"
                                    >
                                      <div className="min-w-0 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                          <Paperclip className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                          <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{attachment.file_name || "Attachment"}</p>
                                          <p className="text-[10px] text-muted-foreground mt-0.5">
                                            {attachment.file_type || "File"}
                                            {attachment.file_size ? ` · ${formatFileSize(attachment.file_size)}` : ""}
                                          </p>
                                        </div>
                                      </div>
                                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                                    </a>
                                  );
                                })
                              ) : (
                                !selected.images?.length && (
                                  <div className="py-6 flex flex-col items-center justify-center text-center">
                                    <Paperclip className="w-6 h-6 text-muted-foreground/30 mb-2" />
                                    <p className="text-xs text-muted-foreground">No media attachments attached to this grievance.</p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-b from-transparent to-muted/10">
                    <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-5 border border-border/50">
                      <Search className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                    <h3 className="font-heading font-semibold text-xl text-foreground mb-2">No Grievance Selected</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px]">
                      Select a grievance from the feed on the left to view its complete details, precise map location, media attachments, and administrative actions.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}