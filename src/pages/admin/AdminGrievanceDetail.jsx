import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, MapPin, Paperclip, UserCheck, AlertCircle } from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import StatusBadge from "@/components/grievance/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categoryLabels } from "@/lib/mock-data";
import { assignOfficerToGrievance, getAdminGrievanceDetail } from "@/lib/api/admin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

function formatFileSize(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size < 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function AdminGrievanceDetail() {
  const { id } = useParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [officerId, setOfficerId] = useState("");
  const [note, setNote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function loadDetail() {
      try {
        const detail = await getAdminGrievanceDetail(id);
        if (mounted) setGrievance(detail);
      } catch {
        if (mounted) setGrievance(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [id]);

  const attachmentCount = grievance?.attachments?.length || 0;
  const locationLines = useMemo(() => {
    if (!grievance) return [];
    const lines = [grievance.area, grievance.city, grievance.state].filter(Boolean);
    if (grievance.pincode) lines.push(`PIN ${grievance.pincode}`);
    return lines;
  }, [grievance]);

  const handleAccept = async () => {
    if (!grievance) return;
    if (!officerId.trim()) {
      toast({ title: "Officer ID required", description: "Enter an officer ID to accept and assign this grievance.", variant: "destructive" });
      return;
    }

    setAssigning(true);
    try {
      const updated = await assignOfficerToGrievance(grievance.id, officerId.trim());
      setGrievance(updated);
      toast({ title: "Grievance accepted", description: "The grievance was assigned successfully." });
    } catch (error) {
      toast({ title: "Assignment failed", description: error.message || "Unable to assign officer.", variant: "destructive" });
    } finally {
      setAssigning(false);
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
        /* @__PURE__ */ jsx("div", { className: "dashboard-topbar", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(Link, { to: "/admin/grievances", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }) }) }),
          /* @__PURE__ */ jsx("h1", { className: "font-heading font-bold text-lg text-foreground", children: "Grievance Details" })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "p-8 text-center min-h-[50vh] flex flex-col items-center justify-center", children: [
          /* @__PURE__ */ jsx(AlertCircle, { className: "w-12 h-12 text-muted-foreground/40 mb-3" }),
          /* @__PURE__ */ jsx("h2", { className: "font-heading font-bold text-2xl text-foreground mb-2", children: "Grievance not found" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-6", children: "The requested grievance could not be loaded from the admin queue." }),
          /* @__PURE__ */ jsx(Link, { to: "/admin/grievances", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Back to Grievances" }) })
        ] })
      ] })
    ] });
  }

  return /* @__PURE__ */ jsxs("div", { className: "dashboard-layout", children: [
    /* @__PURE__ */ jsx(DashboardSidebar, { collapsed: sidebarCollapsed, onToggle: () => setSidebarCollapsed(!sidebarCollapsed) }),
    /* @__PURE__ */ jsxs("main", { className: "dashboard-main bg-muted/10", children: [
      /* @__PURE__ */ jsx("div", { className: "dashboard-topbar", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between w-full gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 min-w-0", children: [
          /* @__PURE__ */ jsx(Link, { to: "/admin/grievances", className: "hidden sm:flex text-muted-foreground hover:text-foreground shrink-0 border border-border/60 bg-muted/30 p-2 rounded-lg transition-colors", children: /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-mono", children: grievance.ticket_id }),
            /* @__PURE__ */ jsx("h1", { className: "font-heading font-bold text-lg text-foreground truncate", children: grievance.title })
          ] })
        ] }),
        /* @__PURE__ */ jsx(StatusBadge, { status: grievance.status.replace("_", "-") })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "p-4 md:p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-5xl mx-auto space-y-6", children: [
        /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, className: "elevated-card bg-card p-6 md:p-8", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-muted text-muted-foreground border border-border/60", children: categoryLabels[grievance.category] || grievance.category }),
            grievance.priority && /* @__PURE__ */ jsx("span", { className: cn("inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide", grievance.priority === "critical" ? "priority-critical" : grievance.priority === "high" ? "priority-high" : grievance.priority === "medium" ? "priority-medium" : "priority-low"), children: `${grievance.priority} Priority` })
          ] }),
          /* @__PURE__ */ jsx("h2", { className: "font-heading font-bold text-2xl text-foreground mb-3", children: "Issue Details" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap", children: grievance.description }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pt-6 border-t border-border/60", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-foreground", children: "Location" }),
              grievance.location && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/20 p-4", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1", children: "Address / Landmark" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground", children: grievance.location })
              ] }),
              locationLines.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: locationLines.map((line) => /* @__PURE__ */ jsx("span", { className: "text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground border border-border/60", children: line }, line)) }),
              grievance.latitude != null && grievance.longitude != null && /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/10 p-4 text-sm", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1", children: "Coordinates" }),
                /* @__PURE__ */ jsxs("p", { className: "font-mono text-foreground", children: [Number(grievance.latitude).toFixed(5), ", ", Number(grievance.longitude).toFixed(5)] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-sm font-bold text-foreground", children: "Assignment" }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border/60 bg-muted/20 p-4 space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Officer ID" }),
                  /* @__PURE__ */ jsx(Input, { className: "mt-2", placeholder: "Enter officer ID to accept and assign", value: officerId, onChange: (e) => setOfficerId(e.target.value) })
                ] }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx(Label, { className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground", children: "Admin Note" }),
                  /* @__PURE__ */ jsx(Textarea, { className: "mt-2 min-h-[100px]", placeholder: "Optional internal note", value: note, onChange: (e) => setNote(e.target.value) })
                ] }),
                /* @__PURE__ */ jsx(Button, { className: "w-full", onClick: handleAccept, disabled: assigning, children: assigning ? "Assigning..." : "Accept & Assign" }),
                note && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground flex items-start gap-2", children: [
                  /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 shrink-0 mt-0.5 text-secondary" }),
                  note
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "elevated-card bg-card p-6", children: [
          /* @__PURE__ */ jsxs("h3", { className: "text-sm font-bold text-foreground flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsx(Paperclip, { className: "w-4 h-4 text-primary" }),
            " Attachments",
            /* @__PURE__ */ jsx("span", { className: "text-xs font-normal text-muted-foreground", children: attachmentCount ? `(${attachmentCount})` : "(none)" })
          ] }),
          attachmentCount > 0 ? /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3", children: grievance.attachments.map((attachment) => /* @__PURE__ */ jsxs("a", { href: attachment.file_url, target: "_blank", rel: "noreferrer", className: "flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/20 px-3 py-2.5 hover:bg-muted/40 transition-colors", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-foreground truncate", children: attachment.file_name || "Attachment" }),
              /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-muted-foreground mt-0.5", children: [
                attachment.file_type || "File",
                attachment.file_size ? ` · ${formatFileSize(attachment.file_size)}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsx("span", { className: "text-[11px] font-semibold text-primary shrink-0", children: "Open" })
          ] }, attachment.id || attachment.file_name)) }) : /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No attachments provided." })
        ] })
      ] }) })
    ] })
  ] });
}

export {
  AdminGrievanceDetail as default
};