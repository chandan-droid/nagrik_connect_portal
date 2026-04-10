import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, Search, HelpCircle, LogOut, User,
  Shield, BarChart3, Users, ChevronLeft, ChevronRight,
  Bell, Settings, CheckCircle2, Clock, ListTodo, TrendingUp,
  AlertTriangle, MessageSquare, Send
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRbac } from '@/hooks/use-rbac';
import { cn } from '@/lib/utils';

type NavItem = { label: string; path: string; icon: React.ElementType; badge?: number };

const citizenNav: NavItem[] = [
  { label: 'Dashboard', path: '/citizen', icon: LayoutDashboard },
  { label: 'My Tickets', path: '/citizen/tickets', icon: ListTodo },
  { label: 'File Grievance', path: '/submit', icon: FileText },
  { label: 'Help Desk', path: '/citizen/help', icon: HelpCircle },
];

const officerNav: NavItem[] = [
  { label: 'Dashboard', path: '/officer', icon: LayoutDashboard },
  { label: 'Work Queue', path: '/officer/queue', icon: ListTodo },
  { label: 'Field Updates', path: '/officer/updates', icon: Send },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Role Access', path: '/admin/access', icon: Users },
];

const roleColors: Record<string, string> = {
  citizen: 'bg-emerald-500/20 text-emerald-400',
  officer: 'bg-blue-500/20 text-blue-400',
  admin: 'bg-amber-500/20 text-amber-400',
};

interface DashboardSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export default function DashboardSidebar({ collapsed = false, onToggle }: DashboardSidebarProps) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { primaryRole } = useRbac();

  const nav =
    primaryRole === 'admin' ? adminNav :
    primaryRole === 'officer' ? officerNav : citizenNav;

  const isActive = (path: string) => {
    if (path === '/citizen' || path === '/officer' || path === '/admin') {
      return location.pathname === path;
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside
      className={cn(
        'dashboard-sidebar custom-scrollbar flex-col justify-between transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border/50">
          <div className="w-9 h-9 rounded-xl bg-sidebar-primary/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-sidebar-primary" />
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col leading-tight"
            >
              <span className="font-heading font-bold text-[13px] text-sidebar-foreground">Nagrik Portal</span>
              <span className="text-[10px] text-sidebar-foreground/50 tracking-widest uppercase">Gov. of India</span>
            </motion.div>
          )}
          {onToggle && (
            <button
              onClick={onToggle}
              className="ml-auto p-1 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/30 transition-colors hidden md:flex"
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Role badge */}
        {!collapsed && primaryRole && (
          <div className="px-4 py-3">
            <span className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize', roleColors[primaryRole] || roleColors.citizen)}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {primaryRole}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="px-3 py-2 space-y-0.5">
          {!collapsed && (
            <p className="text-[10px] font-semibold tracking-widest uppercase text-sidebar-foreground/30 px-3 py-2">Navigation</p>
          )}
          {nav.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                  active
                    ? 'bg-sidebar-primary/20 text-sidebar-primary'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
                )}
              >
                <item.icon className={cn('w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110', active ? 'text-sidebar-primary' : '')} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-destructive text-white px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: user info + sign out */}
      <div className="border-t border-sidebar-border/50 p-3">
        {collapsed ? (
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center p-2 rounded-xl text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-sidebar-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{profile?.full_name || user?.email}</p>
              <p className="text-[10px] text-sidebar-foreground/40 capitalize">{primaryRole || 'User'}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-lg text-sidebar-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
