import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, FileText, Search, BarChart3, ArrowRight, CheckCircle2,
  Users, Clock, Zap, MapPin, Phone, ChevronRight, Star,
  Building2, Droplets, Bolt, Truck, BookOpen, HeartPulse,
  AlertTriangle, Award, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const stats = [
  { icon: FileText, value: '2,45,000+', label: 'Grievances Filed', color: 'text-primary' },
  { icon: CheckCircle2, value: '2,10,000+', label: 'Issues Resolved', color: 'text-secondary' },
  { icon: Users, value: '5,00,000+', label: 'Citizens Served', color: 'text-info' },
  { icon: Clock, value: '< 7 Days', label: 'Avg. Resolution', color: 'text-accent' },
];

const features = [
  { icon: FileText, title: 'Easy Submission', desc: 'File a grievance in minutes with our step-by-step guided form. Attach photos and evidence.', color: 'bg-primary/10 text-primary' },
  { icon: Search, title: 'Real-Time Tracking', desc: 'Track your complaint from submission to resolution with a unique ticket ID.', color: 'bg-secondary/10 text-secondary' },
  { icon: BarChart3, title: 'Transparent Analytics', desc: 'Public dashboards showing department performance and resolution rates.', color: 'bg-accent/10 text-accent' },
  { icon: Zap, title: 'Smart Assignment', desc: 'Auto-routing ensures your grievance reaches the right department instantly.', color: 'bg-info/10 text-info' },
  { icon: MapPin, title: 'Location Intelligence', desc: 'Geo-tagged complaints help authorities identify area-specific problem hotspots.', color: 'bg-destructive/10 text-destructive' },
  { icon: Phone, title: 'Instant Notifications', desc: 'Get notified at every step — via SMS, email, and in-app alerts.', color: 'bg-secondary/10 text-secondary' },
];

const departments = [
  { icon: Droplets, name: 'Water Supply', color: 'bg-blue-500/10 text-blue-600' },
  { icon: Bolt, name: 'Electricity', color: 'bg-amber-500/10 text-amber-600' },
  { icon: Truck, name: 'Roads & Transport', color: 'bg-orange-500/10 text-orange-600' },
  { icon: Shield, name: 'Public Safety', color: 'bg-red-500/10 text-red-600' },
  { icon: BookOpen, name: 'Education', color: 'bg-purple-500/10 text-purple-600' },
  { icon: HeartPulse, name: 'Healthcare', color: 'bg-pink-500/10 text-pink-600' },
  { icon: Building2, name: 'Sanitation', color: 'bg-green-500/10 text-green-600' },
  { icon: AlertTriangle, name: 'Other Issues', color: 'bg-gray-500/10 text-gray-600' },
];

const steps = [
  { num: '01', title: 'Submit Grievance', desc: 'Fill a simple form with issue details, location, and photo evidence.', icon: FileText },
  { num: '02', title: 'Auto Assignment', desc: 'System intelligently routes to the appropriate department & officer.', icon: Zap },
  { num: '03', title: 'Track Progress', desc: 'Monitor real-time status updates through the resolution pipeline.', icon: Search },
  { num: '04', title: 'Get Resolved', desc: 'Receive resolution notification. Rate the service quality provided.', icon: Star },
];

