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
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  ArrowRight,
  PlayCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import StatusBadge from "@/components/grievance/StatusBadge";
import { statusLabels } from "@/lib/mock-data";
import { getCitizenGrievanceDetail, getCitizenGrievances } from "@/lib/api/citizen";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

function normalizeStatus(value) {
  if (value === "under_review") return "under-review";
  if (value === "in_progress") return "in-progress";
  return value || "submitted";
}

function denormalizeStatus(value) {
  if (value === "under-review") return "under_review";
  if (value === "in-progress") return "in_progress";
  return value || "submitted";
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

function getLocationLines(grievance) {
  const location = grievance?.location_details || {};
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
  closed: XCircle,
};

const statusStepColors = {
  submitted: "bg-info text-info-foreground",
  "under-review": "bg-accent text-accent-foreground",
  "in-progress": "bg-primary text-primary-foreground",
  resolved: "bg-secondary text-secondary-foreground",
  closed: "bg-muted text-muted-foreground",
};

export default function CitizenWorkspace() {
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

  const timeline = useMemo(() => {
    const source = Array.isArray(detail?.timeline) ? detail.timeline : [];
    return [...source].sort(
      (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
    );
  }, [detail]);

  const images = useMemo(() => {
    if (!selectedGrievance?.attachments) return [];
    return selectedGrievance.attachments
      .filter((att) => att.file_type?.startsWith("image/") || att.file_name?.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .map((att) => att.file_url);
  }, [selectedGrievance]);

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

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main className="dashboard-main bg-muted/10">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">
              My Grievance Panel
            </h1>
            <p className="text-xs text-muted-foreground">
              Single workspace to track, review, and manage all your grievances.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
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
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
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
                    <div className="flex items-center justify-between gap-3 mb-2">
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
                      <StatusBadge status={normalizeStatus(selectedGrievance.status)} />
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
                    {/* Status Tracker */}
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {statusOrder.map((status, index) => {
                          const currentIndex = statusOrder.indexOf(normalizeStatus(selectedGrievance.status));
                          const Icon = statusIcons[status];
                          const isDone = index < currentIndex;
                          const isCurrent = index === currentIndex;
                          return (
                            <div key={status} className="flex-1 flex flex-col items-center gap-1">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                  isCurrent
                                    ? `${statusStepColors[status]} shadow-sm`
                                    : isDone
                                    ? "bg-secondary text-white"
                                    : "bg-muted text-muted-foreground"
                                )}
                              >
                                {isDone ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <Icon className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <span
                                className={cn(
                                  "text-[10px] text-center",
                                  isCurrent ? "text-foreground font-semibold" : "text-muted-foreground"
                                )}
                              >
                                {statusLabels[denormalizeStatus(status)]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Grid Layout matching OfficerQueue */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 mt-2">
                      {/* Left Column: Actions, Description, Timeline */}
                      <div className="space-y-6">
                        {/* Workspace Actions */}
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                            <PlayCircle className="w-3.5 h-3.5" /> Workspace Actions
                          </h4>
                          <div className="rounded-xl border border-border/50 bg-muted/10 p-6 text-center shadow-sm">
                            <CheckCircle2 className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-foreground">Status Logged</p>
                            <p className="text-xs text-muted-foreground mt-1 max-w-[250px] mx-auto leading-relaxed">
                              This grievance is <strong className="uppercase text-foreground/80">{normalizeStatus(selectedGrievance.status).replace("-", " ")}</strong>. Keep checking this space for updates.
                            </p>
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
                          {timeline.length === 0 ? (
                            <div className="rounded-xl border border-border/50 bg-muted/10 p-4 text-sm text-muted-foreground">
                              No activity available yet for this grievance.
                            </div>
                          ) : (
                            <div className="space-y-0 pl-1">
                              {timeline.map((item, index) => (
                                <div key={item.id} className="relative pl-6 pb-6 last:pb-0">
                                  {index < timeline.length - 1 && (
                                    <div className="absolute left-1.5 top-5 bottom-0 w-px bg-border/60" />
                                  )}
                                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full border-2 z-10 border-primary/30 bg-primary/10" />
                                  <div className="bg-muted/10 rounded-xl p-3 border border-border/50">
                                    <div className="flex justify-between items-start gap-4 mb-1">
                                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                                        {item.status ? normalizeStatus(item.status).replace("-", " ") : "Update"}
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
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Column: Coordinates & Attachments */}
                      <div className="space-y-6">
                        {/* Coordinates Widget */}
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Coordinates
                          </h4>
                          <div className="rounded-xl border border-border/50 bg-muted/10 p-1 space-y-2">
                            <div className="rounded-lg overflow-hidden h-[180px] relative border border-border/40">
                              {selectedGrievance.latitude && selectedGrievance.longitude ? (
                                <MapContainer 
                                  center={[selectedGrievance.latitude, selectedGrievance.longitude]} 
                                  zoom={15} 
                                  className="h-full w-full z-0"
                                >
                                  <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap"
                                  />
                                  <Marker position={[selectedGrievance.latitude, selectedGrievance.longitude]} icon={defaultIcon}>
                                    <Popup>{selectedGrievance.ticket_id}</Popup>
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

                        {/* Attachments */}
                        <div className="space-y-2">
                          <h4 className="text-xs uppercase tracking-widest text-muted-foreground font-semibold flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Paperclip className="w-3.5 h-3.5" /> Media & Attachments
                            </span>
                            <span className="bg-muted px-2 py-0.5 rounded text-[10px]">{selectedGrievance.attachments?.length || 0}</span>
                          </h4>
                          
                          <div className="rounded-xl border border-border/50 bg-muted/10 p-3 space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar">
                            {images.length > 0 && (
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                {images.map((imgUrl, idx) => (
                                  <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-md border border-border/50 group relative">
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                                      <ArrowRight className="text-white w-4 h-4" />
                                    </div>
                                    <img src={imgUrl} alt="Attachment Preview" className="w-full h-20 object-cover transition-transform group-hover:scale-105" />
                                  </a>
                                ))}
                              </div>
                            )}
                            
                            {selectedGrievance.attachments?.length > 0 ? (
                              selectedGrievance.attachments.map((attachment) => {
                                if (images.includes(attachment.file_url)) return null;
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
                                    <span className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">Open</span>
                                  </a>
                                );
                              })
                            ) : (
                              <p className="text-sm text-muted-foreground p-2">No attachments found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
