import type { Step, StepType } from '../types';
import { VideoStep } from './VideoStep';
import { SpeakStep } from './SpeakStep';
import { DictationStep } from './DictationStep';
import { QuizStep } from './QuizStep';
import { GenericStep } from './GenericStep';

const TYPE_LABELS: Record<StepType, string> = {
  video: '📺 观看视频',
  speak: '🎤 口语练习',
  dictation: '✍️ 听写',
  quiz: '📝 测验',
  read: '📖 阅读',
  practice: '💪 动手练习',
  reflect: '🪞 复盘反思',
  link: '🔗 外部资源',
};

const SESSION_LABELS = {
  micro: '碎片 · 约 5 分钟',
  deep: '深度 · 系统练习',
  review: '复习',
};

interface Props {
  step: Step;
  index: number;
  done: boolean;
  onToggle: () => void;
}

export function StepCard({ step, index, done, onToggle }: Props) {
  const renderBody = () => {
    switch (step.type) {
      case 'video':
        return <VideoStep step={step} done={done} onToggle={onToggle} />;
      case 'speak':
        return <SpeakStep step={step} done={done} onToggle={onToggle} />;
      case 'dictation':
        return <DictationStep step={step} done={done} onToggle={onToggle} />;
      case 'quiz':
        return <QuizStep step={step} done={done} onToggle={onToggle} />;
      default:
        return <GenericStep step={step} done={done} onToggle={onToggle} />;
    }
  };

  return (
    <article className={`step-card ${done ? 'step-done' : ''}`} id={step.id}>
      <header className="step-header">
        <span className="step-num">{index + 1}</span>
        <div className="step-titles">
          <span className="step-type">{TYPE_LABELS[step.type]}</span>
          <h3>{step.title ?? step.quizQuestion ?? TYPE_LABELS[step.type]}</h3>
          <div className="step-tags">
            <span className={`tag tag-${step.session}`}>{SESSION_LABELS[step.session]}</span>
            {step.durationMin && <span className="tag">⏱ {step.durationMin} 分钟</span>}
          </div>
        </div>
      </header>
      {renderBody()}
    </article>
  );
}
