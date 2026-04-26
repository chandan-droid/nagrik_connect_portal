import { apiRequest, withQuery } from "@/lib/api/client";
import { normalizeGrievance } from "@/lib/api/adapters";

export async function createDepartment(payload) {
  const response = await apiRequest("/admin/departments", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function getDepartments() {
  const response = await apiRequest("/admin/departments");
  return Array.isArray(response.data) ? response.data : [];
}

export async function getDepartmentDetails(departmentId) {
  const response = await apiRequest(`/admin/departments/${departmentId}/details`);
  return response.data || null;
}

export async function createCategory(payload) {
  const response = await apiRequest("/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data;
}

export async function getCategories() {
  const response = await apiRequest("/admin/categories");
  return Array.isArray(response.data) ? response.data : [];
}

export async function getAllOfficers() {
  const response = await apiRequest("/admin/officers");
  return Array.isArray(response.data) ? response.data : [];
}

export async function createOfficer(payload) {
  const response = await apiRequest("/admin/officers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function getOfficerById(officerUserId) {
  const response = await apiRequest(`/admin/officers/${officerUserId}`);
  return response.data || null;
}

export async function updateOfficer(officerUserId, payload) {
  const response = await apiRequest(`/admin/officers/${officerUserId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return response.data || null;
}

export async function updateOfficerStatus(officerUserId, active) {
  const response = await apiRequest(`/admin/officers/${officerUserId}/status?active=${encodeURIComponent(String(active))}`, {
    method: "PATCH",
  });
  return response.data || null;
}

export async function getOfficersByDepartment(departmentId) {
  const response = await apiRequest(`/admin/officers/department/${departmentId}`);
  return Array.isArray(response.data) ? response.data : [];
}

export async function getGrievanceStatistics() {
  const response = await apiRequest("/admin/statistics/grievances");
  return response.data || null;
}

export async function getGrievanceStatisticsByDepartment(departmentId) {
  const response = await apiRequest(`/admin/statistics/grievances/department/${departmentId}`);
  return response.data || null;
}

export async function getAllAdminGrievances() {
  const response = await apiRequest("/admin/grievances");
  const list = Array.isArray(response.data) ? response.data : [];
  return list.map(normalizeGrievance);
}

export async function getAdminGrievanceDetail(grievanceId) {
  const grievances = await getAllAdminGrievances();
  return grievances.find((grievance) => grievance.id === String(grievanceId)) || null;
}

export async function assignOfficerToGrievance(grievanceId, officerId) {
  const path = withQuery(`/admin/grievances/${grievanceId}/assign`, { officerId });
  const response = await apiRequest(path, { method: "POST" });
  return normalizeGrievance(response.data || {});
}

export async function escalateGrievance(grievanceId) {
  const response = await apiRequest(`/admin/grievances/${grievanceId}/escalate`, {
    method: "POST",
  });
  return normalizeGrievance(response.data || {});
}

export async function getDashboardMonthlyTrends(months = 6) {
  const path = withQuery("/admin/dashboard/monthly-trends", { months });
  const response = await apiRequest(path);
  return response.data || { labels: [], submittedCounts: [], resolvedCounts: [] };
}

export async function getDashboardStatusDistribution() {
  const response = await apiRequest("/admin/dashboard/status-distribution");
  return Array.isArray(response.data) ? response.data : [];
}

export async function getDashboardDepartmentPerformance() {
  const response = await apiRequest("/admin/dashboard/department-performance");
  return Array.isArray(response.data) ? response.data : [];
}
