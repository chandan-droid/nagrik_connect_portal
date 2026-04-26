const rolePermissions = {
  citizen: ["dashboard.view", "grievance.create", "grievance.view.own", "citizen.help.view"],
  officer: ["dashboard.view", "grievance.view.all", "officer.queue.view", "officer.updates.manage", "grievance.update.status", "grievance.update.timeline"],
  admin: ["dashboard.view", "grievance.view.all", "grievance.assign", "analytics.view", "operations.view", "users.manage.roles"]
};
const roleFeatureLabels = {
  citizen: [
    "Create and track personal grievances",
    "View your grievance timeline and status updates",
    "Access citizen-only dashboard and submission flow",
    "Use help desk guidance and support actions"
  ],
  officer: [
    "View assigned grievances and active queue",
    "Update grievance status with action notes",
    "Manage department response workflow",
    "Coordinate operational updates and escalation workflow"
  ],
  admin: [
    "View all grievances across departments",
    "Assign grievances to officers",
    "Monitor analytics and operational KPIs",
    "Manage user roles and access policy",
    "Review operations board and cross-team bottlenecks"
  ]
};
function hasPermission(roles, permission) {
  return roles.some((role) => rolePermissions[role].includes(permission));
}
function getDefaultRouteForRoles(roles) {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("officer")) return "/officer";
  if (roles.includes("citizen")) return "/citizen";
  return "/auth";
}
export {
  getDefaultRouteForRoles,
  hasPermission,
  roleFeatureLabels,
  rolePermissions
};
