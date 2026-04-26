import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Shield,
  FileText,
  Search,
  ArrowRight,
  CheckCircle2,
  Users,
  Clock,
  Zap,
  MapPin,
  ChevronRight,
  Droplets,
  Bolt,
  Truck,
  Building2,
  Award,
  Sparkles,
  Activity,
  Workflow,
  Bell,
  BarChart3,
  CheckCheck,
  ShieldAlert,
  BookOpen,
  Stethoscope,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const stats = [
  { icon: FileText, value: "245K+", label: "Total Grievances", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { icon: CheckCircle2, value: "210K+", label: "Issues Resolved", color: "text-cyan-400", bg: "bg-cyan-500/10" },
  { icon: Activity, value: "98.2%", label: "SLA Compliance", color: "text-teal-400", bg: "bg-teal-500/10" },
  { icon: Clock, value: "< 7 Days", label: "Avg. Resolution", color: "text-sky-400", bg: "bg-sky-500/10" },
];

const featureCards = [
  {
    icon: Workflow,
    title: "Smart Routing",
    desc: "Complaints are auto-routed to the right department with priority signals for faster action.",
  },
  {
    icon: Bell,
    title: "Milestone Alerts",
    desc: "Citizens receive clear updates at review, assignment, in-progress, and resolution stages.",
  },
  {
    icon: BarChart3,
    title: "Performance Insight",
    desc: "Leadership gets visibility into bottlenecks, pendency trends, and service outcomes.",
  },
  {
    icon: CheckCheck,
    title: "Citizen Confidence",
    desc: "Transparent status trails and turnaround commitments strengthen trust in governance.",
  },
];

const departments = [
  { icon: Droplets, name: "Water Supply", theme: "hover:border-blue-500/50 hover:bg-blue-500/[0.02] text-blue-500" },
  { icon: Bolt, name: "Electricity", theme: "hover:border-amber-500/50 hover:bg-amber-500/[0.02] text-amber-500" },
  { icon: Truck, name: "Roads & Transport", theme: "hover:border-emerald-500/50 hover:bg-emerald-500/[0.02] text-emerald-500" },
  { icon: Building2, name: "Sanitation", theme: "hover:border-cyan-500/50 hover:bg-cyan-500/[0.02] text-cyan-500" },
  { icon: ShieldAlert, name: "Public Safety", theme: "hover:border-rose-500/50 hover:bg-rose-500/[0.02] text-rose-500" },
  { icon: BookOpen, name: "Education", theme: "hover:border-indigo-500/50 hover:bg-indigo-500/[0.02] text-indigo-500" },
  { icon: Stethoscope, name: "Healthcare", theme: "hover:border-pink-500/50 hover:bg-pink-500/[0.02] text-pink-500" },
  { icon: MoreHorizontal, name: "Other", theme: "hover:border-slate-500/50 hover:bg-slate-500/[0.02] text-slate-500" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#020808] selection:bg-emerald-500/30">
      <Navbar />

      <section className="relative min-h-[95vh] flex items-center pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[140px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
            <div className="space-y-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md text-emerald-400 text-xs font-bold tracking-[0.2em] uppercase"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Empowering Digital Governance
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="space-y-4"
              >
                <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.95]">
                  Your Voice, <br />
                  <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Our Priority.
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-xl font-medium leading-relaxed italic border-l-2 border-emerald-500/30 pl-6">
                  Transforming civic grievances into measurable resolutions with transparent workflows, accountable ownership, and citizen-first communication.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-5"
              >
                <Link to="/submit">
                  <Button size="lg" className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-[#020808] h-16 px-10 text-base font-black shadow-[0_20px_40px_-10px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1">
                    File Grievance <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/track">
                  <Button variant="outline" size="lg" className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white h-16 px-10 text-base backdrop-blur-xl">
                    <Search className="w-5 h-5 mr-2" /> Track Ticket
                  </Button>
                </Link>
              </motion.div>

            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 1 }}
              className="relative"
            >
              <div className="relative group">
                <div className="relative rounded-[3rem] border border-white/10 bg-white/5 p-4 backdrop-blur-2xl shadow-2xl transition-transform duration-700 overflow-hidden">
                  <div className="rounded-[2.5rem] bg-[#061313] border border-white/10 p-4">
                    <img
                      src="/citi.png"
                      alt="Civic collaboration illustration"
                      className="w-full h-[440px] md:h-[520px] object-contain rounded-[2rem]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#020808]/40 via-transparent to-transparent" />
                </div>

                <div className="absolute -left-6 md:-left-10 top-1/2 -translate-y-1/2 p-5 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
                  <div className="flex flex-col gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                      <Zap className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white font-black tracking-tight text-lg leading-none">Real-Time</p>
                      <p className="text-emerald-400/60 text-[10px] uppercase font-bold tracking-widest mt-1">Resolution Engine</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/10 backdrop-blur-xl hover:bg-white/[0.06] transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${s.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <s.icon className={`w-7 h-7 ${s.color}`} />
              </div>
              <p className="text-4xl font-black text-white tracking-tighter">{s.value}</p>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Platform Strengths</h2>
            <p className="text-slate-500 mt-4 text-lg max-w-3xl mx-auto">
              A modern grievance lifecycle from submission to closure with measurable transparency, clear ownership, and citizen-facing updates.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-6"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                  <card.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-white text-lg font-bold tracking-tight">{card.title}</h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <h2 className="text-5xl font-black text-white tracking-tight">Municipal Departments</h2>
              <p className="text-slate-500 mt-4 text-lg">Direct routing to specialized municipal departments for prioritized response.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {departments.map((d, i) => (
              <Link to="/submit" key={i} className="group">
                <div className={`p-10 rounded-[2.5rem] border border-white/5 bg-white/[0.01] flex flex-col items-center gap-6 text-center transition-all duration-500 ${d.theme} shadow-sm group-hover:shadow-2xl`}>
                  <div className="w-20 h-20 rounded-3xl bg-[#020808] border border-white/10 flex items-center justify-center shadow-inner transition-transform group-hover:scale-110">
                    <d.icon className="w-10 h-10" />
                  </div>
                  <span className="font-black text-white/90 group-hover:text-inherit transition-colors uppercase tracking-widest text-xs">{d.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      <Footer />
    </div>
  );
}