const SESSION_KEY = "ccp_api_session";

export function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Clear legacy shared session storage to avoid cross-tab auto-login.
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getAuthToken() {
  return getSession()?.token || null;
}

export function getSessionRole() {
  return getSession()?.role || null;
}
