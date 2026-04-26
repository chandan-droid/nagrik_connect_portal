function toLowerRole(role) {
  if (!role) return "citizen";
  return String(role).toLowerCase();
}

function normalizeStatus(status) {
  return String(status || "submitted").toLowerCase().replace(/-/g, "_");
}

function normalizePriority(priority) {
  const next = String(priority || "medium").toLowerCase();
  if (["critical", "high", "medium", "low"].includes(next)) return next;
  return "medium";
}

function normalizeCategory(category) {
  if (!category) return "other";
  if (typeof category === "string") return category.toLowerCase().replace(/\s+/g, "_");
  if (typeof category === "object") {
    const name = category.name || category.title || "other";
    return String(name).toLowerCase().replace(/\s+/g, "_");
  }
  return "other";
}

function normalizeCoordinates(raw) {
  if (Array.isArray(raw) && raw.length >= 2) {
    const [lat, lng] = raw;
    const parsedLat = Number(lat);
    const parsedLng = Number(lng);
    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) return [parsedLat, parsedLng];
  }

  if (raw && typeof raw === "object") {
    const lat = Number(raw.lat);
    const lng = Number(raw.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return [lat, lng];
    const latitude = Number(raw.latitude);
    const longitude = Number(raw.longitude);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return [latitude, longitude];
    }
  }

  return null;
}

function toStringValue(value) {
  if (value === null || value === undefined) return null;
  const next = String(value).trim();
  return next || null;
}

function buildLocationDetails(raw) {
  if (raw.location && typeof raw.location === "object" && !Array.isArray(raw.location)) {
    const location = raw.location;
    const coordinates = normalizeCoordinates(location) || normalizeCoordinates(raw.coordinates);

    return {
      state: toStringValue(location.state || raw.state),
      city: toStringValue(location.city || raw.city),
      area: toStringValue(location.area || raw.area),
      pincode: toStringValue(location.pincode || raw.pincode),
      latitude: (coordinates?.[0] ?? Number(location.latitude ?? raw.latitude)) || null,
      longitude: (coordinates?.[1] ?? Number(location.longitude ?? raw.longitude)) || null,
    };
  }

  const coordinates = normalizeCoordinates(raw.coordinates);
  return {
    state: toStringValue(raw.state),
    city: toStringValue(raw.city),
    area: toStringValue(raw.area),
    pincode: toStringValue(raw.pincode),
    latitude: coordinates?.[0] ?? (Number(raw.latitude) || null),
    longitude: coordinates?.[1] ?? (Number(raw.longitude) || null),
  };
}

function buildLocationText(raw, locationDetails) {
  if (typeof raw.location === "string") return raw.location;
  const chunks = [locationDetails.area, locationDetails.city, locationDetails.state, locationDetails.pincode].filter(Boolean);
  return chunks.join(", ") || "Location not provided";
}

function buildDataUrl(fileData, fileType) {
  if (!fileData || typeof fileData !== "string") return null;
  if (fileData.startsWith("data:")) return fileData;
  const mimeType = fileType || "application/octet-stream";
  return `data:${mimeType};base64,${fileData}`;
}

function mapAttachments(raw) {
  const source = Array.isArray(raw.attachments) ? raw.attachments : Array.isArray(raw.proofs) ? raw.proofs : [];
  if (!Array.isArray(source)) return [];

  return source
    .map((item) => {
      if (typeof item === "string") {
        return {
          id: item,
          file_name: item.split("/").pop() || item,
          file_type: null,
          file_size: null,
          file_url: item,
          uploaded_by: null,
          created_at: null,
        };
      }

      const fileType = item?.fileType || item?.mimeType || null;
      const fileData = item?.fileData || item?.file_data || null;
      const fileUrl = item?.fileUrl || item?.url || item?.path || null;
      const resolvedUrl = fileUrl || buildDataUrl(fileData, fileType);
      if (!resolvedUrl) return null;

      return {
        id: String(item?.id ?? resolvedUrl),
        file_name: item?.fileName || item?.filename || (fileUrl ? fileUrl.split("/").pop() : null) || "Attachment",
        file_type: fileType,
        file_size: item?.fileSize ?? item?.size ?? null,
        file_url: resolvedUrl,
        file_data: fileData,
        uploaded_by: item?.uploadedBy || item?.uploaded_by || null,
        created_at: item?.createdAt || item?.created_at || null,
      };
    })
    .filter(Boolean);
}

