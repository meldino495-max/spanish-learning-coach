import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import './index.css';
import App from './App.tsx';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';

function Root() {
  const app = (
    <GoogleAuthProvider>
      <App />
    </GoogleAuthProvider>
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
