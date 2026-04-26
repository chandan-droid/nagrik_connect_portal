const ACCOUNTS_KEY = "ccp_local_accounts_v1";
const SESSION_KEY = "ccp_local_session_v1";
const seedAccounts = [
  {
    id: "u-citizen-1",
    email: "citizen@demo.com",
    password: "citizen123",
    profile: { full_name: "Rajesh Kumar", phone: "+91 9000000001", department: null },
    roles: ["citizen"]
  },
  {
    id: "u-admin-1",
    email: "admin@demo.com",
    password: "admin123",
    profile: { full_name: "System Admin", phone: "+91 9000000002", department: "Administration" },
    roles: ["admin"]
  },
  {
    id: "u-officer-1",
    email: "officer@demo.com",
    password: "officer123",
    profile: { full_name: "Amit Sharma", phone: "+91 9000000003", department: "Water Department" },
    roles: ["officer"]
  }
];

function mergeSeedAccounts(accounts) {
  const existing = Array.isArray(accounts) ? [...accounts] : [];
  for (const seed of seedAccounts) {
    const index = existing.findIndex((acc) => acc.email?.toLowerCase() === seed.email.toLowerCase());
    if (index === -1) {
      existing.push(seed);
      continue;
    }

    const roles = Array.isArray(existing[index].roles) ? existing[index].roles : [];
    for (const role of seed.roles) {
      if (!roles.includes(role)) roles.push(role);
    }
    existing[index].roles = roles;
  }
  return existing;
}

function readAccounts() {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seedAccounts));
    return seedAccounts;
  }
  try {
    const parsed = JSON.parse(raw);
    const merged = mergeSeedAccounts(parsed);
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seedAccounts));
    return seedAccounts;
  }
}
function writeAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}
function getLocalSession() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    const account = readAccounts().find((a) => a.id === session.userId);
    if (!account) return null;
    return {
      user: { id: account.id, email: account.email },
      profile: account.profile,
      roles: account.roles
    };
  } catch {
    return null;
  }
}
function clearLocalSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}
function signInLocal(params) {
  const email = params.email.trim().toLowerCase();
  const account = readAccounts().find((a) => a.email.toLowerCase() === email);
  if (!account || account.password !== params.password) {
    return { ok: false, error: "Invalid email or password." };
  }
  if (params.role && !account.roles.includes(params.role)) {
    return { ok: false, error: `This account does not have ${params.role} access.` };
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id }));
  localStorage.removeItem(SESSION_KEY);
  return {
    ok: true,
    user: { id: account.id, email: account.email },
    profile: account.profile,
    roles: account.roles
  };
}
function signUpLocal(params) {
  const email = params.email.trim().toLowerCase();
  const accounts = readAccounts();
  if (accounts.some((a) => a.email.toLowerCase() === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  const next = {
    id: `u-${Date.now()}`,
    email,
    password: params.password,
    profile: {
      full_name: params.fullName.trim(),
      phone: params.phone?.trim() || null,
      department: null
    },
    roles: ["citizen"]
  };
  accounts.push(next);
  writeAccounts(accounts);
  return { ok: true };
}
export {
  clearLocalSession,
  getLocalSession,
  signInLocal,
  signUpLocal
};
