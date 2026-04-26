import { jsx, jsxs } from "react/jsx-runtime";
function StatCard({ icon: Icon, label, value, trend, colorClass = "text-primary" }) {
  return /* @__PURE__ */ jsxs("div", { className: "stat-card flex items-start gap-4", children: [
    /* @__PURE__ */ jsx("div", { className: `w-11 h-11 rounded-lg flex items-center justify-center bg-primary/10 ${colorClass}`, children: /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: label }),
      /* @__PURE__ */ jsx("p", { className: "text-2xl font-heading font-bold text-foreground", children: value }),
      trend && /* @__PURE__ */ jsx("p", { className: "text-xs text-secondary mt-0.5", children: trend })
    ] })
  ] });
}
export {
  StatCard as default
};
