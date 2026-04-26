import { apiRequest } from "@/lib/api/client";
import { normalizeGrievance, normalizeGrievanceDetail } from "@/lib/api/adapters";

export async function getAssignedOfficerGrievances() {
  const response = await apiRequest("/officer/grievances");
  const list = Array.isArray(response.data) ? response.data : [];
  return list.map(normalizeGrievance);
}

export async function getOfficerGrievanceDetail(id) {
  const response = await apiRequest(`/officer/grievances/${id}`);
  return normalizeGrievanceDetail(response.data || {});
}

export async function startOfficerGrievance(id) {
  const response = await apiRequest(`/officer/grievances/${id}/start`, { method: "POST" });
  return normalizeGrievance(response.data || {});
}

export async function resolveOfficerGrievance(id, file, message) {
  const formData = new FormData();
  formData.append("file", file);
  if (message) formData.append("message", message);

  const response = await apiRequest(`/officer/grievances/${id}/resolve`, {
    method: "POST",
    body: formData,
  });

  return normalizeGrievance(response.data || {});
}

export async function rejectOfficerGrievance(id, message) {
  const formData = new FormData();
  formData.append("message", message);

  const response = await apiRequest(`/officer/grievances/${id}/reject`, {
    method: "POST",
    body: formData,
  });

  return normalizeGrievance(response.data || {});
}
