import { jsx, jsxs } from "react/jsx-runtime";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { categoryLabels } from "@/lib/mock-data";
const priorityCls = {
  critical: "priority-critical",
  high: "priority-high",
  medium: "priority-medium",
  low: "priority-low"
};
function GrievanceCard({ grievance, href }) {
  const date = new Date(grievance.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  return /* @__PURE__ */ jsxs("div", { className: "stat-card group", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-3 gap-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-1", children: /* @__PURE__ */ jsx("p", { className: "text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded", children: grievance.ticketId }) }),
        /* @__PURE__ */ jsx("h3", { className: "font-heading font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors", children: grievance.title })
      ] }),
      /* @__PURE__ */ jsx(StatusBadge, { status: grievance.status })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed", children: grievance.description }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-xs text-muted-foreground mb-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 text-primary shrink-0" }),
        grievance.location
      ] }),
      /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsx(Clock, { className: "w-3.5 h-3.5 shrink-0" }),
        date
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-border/50", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-xs font-medium px-2.5 py-1 rounded-lg bg-muted text-muted-foreground", children: categoryLabels[grievance.category] }),
        grievance.priority && /* @__PURE__ */ jsx("span", { className: priorityCls[grievance.priority] || "priority-low", children: grievance.priority })
      ] }),
      /* @__PURE__ */ jsxs(
        Link,
        {
          to: href || `/grievance/${grievance.id}`,
          className: "text-xs font-semibold text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all hover:gap-1.5 duration-200",
          children: [
            "View ",
            /* @__PURE__ */ jsx(ArrowRight, { className: "w-3.5 h-3.5" })
          ]
        }
      )
    ] })
  ] });
}
export {
  GrievanceCard as default
};
