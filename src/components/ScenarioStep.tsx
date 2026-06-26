import { useState } from 'react';
import type { Step } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

function normalizeItem(item: { es: string; zh: string; note?: string } | string) {
  if (typeof item === 'string') {
    return { es: item, zh: '' };
  }
  return item;
}

/** 场景联想：在真实生活场景中记表达 */
export function ScenarioStep({ step, done, onToggle }: Props) {
  const { speak } = useLanguage();
  const { addMany } = useLanguageSRS();
  const items = (step.scenarioItems ?? []).map(normalizeItem).filter((x) => !x.es.startsWith('（练习）'));
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const saveScenario = () => {
    addMany(
      items.map((x) => ({
        es: x.es,
        zh: x.zh || step.scenarioTitle || '场景',
        note: x.note,
        kind: 'scenario' as const,
      })),
      step.scenarioTitle,
    );
  };

  return (
    <div className="step-body">
      <p className="step-instructions">
        {step.instructions ??
          '场景记忆法：把语言放进生活场景。看着周围，用西语描述；或想象自己在该场景中说这些话。'}
      </p>
      <div className="method-badge">🎬 场景联想 · 把自己变成「西班牙人」</div>
      <h4 className="scenario-title">{step.scenarioTitle}</h4>
      <ul className="scenario-list">
        {items.map((item, i) => (
          <li key={i} className={checked[i] ? 'done' : ''}>
            <label>
              <input
                type="checkbox"
                checked={!!checked[i]}
                onChange={(e) => setChecked((c) => ({ ...c, [i]: e.target.checked }))}
              />
              <span>
                <strong>{item.es}</strong>
                {item.zh && <span className="scenario-item-zh"> — {item.zh}</span>}
                {item.note && <em className="scenario-item-note"> ({item.note})</em>}
              </span>
            </label>
            <button type="button" className="btn-icon" onClick={() => speak(item.es)} title="朗读">
              🔊
            </button>
          </li>
        ))}
      </ul>
      <p className="scenario-extra">
        额外练习：环顾四周，用西语描述 3 样东西（Es mi… / Está… / Hay…）。
      </p>
      <div className="step-actions">
        <button type="button" className="btn btn-primary" onClick={saveScenario}>
          场景句加入 SRS
        </button>
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '标记完成'}
        </button>
      </div>
    </div>
  );
}
