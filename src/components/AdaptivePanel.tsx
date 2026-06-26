import { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { chatCompletion, hasOpenAIKey } from '../utils/openaiClient';
import { buildAdaptivePrompt, parseAdaptive, type AdaptiveSet } from '../utils/adaptive';
import { normalizeForCompare, textsMatch } from '../utils/speech';
import type { SRSItem, SRSRating } from '../hooks/srsCore';

interface Props {
  open: boolean;
  onClose: () => void;
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = (typeof LEVELS)[number];

const MAX_ITEMS = 8;

export function AdaptivePanel({ open, onClose }: Props) {
  const { language, speak } = useLanguage();
  const { items, dueItems, rateItem } = useLanguageSRS();

  const [level, setLevel] = useState<Level>('A2');
  const [set, setSet] = useState<AdaptiveSet | null>(null);
  const [trained, setTrained] = useState<SRSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [fillInputs, setFillInputs] = useState<Record<number, string>>({});
  const [fillChecked, setFillChecked] = useState<Record<number, boolean>>({});
  const [transInputs, setTransInputs] = useState<Record<number, string>>({});
  const [transChecked, setTransChecked] = useState<Record<number, boolean>>({});
  const [rated, setRated] = useState<Record<string, SRSRating>>({});

  // 选出薄弱词：到期优先，其次按 SRS 阶段升序、复习次数降序
  const weakItems = useMemo(() => {
    const pool = dueItems.length >= 3 ? dueItems : items;
    return [...pool]
      .sort((a, b) => a.srsStage - b.srsStage || b.reviewCount - a.reviewCount)
      .slice(0, MAX_ITEMS);
  }, [items, dueItems]);

  if (!open) return null;

  const generate = async () => {
    if (!hasOpenAIKey()) {
      setError('请先在顶部「🤖 陪练」里设置 OpenAI API Key。');
      return;
    }
    if (weakItems.length < 3) {
      setError('SRS 库里至少需要 3 个词/语块。先在「语块学习」「🤖 陪练」或「🎧 听力」里积累一些。');
      return;
    }
    setLoading(true);
    setError(null);
    setSet(null);
    setFillInputs({});
    setFillChecked({});
    setTransInputs({});
    setTransChecked({});
    setRated({});
    try {
      const raw = await chatCompletion(
        buildAdaptivePrompt(
          language.label,
          language.nativeName,
          level,
          weakItems.map((it) => ({ es: it.es, zh: it.zh })),
        ),
        { jsonMode: true, temperature: 0.6 },
      );
      const parsed = parseAdaptive(raw);
      if (!parsed.fills.length && !parsed.translations.length) throw new Error('生成内容为空，请重试。');
      setSet(parsed);
      setTrained(weakItems);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const rate = (item: SRSItem, rating: SRSRating) => {
    rateItem(item.id, rating);
    setRated((r) => ({ ...r, [item.id]: rating }));
  };

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div className="accum-panel accum-panel-wide aitutor-panel" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="accum-header">
          <h2>🎯 AI 弱项特训</h2>
          <span className="accum-count">薄弱 {weakItems.length} · 到期 {dueItems.length}</span>
          <button type="button" className="accum-close" onClick={onClose}>
            ✕
          </button>
        </header>

        {!set ? (
          <div className="aitutor-setup">
            <p className="accum-tip">
              AI 会挑出你 SRS 里最薄弱 / 到期的词与语块，围绕它们生成针对性的挖空和翻译练习——哪里弱补哪里。
            </p>
            {weakItems.length > 0 ? (
              <div className="adaptive-weak">
                <span className="adaptive-weak-label">本次重点：</span>
                {weakItems.map((it) => (
                  <span key={it.id} className="adaptive-chip" title={it.zh}>
                    {it.es}
                  </span>
                ))}
              </div>
            ) : (
              <p className="aitutor-error">SRS 库还是空的。先去积累一些词/语块。</p>
            )}
            <label className="aitutor-field aitutor-level">
              <span>难度（CEFR）</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="aitutor-error">{error}</p>}
            <button type="button" className="btn btn-primary" onClick={() => void generate()} disabled={loading}>
              {loading ? 'AI 生成中…' : '生成特训 →'}
            </button>
          </div>
        ) : (
          <div className="listen-view">
            <div className="aitutor-chat-bar">
              <span className="aitutor-chat-meta">{set.intro_zh || '弱项特训'}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setSet(null)}>
                ↺ 重新生成
              </button>
            </div>

            {set.fills.length > 0 && (
              <div className="listen-quiz">
                <h3>① 选词填空</h3>
                {set.fills.map((f, i) => {
                  const checked = fillChecked[i];
                  const val = fillInputs[i] ?? '';
                  const ok = normalizeForCompare(val) === normalizeForCompare(f.answer);
                  const parts = f.sentence.split('___');
                  return (
                    <div key={i} className="adaptive-fill">
                      <p className="adaptive-fill-sentence">
                        {parts[0]}
                        <input
                          type="text"
                          className={checked ? (ok ? 'fill-ok' : 'fill-wrong') : ''}
                          value={val}
                          onChange={(e) => setFillInputs((s) => ({ ...s, [i]: e.target.value }))}
                          placeholder="填空"
                        />
                        {parts.slice(1).join('___')}
                      </p>
                      {f.translation_zh && <p className="listen-zh">{f.translation_zh}</p>}
                      <div className="adaptive-fill-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => setFillChecked((s) => ({ ...s, [i]: true }))}
                        >
                          核对
                        </button>
                        <button type="button" className="btn-icon" onClick={() => speak(f.answer)}>
                          🔊
                        </button>
                        {checked && (
                          <span className={ok ? 'adaptive-ok' : 'adaptive-wrong'}>
                            {ok ? '✓ 正确' : `正确答案：${f.answer}`}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {set.translations.length > 0 && (
              <div className="listen-quiz">
                <h3>② 中译{language.nativeName}</h3>
                {set.translations.map((t, i) => {
                  const checked = transChecked[i];
                  const val = transInputs[i] ?? '';
                  const ok = textsMatch(val, t.answer_es);
                  return (
                    <div key={i} className="adaptive-trans">
                      <p className="adaptive-trans-zh">{t.zh}</p>
                      <textarea
                        rows={2}
                        value={val}
                        onChange={(e) => setTransInputs((s) => ({ ...s, [i]: e.target.value }))}
                        placeholder={`用${language.nativeName}写出来…`}
                      />
                      <div className="adaptive-fill-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() => setTransChecked((s) => ({ ...s, [i]: true }))}
                        >
                          核对
                        </button>
                        <button type="button" className="btn-icon" onClick={() => speak(t.answer_es)}>
                          🔊
                        </button>
                      </div>
                      {checked && (
                        <div className={`adaptive-trans-answer ${ok ? 'adaptive-ok' : ''}`}>
                          {ok ? '✓ 很接近！参考：' : '参考答案：'}
                          <span>{t.answer_es}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="listen-quiz">
              <h3>③ 给本次重点词重新评级</h3>
              <p className="accum-tip">练完后凭感觉评级，更新 SRS 复习计划。</p>
              <ul className="adaptive-rate-list">
                {trained.map((it) => (
                  <li key={it.id} className="adaptive-rate-item">
                    <button type="button" className="btn-icon" onClick={() => speak(it.es)}>
                      🔊
                    </button>
                    <div className="adaptive-rate-word">
                      <strong>{it.es}</strong>
                      <small>{it.zh}</small>
                    </div>
                    {rated[it.id] ? (
                      <span className="adaptive-ok">已评级 ✓</span>
                    ) : (
                      <div className="adaptive-rate-btns">
                        <button type="button" className="btn srs-again btn-xs" onClick={() => rate(it, 'again')}>
                          忘了
                        </button>
                        <button type="button" className="btn srs-good btn-xs" onClick={() => rate(it, 'good')}>
                          记得
                        </button>
                        <button type="button" className="btn srs-easy btn-xs" onClick={() => rate(it, 'easy')}>
                          简单
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
