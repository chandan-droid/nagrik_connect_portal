import { apiRequest } from "@/lib/api/client";
import { normalizeGrievance, normalizeGrievanceDetail } from "@/lib/api/adapters";

export const grievanceDepartmentMapping = [
  { id: 1, key: "water", name: "Water Supply Department", description: "Handles water supply, leakage, and pipeline issues" },
  { id: 2, key: "electricity", name: "Electricity Department", description: "Handles power supply and electrical infrastructure" },
  { id: 3, key: "roads", name: "Public Works Department", description: "Handles roads, bridges, and infrastructure" },
  { id: 4, key: "sanitation", name: "Sanitation Department", description: "Handles waste management and cleanliness" },
  { id: 5, key: "healthcare", name: "Health Department", description: "Handles public health services and hospitals" },
  { id: 6, key: "transport", name: "Transport Department", description: "Handles traffic, signals, and transport services" },
  { id: 7, key: "other", name: "Municipal Corporation", description: "Handles civic administration and urban services" },
  { id: 8, key: "public_safety", name: "Public Safety Department", description: "Handles police, safety, emergency services" },
  { id: 9, key: "education", name: "Education Department", description: "Handles schools, colleges, and education services" },
];

export const categoryToId = {
  water: 1,
  electricity: 2,
  roads: 3,
  transport: 6,
  sanitation: 4,
  public_safety: 8,
  "public-safety": 8,
  education: 9,
  healthcare: 5,
  health: 5,
  municipal: 7,
  other: 7,
};

export function resolveDepartmentIdForCategory(category) {
  const normalized = String(category || "other")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");
  return categoryToId[normalized] || categoryToId.other;
}

export function resolveCategoryDepartment(category) {
  const normalized = String(category || "other")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const departmentId = resolveDepartmentIdForCategory(normalized);
  const department = grievanceDepartmentMapping.find((item) => item.id === departmentId);

  return {
    category: department?.key || "other",
    departmentId,
    departmentName: department?.name || "Municipal Corporation",
  };
}

export async function submitCitizenGrievance(payload) {
  const response = await apiRequest("/citizen/grievances", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeGrievance(response.data || {});
}

export async function submitCitizenGrievanceWithAttachments(payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  if (payload.category) formData.append("category", payload.category);
  formData.append("departmentId", String(payload.departmentId));
  if (payload.departmentName) formData.append("departmentName", payload.departmentName);
  formData.append("city", payload.city);
  formData.append("state", payload.state);
  formData.append("pincode", payload.pincode);

  if (payload.area) formData.append("area", payload.area);
  if (payload.latitude !== undefined && payload.latitude !== null) formData.append("latitude", String(payload.latitude));
  if (payload.longitude !== undefined && payload.longitude !== null) formData.append("longitude", String(payload.longitude));

  const attachments = Array.isArray(payload.attachments) ? payload.attachments : [];
  attachments.forEach((file) => formData.append("attachments", file));

  const response = await apiRequest("/citizen/grievances", {
    method: "POST",
    body: formData,
  });

  return normalizeGrievance(response.data || {});
}

export async function getCitizenGrievances() {
  const response = await apiRequest("/citizen/grievances");
  const list = Array.isArray(response.data) ? response.data : [];
  return list.map(normalizeGrievance);
}

export async function getCitizenGrievanceDetail(id) {
  const response = await apiRequest(`/citizen/grievances/${id}`);
  return normalizeGrievanceDetail(response.data || {});
}

export async function closeCitizenGrievance(id) {
  const response = await apiRequest(`/citizen/grievances/${id}/close`, { method: "POST" });
  return normalizeGrievance(response.data || {});
}

export async function reopenCitizenGrievance(id) {
  const response = await apiRequest(`/citizen/grievances/${id}/reopen`, { method: "POST" });
  return normalizeGrievance(response.data || {});
}
