import { apiRequest } from "@/lib/api/client";
import { normalizeGrievanceDetail } from "@/lib/api/adapters";

export async function trackPublicGrievance(ticketId) {
  try {
    const response = await apiRequest(`/public/grievances/track/${encodeURIComponent(ticketId)}`);
    return normalizeGrievanceDetail(response.data || {});
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}
