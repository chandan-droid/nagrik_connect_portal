import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Shield, LogOut, User, Bell, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRbac } from "@/hooks/use-rbac";
import { cn } from "@/lib/utils";
function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { can, primaryRole } = useRbac();
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const publicLinks = [
    { label: "Home", path: "/" },
    { label: "Track Grievance", path: "/track" }
  ];
  const isActivePath = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  return /* @__PURE__ */ jsxs(
    "nav",
    {
      className: cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "bg-card/95 backdrop-blur-xl border-b border-border/60 shadow-md" : "bg-card/80 backdrop-blur-lg border-b border-border/40 shadow-sm"
      ),
      children: [
        /* @__PURE__ */ jsx("div", { className: "h-[3px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" }),
        /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between h-14", children: [
          /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2.5 group shrink-0", children: [
            /* @__PURE__ */ jsx("div", { className: "w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200", children: /* @__PURE__ */ jsx(Shield, { className: "w-5 h-5 text-white" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col leading-tight", children: [
              /* @__PURE__ */ jsx("span", { className: "font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors", children: "Nagrik" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground tracking-[0.15em] uppercase", children: "Grievance Portal \xB7 Govt. Of Odisha" })
            ] })
          ] }),
          !user && /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center gap-0.5", children: publicLinks.map((link) => /* @__PURE__ */ jsx(
            Link,
            {
              to: link.path,
              className: cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                isActivePath(link.path) ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              ),
              children: link.label
            },
            link.path
          )) }),
          /* @__PURE__ */ jsx("div", { className: "hidden md:flex items-center gap-2", children: user ? /* @__PURE__ */ jsxs(Fragment, { children: [
            primaryRole && /* @__PURE__ */ jsx("span", { className: cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full capitalize",
              primaryRole === "admin" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : primaryRole === "officer" ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-secondary/10 text-secondary border border-secondary/20"
            ), children: primaryRole }),
            /* @__PURE__ */ jsxs("button", { className: "relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors", children: [
              /* @__PURE__ */ jsx(Bell, { className: "w-4 h-4" }),
              /* @__PURE__ */ jsx("span", { className: "absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" })
            ] }),
            can("grievance.create") && /* @__PURE__ */ jsx(Link, { to: "/submit", children: /* @__PURE__ */ jsx(Button, { size: "sm", className: "gradient-primary text-white hover:opacity-90 shadow-sm font-semibold", children: "File Grievance" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 pl-2 border-l border-border", children: [
              /* @__PURE__ */ jsx("div", { className: "w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-sm", children: /* @__PURE__ */ jsx(User, { className: "w-3.5 h-3.5 text-white" }) }),
              /* @__PURE__ */ jsxs("div", { className: "hidden lg:block", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs font-semibold text-foreground leading-tight", children: profile?.full_name || user.email?.split("@")[0] }),
                /* @__PURE__ */ jsx("p", { className: "text-[10px] text-muted-foreground capitalize", children: primaryRole || "User" })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: signOut,
                  className: "p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1",
                  title: "Sign Out",
                  children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" })
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "text-muted-foreground hover:text-foreground", children: "Sign In" }) }),
            /* @__PURE__ */ jsx(Link, { to: "/auth", children: /* @__PURE__ */ jsxs(Button, { size: "sm", className: "gradient-primary text-white shadow-sm font-semibold", children: [
              "Get Started ",
              /* @__PURE__ */ jsx(ChevronRight, { className: "w-3.5 h-3.5 ml-0.5" })
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "md:hidden p-2 text-foreground rounded-xl hover:bg-muted/60 transition-colors",
              onClick: () => setMobileOpen(!mobileOpen),
              children: mobileOpen ? /* @__PURE__ */ jsx(X, { className: "w-5 h-5" }) : /* @__PURE__ */ jsx(Menu, { className: "w-5 h-5" })
            }
          )
        ] }) }),
        /* @__PURE__ */ jsx(AnimatePresence, { children: mobileOpen && /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, height: 0 },
            animate: { opacity: 1, height: "auto" },
            exit: { opacity: 0, height: 0 },
            className: "md:hidden border-t border-border bg-card/98 backdrop-blur-xl",
            children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-4 space-y-1", children: [
              !user && publicLinks.map((link) => /* @__PURE__ */ jsx(
                Link,
                {
                  to: link.path,
                  onClick: () => setMobileOpen(false),
                  className: cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    isActivePath(link.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50"
                  ),
                  children: link.label
                },
                link.path
              )),
              user ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 text-xs text-muted-foreground capitalize", children: [
                  "Signed in as ",
                  primaryRole || "user",
                  ": ",
                  profile?.full_name || user.email
                ] }),
                can("grievance.create") && /* @__PURE__ */ jsx(Link, { to: "/submit", onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsx(Button, { className: "w-full mt-1 gradient-primary text-white", children: "File Grievance" }) }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    onClick: () => {
                      signOut();
                      setMobileOpen(false);
                    },
                    className: "w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive rounded-xl hover:bg-destructive/10 transition-colors mt-1",
                    children: [
                      /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }),
                      " Sign Out"
                    ]
                  }
                )
              ] }) : /* @__PURE__ */ jsx(Link, { to: "/auth", onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsx(Button, { className: "w-full mt-2 gradient-primary text-white", children: "Sign In / Register" }) })
            ] })
          }
        ) })
      ]
    }
  );
}
export {
  Navbar as default
};
