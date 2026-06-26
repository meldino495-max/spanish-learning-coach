import type { TutorialStep } from '../data/scenarios/types';

export function TutorialBlock({
  steps,
  onSpeak,
}: {
  steps: TutorialStep[];
  onSpeak: (text: string) => void;
}) {
  const sorted = [...steps].sort((a, b) => a.step - b.step);

  return (
    <section className="profession-tutorial-block">
      <h3>🛠️ 上岗教程（怎么做）</h3>
      <p className="profession-tutorial-intro">按步骤学习工作流程，每步含中文说明与关键西语。</p>
      <ol className="tutorial-step-list">
        {sorted.map((s) => (
          <li key={s.step} className="tutorial-step">
            <div className="tutorial-step-head">
              <span className="tutorial-step-num">步骤 {s.step}</span>
              <strong>{s.title}</strong>
            </div>
            <p className="tutorial-step-instruction">{s.instruction}</p>
            {s.tip && <p className="tutorial-step-tip">💡 {s.tip}</p>}
            {s.keyPhrase && (
              <div className="tutorial-key-phrase">
                <p className="chunk-es">{s.keyPhrase.es}</p>
                <p className="chunk-zh">{s.keyPhrase.zh}</p>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => onSpeak(s.keyPhrase!.es)}
                  title="朗读关键句"
                >
                  🔊
                </button>
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
