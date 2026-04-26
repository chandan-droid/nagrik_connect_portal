import { jsx, jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const governanceItems = [
  "Role governance policy review",
  "Department SLA exception audit",
  "Cross-department escalation review",
  "Operational analytics approval"
];
function AdminGovernancePanel() {
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-border/60", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "font-heading text-base", children: "Governance Controls" }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "grid gap-2 sm:grid-cols-2", children: governanceItems.map((item) => /* @__PURE__ */ jsx("div", { className: "rounded-md bg-muted/30 px-3 py-2 text-sm text-muted-foreground", children: item }, item)) })
  ] });
}
export {
  AdminGovernancePanel as default
};
