import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearYoutubeSession,
  handleYoutubeAuthReturn,
  isYoutubeSessionActive,
  loginYoutubeInApp,
} from '../utils/youtubeInApp';

interface YoutubeSessionContextValue {
  isYoutubeLoggedIn: boolean;
  loginInApp: (videoId?: string) => void;
  logout: () => void;
  authJustReturned: boolean;
  pendingVideoId: string | null;
  clearAuthReturn: () => void;
}

const YoutubeSessionContext = createContext<YoutubeSessionContextValue | null>(null);

export function YoutubeSessionProvider({ children }: { children: ReactNode }) {
  const [isYoutubeLoggedIn, setLoggedIn] = useState(isYoutubeSessionActive);
  const [authJustReturned, setAuthJustReturned] = useState(false);
  const [pendingVideoId, setPendingVideoId] = useState<string | null>(null);

  useEffect(() => {
    const result = handleYoutubeAuthReturn();
    if (result.restored) {
      setLoggedIn(true);
      setAuthJustReturned(true);
      setPendingVideoId(result.pendingVideoId);
    }
  }, []);

  const loginInApp = useCallback((videoId?: string) => {
    loginYoutubeInApp(videoId);
  }, []);

  const logout = useCallback(() => {
    clearYoutubeSession();
    setLoggedIn(false);
    setAuthJustReturned(false);
    setPendingVideoId(null);
  }, []);

  const clearAuthReturn = useCallback(() => {
    setAuthJustReturned(false);
    setPendingVideoId(null);
  }, []);

  const value = useMemo(
    () => ({
      isYoutubeLoggedIn,
      loginInApp,
      logout,
      authJustReturned,
      pendingVideoId,
      clearAuthReturn,
    }),
    [authJustReturned, clearAuthReturn, isYoutubeLoggedIn, loginInApp, logout, pendingVideoId],
  );

  return <YoutubeSessionContext.Provider value={value}>{children}</YoutubeSessionContext.Provider>;
}

export function useYoutubeSession() {
  const ctx = useContext(YoutubeSessionContext);
  if (!ctx) throw new Error('useYoutubeSession must be used within YoutubeSessionProvider');
  return ctx;
}
