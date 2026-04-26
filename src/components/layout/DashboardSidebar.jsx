import { jsx, jsxs } from "react/jsx-runtime";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Search,
  HelpCircle,
  LogOut,
  User,
  Shield,
  BarChart3,
  Users,
  Building2,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Send
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRbac } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";
const citizenNav = [
  { label: "Dashboard", path: "/citizen", icon: LayoutDashboard },
  { label: "File Grievance", path: "/submit", icon: FileText },
  { label: "Help Desk", path: "/citizen/help", icon: HelpCircle }
];
const officerNav = [
  { label: "Dashboard", path: "/officer", icon: LayoutDashboard },
  { label: "Work Queue", path: "/officer/queue", icon: ListTodo }
];
const adminNav = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Grievances", path: "/admin/grievances", icon: FileText },
  { label: "Departments", path: "/admin/departments", icon: Building2 },
  { label: "Officers", path: "/admin/officers", icon: Users }
];
const roleColors = {
  citizen: "bg-emerald-500/20 text-emerald-400",
  officer: "bg-blue-500/20 text-blue-400",
  admin: "bg-amber-500/20 text-amber-400"
};
function DashboardSidebar({ collapsed = false, onToggle }) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { primaryRole } = useRbac();
  const nav = primaryRole === "admin" ? adminNav : primaryRole === "officer" ? officerNav : citizenNav;
  const isActive = (path) => {
    if (path === "/citizen" || path === "/officer" || path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  return /* @__PURE__ */ jsxs(
    "aside",
    {
      className: cn(
        "dashboard-sidebar custom-scrollbar flex-col justify-between transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      ),
      children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-5 py-5 border-b border-sidebar-border/50", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(Shield, { className: "w-5 h-5 text-sidebar-primary" }) }),
            !collapsed && /* @__PURE__ */ jsxs(
              motion.div,
              {
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
                className: "flex flex-col leading-tight",
                children: [
                  /* @__PURE__ */ jsx("span", { className: "font-heading font-bold text-[13px] text-sidebar-foreground", children: "Nagrik Grievance Portal" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-sidebar-foreground/50 tracking-widest uppercase", children: "Govt. Of Odisha" })
                ]
              }
            ),
            onToggle && /* @__PURE__ */ jsx(
              "button",
              {
                onClick: onToggle,
                className: "ml-auto p-1 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors hidden md:flex",
                children: collapsed ? /* @__PURE__ */ jsx(ChevronRight, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(ChevronLeft, { className: "w-4 h-4" })
              }
            )
          ] }),
          !collapsed && primaryRole && /* @__PURE__ */ jsx("div", { className: "px-4 py-3", children: /* @__PURE__ */ jsxs("span", { className: cn("inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize", roleColors[primaryRole] || roleColors.citizen), children: [
            /* @__PURE__ */ jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-current animate-pulse" }),
            primaryRole
          ] }) }),
          /* @__PURE__ */ jsxs("nav", { className: "px-3 py-2 space-y-0.5", children: [
            !collapsed && /* @__PURE__ */ jsx("p", { className: "text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/30 px-3 py-2", children: "Navigation" }),
            nav.map((item) => {
              const active = isActive(item.path);
              return /* @__PURE__ */ jsxs(
                Link,
                {
                  to: item.path,
                  title: collapsed ? item.label : void 0,
                  className: cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group",
                    active ? "bg-sidebar-primary/20 text-sidebar-primary" : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30"
                  ),
                  children: [
                    /* @__PURE__ */ jsx(item.icon, { className: cn("w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110", active ? "text-sidebar-primary" : "") }),
                    !collapsed && /* @__PURE__ */ jsx("span", { className: "truncate", children: item.label }),
                    !collapsed && item.badge !== void 0 && item.badge > 0 && /* @__PURE__ */ jsx("span", { className: "ml-auto text-[10px] font-bold bg-destructive text-white px-1.5 py-0.5 rounded-full", children: item.badge }),
                    active && /* @__PURE__ */ jsx("span", { className: "ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary shrink-0" })
                  ]
                },
                item.path
              );
            })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "border-t border-sidebar-border/50 p-3", children: collapsed ? /* @__PURE__ */ jsx(
          "button",
          {
            onClick: signOut,
            className: "w-full flex items-center justify-center p-2 rounded-xl text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors",
            title: "Sign Out",
            children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
          }
        ) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 px-2 py-2 rounded-xl", children: [
          /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsx(User, { className: "w-4 h-4 text-sidebar-primary" }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-sidebar-foreground truncate", children: profile?.full_name || user?.email }),
            /* @__PURE__ */ jsx("p", { className: "text-[10px] text-sidebar-foreground/40 capitalize", children: primaryRole || "User" })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: signOut,
              className: "p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors",
              title: "Sign Out",
              children: /* @__PURE__ */ jsx(LogOut, { className: "w-3.5 h-3.5" })
            }
          )
        ] }) })
      ]
    }
  );
}
export {
  DashboardSidebar as default
};
