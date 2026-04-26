import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";
import { MapPin, Clock3, AlertTriangle, ShieldCheck, Activity, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import "leaflet/dist/leaflet.css";

// Center of the Intelligence Zone (Near Bhubaneswar)
const ODISHA_CENTER = [20.2961, 85.8245];
const RADIAL_METERS = 320000; // ~320km radius to cover most of the state

const odishaBounds = [
  [17.5, 81.0], 
  [23.0, 88.0], 
];

const odishaAnchors = {
  bhubaneswar: [20.2961, 85.8245],
  cuttack: [20.4625, 85.8828],
  puri: [19.8135, 85.8312],
  rourkela: [22.2604, 84.8536],
  sambalpur: [21.4669, 83.9812],
  balasore: [21.4927, 86.9335],
  berhampur: [19.3149, 84.7941],
  koraput: [18.8135, 82.7123],
};

const priorityStyle = {
  critical: { color: "#ef4444", label: "Critical", bg: "bg-red-500/10", rank: 4 },
  high: { color: "#f97316", label: "High", bg: "bg-orange-500/10", rank: 3 },
  medium: { color: "#eab308", label: "Medium", bg: "bg-yellow-500/10", rank: 2 },
  low: { color: "#22c55e", label: "Low", bg: "bg-emerald-500/10", rank: 1 },
};

function hashToJitter(seed) {
  const source = String(seed || "0");
  let hash = 0;
  for (let i = 0; i < source.length; i++) {
    hash = (hash << 5) - hash + source.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((hash % 200) - 100) / 1000;
  const lngOffset = (((hash >> 3) % 200) - 100) / 1000;
  return [latOffset, lngOffset];
}

function resolveCoordinates(issue) {
  if (Array.isArray(issue.coordinates) && issue.coordinates.length >= 2) {
    const [lat, lng] = issue.coordinates;
    if (typeof lat === "number" && typeof lng === "number") {
      return [
        Math.max(18.0, Math.min(22.9, lat)),
        Math.max(82.9, Math.min(87.4, lng)),
      ];
    }
  }

  if (issue.coordinates && typeof issue.coordinates.lat === "number" && typeof issue.coordinates.lng === "number") {
    const lat = Math.max(18.0, Math.min(22.9, issue.coordinates.lat));
    const lng = Math.max(82.9, Math.min(87.4, issue.coordinates.lng));
    return [lat, lng];
  }

  const location = String(issue.location || "").toLowerCase();
  for (const [city, coords] of Object.entries(odishaAnchors)) {
    if (location.includes(city)) {
      const [latJ, lngJ] = hashToJitter(issue.id);
      return [coords[0] + latJ, coords[1] + lngJ];
    }
  }

  const [latJ, lngJ] = hashToJitter(issue.id);
  return [ODISHA_CENTER[0] + latJ, ODISHA_CENTER[1] + lngJ];
}

function elapsedTime(isoDate) {
  const created = new Date(isoDate).getTime();
  const now = Date.now();
  const diffHrs = Math.max(1, Math.floor((now - created) / (1000 * 60 * 60)));
  if (diffHrs < 24) return `${diffHrs}h open`;
  const days = Math.floor(diffHrs / 24);
  return `${days}d ${diffHrs % 24}h open`;
}

function makePictureIcon(priority, photo) {
  const style = priorityStyle[priority] || priorityStyle.medium;
  const safePhoto = photo || "/citi.png";
  return L.divIcon({
    className: "",
    html: `<div style="position:relative;width:34px;height:34px;border-radius:9999px;border:3px solid ${style.color};box-shadow:0 8px 18px rgba(0,0,0,0.35);overflow:hidden;background:#0b1220;">
            <img src="${safePhoto}" alt="issue" style="width:100%;height:100%;object-fit:cover;" />
           </div>
           <div style="position:absolute;left:50%;transform:translateX(-50%);top:31px;width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-top:10px solid ${style.color};"></div>`,
    iconSize: [34, 41],
    iconAnchor: [17, 41],
    popupAnchor: [0, -36],
  });
}

export default function AdminIssuesMapPanel({ issues, fullViewPath = "/admin/grievances" }) {
  const [isClient, setIsClient] = useState(false);
  const [mapView, setMapView] = useState("street");
  useEffect(() => { setIsClient(true); }, []);

  const tileConfig = mapView === "satellite"
    ? {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "&copy; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
      }
    : mapView === "terrain"
      ? {
          url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          attribution: "&copy; OpenStreetMap contributors, SRTM | Map style: OpenTopoMap",
        }
      : {
          url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
        };

  const mapIssues = useMemo(() => (issues || []).map((issue) => ({
    ...issue,
    point: resolveCoordinates(issue),
    age: elapsedTime(issue.created_at),
    photo: issue.images?.[0] || "/citi.png",
  })), [issues]);

  return (
    <section className="bg-card/40 backdrop-blur-2xl border border-border/40 rounded-[3rem] p-7 mb-8 shadow-2xl overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em]">
            <Target className="h-3.5 w-3.5" /> Intelligence Perimeter Active
          </div>
          <h3 className="text-3xl font-black tracking-tighter text-foreground italic">Grievance Map</h3>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center rounded-2xl border border-border/60 bg-card p-1.5">
            <button
              type="button"
              onClick={() => setMapView("street")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                mapView === "street" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Street
            </button>
            <button
              type="button"
              onClick={() => setMapView("terrain")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                mapView === "terrain" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Terrain
            </button>
            <button
              type="button"
              onClick={() => setMapView("satellite")}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-colors ${
                mapView === "satellite" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Satellite
            </button>
            <Link
              to={fullViewPath}
              className="px-3 py-1.5 rounded-xl text-[11px] font-semibold text-muted-foreground hover:bg-muted transition-colors"
            >
              Full View
            </Link>
          </div>
          <div className="hidden md:flex flex-col items-end mr-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase">System Status</p>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Nominal
            </p>
          </div>
          <Badge variant="outline" className="bg-muted px-4 py-1.5 rounded-2xl border-border/60 font-bold">
            {mapIssues.length} Live Nodes
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-8">
        {/* Map Container */}
        <div className="rounded-[2.5rem] overflow-hidden border border-border/40 bg-card shadow-2xl relative group">
          {!isClient ? (
            <div className="h-[520px] w-full flex items-center justify-center text-muted-foreground animate-pulse font-mono tracking-widest uppercase text-xs">
              Calibrating Sensors...
            </div>
          ) : (
            <MapContainer 
              center={ODISHA_CENTER} 
              zoom={7.2} 
              className="h-[520px] w-full z-0" 
              maxBounds={odishaBounds} 
              maxBoundsViscosity={1.0} 
              maxZoom={19}
            >
              <TileLayer
                attribution={tileConfig.attribution}
                url={tileConfig.url}
              />
              {mapView === "satellite" && (
                <TileLayer
                  attribution="&copy; Esri"
                  url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                />
              )}
              
              {/* RADIAL INTELLIGENCE AREA */}
              <Circle
                center={ODISHA_CENTER}
                radius={RADIAL_METERS}
                pathOptions={{ 
                  color: "#3b82f6", 
                  weight: 1, 
                  fillColor: "#3b82f6", 
                  fillOpacity: 0.04,
                  dashArray: '12, 12'
                }}
              />
              
              {/* INNER SCANNING CIRCLE */}
              <Circle
                center={ODISHA_CENTER}
                radius={RADIAL_METERS / 2}
                pathOptions={{ 
                  color: "#3b82f6", 
                  weight: 0.5, 
                  fillColor: "transparent",
                  fillOpacity: 0,
                  dashArray: '5, 15'
                }}
              />

              {mapIssues.map((issue) => (
                <Marker key={issue.id} position={issue.point} icon={makePictureIcon(issue.priority, issue.photo)}>
                  <Popup className="intelligence-popup">
                    <Link to={`${fullViewPath}?id=${issue.id}`} className="block w-[240px] bg-card p-0 rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
                      <img src={issue.photo} className="w-full h-32 object-cover" alt="Issue" />
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">#{issue.ticket_id}</span>
                        </div>
                        <h4 className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{issue.title}</h4>
                      </div>
                    </Link>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Map Overlay Grid Effect */}
          <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent shadow-[inset_0_0_80px_rgba(15,23,42,0.14)] z-[400]" />
          
          <div className="absolute bottom-6 left-6 z-[1000] pointer-events-none">
             <div className="bg-card/90 backdrop-blur-xl p-4 rounded-3xl border border-border/70 shadow-2xl flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Center Point</span>
                  <span className="text-[11px] font-mono text-foreground">20.29°N 85.82°E</span>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Radius</span>
                  <span className="text-[11px] font-mono text-foreground">320 KM</span>
                </div>
             </div>
          </div>
        </div>

        {/* Sidebar: Priority Feed */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-2 mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <h4 className="text-sm font-black uppercase tracking-widest">Hotspots</h4>
            </div>
            <Activity className="h-4 w-4 text-primary animate-pulse" />
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[440px]">
            {mapIssues
              .sort((a, b) => (priorityStyle[b.priority]?.rank || 0) - (priorityStyle[a.priority]?.rank || 0))
              .slice(0, 5)
              .map((issue) => (
                <Link key={issue.id} to={`${fullViewPath}?id=${issue.id}`} className="block group p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all duration-500 cursor-pointer hover:bg-white/[0.06]">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] font-mono text-muted-foreground tracking-tighter">ID_{issue.ticket_id}</span>
                    <Badge variant="outline" className={`text-[8px] h-4 uppercase font-black ${priorityStyle[issue.priority]?.bg}`} style={{ color: priorityStyle[issue.priority]?.color, borderColor: priorityStyle[issue.priority]?.color + '33' }}>
                      {issue.priority}
                    </Badge>
                  </div>
                  <p className="text-xs font-bold leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">{issue.title}</p>
                  <div className="flex items-center gap-4 mt-4 opacity-50 text-[10px]">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {issue.location}</span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
}