import React, { useEffect, useMemo, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  FileText,
  MapPin,
  Search,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  Paperclip,
  XCircle,
  PlayCircle,
  UploadCloud,
} from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/grievance/StatusBadge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  getAssignedOfficerGrievances,
  getOfficerGrievanceDetail,
  startOfficerGrievance,
  resolveOfficerGrievance,
  rejectOfficerGrievance,
} from "@/lib/api/officer";

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
  shadowSize: [41, 41],
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
    minute: "2-digit",
  });
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function normalizeStatusToken(value) {
  return String(value || "").trim().toLowerCase().replace(/-/g, "_");
}

function formatStatusLabel(value) {
  const normalized = normalizeStatusToken(value) || "activity";
  return normalized
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function timelineTone(status) {
  const normalized = normalizeStatusToken(status);
  if (normalized === "resolved" || normalized === "close" || normalized === "closed") {
    return {
      dot: "border-emerald-500/40 bg-emerald-500/20",
      chip: "bg-emerald-500/10 text-emerald-700",
    };
  }
  if (normalized === "in_progress" || normalized === "start" || normalized === "started") {
    return {
      dot: "border-blue-500/40 bg-blue-500/20",
      chip: "bg-blue-500/10 text-blue-700",
    };
  }
  if (normalized === "rejected" || normalized === "reject") {
    return {
      dot: "border-red-500/40 bg-red-500/20",
      chip: "bg-red-500/10 text-red-700",
    };
  }
  return {
    dot: "border-primary/30 bg-primary/20",
    chip: "bg-primary/10 text-primary",
  };
}

export default function OfficerQueue() {
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [grievances, setGrievances] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState(searchParams.get("id") || "");

  const [grievanceDetail, setGrievanceDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(true);

  // Actions state
  const [actionLoading, setActionLoading] = useState(false);
  const [resolveMessage, setResolveMessage] = useState("");
  const [resolveFile, setResolveFile] = useState(null);
  const [rejectMessage, setRejectMessage] = useState("");
  const [acceptedReopenedIds, setAcceptedReopenedIds] = useState({});
  const fileInputRef = useRef(null);
  
  const { toast } = useToast();

  const loadGrievances = async () => {
    try {
      const list = await getAssignedOfficerGrievances();
      const sorted = [...list].sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
      setGrievances(sorted);
      
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
        const list = await getAssignedOfficerGrievances();
        const sorted = [...list].sort((a, b) => parseDate(b.created_at) - parseDate(a.created_at));
        if (!mounted) return;
        setGrievances(sorted);
        
        const queryId = searchParams.get("id");
        if (queryId) {
          setSelectedId(queryId);
        } else {
          setSelectedId(sorted[0]?.id || "");
        }
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
        const detail = await getOfficerGrievanceDetail(selectedId);
        if (mounted) {
          setGrievanceDetail(detail);
          setResolveFile(null);
          setResolveMessage("");
          setRejectMessage("");
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      } catch {
        if (mounted) setGrievanceDetail(null);
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    }
    loadDetail();
    return () => {
      mounted = false;
    };
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

  const selected =
    grievanceDetail?.grievance ||
    filtered.find((g) => String(g.id) === String(selectedId)) ||
    grievances.find((g) => String(g.id) === String(selectedId)) ||
    null;

  const selectedStatus = normalizeStatusToken(selected?.status);
  const isReopened = selectedStatus === "reopened";
  const canShowActionWorkspace = ["assigned", "under_review", "reopened"].includes(selectedStatus);
  const isAcceptedReopened = selected ? Boolean(acceptedReopenedIds[selected.id]) : false;
  const canStartWork = canShowActionWorkspace && (!isReopened || isAcceptedReopened);

  const timelineEvents = useMemo(() => {
    if (!selected) return [];

    const baseTimeline = Array.isArray(grievanceDetail?.timeline)
      ? grievanceDetail.timeline.map((item) => ({
          id: `timeline-${item.id}`,
          created_at: item.created_at,
          status: item.status,
          label: formatStatusLabel(item.status),
          message: item.message || "Status updated",
          actor: item.created_by || "system",
          attachments: [],
          images: [],
        }))
      : [];

    const updateTimeline = Array.isArray(selected.updates)
      ? selected.updates.map((update) => ({
          id: `update-${update.id}`,
          created_at: update.created_at,
          status: update.update_type,
          label: formatStatusLabel(update.update_type),
          message: update.message || "Update added",
          actor: update.updated_by_name || "system",
          attachments: Array.isArray(update.attachments) ? update.attachments : [],
          images: Array.isArray(update.images) ? update.images : [],
        }))
      : [];

    const merged = [...baseTimeline, ...updateTimeline]
      .filter((event) => event.created_at)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const seen = new Set();
    return merged.filter((event) => {
      const key = `${event.created_at}-${event.label}-${event.message}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selected, grievanceDetail]);

  const handleAcceptReopened = () => {
    if (!selected) return;
    setAcceptedReopenedIds((prev) => ({ ...prev, [selected.id]: true }));
    toast({
      title: "Issue accepted",
      description: `You can now start grievance ${selected.ticket_id}.`,
    });
  };

  const handleStart = async () => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const updated = await startOfficerGrievance(selected.id);
      setGrievances((prev) => prev.map((g) => (String(g.id) === String(updated.id) ? updated : g)));
      if (grievanceDetail) setGrievanceDetail({ ...grievanceDetail, grievance: updated });
      setAcceptedReopenedIds((prev) => {
        const next = { ...prev };
        delete next[selected.id];
        return next;
      });
      toast({ title: "Started", description: `You have started working on ${updated.ticket_id}.` });
    } catch (error) {
      toast({ title: "Action Failed", description: error.message || "Failed to start grievance.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!resolveFile) {
      toast({ title: "Resolution Proof Required", description: "Please attach a file proving the resolution.", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      const updated = await resolveOfficerGrievance(selected.id, resolveFile, resolveMessage);
      setGrievances((prev) => prev.map((g) => (String(g.id) === String(updated.id) ? updated : g)));
      if (grievanceDetail) setGrievanceDetail({ ...grievanceDetail, grievance: updated });
      toast({ title: "Resolved", description: `Grievance ${updated.ticket_id} has been marked as resolved.` });
      setResolveFile(null);
      setResolveMessage("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      toast({ title: "Resolution Failed", description: error.message || "Failed to resolve grievance.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!selected) return;
    if (!rejectMessage.trim()) {
      toast({ title: "Rejection Reason Required", description: "Please provide a reason for rejection.", variant: "destructive" });
      return;
    }

    setActionLoading(true);
    try {
      const updated = await rejectOfficerGrievance(selected.id, rejectMessage);
      setGrievances((prev) => prev.map((g) => (String(g.id) === String(updated.id) ? updated : g)));
      if (grievanceDetail) setGrievanceDetail({ ...grievanceDetail, grievance: updated });
      setAcceptedReopenedIds((prev) => {
        const next = { ...prev };
        delete next[selected.id];
        return next;
      });
      toast({ title: "Rejected", description: `Grievance ${updated.ticket_id} has been rejected.` });
      setRejectMessage("");
    } catch (error) {
      toast({ title: "Rejection Failed", description: error.message || "Failed to reject grievance.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const attachmentCount = grievanceDetail?.grievance?.attachments?.length || 0;
  const locationLines = useMemo(() => {
    if (!selected) return [];
    const lines = [selected.area, selected.city, selected.state].filter(Boolean);
    if (selected.pincode) lines.push(`PIN ${selected.pincode}`);
    return lines;
  }, [selected]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="dashboard-main flex items-center justify-center bg-muted/10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow-navy" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading queue...</p>
          </div>
        </main>
      </div>
    );
  }

  const activeCount = grievances.filter((g) => ["assigned", "in_progress"].includes(g.status.toLowerCase())).length;

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main relative overflow-hidden bg-background">
        {/* Immersive Header Background */}
        <div className="absolute top-0 left-0 right-0 h-[250px] bg-gradient-to-br from-primary/10 via-secondary/5 to-background z-0" />
        <div className="absolute top-20 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
        <div className="absolute top-20 -right-20 w-72 h-72 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

        <div className="dashboard-topbar bg-background/60 backdrop-blur-xl border-b border-border/50">
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
              Officer Console
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold">Queue</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">Manage your assigned tasks and resolve issues.</p>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-6 relative z-10 max-w-[1800px] mx-auto h-[calc(100vh-80px)] flex flex-col">
          
          {/* Header Stats & Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end justify-between shrink-0">
            <div className="flex flex-wrap gap-3">
              <div className="glass-card px-4 py-3 min-w-[140px]">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Total Assigned</p>
                <p className="text-2xl font-heading font-bold text-foreground mt-1">{grievances.length}</p>
              </div>
              <div className="glass-card px-4 py-3 min-w-[140px] border-emerald-500/20">
                <p className="text-[10px] uppercase tracking-widest text-emerald-600/80 font-semibold">Active & Pending</p>
                <p className="text-2xl font-heading font-bold text-emerald-600 mt-1">{activeCount}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search queue by ID, title, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 w-full bg-background border-border/60 rounded-xl focus:bg-background/50 transition-colors shadow-sm"
                />
              </div>
              <Button variant="outline" className="h-11 rounded-xl bg-background shadow-sm hover:bg-muted" onClick={loadGrievances}>
                <Clock className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Dual Pane Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
            
            {/* Left Pane: Grievance Feed */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col h-[600px] lg:h-auto elevated-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border/50 bg-muted/20 shrink-0 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" /> Your Queue
                </h3>
                <span className="text-xs text-muted-foreground font-medium">{filtered.length} found</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                <AnimatePresence>
                  {filtered.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-40 text-center px-4">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
                      <p className="text-sm font-medium text-foreground">Queue is clear</p>
                      <p className="text-xs text-muted-foreground mt-1">No assigned grievances match your search.</p>
                    </motion.div>
                  ) : (
                    filtered.map((item) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                          "w-full text-left p-3 rounded-xl border transition-all duration-200 relative group overflow-hidden",
                          selectedId === item.id 
                            ? "bg-primary/5 border-primary/30 shadow-md scale-[1.02] z-10" 
                            : "bg-card border-border/40 hover:bg-muted hover:border-border/80 hover:shadow-sm"
                        )}
                      >
                        {selectedId === item.id && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
                        )}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <span className="text-[11px] font-mono font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {item.ticket_id}
                          </span>
                          <StatusBadge status={item.status.replace("_", "-")} />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground truncate mb-1 pr-4">{item.title}</h4>
                        <p className="text-xs text-muted-foreground truncate">{item.location || "No location"}</p>
                      </motion.button>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Pane: Detailed View */}
            <div className="lg:col-span-8 xl:col-span-9 glass-panel flex flex-col h-[800px] lg:h-auto overflow-hidden">
              {selected ? (
                <>
                  <div className="shrink-0 p-5 md:p-6 border-b border-border/50 bg-card/40 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-xs font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
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

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8">
                      
                      {/* Left Column: Actions & Workflows */}
                      <div className="space-y-6">
                        
                        {/* Action Box based on Status */}
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                            <PlayCircle className="w-3.5 h-3.5" /> Workspace Actions
                          </h4>
                          
                          {canShowActionWorkspace ? (
                            <div className="space-y-4">
                              {isReopened && (
                                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
                                  <p className="text-xs uppercase tracking-wide font-semibold text-amber-700">Reopened Issue</p>
                                  <p className="text-sm text-foreground/80 leading-relaxed">
                                    Accept this reopened grievance first, then start work or reject it with reason.
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAcceptReopened}
                                    disabled={isAcceptedReopened || actionLoading}
                                    className="w-full border-amber-500/40 text-amber-700 hover:bg-amber-500/10"
                                  >
                                    {isAcceptedReopened ? "Accepted" : "Accept Issue"}
                                  </Button>
                                </div>
                              )}

                              <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 text-center space-y-4 shadow-sm">
                                <AlertCircle className="w-8 h-8 text-primary mx-auto opacity-80" />
                                <div>
                                  <h3 className="text-base font-semibold text-foreground">Ready to Start?</h3>
                                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    Mark this grievance as 'In Progress' to begin working on its resolution.
                                  </p>
                                </div>
                                <Button 
                                  onClick={handleStart} 
                                  disabled={actionLoading || !canStartWork}
                                  className="w-full h-11 text-sm shadow-md transition-transform hover:scale-[1.02]"
                                >
                                  {actionLoading ? "Starting..." : isReopened && !isAcceptedReopened ? "Accept Issue To Start" : "Start Working"}
                                </Button>
                              </div>

                              {/* Reject Form */}
                              <form onSubmit={handleReject} className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-3">
                                <h3 className="text-xs font-semibold text-red-600 flex items-center gap-1.5 uppercase tracking-wide">
                                  <XCircle className="w-3.5 h-3.5" /> Reject Grievance
                                </h3>
                                <Textarea 
                                  placeholder="Reason for rejection (Required)..." 
                                  value={rejectMessage}
                                  onChange={(e) => setRejectMessage(e.target.value)}
                                  className="min-h-[60px] bg-background resize-none border-red-500/20 focus-visible:ring-red-500/30 text-sm" 
                                  required
                                />
                                <Button 
                                  type="submit" 
                                  variant="outline" 
                                  disabled={actionLoading} 
                                  className="w-full h-9 border-red-500/30 text-red-600 hover:bg-red-500/10 text-xs font-semibold"
                                >
                                  {actionLoading ? "Processing..." : "Reject Issue"}
                                </Button>
                              </form>
                            </div>
                          ) : selected.status.toLowerCase() === "in_progress" ? (
                            <div className="space-y-4">
                              {/* Resolve Form */}
                              <form onSubmit={handleResolve} className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                                <div>
                                  <h3 className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> Resolve Grievance
                                  </h3>
                                </div>
                                
                                <div className="space-y-3 relative z-10">
                                  <div>
                                    <Label className="text-xs font-semibold text-foreground/80">Proof of Resolution (Required)</Label>
                                    <div className="mt-1 flex items-center gap-3">
                                      <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full h-10 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-700 text-sm"
                                        onClick={() => fileInputRef.current?.click()}
                                      >
                                        <UploadCloud className="w-4 h-4 mr-2" />
                                        {resolveFile ? resolveFile.name : "Upload Document / Photo"}
                                      </Button>
                                      <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        className="hidden" 
                                        onChange={(e) => setResolveFile(e.target.files?.[0] || null)}
                                        accept="image/*,.pdf,.doc,.docx"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <Label className="text-xs font-semibold text-foreground/80">Resolution Note (Optional)</Label>
                                    <Textarea 
                                      placeholder="Explain how this was resolved..." 
                                      value={resolveMessage}
                                      onChange={(e) => setResolveMessage(e.target.value)}
                                      className="min-h-[80px] mt-1 bg-background resize-none border-emerald-500/20 focus-visible:ring-emerald-500/30" 
                                    />
                                  </div>
                                  <Button 
                                    type="submit" 
                                    disabled={actionLoading} 
                                    className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform hover:scale-[1.02]"
                                  >
                                    {actionLoading ? "Submitting..." : "Submit Resolution"}
                                  </Button>
                                </div>
                              </form>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-border/50 bg-muted/20 p-5 text-center flex flex-col items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mb-2" />
                              <p className="text-sm font-semibold text-foreground">Action Completed</p>
                              <p className="text-xs text-muted-foreground mt-1 max-w-[250px] leading-relaxed">
                                This grievance is <strong className="uppercase text-foreground/80">{selected.status.replace("_", " ")}</strong>. No further actions can be taken.
                              </p>
                            </div>
                          )}
                        </div>

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
                        <div className="space-y-4 pt-4 border-t border-border/40">
                          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5" /> Activity Timeline
                          </h4>
                          {timelineEvents.length === 0 ? (
                            <div className="rounded-xl border border-border/50 bg-muted/10 p-4 text-sm text-muted-foreground">
                              No activity available yet for this grievance.
                            </div>
                          ) : (
                            <div className="space-y-0 pl-1">
                              {timelineEvents.map((event, i) => {
                                const tone = timelineTone(event.status);
                                return (
                                  <div key={event.id} className="relative pl-6 pb-6 last:pb-0">
                                    {i < timelineEvents.length - 1 && (
                                      <div className="absolute left-1.5 top-5 bottom-0 w-px bg-border/60" />
                                    )}
                                    <div className={cn("absolute left-0 top-1 w-3 h-3 rounded-full border-2 z-10", tone.dot)} />
                                    <div className="bg-muted/10 rounded-xl p-3 border border-border/50">
                                      <div className="flex justify-between items-start gap-4 mb-1">
                                        <span className={cn("text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded", tone.chip)}>
                                          {event.label}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                          {formatDate(event.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                        {event.message || "No message provided."}
                                      </p>
                                      {event.actor && (
                                        <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                          <UserCheck className="w-3 h-3" /> By {event.actor}
                                        </p>
                                      )}

                                      {event.attachments && event.attachments.length > 0 && (
                                        <div className="mt-3 space-y-2 border-t border-border/40 pt-3">
                                          {event.images?.length > 0 && (
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                              {event.images.map((imgUrl, idx) => (
                                                <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-border/50 group relative">
                                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                                    <ArrowRight className="text-white w-4 h-4" />
                                                  </div>
                                                  <img src={imgUrl} alt="Update Attachment" className="w-full h-16 object-cover transition-transform group-hover:scale-105" />
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                          {event.attachments.map((att) => {
                                            if (event.images?.includes(att.file_url)) return null;
                                            return (
                                              <a key={att.id || att.file_name} href={att.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-background/50 border border-border/40 hover:bg-muted/50 transition-colors">
                                                <Paperclip className="w-3.5 h-3.5 text-primary" />
                                                <div className="min-w-0 flex-1">
                                                  <p className="text-[11px] font-medium text-foreground truncate">{att.file_name}</p>
                                                </div>
                                              </a>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
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
                          <div className="rounded-xl border border-border/50 bg-muted/10 p-1 space-y-2">
                            <div className="rounded-lg overflow-hidden h-[180px] relative border border-border/40">
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
                                  <span className="text-[10px] uppercase tracking-widest font-semibold opacity-50">No Coordinates Provided</span>
                                </div>
                              )}
                            </div>
                            <div className="px-3 pb-2 pt-1">
                              <p className="text-sm text-foreground leading-snug">{selected.location || "Location not provided"}</p>
                              {locationLines.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-border/40">
                                  {locationLines.map(line => (
                                    <span key={line} className="text-[10px] px-2 py-0.5 rounded-full bg-background text-muted-foreground border border-border/60">{line}</span>
                                  ))}
                                </div>
                              )}
                            </div>
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
                          
                          <div className="rounded-xl border border-border/50 bg-muted/10 p-3 space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                            {selected.images?.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                {selected.images.map((imgUrl, idx) => (
                                  <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-border/50 group relative">
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                      <ArrowRight className="text-white w-4 h-4" />
                                    </div>
                                    <img src={imgUrl} alt="Attachment Preview" className="w-full h-20 object-cover transition-transform group-hover:scale-105" />
                                  </a>
                                ))}
                              </div>
                            )}
                            
                            {attachmentCount > 0 ? (
                              grievanceDetail?.grievance?.attachments?.map((attachment) => {
                                if (selected.images?.includes(attachment.file_url)) return null;
                                return (
                                  <a 
                                    key={attachment.id || attachment.file_name}
                                    href={attachment.file_url} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-card px-3 py-2 hover:bg-muted/50 transition-colors group"
                                  >
                                    <div className="min-w-0 flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                        <Paperclip className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">{attachment.file_name || "Attachment"}</p>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">
                                          {attachment.file_type || "File"}
                                          {attachment.file_size ? ` · ${formatFileSize(attachment.file_size)}` : ""}
                                        </p>
                                      </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
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
                  <h3 className="font-heading font-semibold text-xl text-foreground mb-2">No Task Selected</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-[300px]">
                    Select a grievance from your queue to view complete details, maps, and to process its resolution.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
