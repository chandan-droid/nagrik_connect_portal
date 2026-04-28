import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  ArrowLeft,
  Star,
  CheckCircle2,
  Share2,
  MessageSquare,
  Tag,
  Calendar,
  AlertTriangle,
  FileImage,
  Paperclip,
  ExternalLink,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import StatusBadge from "@/components/grievance/StatusBadge";
import { categoryLabels } from "@/lib/mock-data";
import {
  closeCitizenGrievance,
  getCitizenGrievanceDetail,
  reopenCitizenGrievance
} from "@/lib/api/citizen";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
const statusOrder = ["submitted", "under_review", "in_progress", "resolved", "closed"];
const statusDisplay = {
  submitted: "Submitted",
  under_review: "Under Review",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed"
};
const customIcon = L.divIcon({
  className: "custom-map-marker",
  html: `<div style="color: hsl(0, 84%, 60%); display: flex; justify-content: center; align-items: center; width: 36px; height: 36px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="hsl(0, 84%, 60%)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36]
});

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getLocationLines(grievance) {
  const location = grievance.location_details || {};
  const lines = [location.area, location.city, location.state].filter(Boolean);
  if (location.pincode) lines.push(`PIN ${location.pincode}`);
  return lines;
}

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: [1, 2, 3, 4, 5].map((s) => /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: () => onChange?.(s),
      onMouseEnter: () => setHover(s),
      onMouseLeave: () => setHover(0),
      className: cn("transition-transform hover:scale-110", onChange ? "cursor-pointer" : "cursor-default"),
      children: /* @__PURE__ */ jsx(Star, { className: `w-6 h-6 ${s <= (hover || value) ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}` })
    },
    s
  )) });
}
function GrievanceDetail() {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [grievance, setGrievance] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenFeedback, setReopenFeedback] = useState("");
  const [expandedImage, setExpandedImage] = useState(null);
  const { toast } = useToast();
  useEffect(() => {
    let mounted = true;
    async function loadDetails() {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      const detail = await getCitizenGrievanceDetail(id);
      if (mounted) {
        setGrievance(detail.grievance);
        setTimeline(detail.timeline);
      }
    } catch {
      if (mounted) {
        setGrievance(null);
        setTimeline([]);
      }
    } finally {
      if (mounted) setLoading(false);
    }
    }
    loadDetails();
    return () => {
      mounted = false;
    };
  }, [id]);
  const copyTicketId = () => {
    if (grievance) {
      navigator.clipboard.writeText(grievance.ticket_id).then(() => {
        toast({ title: "Copied!", description: "Ticket ID copied to clipboard." });
      });
    }
  };
  const handleFeedback = () => {
    if (!userRating) {
      toast({ title: "Please rate the service", variant: "destructive" });
      return;
    }
    setFeedbackSubmitted(true);
    toast({ title: "\u2705 Feedback Submitted", description: "Thank you for rating our service!" });
  };
  const handleClose = async () => {
    if (!grievance) return;
    try {
      const updated = await closeCitizenGrievance(grievance.id);
      setGrievance(updated);
      toast({ title: "Grievance closed", description: "Status updated to CLOSED." });
    } catch (error) {
      toast({ title: "Action failed", description: error.message || "Unable to close grievance.", variant: "destructive" });
    }
  };
  const handleReopen = () => {
    setReopenFeedback("");
    setShowReopenModal(true);
  };

  const submitReopen = async () => {
    if (!grievance) return;
    if (!reopenFeedback || reopenFeedback.trim().length < 5) {
      toast({ title: "Please provide feedback", description: "Feedback must be at least 5 characters.", variant: "destructive" });
      return;
    }
    try {
      const updated = await reopenCitizenGrievance(grievance.id, { feedback: reopenFeedback.trim() });
      setGrievance(updated);
      setShowReopenModal(false);
      toast({ title: "Grievance reopened", description: "Status updated to REOPENED." });
    } catch (error) {
      toast({ title: "Action failed", description: error.message || "Unable to reopen grievance.", variant: "destructive" });
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "dashboard-layout", children: [
      /* @__PURE__ */ jsx(DashboardSidebar, { collapsed: sidebarCollapsed, onToggle: () => setSidebarCollapsed(!sidebarCollapsed) }),
      /* @__PURE__ */ jsx("main", { className: "dashboard-main flex items-center justify-center bg-muted/10", children: /* @__PURE__ */ jsx("div", { className: "animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" }) })
    ] });
  }
  if (!grievance) {
    return /* @__PURE__ */ jsxs("div", { className: "dashboard-layout", children: [
      /* @__PURE__ */ jsx(DashboardSidebar, { collapsed: sidebarCollapsed, onToggle: () => setSidebarCollapsed(!sidebarCollapsed) }),
      /* @__PURE__ */ jsxs("main", { className: "dashboard-main bg-muted/10", children: [
        /* @__PURE__ */ jsxs("div", { className: "dashboard-topbar", children: [
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h1", { className: "font-heading font-bold text-lg text-foreground", children: "Ticket Details" }) }),
          /* @__PURE__ */ jsx(Link, { to: "/citizen/tickets", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "Back to List" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "p-8 text-center flex flex-col items-center justify-center min-h-[50vh]", children: [
          /* @__PURE__ */ jsx("div", { className: "w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-8 h-8 text-destructive" }) }),
          /* @__PURE__ */ jsx("h2", { className: "font-heading font-bold text-2xl text-foreground mb-2", children: "Grievance Not Found" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "The item you're looking for doesn't exist or may have been removed." }),
          /* @__PURE__ */ jsx(Link, { to: "/citizen/tickets", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", children: [
            /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }),
            " Back to Tickets"
          ] }) })
        ] })
      ] })
    ] });
  }
  const currentIdx = statusOrder.indexOf(grievance.status);
  return /* @__PURE__ */ jsxs("div", { className: "dashboard-layout", children: [
    /* @__PURE__ */ jsx(DashboardSidebar, { collapsed: sidebarCollapsed, onToggle: () => setSidebarCollapsed(!sidebarCollapsed) }),
    /* @__PURE__ */ jsxs("main", { className: "dashboard-main bg-muted/10 relative", children: [
      /* @__PURE__ */ jsx("div", { className: "dashboard-topbar justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center gap-4 w-full", children: [
        /* @__PURE__ */ jsx(Link, { to: "/citizen/tickets", className: "hidden sm:flex text-muted-foreground hover:text-foreground shrink-0 border border-border/60 bg-muted/30 p-2 rounded-lg transition-colors", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pr-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
            /* @__PURE__ */ jsx("span", { className: "font-mono text-xs font-semibold text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded cursor-pointer hover:bg-muted/70 transition-colors", onClick: copyTicketId, title: "Click to copy", children: grievance.ticket_id }),
            /* @__PURE__ */ jsx(StatusBadge, { status: grievance.status.replace("_", "-") })
          ] }),
          /* @__PURE__ */ jsx("h1", { className: "font-heading font-bold text-lg text-foreground truncate", children: grievance.title })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-2 shrink-0 hidden sm:flex", onClick: copyTicketId, children: [
          /* @__PURE__ */ jsx(Share2, { className: "w-4 h-4" }),
          " Share URL"
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "p-4 md:p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
        /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, className: "elevated-card bg-card overflow-hidden", children: [
          /* @__PURE__ */ jsx("div", { className: cn("px-6 py-4 border-b", grievance.status === "resolved" ? "bg-emerald-500/10 border-emerald-500/20" : "bg-muted/30 border-border/50"), children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "flex gap-1.5 mb-2", children: statusOrder.map((s, i) => /* @__PURE__ */ jsx("div", { className: cn("flex-1 h-3 rounded-full transition-all duration-500 shadow-sm", i <= currentIdx ? grievance.status === "resolved" ? "bg-emerald-500" : "bg-secondary" : "bg-muted border border-border/50") }, s)) }),
            /* @__PURE__ */ jsx("div", { className: "flex justify-between text-[11px] font-semibold text-muted-foreground px-1", children: statusOrder.map((s, i) => /* @__PURE__ */ jsx("span", { className: cn(i <= currentIdx ? grievance.status === "resolved" ? "text-emerald-700 dark:text-emerald-400" : "text-foreground" : "text-muted-foreground/50"), children: statusDisplay[s] }, s)) })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "p-6 md:p-8", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2.5 mb-5", children: [
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border border-border/60 shadow-sm", children: [
                /* @__PURE__ */ jsx(Tag, { className: "w-3.5 h-3.5" }),
                categoryLabels[grievance.category.replace("_", "-")] || grievance.category
              ] }),
              /* @__PURE__ */ jsxs("span", { className: cn(
                "inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide",
                grievance.priority === "critical" ? "priority-critical" : grievance.priority === "high" ? "priority-high" : grievance.priority === "medium" ? "priority-medium" : "priority-low"
              ), children: [
                grievance.priority,
                " Priority"
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-card text-muted-foreground border border-border", children: [
                /* @__PURE__ */ jsx(Calendar, { className: "w-3.5 h-3.5" }),
                " ",
                new Date(grievance.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-5", children: [
              grievance.status === "resolved" && /* @__PURE__ */ jsx(Button, { size: "sm", onClick: handleClose, children: "Close Grievance" }),
              ["resolved", "closed"].includes(grievance.status) && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: handleReopen, children: "Reopen Grievance" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "p-5 rounded-2xl bg-muted/10 border border-border/50 mb-6", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2", children: "Description" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground leading-relaxed whitespace-pre-wrap", children: grievance.description })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/60", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-foreground flex items-center gap-2 mb-3", children: [
                  /* @__PURE__ */ jsx(MapPin, { className: "w-4 h-4 text-primary" }),
                  " Location Intelligence"
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
                  grievance.location && /* @__PURE__ */ jsxs("div", { className: "text-sm p-3 rounded-xl bg-muted/30 border border-border text-muted-foreground", children: [
                    /* @__PURE__ */ jsx("span", { className: "font-semibold text-foreground/80 block mb-0.5 text-xs uppercase tracking-wide", children: "Address / Landmark" }),
                    grievance.location
                  ] }),
                  getLocationLines(grievance).length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: getLocationLines(grievance).map((line) => /* @__PURE__ */ jsx("span", { className: "text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/60", children: line }, line)) }),
                  grievance.coordinates && /* @__PURE__ */ jsxs("div", { className: "rounded-2xl overflow-hidden border-2 border-border shadow-sm h-[180px] w-full relative z-0", children: [
                    /* @__PURE__ */ jsxs(
                      MapContainer,
                      {
                        center: grievance.coordinates,
                        zoom: 15,
                        style: { width: "100%", height: "100%" },
                        zoomControl: false,
                        dragging: false,
                        scrollWheelZoom: false,
                        doubleClickZoom: false,
                        children: [
                          /* @__PURE__ */ jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "\xA9 OpenStreetMap" }),
                          /* @__PURE__ */ jsx(Marker, { position: grievance.coordinates, icon: customIcon })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "a",
                      {
                        href: `https://www.openstreetmap.org/?mlat=${grievance.coordinates[0]}&mlon=${grievance.coordinates[1]}#map=16/${grievance.coordinates[0]}/${grievance.coordinates[1]}`,
                        target: "_blank",
                        rel: "noreferrer",
                        className: "absolute bottom-2 right-2 z-[999] bg-background/90 backdrop-blur-sm px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-foreground border border-border flex items-center gap-1.5 hover:bg-muted transition-colors shadow-sm cursor-pointer",
                        children: [
                          /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3" }),
                          " View Map"
                        ]
                      }
                    )
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-foreground flex items-center gap-2 mb-3", children: [
                  /* @__PURE__ */ jsx(FileImage, { className: "w-4 h-4 text-primary" }),
                  " Field Evidence"
                ] }),
                grievance.images && grievance.images.length > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-3", children: grievance.images.map((img, i) => /* @__PURE__ */ jsxs("div", { className: "aspect-video rounded-xl border border-border overflow-hidden bg-muted group cursor-pointer relative", onClick: () => setExpandedImage(img), children: [
                  /* @__PURE__ */ jsx("img", { src: img, alt: `Evidence ${i}`, className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" }),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsx(ExternalLink, { className: "w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" }) })
                ] }, i)) }) : /* @__PURE__ */ jsxs("div", { className: "h-[180px] rounded-2xl border border-dashed border-border bg-muted/10 flex flex-col items-center justify-center text-muted-foreground", children: [
                  /* @__PURE__ */ jsx(FileImage, { className: "w-8 h-8 opacity-20 mb-2" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs", children: "No photos attached" })
                ] }),
                grievance.attachments && grievance.attachments.length > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
                  /* @__PURE__ */ jsxs("h4", { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(Paperclip, { className: "w-3.5 h-3.5" }),
                    " Attachments"
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "space-y-2 max-h-[220px] overflow-auto pr-1", children: grievance.attachments.map((attachment) => /* @__PURE__ */ jsxs("a", { href: attachment.file_url, target: "_blank", rel: "noreferrer", className: "flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors", children: [
                    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground truncate", children: attachment.file_name }),
                      /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
                        attachment.file_type || "File",
                        attachment.file_size ? ` · ${formatFileSize(attachment.file_size)}` : ""
                      ] })
                    ] }),
                    /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold text-primary shrink-0", children: "Open" })
                  ] }, attachment.id)) })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-6", children: [
          /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "lg:col-span-3 elevated-card bg-card p-6 md:p-8", children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-heading font-bold text-lg text-foreground mb-6 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5 text-primary" }),
              " Activity Timeline"
            ] }),
            timeline.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-border", children: [
              /* @__PURE__ */ jsx(MessageSquare, { className: "w-10 h-10 text-muted-foreground/30 mx-auto mb-3" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground mb-1", children: "No activity yet" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Updates will appear here as your grievance progresses." })
            ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-0", children: timeline.map((event, i) => /* @__PURE__ */ jsxs("div", { className: "timeline-item pb-7 group", children: [
              i < timeline.length - 1 && /* @__PURE__ */ jsx("div", { className: "timeline-line group-hover:bg-primary/20 transition-colors" }),
              /* @__PURE__ */ jsx("div", { className: cn(
                "timeline-dot z-10",
                i === timeline.length - 1 ? "border-secondary bg-secondary/10 shadow-sm shadow-secondary/20 ring-4 ring-secondary/5" : "border-primary/20 bg-card"
              ), children: /* @__PURE__ */ jsx(CheckCircle2, { className: cn("w-4 h-4", i === timeline.length - 1 ? "text-secondary" : "text-primary/40") }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0 pt-0.5 pl-2", children: [
                /* @__PURE__ */ jsx(StatusBadge, { status: event.status.replace("_", "-") }),
                /* @__PURE__ */ jsxs("div", { className: "mt-3 p-4 rounded-xl bg-muted/20 border border-border/50 group-hover:border-primary/20 transition-colors shadow-sm", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground leading-relaxed", children: event.message }),
                  /* @__PURE__ */ jsx("p", { className: "text-[11px] text-muted-foreground mt-2 font-mono bg-background inline-block px-2 py-0.5 rounded border border-border", children: new Date(event.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) })
                ] })
              ] })
            ] }, event.id)) })
          ] }),
          ["resolved", "closed"].includes(grievance.status) && /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 0.2 }, className: "lg:col-span-2", children: /* @__PURE__ */ jsxs("div", { className: "elevated-card p-6 border-emerald-500/20 bg-emerald-500/[0.02]", children: [
            /* @__PURE__ */ jsxs("h2", { className: "font-heading font-bold text-lg text-foreground mb-1 flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(Star, { className: "w-5 h-5 text-amber-500 fill-amber-500" }),
              " Rate Resolution"
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-6", children: "How satisfied are you with how this grievance was handled by our officers?" }),
            feedbackSubmitted ? /* @__PURE__ */ jsxs("div", { className: "p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center", children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "w-8 h-8 text-emerald-600 mx-auto mb-2" }),
              /* @__PURE__ */ jsx("p", { className: "font-semibold text-emerald-700 dark:text-emerald-400", children: "Response Recorded" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-emerald-600/70 mt-1", children: "Thank you for your valuable feedback!" })
            ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-5", children: [
              /* @__PURE__ */ jsx("div", { className: "flex justify-center p-3 bg-card rounded-xl border border-border shadow-sm", children: /* @__PURE__ */ jsx(StarRating, { value: userRating, onChange: setUserRating }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs(Label, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block", children: [
                  "Direct Comments ",
                  /* @__PURE__ */ jsx("span", { className: "font-normal opacity-70", children: "(Optional)" })
                ] }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    className: "min-h-[100px] resize-none text-sm bg-card",
                    placeholder: "Share your experience or highlight any specific officers...",
                    value: feedbackText,
                    onChange: (e) => setFeedbackText(e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  onClick: handleFeedback,
                  className: "w-full gradient-primary text-white font-semibold shadow-md",
                  disabled: !userRating,
                  children: "Submit Review"
                }
              )
            ] })
          ] }) })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(AnimatePresence, { children: [
      showReopenModal && /* @__PURE__ */ jsxs(
        motion.div,
        {
          key: "reopen-modal",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "fixed inset-0 z-[9998] bg-background/75 backdrop-blur-sm flex items-center justify-center p-4 md:p-8",
          onClick: () => setShowReopenModal(false),
          children: [
            /* @__PURE__ */ jsx("div", { className: "relative w-full max-w-xl", children: /* @__PURE__ */ jsxs("div", { className: "elevated-card p-6 md:p-8", onClick: (e) => e.stopPropagation(), children: [
              /* @__PURE__ */ jsxs("h3", { className: "font-heading font-bold text-lg text-foreground mb-3", children: ["Why are you reopening?"] }),
              /* @__PURE__ */ jsx(Label, { className: "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block", children: "Feedback (required)" }),
              /* @__PURE__ */ jsx(Textarea, { className: "min-h-[120px] mb-4", placeholder: "Describe why this issue needs to be reopened...", value: reopenFeedback, onChange: (e) => setReopenFeedback(e.target.value) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 justify-end", children: [
                /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setShowReopenModal(false), children: "Cancel" }),
                /* @__PURE__ */ jsx(Button, { onClick: submitReopen, children: "Submit Reopen" })
              ] })
            ] }) }),
          ]
        }
      ),
      expandedImage && /* @__PURE__ */ jsxs(
        motion.div,
        {
          key: "expanded-image",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          className: "fixed inset-0 z-[9999] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8",
          onClick: () => setExpandedImage(null),
          children: [
            /* @__PURE__ */ jsx("button", { className: "absolute top-6 right-6 p-2 rounded-full bg-muted/50 text-foreground hover:bg-destructive hover:text-white transition-colors", onClick: () => setExpandedImage(null), children: /* @__PURE__ */ jsx(X, { className: "w-6 h-6" }) }),
            /* @__PURE__ */ jsx(
              motion.img,
              {
                initial: { scale: 0.9, y: 20 },
                animate: { scale: 1, y: 0 },
                exit: { scale: 0.9, y: 20 },
                src: expandedImage,
                alt: "Expanded evidence",
                className: "max-w-full max-h-full object-contain rounded-lg shadow-2xl",
                onClick: (e) => e.stopPropagation()
              }
            )
          ]
        }
      )
    ] })
  ] });
}
export {
  GrievanceDetail as default
};
