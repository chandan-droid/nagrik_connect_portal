import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, FileText, Search, BarChart3, ArrowRight, CheckCircle2, Users, Clock, TrendingUp, Zap, MapPin, Phone } from 'lucide-react';
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
  { icon: FileText, title: 'Easy Submission', desc: 'File a grievance in minutes with our step-by-step form. Attach photos, set location, and track instantly.' },
  { icon: Search, title: 'Real-Time Tracking', desc: 'Track your complaint from submission to resolution with a unique ticket ID and live timeline updates.' },
  { icon: BarChart3, title: 'Transparent Insights', desc: 'Public dashboards showing department performance, resolution rates, and area-wise complaint heatmaps.' },
  { icon: Zap, title: 'Smart Assignment', desc: 'AI-powered auto-routing ensures your grievance reaches the right department and officer instantly.' },
  { icon: MapPin, title: 'Location Intelligence', desc: 'Geo-tagged complaints with map visualization help authorities identify and address problem hotspots.' },
  { icon: Phone, title: 'Stay Informed', desc: 'Get SMS, email, and in-app notifications at every step. Never wonder about your complaint status.' },
];

const steps = [
  { num: '01', title: 'Submit Your Grievance', desc: 'Fill out a simple form with complaint details, location, and supporting evidence.' },
  { num: '02', title: 'Automatic Assignment', desc: 'System routes your complaint to the appropriate department and officer.' },
  { num: '03', title: 'Track Progress', desc: 'Monitor real-time updates as your issue moves through the resolution pipeline.' },
  { num: '04', title: 'Resolution & Feedback', desc: 'Get notified when resolved. Rate the service and help improve governance.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-secondary/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/20 text-secondary-foreground/90 text-xs font-medium mb-6 border border-secondary/20">
              <Shield className="w-3.5 h-3.5" /> Government of India Initiative
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight mb-5">
              Your Voice,{' '}
              <span className="text-secondary">Our Commitment</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-lg leading-relaxed">
              Report civic issues, track resolutions, and hold authorities accountable — all from one unified platform built for every citizen.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/submit">
                <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold px-6">
                  File a Grievance <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Track Status
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.4 }}
              className="elevated-card p-4 md:p-5 text-center"
            >
              <s.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-heading font-bold text-xl md:text-2xl text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Four simple steps to get your issue resolved transparently</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * i }}
              className="relative"
            >
              <div className="stat-card text-center">
                <span className="font-heading text-4xl font-extrabold text-primary/15">{step.num}</span>
                <h3 className="font-heading font-semibold text-foreground mt-2 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 text-border">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/40 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Built for Citizens</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Powerful features designed to make civic engagement effortless</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05 * i }}
                className="stat-card"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-heading font-semibold text-foreground mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="elevated-card max-w-2xl mx-auto p-10 md:p-14">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-3">Ready to Be Heard?</h2>
          <p className="text-muted-foreground mb-6">Join millions of citizens using the Nagrik Grievance Portal for transparent governance.</p>
          <Link to="/submit">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8">
              Submit Your Grievance <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
