import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { applyTheme, DEFAULT_THEME, THEMES, type ThemeId } from '../themes/themes';

const STORAGE_KEY = 'coach-theme-v1';

interface ThemeContextValue {
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  themes: typeof THEMES;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function loadTheme(): ThemeId {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && THEMES.some((t) => t.id === raw)) return raw as ThemeId;
  } catch {
    /* ignore */
  }
  return DEFAULT_THEME;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeId, setThemeIdState] = useState<ThemeId>(loadTheme);

  useEffect(() => {
    applyTheme(themeId);
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      /* ignore */
    }
  }, [themeId]);

  const value = useMemo(
    () => ({
      themeId,
      setThemeId: setThemeIdState,
      themes: THEMES,
    }),
    [themeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
