export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

/** YouTube 嵌入需要 origin + Referer，否则报 Error 153 */
export function youtubeEmbedUrl(id: string, pageOrigin?: string) {
  const origin = pageOrigin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    fs: '1',
    playsinline: '1',
  });
  if (origin) params.set('origin', origin);
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export function youtubeThumbnailUrl(_id: string) {
  return '';
}

/** 经 Google 登录后跳转到 YouTube 视频（沿用浏览器 YouTube 会话） */
export function youtubeLoginThenWatchUrl(id: string) {
  const watch = encodeURIComponent(youtubeWatchUrl(id));
  return `https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=${watch}&hl=en`;
}

/** 仅登录 YouTube（跳转到 YouTube 首页） */
export function youtubeLoginUrl() {
  const home = encodeURIComponent('https://www.youtube.com/');
  return `https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=${home}&hl=en`;
}

export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
    return u.searchParams.get('v');
  } catch {
    return null;
  }
}
