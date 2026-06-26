import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import type { Step } from '../types';
import { useYoutubeSession } from '../context/YoutubeSessionContext';
import { youtubeEmbedUrl } from '../utils/youtube';
import { openExternalUrl } from '../utils/openExternal';
import { InAppYoutubeLoginButton } from './InAppYoutubeLoginButton';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

export function VideoStep({ step, done, onToggle }: Props) {
  const ytId = step.youtubeId!;
  const { isYoutubeLoggedIn, authJustReturned, clearAuthReturn } = useYoutubeSession();
  const [embedFailed, setEmbedFailed] = useState(false);
  const [tryEmbed, setTryEmbed] = useState(true);
  const [embedKey, setEmbedKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const failTimerRef = useRef<number | null>(null);

  const embedSrc = useMemo(() => youtubeEmbedUrl(ytId, window.location.origin), [ytId]);
  const title = step.youtubeTitle ?? step.title ?? '教学视频';

  useEffect(() => {
    setEmbedFailed(false);
    setTryEmbed(true);
    setEmbedKey((k) => k + 1);
  }, [ytId]);

  useEffect(() => {
    if (authJustReturned) {
      setEmbedFailed(false);
      setTryEmbed(true);
      setEmbedKey((k) => k + 1);
      clearAuthReturn();
    }
  }, [authJustReturned, clearAuthReturn]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com' && event.origin !== 'https://www.youtube-nocookie.com') {
        return;
      }
      const data = event.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data) as { event?: string };
          if (parsed.event === 'onError') setEmbedFailed(true);
        } catch {
          /* not json */
        }
      }
      if (typeof data === 'object' && data !== null && 'event' in data && data.event === 'onError') {
        setEmbedFailed(true);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [ytId]);

  useEffect(() => {
    if (!tryEmbed) return;
    if (failTimerRef.current) window.clearTimeout(failTimerRef.current);
    failTimerRef.current = window.setTimeout(() => {
      setEmbedFailed(true);
    }, 12000);
    return () => {
      if (failTimerRef.current) window.clearTimeout(failTimerRef.current);
    };
  }, [ytId, tryEmbed, embedKey]);

  const showEmbed = tryEmbed && !embedFailed;

  const openExternalWatch = (e: MouseEvent) => {
    e.preventDefault();
    openExternalUrl(`https://www.youtube.com/watch?v=${ytId}`);
  };

  return (
    <div className="step-body">
      <p className="step-instructions">{step.instructions}</p>

      {step.videoInstructor && (
        <p className="video-instructor-badge">🇨🇳 中文讲解 · {step.videoInstructor} · YouTube</p>
      )}
      {title && <p className="step-meta">📺 {title}</p>}

      {isYoutubeLoggedIn ? (
        <p className="notice-ok">✓ 已在软件内登录 YouTube — 页内播放器将使用你的账号</p>
      ) : (
        <p className="notice-warn">
          首次观看请先「软件内登录 YouTube」，登录后会自动回到本页，即可用账号在软件里看视频。
        </p>
      )}

      {showEmbed ? (
        <div className="video-wrap video-wrap-embed">
          <iframe
            key={embedKey}
            ref={iframeRef}
            src={embedSrc}
            title={title}
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => {
              if (failTimerRef.current) window.clearTimeout(failTimerRef.current);
            }}
          />
        </div>
      ) : (
        <div className="video-fallback">
          <p>页内播放不可用。请先软件内登录 YouTube，或点「重试页内播放」。</p>
          <div className="video-thumb-placeholder" aria-hidden="true">
            ▶
          </div>
        </div>
      )}

      <div className="step-actions">
        {!showEmbed && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEmbedFailed(false);
              setTryEmbed(true);
              setEmbedKey((k) => k + 1);
            }}
          >
            重试页内播放
          </button>
        )}
        {!isYoutubeLoggedIn && (
          <InAppYoutubeLoginButton label="软件内登录 YouTube" videoId={ytId} size="md" />
        )}
        {!isYoutubeLoggedIn && (
          <InAppYoutubeLoginButton
            className="btn btn-youtube"
            label="登录并观看本课"
            videoId={ytId}
            size="md"
          />
        )}
        <button type="button" className="btn btn-secondary btn-sm" onClick={openExternalWatch}>
          外部浏览器打开 ↗
        </button>
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '标记完成'}
        </button>
      </div>
    </div>
  );
}
