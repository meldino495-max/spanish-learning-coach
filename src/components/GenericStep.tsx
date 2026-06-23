import type { Step } from '../types';
import { extractYoutubeId, youtubeLoginThenWatchUrl, youtubeWatchUrl } from '../utils/youtube';
import { useGoogleAuth } from '../context/GoogleAuthContext';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

export function GenericStep({ step, done, onToggle }: Props) {
  const { isLinked } = useGoogleAuth();
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
          <a className="btn btn-primary" href={step.url} target="_blank" rel="noreferrer">
            {step.urlLabel ?? '打开链接'} ↗
          </a>
          {ytId && (
            <>
              <a className="btn btn-youtube" href={youtubeWatchUrl(ytId)} target="_blank" rel="noreferrer">
                在 YouTube 观看 ↗
              </a>
              {!isLinked && (
                <a className="btn btn-google" href={youtubeLoginThenWatchUrl(ytId)} target="_blank" rel="noreferrer">
                  登录 YouTube 并观看 ↗
                </a>
              )}
            </>
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
