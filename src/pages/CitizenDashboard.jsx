import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  Inbox,
  FileText,
  MapPin,
  Paperclip,
  Calendar,
  UserCheck,
  Activity,
  Copy,
  Plus,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import StatusBadge from "@/components/grievance/StatusBadge";
import { getCitizenGrievanceDetail, getCitizenGrievances, closeCitizenGrievance, reopenCitizenGrievance } from "@/lib/api/citizen";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function normalizeStatus(value) {
  const token = String(value || "submitted").trim().toLowerCase().replace(/_/g, "-");
  if (token === "under-review") return "under-review";
  if (token === "in-progress") return "in-progress";
  return token;
}

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value || 0);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveAttachmentUrl(attachment) {
  if (!attachment) return null;
  if (attachment.file_url) return attachment.file_url;
  if (attachment.file_data) {
    const mime = attachment.file_type || "application/octet-stream";
    return attachment.file_data.startsWith("data:")
      ? attachment.file_data
      : `data:${mime};base64,${attachment.file_data}`;
  }
  return null;
}

function isImageAttachment(attachment) {
  const fileType = String(attachment?.file_type || "").toLowerCase();
  const fileName = String(attachment?.file_name || "").toLowerCase();
  return fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(fileName);
}

function getLocationLines(grievance) {
  const location = grievance?.location_details || {};
  const lines = [location.area, location.city, location.state].filter(Boolean);
  if (location.pincode) lines.push(`PIN ${location.pincode}`);
  return lines;
}

