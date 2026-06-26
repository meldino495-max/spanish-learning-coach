import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { CustomBackgroundProvider } from './context/CustomBackgroundContext';
import { AudioDeviceProvider } from './context/AudioDeviceContext';
import { YoutubeSessionProvider } from './context/YoutubeSessionContext';
import { applyTheme, DEFAULT_THEME, THEMES, type ThemeId } from './themes/themes';
import './index.css';
import App from './App.tsx';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

applyTheme(
  (() => {
    try {
      const saved = localStorage.getItem('coach-theme-v1');
      if (saved && THEMES.some((t) => t.id === saved)) return saved as ThemeId;
    } catch {
      /* ignore */
    }
    return DEFAULT_THEME;
  })(),
);

function Root() {
  const app = (
    <ThemeProvider>
      <CustomBackgroundProvider>
        <AudioDeviceProvider>
          <YoutubeSessionProvider>
            <LanguageProvider>
              <GoogleAuthProvider>
                <App />
              </GoogleAuthProvider>
            </LanguageProvider>
          </YoutubeSessionProvider>
        </AudioDeviceProvider>
      </CustomBackgroundProvider>
    </ThemeProvider>
  );

  if (clientId) {
    return <GoogleOAuthProvider clientId={clientId}>{app}</GoogleOAuthProvider>;
  }

  return app;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
