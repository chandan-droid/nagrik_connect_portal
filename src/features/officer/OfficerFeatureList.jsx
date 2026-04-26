import { jsx, jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { roleFeatureLabels } from "@/lib/rbac";
function OfficerFeatureList() {
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-border/60", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx(CardTitle, { className: "font-heading text-base", children: "Officer Features" }),
      /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "RBAC: officer" })
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "pt-0", children: /* @__PURE__ */ jsx("ul", { className: "space-y-2 text-sm text-muted-foreground", children: roleFeatureLabels.officer.map((item) => /* @__PURE__ */ jsx("li", { className: "rounded-md bg-muted/30 px-3 py-2", children: item }, item)) }) })
  ] });
}
export {
  OfficerFeatureList as default
};
