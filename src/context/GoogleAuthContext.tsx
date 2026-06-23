import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
}

interface GoogleAuthContextValue {
  user: GoogleUser | null;
  isLinked: boolean;
  clientIdConfigured: boolean;
  setUserFromCredential: (credential: string) => void;
  logout: () => void;
}

const STORAGE_KEY = 'es-coach-google-user-v1';

const GoogleAuthContext = createContext<GoogleAuthContextValue | null>(null);

function parseJwt(token: string): Record<string, string> {
  const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
  if (!base64) return {};
  return JSON.parse(atob(base64)) as Record<string, string>;
}

export function GoogleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<GoogleUser | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as GoogleUser) : null;
    } catch {
      return null;
    }
  });

  const clientIdConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const setUserFromCredential = useCallback((credential: string) => {
    const payload = parseJwt(credential);
    if (!payload.email) return;
    setUser({
      name: payload.name ?? payload.email,
      email: payload.email,
      picture: payload.picture ?? '',
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({
      user,
      isLinked: !!user,
      clientIdConfigured,
      setUserFromCredential,
      logout,
    }),
    [user, clientIdConfigured, setUserFromCredential, logout],
  );

  return <GoogleAuthContext.Provider value={value}>{children}</GoogleAuthContext.Provider>;
}

export function useGoogleAuth() {
  const ctx = useContext(GoogleAuthContext);
  if (!ctx) throw new Error('useGoogleAuth must be used within GoogleAuthProvider');
  return ctx;
}