function mapImages(raw) {
  const source = Array.isArray(raw.images) ? raw.images : Array.isArray(raw.attachments) ? raw.attachments : Array.isArray(raw.proofs) ? raw.proofs : [];
  if (!Array.isArray(source)) return [];

  return source
    .map((item) => {
      if (typeof item === "string") return item;
      const fileType = String(item?.fileType || item?.mimeType || "").toLowerCase();
      const fileData = item?.fileData || item?.file_data || null;
      const fileUrl = item?.fileUrl || item?.url || item?.path || null;
      const resolvedUrl = fileUrl || buildDataUrl(fileData, fileType || null);
      if (fileType.startsWith("image/") && resolvedUrl) return resolvedUrl;
      if (!fileType && resolvedUrl && /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/i.test(resolvedUrl)) return resolvedUrl;
      return null;
    })
    .filter(Boolean);
}

export function normalizeAuthPayload(data) {
  const role = toLowerRole(data.role);
  return {
    token: data.token,
    type: data.type || "Bearer",
    role,
    user: {
      id: String(data.id),
      email: data.email,
    },
    profile: {
      full_name: data.fullName || data.full_name || data.email,
      phone: data.phone || null,
    },
    roles: [role],
  };
}

export function normalizeGrievance(raw) {
  const locationDetails = buildLocationDetails(raw);
  const coordinates = normalizeCoordinates(raw.coordinates) || (
    Number.isFinite(Number(raw.latitude)) && Number.isFinite(Number(raw.longitude))
      ? [Number(raw.latitude), Number(raw.longitude)]
      : locationDetails.latitude !== null && locationDetails.longitude !== null
        ? [locationDetails.latitude, locationDetails.longitude]
        : null
  );
  const attachments = mapAttachments(raw);

  return {
    id: String(raw.id ?? raw.grievanceId ?? raw.grievance_id),
    ticket_id: raw.ticketId || raw.ticket_id || `NGP-${raw.id}`,
    title: raw.title || "Untitled grievance",
    description: raw.description || "",
    category: normalizeCategory(raw.category),
    status: normalizeStatus(raw.status),
    priority: normalizePriority(raw.priority),
    location: buildLocationText(raw, locationDetails),
    location_details: locationDetails,
    location_label: buildLocationText(raw, locationDetails),
    city: locationDetails.city,
    state: locationDetails.state,
    pincode: locationDetails.pincode,
    area: locationDetails.area,
    latitude: coordinates?.[0] ?? raw.latitude ?? null,
    longitude: coordinates?.[1] ?? raw.longitude ?? null,
    coordinates,
    images: mapImages(raw),
    attachments,
    attachment_count: attachments.length,
    citizen_id: raw.citizenId || raw.citizen_id || null,
    citizen_name: raw.citizenName || raw.citizen_name || raw.citizen?.fullName || raw.citizen?.name || null,
    assigned_officer_id: raw.assignedOfficerId || raw.assigned_officer_id || null,
    assigned_officer_name: raw.assignedOfficerName || raw.assigned_officer_name || null,
    department_id: raw.departmentId || raw.department_id || raw.department?.id || null,
    department: raw.departmentName || raw.department_name || raw.department?.name || raw.department || null,
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
    updated_at: raw.updatedAt || raw.updated_at || new Date().toISOString(),
    is_escalated: Boolean(raw.isEscalated || raw.is_escalated),
    updates: Array.isArray(raw.updates) ? raw.updates.map(normalizeGrievanceUpdate) : [],
  };
}

export function normalizeGrievanceUpdate(raw) {
  const attachments = mapAttachments(raw);
  const updateType = normalizeStatus(raw.updateType || raw.update_type || raw.status || "status_change");
  return {
    id: String(raw.id || `upd-${raw.createdAt || raw.created_at || Date.now()}`),
    update_type: updateType,
    status: updateType,
    message: raw.message || "",
    updated_by_id: raw.updatedById || raw.updated_by_id || null,
    updated_by_name: raw.updatedByName || raw.updated_by_name || "System",
    attachments,
    images: mapImages(raw),
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
  };
}

export function normalizeTimelineEntry(raw) {
  const statusToken = raw.status || raw.updateType || raw.update_type || "submitted";
  return {
    id: String(raw.id || `${statusToken}-${raw.createdAt || raw.created_at}`),
    grievance_id: String(raw.grievanceId || raw.grievance_id || ""),
    status: normalizeStatus(statusToken),
    message: raw.message || raw.note || "Status updated",
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
    created_by: raw.createdBy || raw.created_by || raw.updatedByName || raw.updated_by_name || "system",
  };
}

export function normalizeGrievanceDetail(raw) {
  const grievance = normalizeGrievance(raw);
  const historySource = raw.history || raw.timeline || raw.updates || [];

  return {
    grievance,
    timeline: Array.isArray(historySource) ? historySource.map(normalizeTimelineEntry) : [],
  };
}
