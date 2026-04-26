import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Scale, MessageSquare, ShieldAlert, ArrowRight, Zap } from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

const updates = [
  { icon: MessageSquare, text: "Status updates must now include clear, citizen-facing language and ETA for the next milestone.", type: "info" },
  { icon: ShieldAlert, text: "Escalate any issue blocked by external dependency within 24 hours to the Admin operations team.", type: "warning" },
  { icon: Scale, text: 'Mandatory field: Attach geo-tagged verification notes prior to moving a ticket to "Resolved" state.', type: "danger" },
  { icon: Zap, text: "New automated assignment routing is live evaluating officer workloads dynamically.", type: "success" }
];

export default function OfficerUpdates() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Field Updates & Directives</h1>
            <p className="text-xs text-muted-foreground">Internal policy updates and communication standards</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-destructive animate-pulse" />
          </div>
        </div>

        <div className="p-6">
          <div className="max-w-2xl mx-auto mt-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {updates.map((update, i) => {
                const colors = {
                  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
                  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
                  danger: "bg-red-500/10 text-red-600 border-red-500/20",
                  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                }[update.type];

                return (
                  <div key={i} className={`elevated-card p-5 border-l-4 border-l-transparent transition-all hover:-translate-y-0.5 ${colors.replace("bg-", "hover:bg-").replace("/10", "/5")}`}>
                    <div className="flex gap-4 items-start">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colors}`}>
                        <update.icon className="w-5 h-5" />
                      </div>
                      <div className="pt-1">
                        <div className="text-sm font-medium text-foreground leading-relaxed">{update.text}</div>
                        <button className="text-xs font-semibold mt-2 flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
                          View details <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 p-6 rounded-2xl bg-muted/30 border border-border text-center">
              <p className="text-sm font-semibold text-foreground mb-1">Need Clarification?</p>
              <p className="text-xs text-muted-foreground mb-4">Contact your nodal supervisor regarding protocol changes.</p>
              <button className="text-xs bg-foreground text-background px-4 py-2 rounded-lg font-medium hover:opacity-90">
                Open Support Channel
              </button>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
