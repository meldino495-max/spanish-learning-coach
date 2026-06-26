import type { CoachTool, Step } from '../types';

const TOOL_META: Record<CoachTool, { icon: string; cta: string }> = {
  phrase: { icon: '💬', cta: '打开开口短句' },
  writing: { icon: '✍️', cta: '打开写作 & 归纳' },
  tutor: { icon: '🤖', cta: '打开 AI 陪练' },
  listening: { icon: '🎧', cta: '打开分级听力' },
  adaptive: { icon: '🎯', cta: '打开弱项特训' },
  shadow: { icon: '🗣️', cta: '打开影子跟读' },
};

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
  onOpenTool?: (tool: CoachTool) => void;
}

export function CoachStep({ step, done, onToggle, onOpenTool }: Props) {
  const tool = step.coachTool ?? 'phrase';
  const meta = TOOL_META[tool];

  return (
    <div className="step-body coach-step">
      {step.instructions && <p className="coach-step-intro">{step.instructions}</p>}

      {step.coachMethod && (
        <div className="coach-step-method">
          <span className="coach-step-method-tag">📚 为什么这样练</span>
          <p>{step.coachMethod}</p>
        </div>
      )}

      <div className="coach-step-actions">
        <button
          type="button"
          className="btn btn-primary coach-step-launch"
          onClick={() => onOpenTool?.(tool)}
        >
          {meta.icon} {step.coachCta ?? meta.cta}
        </button>
        <label className="coach-step-check">
          <input type="checkbox" checked={done} onChange={onToggle} />
          <span>完成本步</span>
        </label>
      </div>
    </div>
  );
}
