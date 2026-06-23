export function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`;
}

export function youtubeThumbnailUrl(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** 经 Google 登录后跳转到 YouTube 视频（沿用浏览器 YouTube 会话） */
export function youtubeLoginThenWatchUrl(id: string) {
  const watch = encodeURIComponent(youtubeWatchUrl(id));
  return `https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=${watch}&hl=zh-CN`;
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
