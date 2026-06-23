import type { Step, StepType } from '../types';
import { VideoStep } from './VideoStep';
import { SpeakStep } from './SpeakStep';
import { DictationStep } from './DictationStep';
import { QuizStep } from './QuizStep';
import { GenericStep } from './GenericStep';
import { ChunkStep } from './ChunkStep';
import { FillBlankStep } from './FillBlankStep';
import { TranslateStep } from './TranslateStep';
import { FeynmanStep } from './FeynmanStep';
import { ShadowingStep } from './ShadowingStep';
import { ScenarioStep } from './ScenarioStep';
import { SRSStep } from './SRSStep';

const TYPE_LABELS: Record<StepType, string> = {
  video: '📺 听：视频',
  speak: '🎤 说：口语',
  dictation: '👂 听：听写',
  quiz: '📝 写：测验',
  read: '📖 读：语法',
  practice: '💪 写：练习',
  reflect: '🪞 复盘',
  link: '🔗 资源',
  vocab: '📚 词汇',
  fillblank: '✏️ 写：填空',
  translate: '🔄 写：翻译',
  chunk: '📦 说：语块',
  feynman: '🧠 说：费曼',
  shadowing: '👥 听+说：跟读',
  scenario: '🎬 说：场景',
  srs: '🔁 SRS 复习',
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
      case 'chunk':
      case 'vocab':
        return <ChunkStep step={step} done={done} onToggle={onToggle} />;
      case 'fillblank':
        return <FillBlankStep step={step} done={done} onToggle={onToggle} />;
      case 'translate':
        return <TranslateStep step={step} done={done} onToggle={onToggle} />;
      case 'feynman':
        return <FeynmanStep step={step} done={done} onToggle={onToggle} />;
      case 'shadowing':
        return <ShadowingStep step={step} done={done} onToggle={onToggle} />;
      case 'scenario':
        return <ScenarioStep step={step} done={done} onToggle={onToggle} />;
      case 'srs':
        return <SRSStep step={step} done={done} onToggle={onToggle} />;
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
