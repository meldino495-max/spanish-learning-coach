import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { useYoutubeSession } from '../context/YoutubeSessionContext';
import { InAppYoutubeLoginButton } from './InAppYoutubeLoginButton';

export function GoogleLoginBar() {
  const { user, isLinked, clientIdConfigured, setUserFromCredential, logout } = useGoogleAuth();
  const { isYoutubeLoggedIn, logout: logoutYoutube } = useYoutubeSession();
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
          <span className="google-user-status">
            {isYoutubeLoggedIn ? 'Google + YouTube 已登录' : '已连接 Google'}
          </span>
        </div>
        {!isYoutubeLoggedIn && <InAppYoutubeLoginButton label="登录 YouTube" />}
        {isYoutubeLoggedIn && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={logoutYoutube}>
            退出 YouTube
          </button>
        )}
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleLogout}>
          退出 Google
        </button>
      </div>
    );
  }

  return (
    <div className="google-auth setup">
      <InAppYoutubeLoginButton className="btn btn-youtube btn-sm" label="软件内登录 YouTube" />
      {clientIdConfigured && clientId && (
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
      )}
    </div>
  );
}
