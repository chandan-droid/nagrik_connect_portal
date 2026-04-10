import { Shield, Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 pt-12 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                <Shield className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-foreground">Nagrik Grievance</p>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Portal</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4 max-w-[220px]">
              Empowering citizens to voice their concerns and ensuring transparent, accountable governance for all.
            </p>
            {/* India Flag stripe */}
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">Quick Links</h4>
            <div className="space-y-2.5">
              {[
                { label: 'File a Grievance', path: '/submit' },
                { label: 'Track Status', path: '/track' },
                { label: 'My Dashboard', path: '/citizen' },
                { label: 'Sign In / Register', path: '/auth' },
              ].map((l) => (
                <Link key={l.path} to={l.path} className="block text-xs text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Legal & Policy */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">Legal & Policy</h4>
            <div className="space-y-2.5">
              {[
                'Right to Service Act',
                'RTI Guidelines',
                'Privacy Policy',
                'Terms of Service',
                'Accessibility',
              ].map((l) => (
                <span key={l} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                  {l} <ExternalLink className="w-3 h-3 opacity-50" />
                </span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-sm mb-4 text-foreground">Contact & Support</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <Phone className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Helpline</p>
                  <p>1800-XXX-XXXX (Toll Free)</p>
                  <p className="text-[10px] opacity-60 mt-0.5">Mon–Sat, 9AM–6PM IST</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <Mail className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Email Support</p>
                  <p>support@nagrikportal.gov.in</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">Head Office</p>
                  <p>Ministry of Civil Affairs, New Delhi – 110001</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 Nagrik Grievance Portal · Government of India · All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Version 2.0</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" /> System Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
