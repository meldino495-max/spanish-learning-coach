import { useState } from 'react';
import type { Step } from '../types';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

export function QuizStep({ step, done, onToggle }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const options = step.quizOptions ?? [];
  const correctIdx = options.findIndex((o) => o.correct);

  const submit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected === correctIdx) onToggle();
  };

  return (
    <div className="step-body">
      {step.instructions && <p className="step-instructions">{step.instructions}</p>}
      <p className="quiz-question">{step.quizQuestion}</p>
      <div className="quiz-options">
        {options.map((opt, i) => {
          let cls = 'quiz-option';
          if (submitted && i === correctIdx) cls += ' correct';
          else if (submitted && i === selected && i !== correctIdx) cls += ' wrong';
          else if (i === selected) cls += ' selected';
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={submitted}
              onClick={() => setSelected(i)}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
      {!submitted ? (
        <button type="button" className="btn btn-primary" onClick={submit} disabled={selected === null}>
          提交答案
        </button>
      ) : (
        <div className="result-box">
          {selected === correctIdx ? (
            <p className="result-ok-text">✓ 回答正确！</p>
          ) : (
            <p className="result-warn-text">✗ 正确答案：{options[correctIdx]?.text}</p>
          )}
          {step.quizExplanation && <p className="quiz-explain">{step.quizExplanation}</p>}
          {selected !== correctIdx && (
            <button type="button" className="btn btn-secondary" onClick={onToggle}>
              已理解，标记完成
            </button>
          )}
        </div>
      )}
      {done && submitted && selected === correctIdx && (
        <p className="done-badge">✓ 本步骤已完成</p>
      )}
    </div>
  );
}
