import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Upload,
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Droplets,
  Bolt,
  Truck,
  BookOpen,
  HeartPulse,
  Shield,
  Building2,
  AlertCircle,
  X,
  Info,
  LocateFixed,
  Navigation,
  Map
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { categoryLabels } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getCitizenGrievances, resolveCategoryDepartment, submitCitizenGrievance, submitCitizenGrievanceWithAttachments } from "@/lib/api/citizen";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
const stepTitles = ["Category & Type", "Details & Location", "Evidence", "Review & Submit"];
const categoryIcons = {
  water: { icon: Droplets, color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/30" },
  electricity: { icon: Bolt, color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/30" },
  roads: { icon: Truck, color: "text-orange-600", bg: "bg-orange-500/10 border-orange-500/30" },
  transport: { icon: Map, color: "text-cyan-600", bg: "bg-cyan-500/10 border-cyan-500/30" },
  sanitation: { icon: Building2, color: "text-green-600", bg: "bg-green-500/10 border-green-500/30" },
  public_safety: { icon: Shield, color: "text-red-600", bg: "bg-red-500/10 border-red-500/30" },
  education: { icon: BookOpen, color: "text-purple-600", bg: "bg-purple-500/10 border-purple-500/30" },
  healthcare: { icon: HeartPulse, color: "text-pink-600", bg: "bg-pink-500/10 border-pink-500/30" },
  other: { icon: Sparkles, color: "text-gray-600", bg: "bg-gray-500/10 border-gray-500/30" }
};
const priorityConfig = {
  low: { label: "Low", desc: "Non-urgent, can wait 7-10 days", color: "border-border text-muted-foreground" },
  medium: { label: "Medium", desc: "Needs attention within 5-7 days", color: "border-blue-500/40 text-blue-600" },
  high: { label: "High", desc: "Urgent, needs attention within 3 days", color: "border-amber-500/40 text-amber-600" },
  critical: { label: "Critical", desc: "Emergency \u2014 immediate action required", color: "border-destructive/40 text-destructive" }
};
const MAX_ATTACHMENT_SIZE_MB = 10;
const MAX_ATTACHMENT_SIZE_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
const primaryMarkerIcon = L.divIcon({
  className: "custom-map-marker-primary",
  html: `<div style="color: hsl(0, 84%, 60%); display: flex; justify-content: center; align-items: center; width: 36px; height: 36px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="hsl(0, 84%, 60%)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});
const secondaryMarkerIcon = L.divIcon({
  className: "custom-map-marker-secondary",
  html: `<div style="color: hsl(215, 90%, 55%); display: flex; justify-content: center; align-items: center; width: 24px; height: 24px; opacity: 0.85;">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="hsl(215, 90%, 55%)" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="white"/></svg>
  </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24]
});
function MapController({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { animate: true, duration: 1 });
  }, [position, map]);
  return null;
}
function MapClicker({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}
function SubmitGrievance() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [nearbyTickets, setNearbyTickets] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const fallbackMapCenter = [20.5937, 78.9629];
  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    city: "",
    state: "",
    location: "",
    pincode: "",
    coordinates: null,
    priority: "medium",
    anonymous: false
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  useEffect(() => {
    if (!form.coordinates) {
      setNearbyTickets([]);
      return;
    }
    getCitizenGrievances().then((all) => {
    const active = all.filter((g) => ["submitted", "under_review", "in_progress"].includes(g.status));
    const nearby = active.filter((g) => {
      if (!g.coordinates) return false;
      const dist = getDistanceFromLatLonInKm(
        form.coordinates[0],
        form.coordinates[1],
        g.coordinates[0],
        g.coordinates[1]
      );
      return dist <= 2;
    });
    setNearbyTickets(nearby);
    }).catch(() => {
      setNearbyTickets([]);
    });
  }, [form.coordinates]);
  const handleLocateMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({ title: "GeoLocation Disabled", description: "Browser does not support location.", variant: "destructive" });
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({ ...prev, coordinates: [pos.coords.latitude, pos.coords.longitude] }));
        setErrors((prev) => ({ ...prev, location: "" }));
        setIsLocating(false);
        toast({ title: "Location Found", description: "Your pin has been successfully dropped." });
      },
      (err) => {
        toast({ title: "Location Denied", description: "Please manually click on the map to pin your location.", variant: "destructive" });
        setIsLocating(false);
      },
      { timeout: 1e4, enableHighAccuracy: true }
    );
  };
  const validateStep = (s) => {
    const errs = {};
    if (s === 0) {
      if (!form.category) errs.category = "Please select a category";
      if (!form.title.trim()) errs.title = "Title is required";
      if (form.title.trim().length < 5) errs.title = "Title must be at least 5 characters";
    }
    if (s === 1) {
      if (!form.description.trim()) errs.description = "Description is required";
      if (form.description.trim().length < 20) errs.description = "Please provide at least 20 characters of description";
      if (!form.coordinates && !form.location.trim()) errs.location = "Please pin the location on the map or type an address";
      if (!form.city.trim()) errs.city = "City is required";
      if (!form.state.trim()) errs.state = "State is required";
      if (!form.pincode.trim()) errs.pincode = "Pincode is required";
      if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleNext = () => {
    if (validateStep(step)) setStep(Math.min(3, step + 1));
  };
  const handleFileUpload = (files) => {
    if (!files) return;
    const valid = Array.from(files).filter((f) => f.size <= MAX_ATTACHMENT_SIZE_BYTES);
    if (valid.length < files.length) {
      toast({ title: "Some files skipped", description: `Files exceeding ${MAX_ATTACHMENT_SIZE_MB}MB were not added.`, variant: "destructive" });
    }
    const newFiles = valid.map((file) => ({
      file,
      url: URL.createObjectURL(file)
      // Create local blob URL for preview/storage simulation
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
  };
  useEffect(() => {
    return () => uploadedFiles.forEach((f) => URL.revokeObjectURL(f.url));
  }, [uploadedFiles]);
  const handleSubmit = async () => {
    if (!user || !form.category) return;
    setLoading(true);
    try {
      const [latitude, longitude] = form.coordinates || [];
      const mappedCategory = resolveCategoryDepartment(form.category);
      const payload = {
        title: form.title,
        description: form.description,
        category: mappedCategory.category,
        departmentId: mappedCategory.departmentId,
        departmentName: mappedCategory.departmentName,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        area: form.location.trim() || null,
        latitude,
        longitude,
        attachments: uploadedFiles.map((fileObj) => fileObj.file)
      };
      const created = uploadedFiles.length > 0
        ? await submitCitizenGrievanceWithAttachments(payload)
        : await submitCitizenGrievance(payload);
      toast({
        title: "Grievance Submitted",
        description: `Ticket ID: ${created.ticket_id}. You can track it from your dashboard.`
      });
      navigate("/citizen");
    } catch (error) {
      toast({ title: "Submission Failed", description: error.message || "Unable to save grievance. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };
  const stepIcons = [Sparkles, MapPin, Upload, Check];
  return /* @__PURE__ */ jsxs("div", { className: "dashboard-layout", children: [
    /* @__PURE__ */ jsx(DashboardSidebar, { collapsed: sidebarCollapsed, onToggle: () => setSidebarCollapsed(!sidebarCollapsed) }),
    /* @__PURE__ */ jsxs("main", { className: "dashboard-main bg-muted/10", children: [
      /* @__PURE__ */ jsx("div", { className: "dashboard-topbar", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "font-heading font-bold text-lg text-foreground", children: "File a Grievance" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Report civic issues directly to the authorities" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "p-4 md:p-8", children: /* @__PURE__ */ jsx("div", { className: "max-w-2xl mx-auto", children: /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mb-8", children: stepTitles.map((title, i) => {
          const StepIcon = stepIcons[i];
          const done = i < step;
          const current = i === step;
          return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1", children: [
            /* @__PURE__ */ jsx("div", { className: cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-400 shadow-sm",
              done ? "gradient-emerald text-white scale-95" : current ? "gradient-primary text-white ring-4 ring-primary/20 scale-105" : "bg-muted border border-border text-muted-foreground"
            ), children: done ? /* @__PURE__ */ jsx(Check, { className: "w-4 h-4" }) : /* @__PURE__ */ jsx(StepIcon, { className: "w-4 h-4" }) }),
            /* @__PURE__ */ jsx("span", { className: cn("text-[11px] font-semibold hidden sm:block truncate", current ? "text-foreground" : "text-muted-foreground"), children: title }),
            i < 3 && /* @__PURE__ */ jsx("div", { className: cn("flex-1 h-0.5 rounded-full transition-all duration-400 min-w-[8px]", i < step ? "bg-secondary" : "bg-border") })
          ] }, i);
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "elevated-card bg-card p-6 md:p-8", children: [
          /* @__PURE__ */ jsxs(AnimatePresence, { mode: "wait", children: [
            step === 0 && /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.25 }, className: "space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("p", { className: "form-label mb-3", children: "Select Category *" }),
                errors.category && /* @__PURE__ */ jsxs("p", { className: "form-error mb-2", children: [
                  /* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3" }),
                  errors.category
                ] }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: Object.entries(categoryIcons).map(([key, cfg]) => {
                  const CatIcon = cfg.icon;
                  const active = form.category === key;
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => {
                        setForm({ ...form, category: key });
                        setErrors({ ...errors, category: "" });
                      },
                      className: cn(
                        "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm",
                        active ? `${cfg.bg} ${cfg.color} shadow-sm border-current` : "border-border bg-muted/10 text-muted-foreground hover:border-primary/30 hover:bg-muted/30"
                      ),
                      children: [
                        /* @__PURE__ */ jsx(CatIcon, { className: cn("w-6 h-6 transition-transform", active ? cfg.color : "text-muted-foreground") }),
                        categoryLabels[key.replace("_", "-")] || key
                      ]
                    },
                    key
                  );
                }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
                /* @__PURE__ */ jsx(Label, { className: "form-label", children: "Grievance Title *" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    className: cn("mt-1.5 h-11", errors.title ? "border-destructive" : ""),
                    placeholder: "Brief title describing the issue (min 5 chars)",
                    value: form.title,
                    maxLength: 120,
                    onChange: (e) => {
                      setForm({ ...form, title: e.target.value });
                      setErrors({ ...errors, title: "" });
                    }
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mt-1", children: [
                  errors.title ? /* @__PURE__ */ jsxs("p", { className: "form-error", children: [
                    /* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3" }),
                    errors.title
                  ] }) : /* @__PURE__ */ jsx("span", {}),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    form.title.length,
                    "/120"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
                /* @__PURE__ */ jsx(Label, { className: "form-label", children: "Priority Level" }),
                /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2.5 mt-1.5", children: Object.keys(priorityConfig).map((p) => {
                  const pc = priorityConfig[p];
                  return /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setForm({ ...form, priority: p }),
                      className: cn(
                        "flex flex-col items-start gap-0.5 p-3 rounded-xl border-2 text-left transition-all",
                        form.priority === p ? `border-current ${pc.color} bg-current/5` : "border-border bg-muted/10 text-muted-foreground hover:border-primary/30"
                      ),
                      children: [
                        /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: pc.label }),
                        /* @__PURE__ */ jsx("span", { className: "text-[11px] opacity-70 leading-tight", children: pc.desc })
                      ]
                    },
                    p
                  );
                }) })
              ] })
            ] }, "step0"),
            step === 1 && /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.25 }, className: "space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                  /* @__PURE__ */ jsx(Label, { className: "form-label", children: "Detailed Description *" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    form.description.length,
                    "/2000"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    className: cn("mt-1.5 min-h-[120px] resize-none text-sm", errors.description ? "border-destructive" : ""),
                    placeholder: "Describe the problem in detail...",
                    value: form.description,
                    maxLength: 2e3,
                    onChange: (e) => {
                      setForm({ ...form, description: e.target.value });
                      setErrors({ ...errors, description: "" });
                    }
                  }
                ),
                errors.description && /* @__PURE__ */ jsxs("p", { className: "form-error mt-1", children: [
                  /* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3" }),
                  errors.description
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx(Label, { className: "form-label mb-0", children: "Pin Geo-Location *" }),
                    form.coordinates && /* @__PURE__ */ jsxs("span", { className: "text-[10px] ml-2 inline-block font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20", children: [
                      form.coordinates[0].toFixed(4),
                      ", ",
                      form.coordinates[1].toFixed(4)
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs(Button, { type: "button", size: "sm", variant: "outline", onClick: handleLocateMe, disabled: isLocating, className: "h-8 shadow-sm", children: [
                    isLocating ? /* @__PURE__ */ jsx("span", { className: "animate-spin w-3 h-3 border-2 border-foreground border-t-transparent rounded-full mr-2" }) : /* @__PURE__ */ jsx(Navigation, { className: "w-3.5 h-3.5 mr-1.5 text-primary" }),
                    "Locate Me"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative h-[250px] w-full rounded-2xl overflow-hidden border-2 border-border shadow-sm", children: [
                  /* @__PURE__ */ jsxs(
                    MapContainer,
                    {
                      center: form.coordinates || fallbackMapCenter,
                      zoom: form.coordinates ? 15 : 4,
                      style: { height: "100%", width: "100%", zIndex: 1 },
                      children: [
                        /* @__PURE__ */ jsx(TileLayer, { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "\xA9 OpenStreetMap contributors" }),
                        /* @__PURE__ */ jsx(MapClicker, { onPositionChange: (pos) => {
                          setForm({ ...form, coordinates: pos });
                          setErrors({ ...errors, location: "" });
                        } }),
                        /* @__PURE__ */ jsx(MapController, { position: form.coordinates }),
                        form.coordinates && /* @__PURE__ */ jsx(Marker, { position: form.coordinates, icon: primaryMarkerIcon }),
                        nearbyTickets.map((tc) => /* @__PURE__ */ jsx(Marker, { position: tc.coordinates, icon: secondaryMarkerIcon, children: /* @__PURE__ */ jsxs(Popup, { className: "text-xs", children: [
                          /* @__PURE__ */ jsx("strong", { children: tc.ticket_id }),
                          /* @__PURE__ */ jsx("br", {}),
                          tc.title,
                          /* @__PURE__ */ jsx("br", {}),
                          /* @__PURE__ */ jsx("span", { className: "uppercase text-[10px] text-muted-foreground", children: tc.status.replace("_", " ") })
                        ] }) }, tc.id))
                      ]
                    }
                  ),
                  !form.coordinates && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 z-[400] flex items-center justify-center bg-background/30 pointer-events-none backdrop-blur-[1px]", children: /* @__PURE__ */ jsxs("div", { className: "px-4 py-2 bg-card rounded-full shadow-lg border border-border flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx(LocateFixed, { className: "w-4 h-4 text-primary" }),
                    /* @__PURE__ */ jsx("span", { className: "text-sm font-semibold", children: "Click map to drop a pin" })
                  ] }) })
                ] }),
                nearbyTickets.length > 0 && /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, className: "mt-2 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex gap-3 text-sm text-blue-700 dark:text-blue-400", children: [
                  /* @__PURE__ */ jsx(Map, { className: "w-5 h-5 shrink-0 mt-0.5" }),
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsxs("strong", { children: [
                      nearbyTickets.length,
                      " open ticket(s) found near your location."
                    ] }),
                    /* @__PURE__ */ jsx("p", { className: "opacity-80 text-xs mt-0.5", children: "Check the blue pins on the map above to ensure you are not submitting a duplicate grievance for the same issue." })
                  ] })
                ] }),
                errors.location && /* @__PURE__ */ jsxs("p", { className: "form-error mt-1", children: [
                  /* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3" }),
                  errors.location
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "form-field pt-2", children: [
                  /* @__PURE__ */ jsx(Label, { className: "form-label", children: "Street Address / Landmark" }),
                  /* @__PURE__ */ jsxs("div", { className: "relative mt-1.5", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        className: "pl-10 h-11 text-sm",
                        placeholder: "Nearest landmark or exact address...",
                        value: form.location,
                        onChange: (e) => {
                          setForm({ ...form, location: e.target.value });
                          setErrors({ ...errors, location: "" });
                        }
                      }
                    )
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
                  /* @__PURE__ */ jsx(Label, { className: "form-label", children: "Pincode" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      className: cn("mt-1.5 h-11 text-sm", errors.pincode ? "border-destructive" : ""),
                      placeholder: "6-digit pincode",
                      inputMode: "numeric",
                      maxLength: 6,
                      value: form.pincode,
                      onChange: (e) => {
                        const nextValue = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setForm({ ...form, pincode: nextValue });
                        setErrors({ ...errors, pincode: "" });
                      }
                    }
                  ),
                  errors.pincode && /* @__PURE__ */ jsxs("p", { className: "form-error mt-1", children: [
                    /* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3" }),
                    errors.pincode
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
                  /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
                    /* @__PURE__ */ jsx(Label, { className: "form-label", children: "City *" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        className: cn("mt-1.5 h-11 text-sm", errors.city ? "border-destructive" : ""),
                        placeholder: "City",
                        value: form.city,
                        onChange: (e) => {
                          setForm({ ...form, city: e.target.value });
                          setErrors({ ...errors, city: "" });
                        }
                      }
                    ),
                    errors.city && /* @__PURE__ */ jsxs("p", { className: "form-error mt-1", children: [
                      /* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3" }),
                      errors.city
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "form-field", children: [
                    /* @__PURE__ */ jsx(Label, { className: "form-label", children: "State *" }),
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        className: cn("mt-1.5 h-11 text-sm", errors.state ? "border-destructive" : ""),
                        placeholder: "State",
                        value: form.state,
                        onChange: (e) => {
                          setForm({ ...form, state: e.target.value });
                          setErrors({ ...errors, state: "" });
                        }
                      }
                    ),
                    errors.state && /* @__PURE__ */ jsxs("p", { className: "form-error mt-1", children: [
                      /* @__PURE__ */ jsx(AlertCircle, { className: "w-3 h-3" }),
                      errors.state
                    ] })
                  ] })
                ] })
              ] })
            ] }, "step1"),
            step === 2 && /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.25 }, className: "space-y-6", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("p", { className: "form-label mb-1", children: [
                  "Upload Photo Evidence ",
                  /* @__PURE__ */ jsx("span", { className: "text-muted-foreground font-normal", children: "(optional)" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-3", children: "Attach vivid photos to ensure prompt verification. Max 5 images." }),
                /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: cn(
                      "border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 cursor-pointer",
                      dragOver ? "border-primary/60 bg-primary/5" : "border-border/70 bg-muted/10 hover:border-primary/40 hover:bg-muted/30"
                    ),
                    onDragOver: (e) => {
                      e.preventDefault();
                      setDragOver(true);
                    },
                    onDragLeave: () => setDragOver(false),
                    onDrop: (e) => {
                      e.preventDefault();
                      setDragOver(false);
                      handleFileUpload(e.dataTransfer.files);
                    },
                    onClick: () => fileInputRef.current?.click(),
                    children: [
                      /* @__PURE__ */ jsx(Upload, { className: "w-10 h-10 text-primary/40 mx-auto mb-3" }),
                      /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold text-foreground", children: "Drag & drop photos here" }),
                      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "JPG, PNG \u2014 Max 10MB each" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx("input", { ref: fileInputRef, type: "file", className: "hidden", accept: "image/*", multiple: true, onChange: (e) => handleFileUpload(e.target.files) }),
                uploadedFiles.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3", children: uploadedFiles.map((fileObj, i) => /* @__PURE__ */ jsxs("div", { className: "relative group rounded-xl overflow-hidden border border-border aspect-video bg-muted", children: [
                  /* @__PURE__ */ jsx("img", { src: fileObj.url, alt: `Upload ${i}`, className: "w-full h-full object-cover" }),
                  /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]", children: /* @__PURE__ */ jsx("button", { onClick: () => setUploadedFiles((prev) => prev.filter((_, j) => j !== i)), className: "p-2 rounded-full bg-destructive text-white hover:scale-110 transition-transform shadow-md", children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) }) })
                ] }, i)) })
              ] }),
              /* @__PURE__ */ jsxs("label", { className: "flex items-start gap-3 p-4 rounded-xl border border-border/60 bg-card cursor-pointer hover:bg-muted/10 transition-colors shadow-sm", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    checked: form.anonymous,
                    onChange: (e) => setForm({ ...form, anonymous: e.target.checked }),
                    className: "mt-0.5 rounded cursor-pointer"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-bold text-foreground", children: "Submit Anonymously" }),
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mt-1 leading-relaxed", children: "Your identity will be hidden from the public and field officers. Note: You will have limited direct communication capabilities." })
                ] })
              ] })
            ] }, "step2"),
            step === 3 && /* @__PURE__ */ jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 }, transition: { duration: 0.25 }, className: "space-y-5", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm text-info bg-info/10 border border-info/20 rounded-xl px-4 py-3", children: [
                /* @__PURE__ */ jsx(Info, { className: "w-5 h-5 shrink-0" }),
                /* @__PURE__ */ jsx("span", { className: "font-medium text-info-foreground", children: "Please review your grievance carefully before submitting. Content cannot be edited post-submission." })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card shadow-sm divide-y divide-border/60", children: [
                [
                  { label: "Category", value: categoryLabels[form.category.replace("_", "-")] || form.category },
                  { label: "Title", value: form.title || "\u2014" },
                  { label: "Priority", value: priorityConfig[form.priority].label },
                  { label: "Location", value: form.location || (form.coordinates ? `${form.coordinates[0].toFixed(4)}, ${form.coordinates[1].toFixed(4)}` : "Not specified") },
                  { label: "City", value: form.city || "\u2014" },
                  { label: "State", value: form.state || "\u2014" },
                  { label: "Pincode", value: form.pincode || "\u2014" },
                  { label: "Anonymous", value: form.anonymous ? "Yes" : "No" },
                  { label: "Evidence", value: uploadedFiles.length > 0 ? `${uploadedFiles.length} photo(s) attached` : "None" }
                ].map(({ label, value }) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 px-5 py-3.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground w-28 shrink-0", children: label }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm text-foreground font-medium flex-1", children: value })
                ] }, label)),
                form.description && /* @__PURE__ */ jsxs("div", { className: "px-5 py-4 bg-muted/5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-muted-foreground block mb-2", children: "Description" }),
                  /* @__PURE__ */ jsx("p", { className: "text-sm text-foreground leading-relaxed whitespace-pre-wrap", children: form.description })
                ] })
              ] })
            ] }, "step3")
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-between mt-8 pt-6 border-t border-border", children: [
            /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => setStep(Math.max(0, step - 1)), disabled: step === 0, className: "shadow-sm border-border", children: [
              /* @__PURE__ */ jsx(ArrowLeft, { className: "w-4 h-4 mr-2" }),
              " Back"
            ] }),
            step < 3 ? /* @__PURE__ */ jsxs(Button, { onClick: handleNext, className: "gradient-primary text-white shadow-md font-semibold px-6", children: [
              "Continue ",
              /* @__PURE__ */ jsx(ArrowRight, { className: "w-4 h-4 ml-2" })
            ] }) : /* @__PURE__ */ jsx(Button, { onClick: handleSubmit, className: "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md font-semibold px-6", disabled: loading || !form.title || !form.description || !form.category, children: loading ? /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" }),
              " Submitting..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 mr-2" }),
              " Submit Grievance"
            ] }) })
          ] })
        ] })
      ] }) }) })
    ] })
  ] });
}
export {
  SubmitGrievance as default
};
