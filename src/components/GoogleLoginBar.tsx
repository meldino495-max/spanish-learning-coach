import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useGoogleAuth } from '../context/GoogleAuthContext';

export function GoogleLoginBar() {
  const { user, isLinked, clientIdConfigured, setUserFromCredential, logout } = useGoogleAuth();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleLogout = () => {
    if (clientId) {
      try {
        googleLogout();
      } catch {
        /* ignore */
      }
    }
    logout();
  };

  if (isLinked && user) {
    return (
      <div className="google-auth linked">
        {user.picture ? (
          <img className="google-avatar" src={user.picture} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="google-avatar-fallback">G</span>
        )}
        <div className="google-user-meta">
          <span className="google-user-name">{user.name}</span>
          <span className="google-user-status">已连接 Google / YouTube</span>
        </div>
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
          退出
        </button>
      </div>
    );
  }

  if (!clientIdConfigured || !clientId) {
    return (
      <div className="google-auth setup">
        <a
          className="btn btn-youtube btn-sm"
          href="https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https://www.youtube.com/&hl=zh-CN"
          target="_blank"
          rel="noreferrer"
        >
          登录 YouTube ↗
        </a>
        <span className="google-hint" title="在浏览器登录后，点视频页的「在 YouTube 观看」即可">
          浏览器登录
        </span>
      </div>
    );
  }

  return (
    <div className="google-auth">
      <GoogleLogin
        onSuccess={(res) => {
          if (res.credential) setUserFromCredential(res.credential);
        }}
        onError={() => {
          /* user cancelled */
        }}
        text="signin_with"
        shape="pill"
        size="medium"
        theme="filled_black"
      />
    </div>
  );
}
