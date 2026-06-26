import { useState } from 'react';
import type { Step } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { textsMatch } from '../utils/speech';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

export function DictationStep({ step, done, onToggle }: Props) {
  const { speak } = useLanguage();
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const play = () => {
    if (step.dictationText) speak(step.dictationText);
  };

  const check = () => {
    if (!step.dictationText) return;
    const ok = textsMatch(input, step.dictationText);
    setCorrect(ok);
    setChecked(true);
    if (ok) onToggle();
  };

  return (
    <div className="step-body">
      <p className="step-instructions">{step.instructions}</p>
      {step.dictationHint && <p className="step-meta">💡 {step.dictationHint}</p>}
      <div className="step-actions">
        <button type="button" className="btn btn-primary" onClick={play}>
          🔊 播放朗读
        </button>
        <button type="button" className="btn btn-secondary" onClick={play}>
          再听一遍
        </button>
      </div>
      <textarea
        className="dictation-input"
        placeholder="在这里写下你听到的内容…"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setChecked(false);
        }}
        rows={4}
      />
      <div className="step-actions">
        <button type="button" className="btn btn-primary" onClick={check}>
          核对答案
        </button>
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '标记完成'}
        </button>
      </div>
      {checked && (
        <div className={`result-box ${correct ? 'result-ok' : 'result-warn'}`}>
          {correct ? (
            <p>✓ 正确！</p>
          ) : (
            <>
              <p>不完全一致，对照正确答案：</p>
              <p className="answer-text">{step.dictationText}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
