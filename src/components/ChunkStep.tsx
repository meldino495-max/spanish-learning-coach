import { useState } from 'react';
import type { Step } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

/** 语块学习：背整句，不背孤立单词 */
export function ChunkStep({ step, done, onToggle }: Props) {
  const { speak } = useLanguage();
  const { addMany } = useLanguageSRS();
  const chunks = step.chunkItems ?? step.vocabItems ?? [];
  const [active, setActive] = useState(0);

  const c = chunks[active];

  const addAllToSRS = () => {
    addMany(
      chunks.map((x) => ({
        es: x.es,
        zh: x.zh,
        note: x.note ?? x.chunkLabel,
        kind: 'chunk' as const,
      })),
      step.title ?? '语块',
    );
    onToggle();
  };

  return (
    <div className="step-body">
      <p className="step-instructions">
        {step.instructions ??
          '不要记 abandon=放弃，要记整句。每个语块要能直接说出口。大声读 3 遍，想象使用场景。'}
      </p>
      <div className="method-badge">📦 语块记忆 Chunking · 听→说→读→写</div>
      {c && (
        <div className="chunk-card">
          {c.chunkLabel && <span className="chunk-label">{c.chunkLabel}</span>}
          <p className="chunk-es">{c.es}</p>
          <p className="chunk-zh">{c.zh}</p>
          {c.note && <p className="chunk-note">{c.note}</p>}
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => speak(c.es)}>
            🔊 听一遍
          </button>
        </div>
      )}
      <div className="chunk-nav">
        {chunks.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`chunk-dot ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <ul className="chunk-list-compact">
        {chunks.map((ch, i) => (
          <li key={i} onClick={() => setActive(i)} role="presentation">
            <strong>{ch.es}</strong> — {ch.zh}
          </li>
        ))}
      </ul>
      <div className="step-actions">
        <button type="button" className="btn btn-primary" onClick={addAllToSRS}>
          全部加入间隔重复（SRS）
        </button>
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '标记完成'}
        </button>
      </div>
    </div>
  );
}