function toStatusLabel(status) {
  return String(status || "submitted")
    .replace(/_/g, "-")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toStatusEnum(status) {
  const normalized = normalizeStatus(status);
  const enumMap = {
    submitted: "SUBMITTED",
    "under-review": "UNDER_REVIEW",
    "in-progress": "IN_PROGRESS",
    resolved: "RESOLVED",
    reopened: "REOPENED",
    rejected: "REJECTED",
    closed: "CLOSED",
    created: "SUBMITTED",
  };
  return enumMap[normalized] || normalized.replace(/-/g, "_").toUpperCase();
}

function getTimelineEventKey(event) {
  return `${event.status || ""}|${event.message || ""}|${event.created_at || ""}`;
}

const statusColorMap = {
  created: { bg: "bg-info/10", text: "text-info", dot: "border-info/60 bg-info/20" },
  submitted: { bg: "bg-info/10", text: "text-info", dot: "border-info/60 bg-info/20" },
  assigned: { bg: "bg-violet-500/10", text: "text-violet-600", dot: "border-violet-500/60 bg-violet-500/20" },
  accepted: { bg: "bg-indigo-500/10", text: "text-indigo-600", dot: "border-indigo-500/60 bg-indigo-500/20" },
  "under-review": { bg: "bg-accent/10", text: "text-accent", dot: "border-accent/60 bg-accent/20" },
  "in-progress": { bg: "bg-primary/10", text: "text-primary", dot: "border-primary/60 bg-primary/20" },
  reopened: { bg: "bg-amber-500/10", text: "text-amber-600", dot: "border-amber-500/60 bg-amber-500/20" },
  rejected: { bg: "bg-rose-500/10", text: "text-rose-600", dot: "border-rose-500/60 bg-rose-500/20" },
  resolved: { bg: "bg-secondary/10", text: "text-secondary", dot: "border-secondary/60 bg-secondary/20" },
  closed: { bg: "bg-muted/10", text: "text-muted-foreground", dot: "border-muted-foreground/60 bg-muted-foreground/20" },
  "status-change": { bg: "bg-slate-500/10", text: "text-slate-600", dot: "border-slate-500/60 bg-slate-500/20" },
};

function StatCard({ icon: Icon, label, value, tone, hint }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("absolute right-0 top-0 h-16 w-16 -translate-y-4 translate-x-4 rounded-full blur-2xl", tone)} />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
          <span className={cn("rounded-lg p-1.5", tone.replace("/20", "/15"))}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedId, setSelectedId] = useState(searchParams.get("id") || "");
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [ticketQuery, setTicketQuery] = useState("");
  const [listSearch, setListSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { toast } = useToast();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const pending = useMemo(() => tickets.filter((item) => !["resolved", "closed"].includes(item.status)), [tickets]);
  const resolved = useMemo(() => tickets.filter((item) => ["resolved", "closed"].includes(item.status)), [tickets]);
  const critical = useMemo(() => tickets.filter((item) => item.priority === "critical"), [tickets]);
  const resolvedRate = tickets.length ? Math.round((resolved.length / tickets.length) * 100) : 0;

  useEffect(() => {
    let mounted = true;

    async function loadTickets() {
      setLoadingTickets(true);
      try {
        const all = await getCitizenGrievances();
        if (!mounted) return;
        setTickets(all || []);

        const queryId = searchParams.get("id");
        if (queryId) {
          setSelectedId(queryId);
        } else if (!selectedId && all && all.length > 0) {
          setSelectedId(all[0].id);
        }
      } catch (error) {
        if (!mounted) return;
        setTickets([]);
        setSelectedId("");
      } finally {
        if (mounted) setLoadingTickets(false);
      }
    }

    loadTickets();
    return () => {
      mounted = false;
    };
  }, [toast, searchParams]);

  useEffect(() => {
    let mounted = true;

    async function loadDetail() {
      if (!selectedId) {
        setDetail(null);
        return;
      }

      setLoadingDetail(true);
      try {
        const response = await getCitizenGrievanceDetail(selectedId);
        if (!mounted) return;
        setDetail(response || null);
      } catch {
        if (!mounted) return;
        setDetail(null);
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [selectedId]);

  const filteredTickets = useMemo(() => {
    return tickets
      .filter((ticket) => statusFilter === "all" || normalizeStatus(ticket.status) === normalizeStatus(statusFilter))
      .filter(
        (ticket) =>
          !listSearch ||
          ticket.title.toLowerCase().includes(listSearch.toLowerCase()) ||
          ticket.ticket_id.toLowerCase().includes(listSearch.toLowerCase())
      );
  }, [listSearch, statusFilter, tickets]);

  const selectedTicket = useMemo(
    () => tickets.find((ticket) => String(ticket.id) === String(selectedId)) || null,
    [selectedId, tickets]
  );

  const selectedGrievance = detail?.grievance || selectedTicket || null;

  const selectedTimeline = useMemo(() => {
    const grievanceAttachments = Array.isArray(selectedGrievance?.attachments)
      ? selectedGrievance.attachments
      : [];
    const grievanceCreatedAtMs = Date.parse(selectedGrievance?.created_at || "");
    const initialAttachments = grievanceAttachments.filter((attachment) => {
      const attachmentCreatedAtMs = Date.parse(attachment?.created_at || "");
      if (Number.isFinite(grievanceCreatedAtMs) && Number.isFinite(attachmentCreatedAtMs)) {
        return Math.abs(attachmentCreatedAtMs - grievanceCreatedAtMs) <= 5 * 60 * 1000;
      }

      if (selectedGrievance?.citizen_name && attachment?.uploaded_by) {
        return String(attachment.uploaded_by).toLowerCase() === String(selectedGrievance.citizen_name).toLowerCase();
      }

      return !attachment?.created_at;
    });

    const baseEvents = Array.isArray(detail?.timeline)
      ? detail.timeline.map((item) => ({
          id: `history-${item.id}`,
          source: "history",
          status: normalizeStatus(item.status),
          message: item.message || "Status updated",
          created_at: item.created_at,
          created_by: item.created_by || "System",
          attachments: [],
        }))
      : [];

    const updateEvents = Array.isArray(selectedGrievance?.updates)
      ? selectedGrievance.updates.map((item) => ({
          id: `update-${item.id}`,
          source: "update",
          status: normalizeStatus(item.update_type || item.status),
          message: item.message || "Update received",
          created_at: item.created_at,
          created_by: item.updated_by_name || "System",
          attachments: Array.isArray(item.attachments) ? item.attachments : [],
        }))
      : [];

    const hasCreatedUpdate = updateEvents.some((item) => item.status === "created");
    const fallbackCreatedEvent = selectedGrievance?.created_at && !hasCreatedUpdate
      ? [{
          id: `created-${selectedGrievance.id}`,
          source: "fallback",
          status: "created",
          message: "Grievance submitted by citizen.",
          created_at: selectedGrievance.created_at,
          created_by: selectedGrievance.citizen_name || "Citizen",
          attachments: initialAttachments,
        }]
      : [];

    const mergedByKey = new Map();
    for (const event of [...baseEvents, ...fallbackCreatedEvent, ...updateEvents]) {
      if (!event.created_at) continue;

      const baseKey = getTimelineEventKey(event);
      const existing = mergedByKey.get(baseKey);

      if (!existing) {
        mergedByKey.set(baseKey, event);
        continue;
      }

      const areBothUpdates = existing.source === "update" && event.source === "update";
      if (areBothUpdates) {
        mergedByKey.set(`${baseKey}|${event.id}`, event);
        continue;
      }

      const preferred = event.source === "update" ? event : existing;
      const secondary = event.source === "update" ? existing : event;
      mergedByKey.set(baseKey, {
        ...secondary,
        ...preferred,
        attachments: Array.isArray(preferred.attachments) && preferred.attachments.length > 0
          ? preferred.attachments
          : (Array.isArray(secondary.attachments) ? secondary.attachments : []),
      });
    }

    return Array.from(mergedByKey.values()).sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
  }, [detail, selectedGrievance]);

  const handleTrackByTicket = () => {
    const query = ticketQuery.trim().toLowerCase();
    if (!query) return;

    const match = tickets.find((ticket) => ticket.ticket_id.toLowerCase() === query);
    if (!match) {
      toast({
        title: "Ticket not found",
        description: "No grievance found for this ticket ID in your account.",
        variant: "destructive",
      });
      return;
    }

    setSelectedId(match.id);
  };

  const handleCopyTicket = () => {
    if (!selectedGrievance?.ticket_id) return;
    navigator.clipboard
      .writeText(selectedGrievance.ticket_id)
      .then(() => toast({ title: "Copied", description: "Ticket ID copied to clipboard." }));
  };

  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenFeedback, setReopenFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const grievanceStatusToken = (selectedGrievance?.status || "").toString().toLowerCase();
  const grievanceStatusNormalized = normalizeStatus(grievanceStatusToken);
  const isResolvedStatus = grievanceStatusToken === "resolved" || grievanceStatusToken.includes("resolv") || grievanceStatusNormalized === "resolved";
  const isClosedStatus = grievanceStatusToken === "closed" || grievanceStatusToken.includes("clos") || grievanceStatusNormalized === "closed";

  const handleClose = async () => {
    if (!selectedGrievance) return;
    setActionLoading(true);
    try {
      const updated = await closeCitizenGrievance(selectedGrievance.id);
      setDetail((d) => (d ? { ...d, grievance: updated } : { grievance: updated }));
      setTickets((list) => list.map((t) => (String(t.id) === String(updated.id) ? updated : t)));
      toast({ title: "Grievance closed", description: "Status updated to CLOSED." });
    } catch (err) {
      toast({ title: "Action failed", description: err.message || "Unable to close grievance.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReopen = () => {
    setReopenFeedback("");
    setShowReopenModal(true);
  };

  const submitReopen = async () => {
    if (!selectedGrievance) return;
    if (!reopenFeedback || reopenFeedback.trim().length < 5) {
      toast({ title: "Please provide feedback", description: "Feedback must be at least 5 characters.", variant: "destructive" });
      return;
    }
    setActionLoading(true);
    try {
      const updated = await reopenCitizenGrievance(selectedGrievance.id, { feedback: reopenFeedback.trim() });
      setDetail((d) => (d ? { ...d, grievance: updated } : { grievance: updated }));
      setTickets((list) => list.map((t) => (String(t.id) === String(updated.id) ? updated : t)));
      setShowReopenModal(false);
      toast({ title: "Grievance reopened", description: "Status updated to REOPENED." });
    } catch (err) {
      toast({ title: "Action failed", description: err.message || "Unable to reopen grievance.", variant: "destructive" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="dashboard-main bg-muted/10">
        <div className="dashboard-topbar">
          <div>
            <p className="text-xs text-muted-foreground">
              {greeting} 👋
            </p>
            <h1 className="font-heading font-bold text-lg text-foreground">
              {profile?.full_name || user?.email?.split("@")[0]}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/submit">
              <Button className="gradient-primary text-white shadow-md hover:opacity-90 font-semibold" size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                New Grievance
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_45%),radial-gradient(circle_at_bottom_left,hsl(var(--secondary)/0.2),transparent_40%)]" />
            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Citizen Grievance Command Center</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Track every complaint, monitor updates, and act quickly from a single beautiful workspace.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>{resolvedRate}% of your grievances are closed or resolved</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              icon={FileText}
              label="Total Filed"
              value={tickets.length}
              tone="bg-primary/20 text-primary"
              hint="All complaints raised by you"
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={pending.length}
              tone="bg-amber-500/20 text-amber-600"
              hint="Awaiting review or action"
            />
            <StatCard
              icon={CheckCircle2}
              label="Resolved"
              value={resolved.length}
              tone="bg-emerald-500/20 text-emerald-600"
              hint="Completed and closed"
            />
            <StatCard
              icon={AlertTriangle}
              label="Critical"
              value={critical.length}
              tone="bg-rose-500/20 text-rose-600"
              hint={critical.length > 0 ? "Needs immediate attention" : "No urgent complaints"}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Link to="/submit" className="group rounded-2xl border border-transparent bg-[linear-gradient(120deg,hsl(var(--primary)),hsl(var(--primary)/0.75))] p-4 text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/20">
                <Plus className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold">File New Grievance</p>
              <p className="mt-1 text-xs text-primary-foreground/80">Report civic issues in minutes.</p>
            </Link>

            <button
              type="button"
              onClick={() => {
                setStatusFilter("in_progress");
                setListSearch("");
              }}
              className="group rounded-2xl border border-border/60 bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Focus Active Cases</p>
              <p className="mt-1 text-xs text-muted-foreground">Jump straight to in-progress grievances.</p>
            </button>

            <Link to="/citizen/help" className="group rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-secondary/40 hover:shadow-md">
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
                <Inbox className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-foreground">Help & Guidance</p>
              <p className="mt-1 text-xs text-muted-foreground">Learn how tracking and responses work.</p>
            </Link>
          </div>

         

          {/* Main Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
            {/* Left Pane - Grievance List */}
            <section className="lg:col-span-4 elevated-card overflow-hidden flex flex-col">
              <div className="p-4 border-b border-border/60 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    className="pl-8 h-9 text-sm"
                    placeholder="Search my grievances..."
                    value={listSearch}
                    onChange={(e) => setListSearch(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="submitted">SUBMITTED</SelectItem>
                    <SelectItem value="under_review">UNDER_REVIEW</SelectItem>
                    <SelectItem value="in_progress">IN_PROGRESS</SelectItem>
                    <SelectItem value="resolved">RESOLVED</SelectItem>
                    <SelectItem value="reopened">REOPENED</SelectItem>
                    <SelectItem value="rejected">REJECTED</SelectItem>
                    <SelectItem value="closed">CLOSED</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                {loadingTickets ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-14">
                    <Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">No grievances found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try changing filters or search.</p>
                  </div>
                ) : (
                  filteredTickets.map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedId(ticket.id)}
                      className={cn(
                        "w-full text-left rounded-xl border p-3 mb-2 transition-colors",
                        String(selectedId) === String(ticket.id)
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/60 bg-card hover:bg-muted/40"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {ticket.ticket_id}
                        </span>
                        <StatusBadge status={normalizeStatus(ticket.status)} />
                      </div>
                      <p className="text-sm font-semibold text-foreground truncate">
                        {ticket.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(ticket.created_at)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Right Pane - Grievance Detail */}
            <section className="lg:col-span-8 elevated-card overflow-hidden relative">
              {!selectedGrievance ? (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8">
                  <Search className="w-10 h-10 text-muted-foreground/30 mb-3" />
                  <p className="text-lg font-semibold text-foreground">Select a grievance</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose a ticket from the left to view full details here.
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  {loadingDetail && (
                    <div className="absolute inset-0 z-10 bg-background/50 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    </div>
                  )}

                  <div className="p-5 border-b border-border/60 bg-card/60">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded">
                          {selectedGrievance.ticket_id}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyTicket}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Status:</span>
                        <StatusBadge status={normalizeStatus(selectedGrievance.status)} />
                        <div className="ml-3 flex items-center gap-2">
                          {isResolvedStatus && (
                            <>
                              <Button size="sm" className="bg-emerald-600 text-white" onClick={handleClose} disabled={actionLoading}>
                                Close Grievance
                              </Button>
                              <Button size="sm" variant="outline" onClick={handleReopen} disabled={actionLoading}>
                                Reopen Grievance
                              </Button>
                            </>
                          )}
                          {isClosedStatus && (
                            <Button size="sm" variant="outline" onClick={handleReopen} disabled={actionLoading}>
                              Reopen Grievance
                            </Button>
                          )}
                        </div>
                        {/* <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {toStatusEnum(selectedGrievance.status)}
                        </span> */}
                      </div>
                    </div>
                    <h2 className="font-heading font-bold text-xl text-foreground">
                      {selectedGrievance.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(selectedGrievance.created_at)}
                    </p>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                    <div className="rounded-xl border border-border/50 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--muted)/0.2))] p-4">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
                        Grievance Details
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        <div className="rounded-lg border border-border/50 bg-background/70 p-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Department</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{selectedGrievance.department || "Not assigned"}</p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background/70 p-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Priority</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{toStatusLabel(selectedGrievance.priority || "medium")}</p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background/70 p-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Citizen</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{selectedGrievance.citizen_name || "Citizen"}</p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background/70 p-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Assigned Officer</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{selectedGrievance.assigned_officer_name || "Not assigned"}</p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background/70 p-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Created At</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{formatDate(selectedGrievance.created_at)}</p>
                        </div>
                        <div className="rounded-lg border border-border/50 bg-background/70 p-2.5">
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Updated At</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">{formatDate(selectedGrievance.updated_at || selectedGrievance.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Description
                      </h4>
                      <div className="rounded-xl border border-border/50 bg-muted/10 p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {selectedGrievance.description || "No description provided."}
                      </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="space-y-4 pt-4 border-t border-border/40">
                      <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Activity Timeline
                      </h4>
                      {selectedTimeline.length === 0 ? (
                        <div className="rounded-xl border border-border/50 bg-muted/10 p-4 text-sm text-muted-foreground">
                          No activity available yet for this grievance.
                        </div>
                      ) : (
                        <div className="space-y-3 pl-1">
                          {selectedTimeline.map((item, index) => {
                            const statusNorm = item.status ? normalizeStatus(item.status) : "submitted";
                            const colorConfig = statusColorMap[statusNorm] || statusColorMap.submitted;
                            const eventAttachments = Array.isArray(item.attachments) ? item.attachments : [];
                            const resolvedEventAttachments = eventAttachments
                              .map((attachment) => ({
                                ...attachment,
                                href: resolveAttachmentUrl(attachment),
                              }))
                              .filter((attachment) => Boolean(attachment.href));
                            const imageAttachments = resolvedEventAttachments.filter((attachment) => isImageAttachment(attachment));
                            const fileAttachments = resolvedEventAttachments.filter((attachment) => !isImageAttachment(attachment));

                            return (
                              <div key={item.id} className="relative pl-6 pb-2 last:pb-0">
                                {index < selectedTimeline.length - 1 && (
                                  <div className="absolute left-1.5 top-5 bottom-0 w-px bg-border/50" />
                                )}
                                <div className={cn(
                                  "absolute left-0 top-2 w-3 h-3 rounded-full border-2 z-10",
                                  colorConfig.dot
                                )} />
                                <div className={cn("rounded-xl p-3 border border-border/50 bg-background/85", colorConfig.bg)}>
                                  <div className={cn("grid gap-3", resolvedEventAttachments.length > 0 ? "md:grid-cols-[minmax(0,1fr)_220px]" : "") }>
                                    <div>
                                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between mb-2">
                                        <span className={cn(
                                          "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded w-fit",
                                          colorConfig.text,
                                          colorConfig.bg
                                        )}>
                                          {toStatusEnum(statusNorm)}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                          {formatDate(item.created_at)}
                                        </span>
                                      </div>
                                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                        {item.message || "Status updated."}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                                        <UserCheck className="w-3 h-3" /> By {item.created_by || "system"}
                                      </p>
                                    </div>

                                    {resolvedEventAttachments.length > 0 && (
                                      <div className="rounded-lg border border-border/60 bg-background/80 p-2 space-y-2">
                                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                                          Attachments
                                        </p>

                                        {imageAttachments.length > 0 && (
                                          <div className="grid grid-cols-2 gap-1.5">
                                            {imageAttachments.map((attachment, fileIndex) => (
                                              <a
                                                key={`${item.id}-img-${attachment.id || fileIndex}`}
                                                href={attachment.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="block overflow-hidden rounded-md border border-border/50"
                                              >
                                                <img
                                                  src={attachment.href}
                                                  alt={attachment.file_name || "Update attachment"}
                                                  className="h-16 w-full object-cover"
                                                />
                                              </a>
                                            ))}
                                          </div>
                                        )}

                                        {fileAttachments.length > 0 && (
                                          <div className="space-y-1.5">
                                            {fileAttachments.map((attachment, fileIndex) => (
                                              <a
                                                key={`${item.id}-doc-${attachment.id || fileIndex}`}
                                                href={attachment.href}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1 text-[11px] hover:bg-muted/40"
                                              >
                                                <Paperclip className="h-3 w-3 shrink-0 text-primary" />
                                                <span className="truncate text-foreground/90">{attachment.file_name || "Attachment"}</span>
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {(selectedGrievance.location || getLocationLines(selectedGrievance).length > 0 || (Number.isFinite(Number(selectedGrievance.latitude)) && Number.isFinite(Number(selectedGrievance.longitude)))) && (
                      <div className="space-y-2 pt-4 border-t border-border/40">
                        <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" /> Location
                        </h4>
                        <div className="rounded-xl border border-border/50 bg-muted/10 p-1 space-y-2">
                          {Number.isFinite(Number(selectedGrievance.latitude)) && Number.isFinite(Number(selectedGrievance.longitude)) && (
                            <div className="rounded-lg overflow-hidden h-[180px] relative border border-border/40">
                              <MapContainer
                                center={[Number(selectedGrievance.latitude), Number(selectedGrievance.longitude)]}
                                zoom={15}
                                className="h-full w-full z-0"
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution="&copy; OpenStreetMap"
                                />
                                <Marker position={[Number(selectedGrievance.latitude), Number(selectedGrievance.longitude)]} icon={defaultIcon}>
                                  <Popup>{selectedGrievance.ticket_id}</Popup>
                                </Marker>
                              </MapContainer>
                            </div>
                          )}
                          <div className="px-3 py-2">
                            <p className="text-sm text-foreground leading-snug">{selectedGrievance.location || "Location not provided"}</p>
                            {getLocationLines(selectedGrievance).length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-border/40">
                                {getLocationLines(selectedGrievance).map((line) => (
                                  <span key={line} className="text-[10px] px-2 py-0.5 rounded-full bg-background text-muted-foreground border border-border/60">{line}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
      {showReopenModal && (
        <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl">
            <div className="elevated-card p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading font-bold text-lg mb-2">Why are you reopening?</h3>
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Feedback (required)</Label>
              <Textarea className="min-h-[120px] mb-4" placeholder="Describe why this issue needs to be reopened..." value={reopenFeedback} onChange={(e) => setReopenFeedback(e.target.value)} />
              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowReopenModal(false)}>Cancel</Button>
                <Button onClick={submitReopen} disabled={actionLoading}>Submit Reopen</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
