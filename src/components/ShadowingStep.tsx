import { useState } from 'react';
import type { Step } from '../types';
import { speakSpanish, stopSpeaking } from '../utils/speech';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

/** 影子跟读 Shadowing */
export function ShadowingStep({ step, done, onToggle }: Props) {
  const lines = step.shadowingLines ?? [];
  const [idx, setIdx] = useState(0);
  const [round, setRound] = useState(1);
  const line = lines[idx];

  const play = () => {
    if (line) speakSpanish(line, 0.75);
  };

  const next = () => {
    stopSpeaking();
    if (idx < lines.length - 1) setIdx((i) => i + 1);
    else {
      setIdx(0);
      setRound((r) => r + 1);
    }
  };

  return (
    <div className="step-body">
      <p className="step-instructions">
        {step.instructions ??
          '影子跟读法：① 点播放 ② 几乎同时跟读 ③ 模仿语调，不要等整句结束。每句 3 遍。'}
      </p>
      <div className="method-badge">👥 Shadowing · 第 {round} 轮</div>
      {line ? (
        <div className="shadow-card">
          <p className="shadow-line">{line}</p>
          <p className="shadow-progress">
            第 {idx + 1}/{lines.length} 句
          </p>
        </div>
      ) : (
        <p>暂无跟读句子，使用本课例句练习。</p>
      )}
      <div className="step-actions">
        <button type="button" className="btn btn-primary" onClick={play}>
          🔊 播放（然后立即跟读）
        </button>
        <button type="button" className="btn btn-secondary" onClick={next}>
          下一句 →
        </button>
      </div>
      <ol className="shadow-all-lines">
        {lines.map((l, i) => (
          <li key={i} className={i === idx ? 'active' : ''}>
            {l}
          </li>
        ))}
      </ol>
      <div className="step-actions">
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '跟读完成，标记'}
        </button>
      </div>
    </div>
  );
}
