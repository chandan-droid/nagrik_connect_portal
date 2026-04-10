import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, LogOut, User, Bell, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRbac } from '@/hooks/use-rbac';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const { can, primaryRole } = useRbac();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const publicLinks = [
    { label: 'Home', path: '/' },
    { label: 'Track Grievance', path: '/track' },
  ];

  const isActivePath = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-card/95 backdrop-blur-xl border-b border-border/60 shadow-md'
          : 'bg-card/80 backdrop-blur-lg border-b border-border/40 shadow-sm'
      )}
    >
      {/* India flag accent line */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                Nagrik Grievance
              </span>
              <span className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase">Portal · GOI</span>
            </div>
          </Link>

          {/* Desktop nav — only shown on public pages */}
          {!user && (
            <div className="hidden md:flex items-center gap-0.5">
              {publicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActivePath(link.path)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {/* Role chip */}
                {primaryRole && (
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full capitalize',
                    primaryRole === 'admin' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                    primaryRole === 'officer' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' :
                    'bg-secondary/10 text-secondary border border-secondary/20'
                  )}>
                    {primaryRole}
                  </span>
                )}

                {/* Notification bell */}
                <button className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-destructive rounded-full" />
                </button>

                {/* File grievance CTA */}
                {can('grievance.create') && (
                  <Link to="/submit">
                    <Button size="sm" className="gradient-primary text-white hover:opacity-90 shadow-sm font-semibold">
                      File Grievance
                    </Button>
                  </Link>
                )}

                {/* User menu */}
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-sm">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-semibold text-foreground leading-tight">{profile?.full_name || user.email?.split('@')[0]}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{primaryRole || 'User'}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors ml-1"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/auth">
                  <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm" className="gradient-primary text-white shadow-sm font-semibold">
                    Get Started <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-foreground rounded-xl hover:bg-muted/60 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-card/98 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {!user && publicLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    isActivePath(link.path) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="px-4 py-2 text-xs text-muted-foreground capitalize">
                    Signed in as {primaryRole || 'user'}: {profile?.full_name || user.email}
                  </div>
                  {can('grievance.create') && (
                    <Link to="/submit" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full mt-1 gradient-primary text-white">File Grievance</Button>
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive rounded-xl hover:bg-destructive/10 transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full mt-2 gradient-primary text-white">Sign In / Register</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
