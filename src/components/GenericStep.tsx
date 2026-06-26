import type { Step } from '../types';
import { extractYoutubeId, youtubeWatchUrl } from '../utils/youtube';
import { openExternalUrl } from '../utils/openExternal';
import { InAppYoutubeLoginButton } from './InAppYoutubeLoginButton';
import { useYoutubeSession } from '../context/YoutubeSessionContext';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

export function GenericStep({ step, done, onToggle }: Props) {
  const { isYoutubeLoggedIn } = useYoutubeSession();
  const ytId = step.url ? extractYoutubeId(step.url) : null;

  return (
    <div className="step-body">
      <p className="step-instructions">{step.instructions ?? ''}</p>
      {step.checklist && (
        <ul className="checklist">
          {step.checklist.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
      {step.url && (
        <div className="step-actions">
          {ytId && !isYoutubeLoggedIn && (
            <InAppYoutubeLoginButton label="软件内登录 YouTube" videoId={ytId} />
          )}
          {ytId && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => openExternalUrl(youtubeWatchUrl(ytId))}
            >
              外部浏览器打开 ↗
            </button>
          )}
          {!ytId && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => openExternalUrl(step.url!)}
            >
              {step.urlLabel ?? '打开链接'} ↗
            </button>
          )}
        </div>
      )}
      <div className="step-actions">
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '标记完成'}
        </button>
      </div>
    </div>
  );
}
