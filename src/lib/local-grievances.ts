import { mockGrievances, type GrievanceCategory, type GrievancePriority } from '@/lib/mock-data';

export type LocalGrievanceStatus = 'submitted' | 'under_review' | 'in_progress' | 'resolved' | 'closed';

export interface LocalGrievance {
  id: string;
  ticket_id: string;
  title: string;
  description: string;
  category: GrievanceCategory | 'public_safety';
  status: LocalGrievanceStatus;
  priority: GrievancePriority;
  location: string | null;
  coordinates?: [number, number] | null;
  images?: string[];
  citizen_id: string;
  assigned_officer_id: string | null;
  department: string | null;
  satisfaction: number | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface LocalTimelineEvent {
  id: string;
  grievance_id: string;
  status: LocalGrievanceStatus;
  message: string;
  created_by: string;
  created_at: string;
}

const GRIEVANCES_KEY = 'ccp_local_grievances_v1';
const TIMELINE_KEY = 'ccp_local_timeline_v1';

function toDbStatus(status: string): LocalGrievanceStatus {
  if (status === 'under-review') return 'under_review';
  if (status === 'in-progress') return 'in_progress';
  return status as LocalGrievanceStatus;
}

function toDbCategory(category: GrievanceCategory): GrievanceCategory | 'public_safety' {
  if (category === 'public-safety') return 'public_safety';
  return category;
}

function seededGrievances(): LocalGrievance[] {
  return mockGrievances.map((g) => ({
    id: g.id,
    ticket_id: g.ticketId,
    title: g.title,
    description: g.description,
    category: toDbCategory(g.category),
    status: toDbStatus(g.status),
    priority: g.priority,
    location: g.location,
    citizen_id: 'u-citizen-1',
    assigned_officer_id: g.assignedOfficer ? 'u-officer-1' : null,
    department: g.department || null,
    satisfaction: g.satisfaction ?? null,
    images: [],
    coordinates: null,
    is_anonymous: false,
    created_at: g.createdAt,
    updated_at: g.updatedAt,
  }));
}

function seededTimeline(grievances: LocalGrievance[]): LocalTimelineEvent[] {
  return grievances.flatMap((g) => {
    const source = mockGrievances.find((m) => m.id === g.id);
    if (!source) return [];

    return source.timeline.map((t) => ({
      id: `${g.id}-${t.id}`,
      grievance_id: g.id,
      status: toDbStatus(t.status),
      message: t.message,
      created_by: 'system',
      created_at: t.timestamp,
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

function readJson<T>(key: string, fallback: T): T {
  ensureSeeded();
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalGrievancesByCitizen(citizenId: string): LocalGrievance[] {
  const all = readJson<LocalGrievance[]>(GRIEVANCES_KEY, []);
  return all
    .filter((g) => g.citizen_id === citizenId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getAllLocalGrievances(): LocalGrievance[] {
  return readJson<LocalGrievance[]>(GRIEVANCES_KEY, []);
}

export function getLocalGrievanceById(id: string): LocalGrievance | null {
  const all = readJson<LocalGrievance[]>(GRIEVANCES_KEY, []);
  return all.find((g) => g.id === id) || null;
}

export function getLocalTimelineByGrievanceId(grievanceId: string): LocalTimelineEvent[] {
  const all = readJson<LocalTimelineEvent[]>(TIMELINE_KEY, []);
  return all
    .filter((t) => t.grievance_id === grievanceId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function addLocalGrievance(input: {
  title: string;
  description: string;
  category: GrievanceCategory | 'public_safety';
  location: string;
  coordinates?: [number, number];
  images?: string[];
  priority: GrievancePriority;
  citizenId: string;
  anonymous: boolean;
}) {
  const grievances = readJson<LocalGrievance[]>(GRIEVANCES_KEY, []);
  const timeline = readJson<LocalTimelineEvent[]>(TIMELINE_KEY, []);

  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  const nextNumber = grievances.length + 1;
  const grievanceId = `g-${Date.now()}`;
  const ticketId = `NGP-${year}-${String(nextNumber).padStart(4, '0')}`;

  const grievance: LocalGrievance = {
    id: grievanceId,
    ticket_id: ticketId,
    title: input.title,
    description: input.description,
    category: input.category,
    status: 'submitted',
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
    updated_at: now,
  };

  const timelineEvent: LocalTimelineEvent = {
    id: `t-${Date.now()}`,
    grievance_id: grievanceId,
    status: 'submitted',
    message: 'Grievance submitted by citizen',
    created_by: input.citizenId,
    created_at: now,
  };

  grievances.push(grievance);
  timeline.push(timelineEvent);

  writeJson(GRIEVANCES_KEY, grievances);
  writeJson(TIMELINE_KEY, timeline);

  return grievance;
}
