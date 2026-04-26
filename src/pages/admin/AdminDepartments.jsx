import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BadgeCheck, 
  Building2, 
  ChevronRight, 
  Search, 
  Sparkles, 
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock
} from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getDepartmentDetails,
  getDepartments,
  getGrievanceStatistics,
  getGrievanceStatisticsByDepartment,
  getOfficersByDepartment
} from "@/lib/api/admin";

export default function AdminDepartments() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentDetail, setDepartmentDetail] = useState(null);
  const [departmentOfficers, setDepartmentOfficers] = useState([]);
  const [grievanceStats, setGrievanceStats] = useState(null);
  const [departmentStats, setDepartmentStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const departmentStyles = {
    water: { ring: "ring-sky-500/20", badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300", accent: "from-sky-500 to-cyan-400" },
    electricity: { ring: "ring-amber-500/20", badge: "bg-amber-500/10 text-amber-700 dark:text-amber-300", accent: "from-amber-500 to-orange-400" },
    roads: { ring: "ring-orange-500/20", badge: "bg-orange-500/10 text-orange-700 dark:text-orange-300", accent: "from-orange-500 to-red-400" },
    transport: { ring: "ring-cyan-500/20", badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300", accent: "from-cyan-500 to-blue-400" },
    sanitation: { ring: "ring-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", accent: "from-emerald-500 to-teal-400" },
    "public-safety": { ring: "ring-red-500/20", badge: "bg-red-500/10 text-red-700 dark:text-red-300", accent: "from-red-500 to-rose-400" },
    education: { ring: "ring-violet-500/20", badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300", accent: "from-violet-500 to-fuchsia-400" },
    healthcare: { ring: "ring-pink-500/20", badge: "bg-pink-500/10 text-pink-700 dark:text-pink-300", accent: "from-pink-500 to-rose-400" },
    other: { ring: "ring-slate-500/20", badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300", accent: "from-slate-500 to-slate-400" }
  };

  useEffect(() => {
    let mounted = true;
    async function loadDepartments() {
      try {
        const [deptList, stats] = await Promise.all([getDepartments(), getGrievanceStatistics()]);
        const baseDepartments = Array.isArray(deptList) ? deptList : [];

        const enrichedDepartments = await Promise.all(
          baseDepartments.map(async (dept) => {
            try {
              const details = await getDepartmentDetails(dept.id);
              return {
                ...dept,
                totalOfficers: details?.totalOfficers ?? dept.totalOfficers ?? 0
              };
            } catch {
              return {
                ...dept,
                totalOfficers: dept.totalOfficers ?? 0
              };
            }
          })
        );

        if (!mounted) return;
        setDepartments(enrichedDepartments);
        setGrievanceStats(stats);
        if (enrichedDepartments.length > 0) setSelectedDepartmentId(String(enrichedDepartments[0].id));
      } catch {
        if (mounted) {
          setDepartments([]);
          setGrievanceStats(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadDepartments();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadDepartmentData() {
      if (!selectedDepartmentId) {
        setDepartmentDetail(null);
        setDepartmentOfficers([]);
        setDepartmentStats(null);
        return;
      }

      try {
        const [details, officers, stats] = await Promise.all([
          getDepartmentDetails(selectedDepartmentId),
          getOfficersByDepartment(selectedDepartmentId),
          getGrievanceStatisticsByDepartment(selectedDepartmentId)
        ]);
        if (!mounted) return;
        setDepartmentDetail(details);
        setDepartmentOfficers(Array.isArray(officers) ? officers : []);
        setDepartmentStats(stats);
      } catch {
        if (mounted) {
          setDepartmentDetail(null);
          setDepartmentOfficers([]);
          setDepartmentStats(null);
        }
      }
    }

    loadDepartmentData();
    return () => {
      mounted = false;
    };
  }, [selectedDepartmentId]);

  const selectedDepartment = departments.find((dept) => String(dept.id) === String(selectedDepartmentId)) || null;
  const filteredDepartments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter((dept) => {
      const text = `${dept.name || ""} ${dept.description || ""} ${dept.id || ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [departments, searchQuery]);

  const liveSummary = useMemo(() => {
    const source = departmentStats || grievanceStats || {};
    return [
      { label: "Total grievances", value: source.totalGrievances ?? 0, icon: Activity, color: "text-blue-500" },
      { label: "Open Issues", value: (source.submittedCount ?? 0) + (source.underReviewCount ?? 0) + (source.inProgressCount ?? 0), icon: AlertTriangle, color: "text-amber-500" },
      { label: "Resolved", value: source.resolvedCount ?? 0, icon: CheckCircle2, color: "text-emerald-500" },
      { label: "Closed", value: source.closedCount ?? 0, icon: BadgeCheck, color: "text-slate-500" }
    ];
  }, [departmentStats, grievanceStats]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="dashboard-main flex items-center justify-center bg-muted/10">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow-navy" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading department data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="dashboard-main bg-background relative overflow-hidden">
        
        {/* Dynamic Background */}
        <div className="absolute top-0 inset-x-0 h-[380px] bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

        <div className="p-4 md:p-6 lg:p-8 space-y-6 relative z-10 max-w-[1600px] mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Department Intelligence Center
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">Departments</h1>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Browse every department in one place, inspect officer capacity, and review live grievance metrics without leaving the screen.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {liveSummary.map((item, index) => (
                <div key={item.label} className={cn(
                  "glass-card p-4 min-w-[140px] flex flex-col justify-between relative overflow-hidden group",
                  index === 0 && !departmentStats && "border-primary/30"
                )}>
                  {/* Subtle background glow for cards */}
                  <div className={cn("absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40", item.color.replace('text-', 'bg-'))} />
                  
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{item.label}</p>
                  </div>
                  <p className="text-3xl font-heading font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search departments by name or description..."
              className="pl-11 h-12 rounded-2xl border-border/60 bg-card/50 backdrop-blur-sm shadow-sm focus-visible:ring-primary/30 text-base"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-8 items-start">
            
            {/* Departments List Pane */}
            <div className="xl:sticky xl:top-6 space-y-4">
              <div className="elevated-card p-5 h-[calc(100vh-280px)] min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> Directory
                  </h3>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {filteredDepartments.length} depts
                  </span>
                </div>
                
                <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {filteredDepartments.map((dept) => {
                      const active = String(dept.id) === String(selectedDepartmentId);
                      const slug = String(dept.name || "other").toLowerCase().replace(/\s+/g, "-");
                      const style = departmentStyles[slug] || departmentStyles.other;
                      
                      return (
                        <motion.button
                          layout
                          key={dept.id}
                          onClick={() => setSelectedDepartmentId(String(dept.id))}
                          className={cn(
                            "w-full text-left rounded-2xl border p-4 transition-all duration-300 group relative overflow-hidden",
                            active 
                              ? `border-primary/40 bg-gradient-to-br ${style.accent} bg-opacity-10 shadow-md ring-1 ${style.ring}` 
                              : "border-border/60 bg-card/50 hover:border-primary/30 hover:bg-muted/30"
                          )}
                        >
                          {active && (
                            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5", style.accent)} />
                          )}
                          <div className="flex items-start gap-4 relative z-10">
                            <div className={cn(
                              "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-sm transition-transform duration-300 group-hover:scale-105", 
                              `bg-gradient-to-br ${style.accent}`
                            )}>
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1 py-0.5">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="font-heading font-bold text-foreground truncate">{dept.name || "Unnamed"}</h4>
                                {active && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                {dept.description || "No description provided."}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs relative z-10">
                            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium", style.badge)}>
                              <Users className="w-3.5 h-3.5" />
                              {dept.totalOfficers ?? 0} officers
                            </span>
                            <span className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity text-foreground font-medium">
                              Open <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </AnimatePresence>

                  {!filteredDepartments.length && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-40 text-center">
                      <Building2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
                      <p className="text-sm font-medium text-foreground">No departments found</p>
                      <p className="text-xs text-muted-foreground mt-1">Try a different search query.</p>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Department Detail Pane */}
            <div className="space-y-6">
              {selectedDepartment ? (
                <motion.div
                  key={selectedDepartment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Selected Dept Hero Header */}
                  <section className="relative overflow-hidden rounded-[2rem] elevated-card p-6 md:p-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute -top-24 -right-10 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                      <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md">
                            Selected Department
                          </span>
                          <span className="text-xs font-mono text-muted-foreground">ID: {selectedDepartmentId}</span>
                        </div>
                        <h2 className="font-heading text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">
                          {departmentDetail?.name || selectedDepartment.name}
                        </h2>
                        <p className="mt-4 text-sm md:text-base text-muted-foreground leading-relaxed">
                          {departmentDetail?.description || selectedDepartment.description || "No department description available."}
                        </p>
                      </div>
                      
                      <div className="glass-panel p-5 min-w-[200px] flex flex-col items-center justify-center text-center shrink-0">
                        <Users className="w-8 h-8 text-primary mb-3 opacity-80" />
                        <p className="text-3xl font-heading font-bold text-foreground">
                          {departmentDetail?.totalOfficers ?? departmentOfficers.length ?? 0}
                        </p>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1">
                          Total Officers
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Officers & Details Split */}
                  <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
                    
                    {/* Officers List */}
                    <section className="elevated-card p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading font-bold text-xl text-foreground flex items-center gap-2">
                          <BadgeCheck className="w-5 h-5 text-secondary" /> Officer Roster
                        </h3>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                          {departmentOfficers.length} active
                        </span>
                      </div>

                      {departmentOfficers.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {departmentOfficers.map((officer) => (
                            <div key={officer.id} className="rounded-2xl border border-border/50 bg-card hover:bg-muted/10 transition-colors p-5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-foreground text-base">
                                    {officer.fullName || "Unnamed Officer"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1 bg-muted inline-block px-2 py-0.5 rounded">
                                    {officer.designation || "Officer"}
                                  </p>
                                </div>
                                <span className={cn(
                                  "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shrink-0",
                                  officer.isActive ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
                                )}>
                                  {officer.isActive ? "Active" : "Inactive"}
                                </span>
                              </div>
                              <div className="pt-4 border-t border-border/40 grid grid-cols-1 gap-2 text-xs">
                                <p className="text-muted-foreground flex items-center justify-between">
                                  <span>Email</span> <span className="font-medium text-foreground">{officer.email || "N/A"}</span>
                                </p>
                                <p className="text-muted-foreground flex items-center justify-between">
                                  <span>Phone</span> <span className="font-medium text-foreground">{officer.phone || "N/A"}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-10 flex flex-col items-center justify-center text-center">
                          <Users className="w-10 h-10 mb-4 text-muted-foreground/30" />
                          <p className="text-sm font-medium text-foreground">No Officers Assigned</p>
                          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                            There are currently no active officers listed for this department.
                          </p>
                        </div>
                      )}
                    </section>

                    {/* Department Metrics Side Pane */}
                    <aside className="space-y-6">
                      <section className="elevated-card p-6 bg-gradient-to-br from-card to-muted/20">
                        <h3 className="font-heading font-bold text-foreground mb-5 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" /> Dept Metrics
                        </h3>
                        
                        <div className="space-y-3">
                          {[
                            { label: "Open Issues", value: (departmentStats?.submittedCount ?? 0) + (departmentStats?.underReviewCount ?? 0) + (departmentStats?.inProgressCount ?? 0), color: "border-l-amber-500" },
                            { label: "Resolved", value: departmentStats?.resolvedCount ?? 0, color: "border-l-emerald-500" },
                            { label: "Closed", value: departmentStats?.closedCount ?? 0, color: "border-l-slate-500" },
                            { label: "Reopened", value: departmentStats?.reopenedCount ?? 0, color: "border-l-rose-500" }
                          ].map((item) => (
                            <div key={item.label} className={cn("rounded-xl border border-border/60 bg-card p-4 flex items-center justify-between border-l-4", item.color)}>
                              <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{item.label}</p>
                              <p className="font-heading text-xl font-bold text-foreground">{item.value}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Intelligence Note</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            These metrics reflect the real-time operational capacity and load for {selectedDepartment.name}.
                          </p>
                        </div>
                      </section>
                    </aside>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-border bg-card/50 p-16 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                  <div className="w-20 h-20 rounded-full bg-muted/40 flex items-center justify-center mb-5 border border-border/50">
                    <Building2 className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-foreground mb-2">No Department Selected</h3>
                  <p className="text-sm text-muted-foreground max-w-[300px] leading-relaxed">
                    Select a department from the directory to view its detailed roster, description, and live grievance handling metrics.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}