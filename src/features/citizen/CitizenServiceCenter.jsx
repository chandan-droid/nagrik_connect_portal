import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, PlusCircle, Search } from "lucide-react";
function CitizenServiceCenter() {
  return /* @__PURE__ */ jsxs(Card, { className: "mb-6 border-border/60", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsx(CardTitle, { className: "font-heading text-base", children: "Citizen Service Center" }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "grid gap-3 sm:grid-cols-3", children: [
      /* @__PURE__ */ jsx(Link, { to: "/submit", children: /* @__PURE__ */ jsxs(Button, { className: "w-full justify-start bg-primary text-primary-foreground", children: [
        /* @__PURE__ */ jsx(PlusCircle, { className: "w-4 h-4 mr-2" }),
        " File New Grievance"
      ] }) }),
      /* @__PURE__ */ jsx(Link, { to: "/citizen/track", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [
        /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 mr-2" }),
        " Track Ticket Status"
      ] }) }),
      /* @__PURE__ */ jsx(Link, { to: "/citizen", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "w-full justify-start", children: [
        /* @__PURE__ */ jsx(ClipboardList, { className: "w-4 h-4 mr-2" }),
        " View My Cases"
      ] }) })
    ] })
  ] });
}
export {
  CitizenServiceCenter as default
};
