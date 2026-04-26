import { apiRequest } from "@/lib/api/client";
import { normalizeAuthPayload } from "@/lib/api/adapters";
import { clearSession, saveSession } from "@/lib/api/session";

export async function registerCitizen(payload) {
  const response = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return normalizeAuthPayload(response.data || {});
}

export async function loginUser(payload) {
  const response = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const normalized = normalizeAuthPayload(response.data || {});
  saveSession(normalized);
  return normalized;
}

export function logoutUser() {
  clearSession();
}
