import { mockGrievances } from "@/lib/mock-data";
const GRIEVANCES_KEY = "ccp_local_grievances_v1";
const TIMELINE_KEY = "ccp_local_timeline_v1";
function toDbStatus(status) {
  if (status === "under-review") return "under_review";
  if (status === "in-progress") return "in_progress";
  return status;
}
function toDbCategory(category) {
  if (category === "public-safety") return "public_safety";
  return category;
}
function seededGrievances() {
  return mockGrievances.map((g) => ({
    id: g.id,
    ticket_id: g.ticketId,
    title: g.title,
    description: g.description,
    category: toDbCategory(g.category),
    status: toDbStatus(g.status),
    priority: g.priority,
    location: g.location,
    citizen_id: "u-citizen-1",
    assigned_officer_id: g.assignedOfficer ? "u-officer-1" : null,
    department: g.department || null,
    satisfaction: g.satisfaction ?? null,
    images: [],
    coordinates: null,
    is_anonymous: false,
    created_at: g.createdAt,
    updated_at: g.updatedAt
  }));
}
function seededTimeline(grievances) {
  return grievances.flatMap((g) => {
    const source = mockGrievances.find((m) => m.id === g.id);
    if (!source) return [];
    return source.timeline.map((t) => ({
      id: `${g.id}-${t.id}`,
      grievance_id: g.id,
      status: toDbStatus(t.status),
      message: t.message,
      created_by: "system",
      created_at: t.timestamp
    }));
  });
}
function ensureSeeded() {
  if (!localStorage.getItem(GRIEVANCES_KEY)) {
    const grievances = seededGrievances();
    localStorage.setItem(GRIEVANCES_KEY, JSON.stringify(grievances));
    localStorage.setItem(TIMELINE_KEY, JSON.stringify(seededTimeline(grievances)));
  }
}
function readJson(key, fallback) {
  ensureSeeded();
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getLocalGrievancesByCitizen(citizenId) {
  const all = readJson(GRIEVANCES_KEY, []);
  return all.filter((g) => g.citizen_id === citizenId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
function getAllLocalGrievances() {
  return readJson(GRIEVANCES_KEY, []);
}
function getLocalGrievanceById(id) {
  const all = readJson(GRIEVANCES_KEY, []);
  return all.find((g) => g.id === id) || null;
}
function getLocalTimelineByGrievanceId(grievanceId) {
  const all = readJson(TIMELINE_KEY, []);
  return all.filter((t) => t.grievance_id === grievanceId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}
function addLocalGrievance(input) {
  const grievances = readJson(GRIEVANCES_KEY, []);
  const timeline = readJson(TIMELINE_KEY, []);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const nextNumber = grievances.length + 1;
  const grievanceId = `g-${Date.now()}`;
  const ticketId = `NGP-${year}-${String(nextNumber).padStart(4, "0")}`;
  const grievance = {
    id: grievanceId,
    ticket_id: ticketId,
    title: input.title,
    description: input.description,
    category: input.category,
    status: "submitted",
    priority: input.priority,
    location: input.location || null,
    coordinates: input.coordinates || null,
    images: input.images || [],
    citizen_id: input.citizenId,
    assigned_officer_id: null,
    department: null,
    satisfaction: null,
    is_anonymous: input.anonymous,
    created_at: now,
    updated_at: now
  };
  const timelineEvent = {
    id: `t-${Date.now()}`,
    grievance_id: grievanceId,
    status: "submitted",
    message: "Grievance submitted by citizen",
    created_by: input.citizenId,
    created_at: now
  };
  grievances.push(grievance);
  timeline.push(timelineEvent);
  writeJson(GRIEVANCES_KEY, grievances);
  writeJson(TIMELINE_KEY, timeline);
  return grievance;
}
export {
  addLocalGrievance,
  getAllLocalGrievances,
  getLocalGrievanceById,
  getLocalGrievancesByCitizen,
  getLocalTimelineByGrievanceId
};
