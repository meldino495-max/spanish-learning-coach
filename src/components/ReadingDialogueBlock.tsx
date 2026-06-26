import { useState } from 'react';
import type { ReadingDialogue } from '../data/scenarios/types';

export function ReadingDialogueBlock({
  dialogue,
  onSpeak,
}: {
  dialogue: ReadingDialogue;
  onSpeak: (text: string) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = submitted
    ? dialogue.comprehension.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;

  return (
    <article className="reading-dialogue-block">
      <header className="reading-dialogue-header">
        <h3>📖 {dialogue.title}</h3>
      </header>
      <div className="reading-dialogue-context">
        <p className="reading-context-label">课文背景</p>
        <p>{dialogue.context}</p>
      </div>

      {dialogue.passage && (
        <div className="reading-dialogue-passage">
          <div className="reading-passage-head">
            <p className="reading-context-label">课文（整段精读）</p>
            <button
              type="button"
              className="btn-icon reading-speak-btn"
              onClick={() => onSpeak(dialogue.passage!.es)}
              title="朗读全文"
            >
              🔊
            </button>
          </div>
          <p className="chunk-es reading-passage-es">{dialogue.passage.es}</p>
          <p className="chunk-zh reading-passage-zh">{dialogue.passage.zh}</p>
        </div>
      )}

      <div className="reading-dialogue-script">
        <p className="reading-context-label">对话</p>
        <ol className="reading-turn-list">
          {dialogue.turns.map((turn, i) => (
            <li key={`${turn.speaker}-${i}`} className="reading-turn">
              <span className="reading-speaker">{turn.speaker}</span>
              <div className="reading-turn-body">
                <p className="chunk-es">{turn.es}</p>
                <p className="chunk-zh">{turn.zh}</p>
                <button
                  type="button"
                  className="btn-icon reading-speak-btn"
                  onClick={() => onSpeak(turn.es)}
                  title="朗读这句"
                >
                  🔊
                </button>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {dialogue.comprehension.length > 0 && (
        <div className="reading-comprehension">
          <p className="reading-context-label">阅读理解</p>
          {dialogue.comprehension.map((q, qi) => {
            const picked = answers[qi];
            const correct = q.correctIndex;
            return (
              <fieldset key={qi} className="reading-question">
                <legend>
                  {qi + 1}. {q.question}
                </legend>
                <div className="reading-options">
                  {q.options.map((opt, oi) => {
                    let cls = 'reading-option';
                    if (submitted && oi === correct) cls += ' correct';
                    if (submitted && picked === oi && oi !== correct) cls += ' wrong';
                    return (
                      <label key={oi} className={cls}>
                        <input
                          type="radio"
                          name={`rd-${dialogue.id}-q${qi}`}
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
                disabled={dialogue.comprehension.some((_, i) => answers[i] == null)}
                onClick={() => setSubmitted(true)}
              >
                提交答案
              </button>
            ) : (
              <p className="reading-score">
                得分：{score} / {dialogue.comprehension.length}
                {score === dialogue.comprehension.length ? ' · 全对！' : ''}
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
    </article>
  );
}
