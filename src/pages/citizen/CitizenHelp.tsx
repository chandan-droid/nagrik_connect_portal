import { useState } from 'react';
import { motion } from 'framer-motion';
import { LifeBuoy, BookOpen, MessageSquare, AlertTriangle, ChevronDown, Rocket, Clock, Zap } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { Button } from '@/components/ui/button';

const faqs = [
  { q: 'How fast are grievances resolved?', a: 'SLA (Service Level Agreement) dictates that critical issues are addressed within 48 hours, high priority in 3-5 days, and standard issues within 7-10 days depending on the department workload.' },
  { q: 'Can I edit a submitted grievance?', a: 'Once submitted, a grievance cannot be directly edited to maintain tamper-proof records. However, you can add follow-up context through comments or contact support referencing your Ticket ID.' },
  { q: 'How do I escalate urgent issues?', a: 'If an issue breaches its SLA timeline, an "Escalate" button will automatically appear in your ticket details view. This alerts the Admin oversight committee immediately.' },
  { q: 'What happens if my ticket is wrongly categorized?', a: 'The auto-routing system usually handles categorization, but if a mistake occurs, the designated officer will re-route it to the correct department internally without any action required from you.' }
];

export default function CitizenHelp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Help Desk & Support</h1>
            <p className="text-xs text-muted-foreground">Resources and FAQs for navigating the portal</p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="w-3.5 h-3.5" /> Contact Support
          </Button>
        </div>

        <div className="p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="elevated-card p-5 group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Rocket className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">Quick Start Guide</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Learn the basics of filing a grievance, attaching evidence, and tracking progress.</p>
                <button className="text-xs font-semibold text-primary mt-3 flex items-center gap-1 hover:underline">Read Guide</button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="elevated-card p-5 group">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">Understanding SLAs</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">View timeline commitments and resolution guarantees by department.</p>
                <button className="text-xs font-semibold text-secondary mt-3 flex items-center gap-1 hover:underline">View Timelines</button>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="elevated-card p-5 group">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1">Escalation Policy</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Know how and when to escalate unresponsive or unresolved tickets.</p>
                <button className="text-xs font-semibold text-amber-600 mt-3 flex items-center gap-1 hover:underline">Read Policy</button>
              </motion.div>
            </div>

            {/* Checklist */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="elevated-card p-6 border-l-4 border-l-info">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-info/10 text-info flex items-center justify-center shrink-0 mt-1">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-foreground mb-2">Tips for Faster Resolution</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground">
                      <strong className="text-foreground block mb-1">📌 Precise Location</strong>
                      Add clear landmarks, PIN codes, or drop a map pin for accurate field routing.
                    </div>
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground">
                      <strong className="text-foreground block mb-1">📷 Visual Evidence</strong>
                      Attach clear photos or videos. Tickets with evidence get prioritized by officers.
                    </div>
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground">
                      <strong className="text-foreground block mb-1">📝 Clear Titles</strong>
                      Write brief, descriptive titles (e.g., "Pothole on Main St." instead of "Bad Road").
                    </div>
                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground">
                      <strong className="text-foreground block mb-1">🔄 Avoid Duplicates</strong>
                      Search open tickets in your area before submitting to prevent system clutter.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* FAQs */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="elevated-card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <LifeBuoy className="w-4 h-4 text-foreground" />
                </div>
                <h2 className="font-heading font-bold text-lg text-foreground">Frequently Asked Questions</h2>
              </div>
              <div className="space-y-4">
                {faqs.map((item, i) => (
                  <details key={i} className="group rounded-xl border border-border bg-card overflow-hidden">
                    <summary className="flex items-center justify-between p-4 font-semibold cursor-pointer select-none outline-none group-open:bg-muted/30 transition-colors">
                      {item.q}
                      <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="p-4 pt-1 text-sm text-muted-foreground border-t border-border/50 bg-muted/10 leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </main>
    </div>
  );
}
