import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { getPhrasePacks } from '../data/phrases/essentialPhrases';
import { getInductionCards } from '../data/phrases/inductionCards';
import { scorePronunciation } from '../utils/pronunciation';
import { logActivity } from '../utils/activityLog';

function writingLabel(score: number): { text: string; tone: 'good' | 'mid' | 'low' } {
  if (score >= 85) return { text: '写对了！', tone: 'good' };
  if (score >= 60) return { text: '接近，注意红黄处的用词与语序', tone: 'mid' };
  return { text: '差距较大，对照原文修正后再写一遍', tone: 'low' };
}

interface Props {
  open: boolean;
  onClose: () => void;
}

type Tab = 'back' | 'induct';

export function WritingPanel({ open, onClose }: Props) {
  const { language, languageId, pack, speak } = useLanguage();
  const { addItem } = useLanguageSRS();

  const packs = useMemo(() => getPhrasePacks(languageId, pack), [languageId, pack]);
  const cards = useMemo(() => getInductionCards(languageId), [languageId]);

  const [tab, setTab] = useState<Tab>('back');

  // —— 逆翻译 ——
  const [packId, setPackId] = useState(packs[0]?.id ?? '');
  const sourcePack = packs.find((p) => p.id === packId) ?? packs[0];
  const sentences = sourcePack?.phrases ?? [];
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  // 切换语言后重置到第一个短句包，避免索引越界
  useEffect(() => {
    setPackId(packs[0]?.id ?? '');
    setIdx(0);
    setAnswer('');
    setRevealed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageId]);

  const current = sentences[idx];
  const result = useMemo(
    () => (revealed && current ? scorePronunciation(answer, current.es) : null),
    [revealed, answer, current],
  );

  if (!open) return null;

  const reveal = () => {
    setRevealed(true);
    logActivity(language.storagePrefix);
  };
  const go = (n: number) => {
    if (!sentences.length) return;
    const next = (n + sentences.length) % sentences.length;
    setIdx(next);
    setAnswer('');
    setRevealed(false);
  };
  const changePack = (id: string) => {
    setPackId(id);
    setIdx(0);
    setAnswer('');
    setRevealed(false);
  };

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div className="accum-panel accum-panel-wide phrase-panel" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="accum-header">
          <h2>✍️ 写作 & 归纳</h2>
          <span className="accum-count">Kazu 第二步 · 读 + 写</span>
          <button type="button" className="accum-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </header>

        <div className="phrase-body">
          <div className="writing-tabs">
            <button
              type="button"
              className={`writing-tab ${tab === 'back' ? 'active' : ''}`}
              onClick={() => setTab('back')}
            >
              🔄 逆翻译
            </button>
            <button
              type="button"
              className={`writing-tab ${tab === 'induct' ? 'active' : ''}`}
              onClick={() => setTab('induct')}
            >
              🧩 语法归纳
            </button>
          </div>

          {tab === 'back' && (
            <>
              <div className="phrase-method">
                <strong>逆翻译（back-translation）</strong>
                <span>看着中文，把它写成{language.label}，再对照原文。错在哪、漏了什么，一目了然——单词用法和语法掌握度同时检验。</span>
              </div>

              {packs.length > 1 && (
                <div className="phrase-packs">
                  {packs.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`phrase-pack-chip ${p.id === sourcePack?.id ? 'active' : ''}`}
                      onClick={() => changePack(p.id)}
                    >
                      {p.icon} {p.title}
                    </button>
                  ))}
                </div>
              )}

              {current ? (
                <div className="bt-card">
                  <p className="bt-counter">
                    第 {idx + 1}/{sentences.length} 句
                  </p>
                  <p className="bt-zh">{current.zh}</p>
                  <textarea
                    className="shadow-input"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={`用${language.label}写出来…`}
                    rows={2}
                  />
                  {!revealed ? (
                    <button type="button" className="btn btn-primary btn-sm" onClick={reveal}>
                      对照原文
                    </button>
                  ) : (
                    <div className="bt-result">
                      {result && (
                        <div className={`pron-score pron-${writingLabel(result.score).tone}`}>
                          <span className="pron-score-num">{result.score}</span>
                          <span className="pron-score-max">/100</span>
                          <span className="pron-score-label">{writingLabel(result.score).text}</span>
                        </div>
                      )}
                      <p className="bt-original-label">原文（绿=对上 · 黄=接近 · 红=漏/错）：</p>
                      <p className="shadow-sentence">
                        {result
                          ? result.words.map((w, i) => (
                              <span key={i} className={`pron-word pron-word-${w.status}`}>
                                {w.display}{' '}
                              </span>
                            ))
                          : current.es}
                      </p>
                      <div className="phrase-actions">
                        <button type="button" className="btn btn-secondary btn-xs" onClick={() => speak(current.es, 0.95)}>
                          🔊 听原文
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-xs"
                          onClick={() =>
                            addItem({ es: current.es, zh: current.zh, source: '逆翻译', kind: 'chunk' })
                          }
                        >
                          ＋ 记忆库
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="shadow-nav">
                    <button type="button" className="btn btn-secondary" onClick={() => go(idx - 1)}>
                      ← 上一句
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => go(idx + 1)}>
                      下一句 →
                    </button>
                  </div>
                </div>
              ) : (
                <p className="accum-tip">该语言暂无可用于逆翻译的短句。</p>
              )}
            </>
          )}

          {tab === 'induct' && (
            <>
              <div className="phrase-method">
                <strong>从短句归纳语法</strong>
                <span>Kazu：先看真实短句、凭感觉猜出规律，再用逻辑确认。比直接背语法术语更容易内化。</span>
              </div>
              {cards.length > 0 ? (
                cards.map((c) => <InductionItem key={c.id} card={c} speak={speak} />)
              ) : (
                <p className="accum-tip">语法归纳卡片目前为西班牙语准备。其他语言可在课程的「费曼」步骤练习归纳。</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function InductionItem({
  card,
  speak,
}: {
  card: import('../data/phrases/inductionCards').InductionCard;
  speak: (t: string, r?: number) => void;
}) {
  const [guess, setGuess] = useState('');
  const [show, setShow] = useState(false);
  return (
    <div className="induct-card">
      <p className="induct-title">{card.title}</p>
      <ul className="induct-examples">
        {card.examples.map((e, i) => (
          <li key={i}>
            <button type="button" className="induct-play" onClick={() => speak(e.es, 0.9)} title="听">
              🔊
            </button>
            <span className="induct-es">{e.es}</span>
            <span className="induct-zh">{e.zh}</span>
          </li>
        ))}
      </ul>
      <p className="induct-hint">💭 {card.hint}</p>
      <textarea
        className="shadow-input"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        placeholder="你发现的规律是？（先自己说说看）"
        rows={2}
      />
      {!show ? (
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setShow(true)}>
          看规律
        </button>
      ) : (
        <p className="induct-rule">✅ {card.rule}</p>
      )}
    </div>
  );
}
