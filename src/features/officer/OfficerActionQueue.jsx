import { jsx, jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
const queueSteps = [
  "Accept and verify assigned grievance",
  "Update status with field notes",
  "Notify citizen on milestone changes",
  "Escalate blocked cases to admin"
];
function OfficerActionQueue() {
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-border/60", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "font-heading text-base", children: "Officer Action Queue" }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-2", children: queueSteps.map((step, index) => /* @__PURE__ */ jsxs("div", { className: "rounded-md bg-muted/30 px-3 py-2 text-sm text-muted-foreground", children: [
      index + 1,
      ". ",
      step
    ] }, step)) })
  ] });
}
export {
  OfficerActionQueue as default
};
