import { useState } from 'react';
import type { Step } from '../types';
import { speakSpanish } from '../utils/speech';
import { useSRS } from '../hooks/useSRS';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

/** 场景联想：在真实生活场景中记表达 */
export function ScenarioStep({ step, done, onToggle }: Props) {
  const { addMany } = useSRS();
  const items = step.scenarioItems ?? [];
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const saveScenario = () => {
    addMany(
      items.map((es) => ({ es, zh: step.scenarioTitle ?? '场景', kind: 'scenario' as const })),
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
              <span>{item}</span>
            </label>
            <button type="button" className="btn-icon" onClick={() => speakSpanish(item)} title="朗读">
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
