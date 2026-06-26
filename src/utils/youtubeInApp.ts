const RETURN_KEY = 'coach-yt-return';
const PENDING_VIDEO_KEY = 'coach-yt-pending-video';
const SESSION_KEY = 'coach-yt-session-v1';
const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

/** 登录完成后跳回软件首页，并带上 yt_auth 标记 */
export function youtubeInAppLoginUrl() {
  const appReturn = `${window.location.origin}${window.location.pathname}?yt_auth=1`;
  return `https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=${encodeURIComponent(appReturn)}&hl=en`;
}

/** 在当前软件窗口内登录 YouTube（登录后自动回到课程页） */
export function loginYoutubeInApp(videoId?: string) {
  sessionStorage.setItem(RETURN_KEY, window.location.href);
  if (videoId) sessionStorage.setItem(PENDING_VIDEO_KEY, videoId);
  else sessionStorage.removeItem(PENDING_VIDEO_KEY);
  window.location.assign(youtubeInAppLoginUrl());
}

export function markYoutubeSessionActive() {
  localStorage.setItem(SESSION_KEY, String(Date.now()));
}

export function clearYoutubeSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function isYoutubeSessionActive(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < SESSION_MAX_AGE_MS;
  } catch {
    return false;
  }
}

/** 从 Google 登录页返回后，恢复课程页并清理 URL 参数 */
export function handleYoutubeAuthReturn(): { restored: boolean; pendingVideoId: string | null } {
  const params = new URLSearchParams(window.location.search);
  if (params.get('yt_auth') !== '1') {
    return { restored: false, pendingVideoId: null };
  }

  markYoutubeSessionActive();

  const returnUrl = sessionStorage.getItem(RETURN_KEY);
  const pendingVideoId = sessionStorage.getItem(PENDING_VIDEO_KEY);
  sessionStorage.removeItem(RETURN_KEY);
  sessionStorage.removeItem(PENDING_VIDEO_KEY);

  if (returnUrl) {
    try {
      const u = new URL(returnUrl);
      window.history.replaceState({}, '', u.pathname + u.search + u.hash);
    } catch {
      params.delete('yt_auth');
      const qs = params.toString();
      window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
    }
  } else {
    params.delete('yt_auth');
    const qs = params.toString();
    window.history.replaceState({}, '', qs ? `?${qs}` : window.location.pathname);
  }

  return { restored: true, pendingVideoId };
}
