import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { motion } from "framer-motion";
import { LifeBuoy, MessageSquare, AlertTriangle, ChevronDown, Rocket, Clock, Zap } from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/button";
const faqs = [
  { q: "How fast are grievances resolved?", a: "SLA (Service Level Agreement) dictates that critical issues are addressed within 48 hours, high priority in 3-5 days, and standard issues within 7-10 days depending on the department workload." },
  { q: "Can I edit a submitted grievance?", a: "Once submitted, a grievance cannot be directly edited to maintain tamper-proof records. However, you can add follow-up context through comments or contact support referencing your Ticket ID." },
  { q: "How do I escalate urgent issues?", a: 'If an issue breaches its SLA timeline, an "Escalate" button will automatically appear in your ticket details view. This alerts the Admin oversight committee immediately.' },
  { q: "What happens if my ticket is wrongly categorized?", a: "The auto-routing system usually handles categorization, but if a mistake occurs, the designated officer will re-route it to the correct department internally without any action required from you." }
];
function CitizenHelp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  return /* @__PURE__ */ jsxs("div", { className: "dashboard-layout", children: [
    /* @__PURE__ */ jsx(DashboardSidebar, { collapsed: sidebarCollapsed, onToggle: () => setSidebarCollapsed(!sidebarCollapsed) }),
    /* @__PURE__ */ jsxs("main", { className: "dashboard-main", children: [
      /* @__PURE__ */ jsxs("div", { className: "dashboard-topbar", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h1", { className: "font-heading font-bold text-lg text-foreground", children: "Help Desk & Support" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Resources and FAQs for navigating the portal" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", className: "gap-2", children: [
          /* @__PURE__ */ jsx(MessageSquare, { className: "w-3.5 h-3.5" }),
          " Contact Support"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
          /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0 }, className: "elevated-card p-5 group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(Rocket, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-heading font-semibold text-foreground mb-1", children: "Quick Start Guide" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Learn the basics of filing a grievance, attaching evidence, and tracking progress." }),
            /* @__PURE__ */ jsx("button", { className: "text-xs font-semibold text-primary mt-3 flex items-center gap-1 hover:underline", children: "Read Guide" })
          ] }),
          /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 }, className: "elevated-card p-5 group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(Clock, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-heading font-semibold text-foreground mb-1", children: "Understanding SLAs" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "View timeline commitments and resolution guarantees by department." }),
            /* @__PURE__ */ jsx("button", { className: "text-xs font-semibold text-secondary mt-3 flex items-center gap-1 hover:underline", children: "View Timelines" })
          ] }),
          /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.2 }, className: "elevated-card p-5 group", children: [
            /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5" }) }),
            /* @__PURE__ */ jsx("h3", { className: "font-heading font-semibold text-foreground mb-1", children: "Escalation Policy" }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed", children: "Know how and when to escalate unresponsive or unresolved tickets." }),
            /* @__PURE__ */ jsx("button", { className: "text-xs font-semibold text-amber-600 mt-3 flex items-center gap-1 hover:underline", children: "Read Policy" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.3 }, className: "elevated-card p-6 border-l-4 border-l-info", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center shrink-0 mt-1", children: /* @__PURE__ */ jsx(Zap, { className: "w-5 h-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "font-heading font-bold text-lg text-foreground mb-2", children: "Tips for Faster Resolution" }),
            /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsx("strong", { className: "text-foreground block mb-1", children: "\u{1F4CC} Precise Location" }),
                "Add clear landmarks, PIN codes, or drop a map pin for accurate field routing."
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsx("strong", { className: "text-foreground block mb-1", children: "\u{1F4F7} Visual Evidence" }),
                "Attach clear photos or videos. Tickets with evidence get prioritized by officers."
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsx("strong", { className: "text-foreground block mb-1", children: "\u{1F4DD} Clear Titles" }),
                'Write brief, descriptive titles (e.g., "Pothole on Main St." instead of "Bad Road").'
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground", children: [
                /* @__PURE__ */ jsx("strong", { className: "text-foreground block mb-1", children: "\u{1F504} Avoid Duplicates" }),
                "Search open tickets in your area before submitting to prevent system clutter."
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.4 }, className: "elevated-card p-6", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-6", children: [
            /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-lg bg-muted flex items-center justify-center", children: /* @__PURE__ */ jsx(LifeBuoy, { className: "w-4 h-4 text-foreground" }) }),
            /* @__PURE__ */ jsx("h2", { className: "font-heading font-bold text-lg text-foreground", children: "Frequently Asked Questions" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-4", children: faqs.map((item, i) => /* @__PURE__ */ jsxs("details", { className: "group rounded-xl border border-border bg-card overflow-hidden", children: [
            /* @__PURE__ */ jsxs("summary", { className: "flex items-center justify-between p-4 font-semibold cursor-pointer select-none outline-none group-open:bg-muted/30 transition-colors", children: [
              item.q,
              /* @__PURE__ */ jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "p-4 pt-1 text-sm text-muted-foreground border-t border-border/50 bg-muted/10 leading-relaxed", children: item.a })
          ] }, i)) })
        ] })
      ] }) })
    ] })
  ] });
}
export {
  CitizenHelp as default
};
