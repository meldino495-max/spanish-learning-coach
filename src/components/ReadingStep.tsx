import { useState } from 'react';
import type { Step } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

export function ReadingStep({ step, done, onToggle }: Props) {
  const { speak } = useLanguage();
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const turns = step.readingTurns ?? [];
  const sentences = step.readingSentences ?? [];
  const questions = step.readingQuestions ?? [];
  const isDialogue = step.readingFormat === 'dialogue';

  const allEs = isDialogue ? turns.map((t) => t.es) : sentences.map((s) => s.es);
  const score = submitted
    ? questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  const playAll = () => {
    const text = allEs.join(' ');
    if (text) speak(text, 0.85);
  };

  const allAnswered = questions.every((_, i) => answers[i] != null);

  return (
    <div className="step-body reading-step">
      <p className="step-instructions">{step.instructions}</p>
      {step.readingContext && <p className="reading-step-context">{step.readingContext}</p>}

      {allEs.length > 0 && (
        <div className="reading-step-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={playAll}>
            🔊 朗读全文
          </button>
        </div>
      )}

      {isDialogue ? (
        <ol className="reading-step-turns">
          {turns.map((turn, i) => (
            <li key={i} className="reading-step-turn">
              <span className="reading-step-speaker">{turn.speaker}</span>
              <div className="reading-step-turn-body">
                <p className="chunk-es">{turn.es}</p>
                {turn.zh && <p className="chunk-zh">{turn.zh}</p>}
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => speak(turn.es, 0.85)}
                title="朗读这句"
              >
                🔊
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <div className="reading-step-article">
          <p className="reading-step-article-es">{sentences.map((s) => s.es).join(' ')}</p>
          <ol className="reading-step-sentences">
            {sentences.map((s, i) => (
              <li key={i} className="reading-step-sentence">
                <div className="reading-step-sentence-body">
                  <p className="chunk-es">{s.es}</p>
                  {s.zh && <p className="chunk-zh">{s.zh}</p>}
                </div>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => speak(s.es, 0.85)}
                  title="朗读这句"
                >
                  🔊
                </button>
              </li>
            ))}
          </ol>
        </div>
      )}

      {questions.length > 0 && (
        <div className="reading-step-quiz">
          <p className="reading-context-label">阅读理解</p>
          {questions.map((q, qi) => {
            const picked = answers[qi];
            return (
              <fieldset key={qi} className="reading-question">
                <legend>
                  {qi + 1}. {q.question}
                </legend>
                <div className="reading-options">
                  {q.options.map((opt, oi) => {
                    let cls = 'reading-option';
                    if (submitted && oi === q.correctIndex) cls += ' correct';
                    if (submitted && picked === oi && oi !== q.correctIndex) cls += ' wrong';
                    return (
                      <label key={oi} className={cls}>
                        <input
                          type="radio"
                          name={`${step.id}-q${qi}`}
                          checked={picked === oi}
                          disabled={submitted}
                          onChange={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                        />
                        {opt}
                      </label>
                    );
                  })}
                </div>
                {submitted && q.explanation && (
                  <p className="reading-explanation">💡 {q.explanation}</p>
                )}
              </fieldset>
            );
          })}

          <div className="reading-comp-actions">
            {!submitted ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!allAnswered}
                onClick={() => setSubmitted(true)}
              >
                提交答案
              </button>
            ) : (
              <p className="reading-score">
                得分：{score} / {questions.length}
                {score === questions.length ? ' · 全对！' : ''}
              </p>
            )}
            {submitted && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              >
                重做
              </button>
            )}
          </div>
        </div>
      )}

      <div className="step-actions">
        <button
          type="button"
          className={`btn ${done ? 'btn-done' : 'btn-secondary'}`}
          onClick={onToggle}
        >
          {done ? '✓ 已完成' : '标记完成'}
        </button>
      </div>
    </div>
  );
}
