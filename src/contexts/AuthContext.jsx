import { jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from "react";
import { loginUser, logoutUser, registerCitizen } from "@/lib/api/auth";
import { getSession } from "@/lib/api/session";
const AuthContext = createContext({
  user: null,
  session: null,
  profile: null,
  roles: [],
  loading: true,
  signIn: async () => ({ error: "Not initialized" }),
  signUp: async () => ({ error: "Not initialized" }),
  signOut: async () => {
  },
  hasRole: () => false
});
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const saved = getSession();
    if (saved) {
      setUser(saved.user);
      setProfile(saved.profile);
      setRoles(saved.roles || []);
      setSession({ userId: saved.user.id, token: saved.token });
    }
    setLoading(false);
  }, []);
  const signIn = async ({ email, password, role }) => {
    try {
      const result = await loginUser({ email, password });
      if (role && result.role !== role) {
        return { error: `This account belongs to ${result.role.toUpperCase()} role.` };
      }
      setUser(result.user);
      setProfile(result.profile);
      setRoles(result.roles);
      setSession({ userId: result.user.id, token: result.token });
      return { error: null, role: result.role };
    } catch (error) {
      return { error: error.message || "Unable to sign in" };
    }
  };
  const signUp = async ({ email, password, fullName, phone }) => {
    try {
      await registerCitizen({ email, password, fullName, phone });
      return { error: null };
    } catch (error) {
      return { error: error.message || "Unable to register" };
    }
  };
  const signOut = async () => {
    logoutUser();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
  };
  const hasRole = (role) => roles.includes(role);
  return /* @__PURE__ */ jsx(AuthContext.Provider, { value: { user, session, profile, roles, loading, signIn, signUp, signOut, hasRole }, children });
}
const useAuth = () => useContext(AuthContext);
export {
  AuthProvider,
  useAuth
};
