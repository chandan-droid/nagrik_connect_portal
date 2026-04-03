import { Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-foreground">Nagrik Grievance Portal</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Empowering citizens to voice their concerns and ensuring transparent, accountable governance for all.
            </p>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-foreground">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/submit" className="block text-sm text-muted-foreground hover:text-primary transition-colors">File Grievance</Link>
              <Link to="/track" className="block text-sm text-muted-foreground hover:text-primary transition-colors">Track Status</Link>
              <Link to="/citizen" className="block text-sm text-muted-foreground hover:text-primary transition-colors">My Dashboard</Link>
            </div>
          </div>
          <div>
            <h4 className="font-heading font-semibold text-sm mb-3 text-foreground">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Helpline: 1800-XXX-XXXX</p>
              <p>Email: support@nagrikportal.gov.in</p>
              <p>Mon–Sat, 9AM–6PM</p>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          © 2026 Nagrik Grievance Portal. Government of India. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
