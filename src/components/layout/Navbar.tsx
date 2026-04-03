import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, profile, signOut, hasRole } = useAuth();

  const navLinks = [
    { label: 'Home', path: '/' },
    ...(user ? [
      { label: 'Track Grievance', path: '/track' },
      { label: 'My Dashboard', path: '/citizen' },
      ...(hasRole('admin') ? [{ label: 'Admin', path: '/admin' }] : []),
      ...(hasRole('officer') ? [{ label: 'Officer', path: '/officer' }] : []),
    ] : [
      { label: 'Track Grievance', path: '/track' },
    ]),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm leading-tight text-foreground">Nagrik Grievance</span>
              <span className="text-[10px] text-muted-foreground leading-tight tracking-[0.15em] uppercase">Portal</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.path
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            {user ? (
              <>
                <Link to="/submit">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                    File Grievance
                  </Button>
                </Link>
                <div className="flex items-center gap-2 pl-2 border-l border-border">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-medium text-foreground leading-tight">{profile?.full_name || user.email}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{hasRole('admin') ? 'Admin' : hasRole('officer') ? 'Officer' : 'Citizen'}</p>
                  </div>
                  <button onClick={signOut} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Sign Out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          <button className="md:hidden p-2 text-foreground rounded-lg hover:bg-muted/50 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.path ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link to="/submit" onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full mt-2 bg-primary text-primary-foreground">File Grievance</Button>
                  </Link>
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-destructive mt-1">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full mt-2 bg-primary text-primary-foreground">Sign In</Button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
