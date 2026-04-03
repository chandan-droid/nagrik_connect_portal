export type GrievanceStatus = 'submitted' | 'under-review' | 'in-progress' | 'resolved' | 'closed';
export type GrievanceCategory = 'water' | 'electricity' | 'roads' | 'sanitation' | 'public-safety' | 'education' | 'healthcare' | 'other';
export type UserRole = 'citizen' | 'admin' | 'officer';

export interface Grievance {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  category: GrievanceCategory;
  status: GrievanceStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  citizenName: string;
  citizenEmail: string;
  assignedOfficer?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
  satisfaction?: number;
}

export interface TimelineEvent {
  id: string;
  status: GrievanceStatus;
  message: string;
  timestamp: string;
  by: string;
}

export const categoryLabels: Record<GrievanceCategory, string> = {
  water: 'Water Supply',
  electricity: 'Electricity',
  roads: 'Roads & Transport',
  sanitation: 'Sanitation',
  'public-safety': 'Public Safety',
  education: 'Education',
  healthcare: 'Healthcare',
  other: 'Other',
};

export const statusLabels: Record<GrievanceStatus, string> = {
  submitted: 'Submitted',
  'under-review': 'Under Review',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const statusColors: Record<GrievanceStatus, string> = {
  submitted: 'status-submitted',
  'under-review': 'status-review',
  'in-progress': 'status-progress',
  resolved: 'status-resolved',
  closed: 'status-closed',
};

export const mockGrievances: Grievance[] = [
  {
    id: '1', ticketId: 'NGP-2026-0001', title: 'Broken water pipeline on MG Road',
    description: 'Major water pipeline leak causing flooding on MG Road near sector 12. Water has been wasting for 3 days.',
    category: 'water', status: 'in-progress', priority: 'high',
    location: 'MG Road, Sector 12, Delhi', citizenName: 'Rajesh Kumar', citizenEmail: 'rajesh@email.com',
    assignedOfficer: 'Amit Sharma', department: 'Water Department',
    createdAt: '2026-03-28T10:00:00Z', updatedAt: '2026-04-02T14:00:00Z',
    timeline: [
      { id: '1', status: 'submitted', message: 'Grievance submitted by citizen', timestamp: '2026-03-28T10:00:00Z', by: 'Rajesh Kumar' },
      { id: '2', status: 'under-review', message: 'Assigned to Water Department', timestamp: '2026-03-29T09:00:00Z', by: 'System' },
      { id: '3', status: 'in-progress', message: 'Repair team dispatched to location', timestamp: '2026-04-01T11:00:00Z', by: 'Amit Sharma' },
    ],
  },
  {
    id: '2', ticketId: 'NGP-2026-0002', title: 'Street lights not working in Colony B',
    description: 'All street lights in Colony B, Block 4 have been off for a week. Safety concern for residents.',
    category: 'electricity', status: 'under-review', priority: 'medium',
    location: 'Colony B, Block 4, Mumbai', citizenName: 'Priya Patel', citizenEmail: 'priya@email.com',
    assignedOfficer: 'Suresh Reddy', department: 'Electricity Board',
    createdAt: '2026-04-01T08:30:00Z', updatedAt: '2026-04-02T10:00:00Z',
    timeline: [
      { id: '1', status: 'submitted', message: 'Grievance submitted', timestamp: '2026-04-01T08:30:00Z', by: 'Priya Patel' },
      { id: '2', status: 'under-review', message: 'Under review by Electricity Board', timestamp: '2026-04-02T10:00:00Z', by: 'Suresh Reddy' },
    ],
  },
  {
    id: '3', ticketId: 'NGP-2026-0003', title: 'Pothole causing accidents on NH-48',
    description: 'Large pothole on NH-48 near toll plaza. Multiple accidents reported.',
    category: 'roads', status: 'submitted', priority: 'critical',
    location: 'NH-48, Near Toll Plaza, Gurgaon', citizenName: 'Mohammed Ali', citizenEmail: 'mali@email.com',
    createdAt: '2026-04-03T06:00:00Z', updatedAt: '2026-04-03T06:00:00Z',
    timeline: [
      { id: '1', status: 'submitted', message: 'Grievance submitted', timestamp: '2026-04-03T06:00:00Z', by: 'Mohammed Ali' },
    ],
  },
  {
    id: '4', ticketId: 'NGP-2026-0004', title: 'Garbage not collected for 5 days',
    description: 'Municipal garbage collection has stopped in our area for 5 days. Unhygienic conditions.',
    category: 'sanitation', status: 'resolved', priority: 'medium',
    location: 'Janakpuri, West Delhi', citizenName: 'Sunita Devi', citizenEmail: 'sunita@email.com',
    assignedOfficer: 'Vikram Singh', department: 'Sanitation Department',
    createdAt: '2026-03-25T12:00:00Z', updatedAt: '2026-04-01T16:00:00Z',
    timeline: [
      { id: '1', status: 'submitted', message: 'Grievance submitted', timestamp: '2026-03-25T12:00:00Z', by: 'Sunita Devi' },
      { id: '2', status: 'under-review', message: 'Reviewed by Sanitation Dept', timestamp: '2026-03-26T09:00:00Z', by: 'System' },
      { id: '3', status: 'in-progress', message: 'Cleanup crew assigned', timestamp: '2026-03-27T10:00:00Z', by: 'Vikram Singh' },
      { id: '4', status: 'resolved', message: 'Area cleaned and regular collection resumed', timestamp: '2026-04-01T16:00:00Z', by: 'Vikram Singh' },
    ],
    satisfaction: 4,
  },
  {
    id: '5', ticketId: 'NGP-2026-0005', title: 'School building roof leaking',
    description: 'Government primary school in sector 7 has severe roof leakage affecting classrooms.',
    category: 'education', status: 'in-progress', priority: 'high',
    location: 'Sector 7, Noida', citizenName: 'Anita Gupta', citizenEmail: 'anita@email.com',
    assignedOfficer: 'Rakesh Verma', department: 'Education Department',
    createdAt: '2026-03-20T14:00:00Z', updatedAt: '2026-04-02T09:00:00Z',
    timeline: [
      { id: '1', status: 'submitted', message: 'Grievance submitted', timestamp: '2026-03-20T14:00:00Z', by: 'Anita Gupta' },
      { id: '2', status: 'under-review', message: 'Inspection scheduled', timestamp: '2026-03-22T10:00:00Z', by: 'System' },
      { id: '3', status: 'in-progress', message: 'Repair work started', timestamp: '2026-03-30T08:00:00Z', by: 'Rakesh Verma' },
    ],
  },
  {
    id: '6', ticketId: 'NGP-2026-0006', title: 'Public hospital lacks medicines',
    description: 'District hospital pharmacy is out of basic medicines including antibiotics and painkillers.',
    category: 'healthcare', status: 'closed', priority: 'high',
    location: 'District Hospital, Lucknow', citizenName: 'Deepak Mishra', citizenEmail: 'deepak@email.com',
    assignedOfficer: 'Dr. Neha Kapoor', department: 'Health Department',
    createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-03-28T17:00:00Z',
    timeline: [
      { id: '1', status: 'submitted', message: 'Grievance submitted', timestamp: '2026-03-10T09:00:00Z', by: 'Deepak Mishra' },
      { id: '2', status: 'under-review', message: 'Verified by Health Dept', timestamp: '2026-03-12T10:00:00Z', by: 'System' },
      { id: '3', status: 'in-progress', message: 'Medicine procurement initiated', timestamp: '2026-03-15T11:00:00Z', by: 'Dr. Neha Kapoor' },
      { id: '4', status: 'resolved', message: 'Medicines restocked', timestamp: '2026-03-25T14:00:00Z', by: 'Dr. Neha Kapoor' },
      { id: '5', status: 'closed', message: 'Closed after citizen confirmation', timestamp: '2026-03-28T17:00:00Z', by: 'System' },
    ],
    satisfaction: 5,
  },
];

export const departmentStats = [
  { name: 'Water', total: 45, resolved: 32, pending: 13 },
  { name: 'Electricity', total: 38, resolved: 28, pending: 10 },
  { name: 'Roads', total: 52, resolved: 35, pending: 17 },
  { name: 'Sanitation', total: 41, resolved: 30, pending: 11 },
  { name: 'Education', total: 22, resolved: 15, pending: 7 },
  { name: 'Healthcare', total: 18, resolved: 12, pending: 6 },
  { name: 'Public Safety', total: 29, resolved: 20, pending: 9 },
];

export const monthlyTrends = [
  { month: 'Oct', submitted: 120, resolved: 95 },
  { month: 'Nov', submitted: 145, resolved: 110 },
  { month: 'Dec', submitted: 130, resolved: 120 },
  { month: 'Jan', submitted: 160, resolved: 135 },
  { month: 'Feb', submitted: 175, resolved: 150 },
  { month: 'Mar', submitted: 190, resolved: 165 },
];
