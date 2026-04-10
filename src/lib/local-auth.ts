export type AppRole = 'citizen' | 'admin' | 'officer';

export interface LocalUser {
  id: string;
  email: string;
}

export interface LocalProfile {
  full_name: string | null;
  phone: string | null;
  department: string | null;
}

interface LocalAccount {
  id: string;
  email: string;
  password: string;
  profile: LocalProfile;
  roles: AppRole[];
}

interface StoredSession {
  userId: string;
}

const ACCOUNTS_KEY = 'ccp_local_accounts_v1';
const SESSION_KEY = 'ccp_local_session_v1';

const seedAccounts: LocalAccount[] = [
  {
    id: 'u-citizen-1',
    email: 'citizen@demo.com',
    password: 'citizen123',
    profile: { full_name: 'Rajesh Kumar', phone: '+91 9000000001', department: null },
    roles: ['citizen'],
  },
  {
    id: 'u-admin-1',
    email: 'admin@demo.com',
    password: 'admin123',
    profile: { full_name: 'System Admin', phone: '+91 9000000002', department: 'Administration' },
    roles: ['admin'],
  },
  {
    id: 'u-officer-1',
    email: 'officer@demo.com',
    password: 'officer123',
    profile: { full_name: 'Amit Sharma', phone: '+91 9000000003', department: 'Water Department' },
    roles: ['officer'],
  },
];

function readAccounts(): LocalAccount[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seedAccounts));
    return seedAccounts;
  }

  try {
    const parsed = JSON.parse(raw) as LocalAccount[];
    return Array.isArray(parsed) ? parsed : seedAccounts;
  } catch {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seedAccounts));
    return seedAccounts;
  }
}

function writeAccounts(accounts: LocalAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function getLocalSession(): { user: LocalUser; profile: LocalProfile; roles: AppRole[] } | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as StoredSession;
    const account = readAccounts().find((a) => a.id === session.userId);
    if (!account) return null;

    return {
      user: { id: account.id, email: account.email },
      profile: account.profile,
      roles: account.roles,
    };
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function signInLocal(params: { email: string; password: string; role?: AppRole }) {
  const email = params.email.trim().toLowerCase();
  const account = readAccounts().find((a) => a.email.toLowerCase() === email);

  if (!account || account.password !== params.password) {
    return { ok: false as const, error: 'Invalid email or password.' };
  }

  if (params.role && !account.roles.includes(params.role)) {
    return { ok: false as const, error: `This account does not have ${params.role} access.` };
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: account.id } satisfies StoredSession));

  return {
    ok: true as const,
    user: { id: account.id, email: account.email } satisfies LocalUser,
    profile: account.profile,
    roles: account.roles,
  };
}

export function signUpLocal(params: { email: string; password: string; fullName: string; phone?: string }) {
  const email = params.email.trim().toLowerCase();
  const accounts = readAccounts();

  if (accounts.some((a) => a.email.toLowerCase() === email)) {
    return { ok: false as const, error: 'An account with this email already exists.' };
  }

  const next: LocalAccount = {
    id: `u-${Date.now()}`,
    email,
    password: params.password,
    profile: {
      full_name: params.fullName.trim(),
      phone: params.phone?.trim() || null,
      department: null,
    },
    roles: ['citizen'],
  };

  accounts.push(next);
  writeAccounts(accounts);

  return { ok: true as const };
}
