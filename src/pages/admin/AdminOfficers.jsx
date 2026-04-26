import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Plus,
  Save,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Users,
  UserPen,
  XCircle,
  CheckCircle2
} from "lucide-react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  createOfficer,
  getAllOfficers,
  getDepartments,
  getOfficerById,
  updateOfficer,
  updateOfficerStatus
} from "@/lib/api/admin";

const emptyCreateForm = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  departmentId: "",
  designation: ""
};

const emptyEditForm = {
  fullName: "",
  phone: "",
  departmentId: "",
  designation: ""
};

function normalizeOfficerId(officer) {
  return String(officer?.id ?? officer?.officerUserId ?? officer?.userId ?? "");
}

export default function AdminOfficers() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingCreate, setSavingCreate] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [officerList, deptList] = await Promise.all([getAllOfficers(), getDepartments()]);
        if (!mounted) return;
        setOfficers(Array.isArray(officerList) ? officerList : []);
        setDepartments(Array.isArray(deptList) ? deptList : []);
        if (!selectedOfficerId && officerList?.length > 0) {
          setSelectedOfficerId(normalizeOfficerId(officerList[0]));
        }
      } catch {
        if (mounted) {
          setOfficers([]);
          setDepartments([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function loadDetail() {
      if (!selectedOfficerId) {
        setSelectedOfficer(null);
        setEditForm(emptyEditForm);
        return;
      }

      setLoadingDetail(true);
      try {
        const detail = await getOfficerById(selectedOfficerId);
        if (!mounted) return;
        const nextOfficer = detail || officers.find((officer) => normalizeOfficerId(officer) === String(selectedOfficerId)) || null;
        setSelectedOfficer(nextOfficer);
        setEditForm({
          fullName: nextOfficer?.fullName || "",
          phone: nextOfficer?.phone || "",
          departmentId: nextOfficer?.departmentId ?? nextOfficer?.department_id ?? "",
          designation: nextOfficer?.designation || ""
        });
      } catch {
        if (mounted) {
          const fallback = officers.find((officer) => normalizeOfficerId(officer) === String(selectedOfficerId)) || null;
          setSelectedOfficer(fallback);
          setEditForm({
            fullName: fallback?.fullName || "",
            phone: fallback?.phone || "",
            departmentId: fallback?.departmentId ?? fallback?.department_id ?? "",
            designation: fallback?.designation || ""
          });
        }
      } finally {
        if (mounted) setLoadingDetail(false);
      }
    }

    loadDetail();
    return () => {
      mounted = false;
    };
  }, [selectedOfficerId, officers]);

  const filteredOfficers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return officers;
    return officers.filter((officer) => {
      const blob = [
        officer.fullName,
        officer.email,
        officer.phone,
        officer.designation,
        officer.departmentName,
        officer.isActive ? "active" : "inactive"
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(query);
    });
  }, [officers, searchQuery]);

  const stats = useMemo(() => {
    const activeCount = officers.filter((officer) => officer.isActive !== false).length;
    const inactiveCount = officers.length - activeCount;
    const departmentCoverage = new Set(officers.map((officer) => officer.departmentName || officer.departmentId || officer.department_id).filter(Boolean)).size;
    return [
      { label: "Total officers", value: officers.length, color: "text-blue-500", icon: Users },
      { label: "Active", value: activeCount, color: "text-emerald-500", icon: CheckCircle2 },
      { label: "Inactive", value: inactiveCount, color: "text-rose-500", icon: XCircle },
      { label: "Departments", value: departmentCoverage, color: "text-amber-500", icon: Building2 }
    ];
  }, [officers]);

  const refreshData = async () => {
    try {
      const [officerList, deptList] = await Promise.all([getAllOfficers(), getDepartments()]);
      setOfficers(Array.isArray(officerList) ? officerList : []);
      setDepartments(Array.isArray(deptList) ? deptList : []);
      const nextSelected = officerList.find((officer) => normalizeOfficerId(officer) === String(selectedOfficerId)) || officerList[0] || null;
      if (nextSelected && !selectedOfficerId) {
        setSelectedOfficerId(normalizeOfficerId(nextSelected));
      }
      if (selectedOfficerId) {
        const detail = await getOfficerById(selectedOfficerId);
        setSelectedOfficer(detail || nextSelected || null);
      }
      toast({ title: "Refreshed", description: "Officer data was reloaded." });
    } catch (error) {
      toast({ title: "Refresh failed", description: error.message || "Unable to reload officer data.", variant: "destructive" });
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.fullName.trim() || !createForm.email.trim() || !createForm.password.trim() || !createForm.departmentId || !createForm.designation.trim()) {
      toast({ title: "Missing fields", description: "Full name, email, password, department, and designation are required.", variant: "destructive" });
      return;
    }

    setSavingCreate(true);
    try {
      await createOfficer({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        phone: createForm.phone.trim() || null,
        departmentId: Number(createForm.departmentId),
        designation: createForm.designation.trim()
      });
      toast({ title: "Officer created", description: `${createForm.fullName.trim()} was added successfully.` });
      setCreateForm(emptyCreateForm);
      await refreshData();
    } catch (error) {
      toast({ title: "Create failed", description: error.message || "Unable to create officer.", variant: "destructive" });
    } finally {
      setSavingCreate(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfficerId) return;
    setSavingUpdate(true);
    try {
      const updated = await updateOfficer(selectedOfficerId, {
        fullName: editForm.fullName.trim() || undefined,
        phone: editForm.phone.trim() || null,
        departmentId: editForm.departmentId ? Number(editForm.departmentId) : null,
        designation: editForm.designation.trim() || undefined
      });
      setSelectedOfficer(updated || selectedOfficer);
      toast({ title: "Officer updated", description: "Officer details were saved." });
      await refreshData();
    } catch (error) {
      toast({ title: "Update failed", description: error.message || "Unable to update officer.", variant: "destructive" });
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedOfficer) return;
    const nextActive = !(selectedOfficer.isActive !== false);
    setTogglingStatus(true);
    try {
      const updated = await updateOfficerStatus(selectedOfficerId, nextActive);
      setSelectedOfficer(updated || { ...selectedOfficer, isActive: nextActive });
      toast({ title: "Status updated", description: `Officer marked as ${nextActive ? "active" : "inactive"}.` });
      await refreshData();
    } catch (error) {
      toast({ title: "Status update failed", description: error.message || "Unable to change officer status.", variant: "destructive" });
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="dashboard-main flex items-center justify-center bg-muted/10">
           <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full glow-navy" />
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading officer directory...</p>
          </div>
        </main>
      </div>
    );
  }

  const selectedDepartmentName = departments.find((dept) => String(dept.id) === String(editForm.departmentId))?.name || selectedOfficer?.departmentName || "Unassigned";

  return (
    <div className="dashboard-layout">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <main className="dashboard-main bg-background relative overflow-hidden">
        
        {/* Dynamic Background */}
        <div className="absolute top-0 inset-x-0 h-[400px] bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
        <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

        <div className="p-4 md:p-6 lg:p-8 space-y-6 relative z-10 max-w-[1600px] mx-auto">
          
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Officer Control Center
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground leading-tight">Officers</h1>
              <p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Create officers, assign them to departments, update their details, and switch status without leaving the admin flow.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
              {stats.map((item) => (
                <div key={item.label} className="glass-card p-4 min-w-[140px] flex flex-col justify-between relative overflow-hidden group border-border/50 hover:border-primary/30 transition-colors">
                  <div className={cn("absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-2xl opacity-10 transition-opacity group-hover:opacity-30", item.color.replace('text-', 'bg-'))} />
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className={cn("w-4 h-4", item.color)} />
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{item.label}</p>
                  </div>
                  <p className="text-3xl font-heading font-bold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-2">
            <div className="relative max-w-xl w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search officers by name, department, role, or contact..."
                className="pl-11 h-12 rounded-2xl border-border/60 bg-card/50 backdrop-blur-sm shadow-sm focus-visible:ring-primary/30 text-base"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" onClick={refreshData} className="h-12 rounded-2xl px-5 bg-card/50 backdrop-blur-sm">
                <RefreshCw className="w-4 h-4 mr-2 text-primary" /> Refresh
              </Button>
              <Button onClick={() => setSelectedOfficerId("")} className="h-12 rounded-2xl px-5 shadow-md gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" /> New Officer
              </Button>
            </div>
          </div>

          {/* Two-Column Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_450px] 2xl:grid-cols-[1fr_500px] gap-8 items-start">
            
            {/* Officers Directory (Left Pane) */}
            <section className="elevated-card overflow-hidden flex flex-col h-[calc(100vh-280px)] min-h-[550px]">
              <div className="p-5 border-b border-border/40 bg-muted/5 flex items-center justify-between">
                <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Officer Directory
                </h3>
                <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-md">
                  {filteredOfficers.length} found
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-card/30">
                <AnimatePresence>
                  {filteredOfficers.length > 0 ? (
                    filteredOfficers.map((officer) => {
                      const officerId = normalizeOfficerId(officer);
                      const active = String(officerId) === String(selectedOfficerId);
                      
                      return (
                        <motion.button
                          layout
                          key={officerId}
                          onClick={() => setSelectedOfficerId(officerId)}
                          className={cn(
                            "w-full text-left rounded-2xl border p-4 transition-all duration-300 group relative overflow-hidden",
                            active 
                              ? "border-primary/40 bg-primary/5 shadow-md ring-1 ring-primary/20" 
                              : "border-border/60 bg-card/50 hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm"
                          )}
                        >
                          {active && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-2xl" />}
                          
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={cn("font-heading font-bold text-base truncate transition-colors", active ? "text-primary" : "text-foreground group-hover:text-primary")}>
                                  {officer.fullName || "Unnamed Officer"}
                                </h4>
                                {active && <BadgeCheck className="w-4 h-4 text-primary shrink-0" />}
                              </div>
                              <p className="text-xs text-muted-foreground bg-muted/50 inline-block px-2 py-0.5 rounded-md">
                                {officer.designation || "Officer"}
                              </p>
                            </div>
                            <span className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold shrink-0",
                              officer.isActive !== false ? "bg-secondary/15 text-secondary" : "bg-muted text-muted-foreground"
                            )}>
                              {officer.isActive !== false ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                              {officer.isActive !== false ? "Active" : "Inactive"}
                            </span>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-border/40 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 truncate" title={officer.email}>
                              <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{officer.email || "No email"}</span>
                            </span>
                            <span className="flex items-center gap-1.5 truncate">
                              <Phone className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{officer.phone || "No phone"}</span>
                            </span>
                            <span className="flex items-center gap-1.5 truncate" title={officer.departmentName}>
                              <Building2 className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{officer.departmentName || "Unassigned"}</span>
                            </span>
                            <span className="flex items-center gap-1.5 truncate">
                              <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{officer.id ?? "N/A"}</span>
                            </span>
                          </div>
                        </motion.button>
                      );
                    })
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <p className="font-heading font-semibold text-foreground">No officers found</p>
                      <p className="text-sm text-muted-foreground mt-1">Check your search query or add a new officer.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </section>

            {/* Details & Forms (Right Pane) */}
            <aside className="h-[calc(100vh-280px)] min-h-[550px]">
              <div className="glass-panel h-full flex flex-col overflow-hidden relative">
                <div className="p-5 md:p-6 border-b border-border/40 bg-gradient-to-br from-muted/20 to-transparent flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
                      <UserPen className="w-5 h-5 text-primary" />
                      {selectedOfficer ? "Edit Officer Profile" : "Create New Officer"}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedOfficer ? "Update details or change status." : "Provision a new officer account."}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 md:p-6 custom-scrollbar bg-card/20">
                  {selectedOfficer ? (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                      
                      {/* Selected Officer Header Card */}
                      <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/5 via-transparent to-transparent p-5 flex items-start justify-between gap-4 shadow-sm">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Editing</p>
                          <h4 className="font-heading text-xl font-bold text-foreground">{selectedOfficer.fullName || "Unnamed Officer"}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{selectedOfficer.designation || "Officer"}</p>
                        </div>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm",
                          selectedOfficer.isActive !== false ? "bg-secondary/15 text-secondary border border-secondary/20" : "bg-muted text-muted-foreground border border-border/50"
                        )}>
                          {selectedOfficer.isActive !== false ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <form onSubmit={handleUpdateSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">Full Name</Label>
                            <Input 
                              value={editForm.fullName} 
                              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} 
                              placeholder="Officer full name"
                              className="bg-card/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">Phone</Label>
                            <Input 
                              value={editForm.phone} 
                              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} 
                              placeholder="10 to 15 digits"
                              className="bg-card/50"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">Department</Label>
                            <select 
                              value={editForm.departmentId} 
                              onChange={(e) => setEditForm({ ...editForm, departmentId: e.target.value })} 
                              className="flex h-11 w-full rounded-xl border border-input bg-card/50 px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                            >
                              <option value="">Select a department...</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name || `Department ${dept.id}`}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">Designation</Label>
                            <Textarea 
                              value={editForm.designation} 
                              onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} 
                              placeholder="e.g. Senior Inspector" 
                              className="min-h-[100px] bg-card/50 resize-none" 
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                          <Button type="submit" disabled={savingUpdate || loadingDetail} className="flex-1 h-12 rounded-xl shadow-md gradient-primary text-white">
                            <Save className="w-4 h-4 mr-2" /> {savingUpdate ? "Saving Changes..." : "Save Changes"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={handleToggleStatus} 
                            disabled={togglingStatus} 
                            className={cn(
                              "flex-1 h-12 rounded-xl border-border/60",
                              selectedOfficer.isActive !== false ? "hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30" : "hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30"
                            )}
                          >
                            {selectedOfficer.isActive !== false ? <ToggleLeft className="w-4 h-4 mr-2" /> : <ToggleRight className="w-4 h-4 mr-2" />} 
                            {togglingStatus ? "Updating..." : selectedOfficer.isActive !== false ? "Mark as Inactive" : "Mark as Active"}
                          </Button>
                        </div>
                      </form>

                      <div className="rounded-xl border border-border/40 bg-muted/20 p-4 text-xs text-muted-foreground flex items-start gap-3">
                        <Building2 className="w-4 h-4 mt-0.5 shrink-0 opacity-70" />
                        <div>
                          <p className="font-semibold text-foreground mb-0.5 uppercase tracking-widest text-[10px]">Current Mapping</p>
                          <p>This officer is currently mapped to <strong>{selectedDepartmentName}</strong>. Changing the department will re-route their new grievance assignments.</p>
                        </div>
                      </div>

                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <form onSubmit={handleCreateSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-1">Full Name <span className="text-rose-500">*</span></Label>
                            <Input 
                              value={createForm.fullName} 
                              onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} 
                              placeholder="Officer full name"
                              className="bg-card/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-1">Email <span className="text-rose-500">*</span></Label>
                            <Input 
                              type="email" 
                              value={createForm.email} 
                              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} 
                              placeholder="officer@gov.in"
                              className="bg-card/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-1">Password <span className="text-rose-500">*</span></Label>
                            <Input 
                              type="password" 
                              value={createForm.password} 
                              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} 
                              placeholder="Temporary password"
                              className="bg-card/50"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest">Phone</Label>
                            <Input 
                              value={createForm.phone} 
                              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} 
                              placeholder="10 to 15 digits"
                              className="bg-card/50"
                            />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-1">Department <span className="text-rose-500">*</span></Label>
                            <select 
                              value={createForm.departmentId} 
                              onChange={(e) => setCreateForm({ ...createForm, departmentId: e.target.value })} 
                              className="flex h-11 w-full rounded-xl border border-input bg-card/50 px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                            >
                              <option value="">Select a department...</option>
                              {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>{dept.name || `Department ${dept.id}`}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-xs font-semibold text-foreground/80 uppercase tracking-widest flex items-center gap-1">Designation <span className="text-rose-500">*</span></Label>
                            <Textarea 
                              value={createForm.designation} 
                              onChange={(e) => setCreateForm({ ...createForm, designation: e.target.value })} 
                              placeholder="e.g. Senior Inspector" 
                              className="min-h-[100px] bg-card/50 resize-none" 
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                          <Button type="submit" disabled={savingCreate} className="flex-1 h-12 rounded-xl shadow-md gradient-primary text-white">
                            <Plus className="w-4 h-4 mr-2" /> {savingCreate ? "Creating Officer..." : "Create Officer"}
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setCreateForm(emptyCreateForm)} className="h-12 w-full sm:w-28 rounded-xl border-border/60">
                            Clear
                          </Button>
                        </div>
                      </form>

                      <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-primary/80 flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
                        <p className="leading-relaxed">
                          New officers will receive their credentials via email (if configured). They will be forced to change their temporary password upon first login.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}