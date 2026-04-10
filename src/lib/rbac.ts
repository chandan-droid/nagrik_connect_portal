import type { AppRole } from '@/lib/local-auth';

export type FeaturePermission =
  | 'dashboard.view'
  | 'grievance.create'
  | 'grievance.view.own'
  | 'grievance.view.all'
  | 'citizen.help.view'
  | 'officer.queue.view'
  | 'officer.updates.manage'
  | 'grievance.assign'
  | 'grievance.update.status'
  | 'grievance.update.timeline'
  | 'analytics.view'
  | 'operations.view'
  | 'users.manage.roles';

export const rolePermissions: Record<AppRole, FeaturePermission[]> = {
  citizen: ['dashboard.view', 'grievance.create', 'grievance.view.own', 'citizen.help.view'],
  officer: ['dashboard.view', 'grievance.view.all', 'officer.queue.view', 'officer.updates.manage', 'grievance.update.status', 'grievance.update.timeline'],
  admin: ['dashboard.view', 'grievance.view.all', 'grievance.assign', 'analytics.view', 'operations.view', 'users.manage.roles'],
};

export const roleFeatureLabels: Record<AppRole, string[]> = {
  citizen: [
    'Create and track personal grievances',
    'View your grievance timeline and status updates',
    'Access citizen-only dashboard and submission flow',
    'Use help desk guidance and support actions',
  ],
  officer: [
    'View assigned grievances and active queue',
    'Update grievance status with action notes',
    'Manage department response workflow',
    'Coordinate operational updates and escalation workflow',
  ],
  admin: [
    'View all grievances across departments',
    'Assign grievances to officers',
    'Monitor analytics and operational KPIs',
    'Manage user roles and access policy',
    'Review operations board and cross-team bottlenecks',
  ],
};

export function hasPermission(roles: AppRole[], permission: FeaturePermission): boolean {
  return roles.some((role) => rolePermissions[role].includes(permission));
}

export function getDefaultRouteForRoles(roles: AppRole[]): string {
  if (roles.includes('admin')) return '/admin';
  if (roles.includes('officer')) return '/officer';
  if (roles.includes('citizen')) return '/citizen';
  return '/auth';
}
