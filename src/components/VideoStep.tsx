import { useEffect, useRef, useState } from 'react';
import type { Step } from '../types';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import {
  youtubeEmbedUrl,
  youtubeLoginThenWatchUrl,
  youtubeThumbnailUrl,
  youtubeWatchUrl,
} from '../utils/youtube';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

export function VideoStep({ step, done, onToggle }: Props) {
  const id = step.youtubeId!;
  const { isLinked } = useGoogleAuth();
  const [embedFailed, setEmbedFailed] = useState(false);
  const [tryEmbed, setTryEmbed] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const failTimerRef = useRef<number | null>(null);

  useEffect(() => {
    setEmbedFailed(false);
    setTryEmbed(false);
  }, [id]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com' && event.origin !== 'https://www.youtube-nocookie.com') {
        return;
      }
      const data = event.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data) as { event?: string; info?: { playerState?: number } };
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
  }, []);

  const startEmbed = () => {
    setTryEmbed(true);
    setEmbedFailed(false);
    if (failTimerRef.current) window.clearTimeout(failTimerRef.current);
    failTimerRef.current = window.setTimeout(() => {
      setEmbedFailed(true);
    }, 8000);
  };

  useEffect(() => {
    return () => {
      if (failTimerRef.current) window.clearTimeout(failTimerRef.current);
    };
  }, []);

  const watchOnYoutube = () => {
    window.open(youtubeWatchUrl(id), '_blank', 'noopener,noreferrer');
  };

  const loginAndWatch = () => {
    window.open(youtubeLoginThenWatchUrl(id), '_blank', 'noopener,noreferrer');
  };

  const showEmbed = tryEmbed && !embedFailed;

  return (
    <div className="step-body">
      <p className="step-instructions">{step.instructions}</p>
      {step.youtubeTitle && <p className="step-meta">📺 {step.youtubeTitle}</p>}

      <div className="video-notice">
        {isLinked ? (
          <span className="notice-ok">✓ 已连接 Google 账号 — 建议在 YouTube 网站观看（更稳定、可同步历史）</span>
        ) : (
          <span className="notice-warn">
            许多课程视频禁止页内嵌入。请先登录 YouTube，再点击下方红色按钮观看。
          </span>
        )}
      </div>

      <div className="video-preview-card">
        <img className="video-thumb" src={youtubeThumbnailUrl(id)} alt={step.youtubeTitle ?? 'YouTube 视频'} />
        <div className="video-preview-overlay">
          <button type="button" className="btn btn-youtube btn-lg" onClick={watchOnYoutube}>
            ▶ 在 YouTube 观看
          </button>
          {!isLinked && (
            <button type="button" className="btn btn-google btn-lg" onClick={loginAndWatch}>
              登录 YouTube 并观看
            </button>
          )}
        </div>
      </div>

      {showEmbed ? (
        <div className="video-wrap">
          <iframe
            ref={iframeRef}
            src={youtubeEmbedUrl(id)}
            title={step.youtubeTitle ?? step.title ?? 'YouTube'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => {
              if (failTimerRef.current) window.clearTimeout(failTimerRef.current);
            }}
          />
        </div>
      ) : embedFailed && tryEmbed ? (
        <div className="video-fallback">
          <p>页内播放失败（上传者可能禁止嵌入）。请改用上方按钮在 YouTube 观看。</p>
        </div>
      ) : null}

      <div className="step-actions">
        {!tryEmbed && (
          <button type="button" className="btn btn-secondary" onClick={startEmbed}>
            尝试页内播放
          </button>
        )}
        <button type="button" className="btn btn-youtube" onClick={watchOnYoutube}>
          在 YouTube 打开 ↗
        </button>
        {!isLinked && (
          <button type="button" className="btn btn-google" onClick={loginAndWatch}>
            登录后观看 ↗
          </button>
        )}
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '标记完成'}
        </button>
      </div>
    </div>
  );
}
