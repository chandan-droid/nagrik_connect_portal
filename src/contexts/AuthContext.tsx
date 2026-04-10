import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  clearLocalSession,
  getLocalSession,
  signInLocal,
  signUpLocal,
  type AppRole,
  type LocalProfile,
  type LocalUser,
} from '@/lib/local-auth';

type Session = { userId: string } | null;

interface AuthContextType {
  user: LocalUser | null;
  session: Session | null;
  profile: LocalProfile | null;
  roles: AppRole[];
  loading: boolean;
  signIn: (params: { email: string; password: string; role?: AppRole }) => Promise<{ error: string | null }>;
  signUp: (params: { email: string; password: string; fullName: string; phone?: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  roles: [],
  loading: true,
  signIn: async () => ({ error: 'Not initialized' }),
  signUp: async () => ({ error: 'Not initialized' }),
  signOut: async () => {},
  hasRole: () => false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<LocalProfile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const local = getLocalSession();
    if (local) {
      setUser(local.user);
      setProfile(local.profile);
      setRoles(local.roles);
      setSession({ userId: local.user.id });
    }
    setLoading(false);
  }, []);

  const signIn: AuthContextType['signIn'] = async ({ email, password, role }) => {
    const result = signInLocal({ email, password, role });
    if (!result.ok) return { error: result.error };

    setUser(result.user);
    setProfile(result.profile);
    setRoles(result.roles);
    setSession({ userId: result.user.id });
    return { error: null };
  };

  const signUp: AuthContextType['signUp'] = async ({ email, password, fullName, phone }) => {
    const result = signUpLocal({ email, password, fullName, phone });
    if (!result.ok) return { error: result.error };
    return { error: null };
  };

  const signOut = async () => {
    clearLocalSession();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };

  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, loading, signIn, signUp, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
