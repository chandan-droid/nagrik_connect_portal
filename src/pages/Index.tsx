import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Search, BarChart3, ArrowRight, CheckCircle2, Users, Clock, Zap, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const stats = [
  { icon: FileText, value: '2,45,000+', label: 'Grievances Filed' },
  { icon: CheckCircle2, value: '2,10,000+', label: 'Issues Resolved' },
  { icon: Users, value: '5,00,000+', label: 'Citizens Served' },
  { icon: Clock, value: '< 7 Days', label: 'Avg. Resolution' },
];

const features = [
  { icon: FileText, title: 'Easy Submission', desc: 'File a grievance in minutes with our step-by-step form. Attach photos and set location.', color: 'bg-primary/10 text-primary' },
  { icon: Search, title: 'Real-Time Tracking', desc: 'Track your complaint from submission to resolution with a unique ticket ID.', color: 'bg-secondary/10 text-secondary' },
  { icon: BarChart3, title: 'Transparent Analytics', desc: 'Public dashboards showing department performance and resolution rates.', color: 'bg-accent/10 text-accent' },
  { icon: Zap, title: 'Smart Assignment', desc: 'Auto-routing ensures your grievance reaches the right department instantly.', color: 'bg-info/10 text-info' },
  { icon: MapPin, title: 'Location Intelligence', desc: 'Geo-tagged complaints help authorities identify problem hotspots.', color: 'bg-destructive/10 text-destructive' },
  { icon: Phone, title: 'Instant Notifications', desc: 'Get notified at every step — SMS, email, and in-app alerts.', color: 'bg-success/10 text-success' },
];

const steps = [
  { num: '01', title: 'Submit Grievance', desc: 'Fill a simple form with details, location, and evidence.' },
  { num: '02', title: 'Auto Assignment', desc: 'System routes to the appropriate department and officer.' },
  { num: '03', title: 'Track Progress', desc: 'Monitor real-time updates through the resolution pipeline.' },
  { num: '04', title: 'Get Resolved', desc: 'Notified when resolved. Rate the service quality.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-[10%] w-80 h-80 bg-secondary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-[5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[200px]" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 text-secondary text-xs font-semibold mb-8 border border-secondary/20 backdrop-blur-sm"
            >
              <Shield className="w-3.5 h-3.5" /> Government of India Initiative
              <ChevronRight className="w-3 h-3" />
            </motion.div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-[3.5rem] font-extrabold text-primary-foreground leading-[1.1] mb-6">
              Your Voice,{' '}
              <span className="relative">
                <span className="text-secondary">Our Commitment</span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-secondary/30 rounded-full origin-left"
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/60 mb-10 max-w-lg leading-relaxed">
              Report civic issues, track resolutions, and hold authorities accountable — all from one unified platform.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/submit">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-7 h-12 text-base shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all">
                  File a Grievance <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 h-12 text-base backdrop-blur-sm">
                  Track Status
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.5 }}
              className="elevated-card p-5 md:p-6 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-heading font-bold text-xl md:text-2xl text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2 block">Process</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Four simple steps to get your issue resolved transparently</p>
          </motion.div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="relative"
            >
              <div className="stat-card text-center py-8">
                <span className="font-heading text-5xl font-extrabold text-primary/[0.08] block">{step.num}</span>
                <h3 className="font-heading font-bold text-foreground mt-1 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:flex absolute top-1/2 -right-3 w-6 text-border/60 items-center">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2 block">Features</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">Built for Citizens</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Powerful features designed to make civic engagement effortless</p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
                className="stat-card group"
              >
                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl gradient-hero p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Ready to Be Heard?</h2>
            <p className="text-primary-foreground/60 mb-8 max-w-md mx-auto text-lg">Join millions of citizens using the portal for transparent governance.</p>
            <Link to="/auth">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-8 h-12 text-base shadow-lg shadow-secondary/20">
                Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
