import { jsx, jsxs } from "react/jsx-runtime";
import { Shield, Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
function Footer() {
  return /* @__PURE__ */ jsx("footer", { className: "bg-card border-t border-border mt-auto", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 pt-12 pb-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-8 mb-10", children: [
      /* @__PURE__ */ jsxs("div", { className: "md:col-span-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 mb-4", children: [
          /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md", children: /* @__PURE__ */ jsx(Shield, { className: "w-4.5 h-4.5 text-white" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-heading font-bold text-sm text-foreground", children: "Nagrik Grievance" }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground tracking-widest uppercase", children: "Portal" })
          ] })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground leading-relaxed mb-4 max-w-[220px]", children: "Empowering citizens to voice their concerns and ensuring transparent, accountable governance for all." }),
        /* @__PURE__ */ jsx("div", { className: "h-1 w-16 rounded-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-heading font-semibold text-sm mb-4 text-foreground", children: "Quick Links" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: [
          { label: "File a Grievance", path: "/submit" },
          { label: "Track Status", path: "/track" },
          { label: "My Dashboard", path: "/citizen" },
          { label: "Sign In / Register", path: "/auth" }
        ].map((l) => /* @__PURE__ */ jsx(Link, { to: l.path, className: "block text-xs text-muted-foreground hover:text-primary transition-colors", children: l.label }, l.path)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-heading font-semibold text-sm mb-4 text-foreground", children: "Legal & Policy" }),
        /* @__PURE__ */ jsx("div", { className: "space-y-2.5", children: [
          "Right to Service Act",
          "RTI Guidelines",
          "Privacy Policy",
          "Terms of Service",
          "Accessibility"
        ].map((l) => /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer", children: [
          l,
          " ",
          /* @__PURE__ */ jsx(ExternalLink, { className: "w-3 h-3 opacity-50" })
        ] }, l)) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "font-heading font-semibold text-sm mb-4 text-foreground", children: "Contact & Support" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Phone, { className: "w-3.5 h-3.5 text-primary shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "Helpline" }),
              /* @__PURE__ */ jsx("p", { children: "1800-XXX-XXXX (Toll Free)" }),
              /* @__PURE__ */ jsx("p", { className: "text-[10px] opacity-60 mt-0.5", children: "Mon\u2013Sat, 9AM\u20136PM IST" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Mail, { className: "w-3.5 h-3.5 text-primary shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "Email Support" }),
              /* @__PURE__ */ jsx("p", { children: "support@nagrikportal.gov.in" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2.5 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "w-3.5 h-3.5 text-primary shrink-0 mt-0.5" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-foreground", children: "Head Office" }),
              /* @__PURE__ */ jsx("p", { children: "Ministry of Civil Affairs, New Delhi \u2013 110001" })
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "\xA9 2026 Nagrik Grievance Portal \xB7 Government of India \xB7 All rights reserved." }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { children: "Version 2.0" }),
        /* @__PURE__ */ jsx("span", { className: "w-1 h-1 rounded-full bg-muted-foreground/40" }),
        /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1.5", children: [
          /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" }),
          " System Operational"
        ] })
      ] })
    ] })
  ] }) });
}
export {
  Footer as default
};
