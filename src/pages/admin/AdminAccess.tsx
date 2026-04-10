import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, KeySquare, Lock, Users, Briefcase, Database, Eye } from 'lucide-react';
import DashboardSidebar from '@/components/layout/DashboardSidebar';
import { rolePermissions } from '@/lib/rbac';
import { cn } from '@/lib/utils';

const roleMeta: Record<string, { icon: React.ElementType; color: string; desc: string }> = {
  admin: { icon: Shield, color: 'text-amber-600', desc: 'Full system access and analytics' },
  officer: { icon: Briefcase, color: 'text-blue-600', desc: 'Field operations and ticket resolution' },
  citizen: { icon: Users, color: 'text-secondary', desc: 'Public grievance reporting portal' }
};

export default function AdminAccess() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">Role Base Access Control</h1>
            <p className="text-xs text-muted-foreground">Manage permissions across all system roles</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/20">
               <Lock className="w-3 h-3" /> Secure Enclave Active
             </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {Object.entries(rolePermissions).map(([role, permissions], i) => {
              const meta = roleMeta[role as keyof typeof roleMeta];
              
              return (
                <motion.div key={role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <div className="elevated-card overflow-hidden h-full">
                    {/* Header */}
                    <div className="p-5 border-b border-border/50 bg-muted/10 relative overflow-hidden">
                      <div className="absolute -right-4 -top-4 opacity-[0.03]">
                         <meta.icon className="w-32 h-32" />
                      </div>
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-card shadow-sm border border-border", meta.color)}>
                          <meta.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="font-heading font-bold text-foreground capitalize text-lg">{role}</h2>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{meta.desc}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Permissions list */}
                    <div className="p-5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <KeySquare className="w-3.5 h-3.5" /> Granted Authorities
                      </p>
                      <div className="space-y-2">
                        {permissions.map((p) => {
                          const isRead = p.startsWith('view_') || p.startsWith('track_');
                          return (
                            <div key={p} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/50 text-xs">
                              {isRead ? <Eye className="w-3.5 h-3.5 text-info" /> : <Database className="w-3.5 h-3.5 text-accent" />}
                              <span className="font-mono mt-0.5 text-muted-foreground">{p}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