const testimonials = [
  { name: 'Priya Sharma', city: 'New Delhi', rating: 5, text: 'My road repair request was addressed within 5 days. Excellent transparency!' },
  { name: 'Ranjit Patel', city: 'Ahmedabad', rating: 5, text: 'Water supply issue resolved in 3 days after I filed on this portal. Amazing service.' },
  { name: 'Meena Devi', city: 'Jaipur', rating: 4, text: 'Very easy to track my grievance. Officer called me within 48 hours of filing.' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="gradient-hero relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-[10%] w-96 h-96 bg-secondary/15 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-[5%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[160px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-secondary/5 rounded-full blur-[200px]" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/15 text-secondary text-xs font-semibold mb-8 border border-secondary/20 backdrop-blur-sm">
                <Shield className="w-3.5 h-3.5" />
                Government of India · Official Grievance Portal
                <ChevronRight className="w-3 h-3" />
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.05] mb-6"
            >
              Your Voice,{' '}
              <span className="relative inline-block">
                <span className="text-secondary">Our Commitment</span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.9, duration: 0.6 }}
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-secondary/40 rounded-full origin-left"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg md:text-xl text-white/60 mb-10 max-w-xl leading-relaxed"
            >
              Report civic issues, track resolutions in real-time, and hold authorities accountable — all from one unified platform trusted by crores of citizens.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link to="/submit">
                <Button
                  size="lg"
                  className="bg-secondary text-white hover:bg-secondary/90 font-semibold px-8 h-12 text-base shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
                >
                  File a Grievance <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/track">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 hover:border-white/30 h-12 text-base backdrop-blur-sm transition-all"
                >
                  <Search className="w-4 h-4 mr-2" /> Track Status
                </Button>
              </Link>
            </motion.div>

            {/* Quick stats below CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex flex-wrap gap-6 mt-10"
            >
              {[{ v: '85%', l: 'SLA Compliance' }, { v: '< 7d', l: 'Avg Resolution' }, { v: '4.6★', l: 'Citizen Rating' }].map((s) => (
                <div key={s.l} className="text-center">
                  <p className="font-heading text-xl font-bold text-secondary">{s.v}</p>
                  <p className="text-[11px] text-white/40 mt-0.5">{s.l}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ─────────────────────────────────────────── */}
      <section className="container mx-auto px-4 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 * i, duration: 0.5 }}
              className="elevated-card p-5 md:p-6 text-center group hover:shadow-xl transition-all"
            >
              <div className={`w-11 h-11 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className={`font-heading font-bold text-xl md:text-2xl ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Departments ───────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2 block">Categories</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">File by Department</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Select the relevant department and we'll auto-route your grievance to the right authority</p>
          </motion.div>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {departments.map((d, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Link to="/submit"
                className="group elevated-card p-5 flex flex-col items-center gap-3 text-center hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-2xl ${d.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <d.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-foreground">{d.name}</span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section className="bg-muted/30 py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2 block">Process</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">How It Works</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Four simple steps to get your civic issue resolved transparently</p>
            </motion.div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[2.25rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-border via-primary/30 to-border" />
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * i }}
                className="relative"
              >
                <div className="stat-card text-center py-8 px-5">
                  <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 shadow-md relative z-10">
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-heading text-4xl font-extrabold text-primary/[0.07] block">{step.num}</span>
                  <h3 className="font-heading font-bold text-foreground mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <div className="text-center mb-14">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <span className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2 block">Features</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">Built for Every Citizen</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Powerful features designed to make civic engagement effortless and transparent</p>
          </motion.div>
        </div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f, i) => (
            <motion.div key={i} variants={itemVariants} className="stat-card group">
              <div className={`w-12 h-12 rounded-2xl ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-foreground mb-1.5 text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────── */}
      <section className="bg-muted/30 py-20 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <span className="text-xs font-semibold tracking-widest uppercase text-secondary mb-2 block">Citizens Speak</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">Real Experiences</h2>
              <p className="text-muted-foreground">Thousands of citizens have seen their issues resolved through our platform</p>
            </motion.div>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={itemVariants} className="elevated-card p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="container mx-auto px-4 py-20 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white/70 text-xs font-semibold mb-6 border border-white/10">
              <Award className="w-3.5 h-3.5" /> Trusted by 5L+ Citizens
            </div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Ready to Be Heard?</h2>
            <p className="text-white/60 mb-8 max-w-md mx-auto text-lg">Join millions of citizens using the portal for transparent and accountable governance.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 font-semibold px-10 h-12 text-base shadow-lg shadow-secondary/20">
                  Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/track">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-12 text-base">
                  Track Existing Ticket
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
