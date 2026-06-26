import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { logActivity } from '../utils/activityLog';
import { chatCompletion, hasOpenAIKey } from '../utils/openaiClient';
import { buildListeningPrompt, parseListening, type ListeningPassage } from '../utils/listening';
import { scorePronunciation } from '../utils/pronunciation';

interface Props {
  open: boolean;
  onClose: () => void;
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = (typeof LEVELS)[number];

const TOPICS = [
  '日常生活',
  '旅行与交通',
  '工作与职场',
  '点餐与美食',
  '健康与就医',
  '购物消费',
  '新闻时事',
  '文化与习俗',
];

const SPEEDS: { label: string; rate: number }[] = [
  { label: '0.7×', rate: 0.7 },
  { label: '0.85×', rate: 0.85 },
  { label: '1.0×', rate: 1.0 },
];

export function ListeningPanel({ open, onClose }: Props) {
  const { language, speak } = useLanguage();
  const { addItem } = useLanguageSRS();

  const [level, setLevel] = useState<Level>('A2');
  const [topic, setTopic] = useState(TOPICS[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [format, setFormat] = useState<'dialogue' | 'article'>('dialogue');

  const [passage, setPassage] = useState<ListeningPassage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showText, setShowText] = useState(false);
  const [showZh, setShowZh] = useState(false);
  const [intensive, setIntensive] = useState(false);
  const [rate, setRate] = useState(0.85);

  const [dictation, setDictation] = useState<Record<number, string>>({});
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    // 关闭后保留上次结果；打开时不重置
  }, [open]);

  if (!open) return null;

  const effectiveTopic = topic === '自定义' ? customTopic.trim() : topic;

  const generate = async () => {
    if (!hasOpenAIKey()) {
      setError('请先在顶部「🤖 陪练」里设置 OpenAI API Key。');
      return;
    }
    if (topic === '自定义' && !customTopic.trim()) {
      setError('请填写自定义主题。');
      return;
    }
    logActivity(language.storagePrefix);
    setLoading(true);
    setError(null);
    setPassage(null);
    setShowText(false);
    setShowZh(false);
    setIntensive(false);
    setDictation({});
    setAnswers({});
    setSubmitted(false);
    try {
      const raw = await chatCompletion(
        buildListeningPrompt(language.label, language.nativeName, level, effectiveTopic || topic, format),
        { jsonMode: true, temperature: 0.7 },
      );
      const p = parseListening(raw);
      if (!p.lines.length) throw new Error('生成内容为空，请重试。');
      setPassage(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const playAll = () => {
    if (!passage) return;
    const text = passage.lines.map((l) => l.es).join(' … ');
    speak(text, rate);
  };

  const score = passage
    ? passage.questions.filter((q, i) => answers[i] === q.correctIndex).length
    : 0;
  const allAnswered =
    passage && passage.questions.length > 0 && passage.questions.every((_, i) => answers[i] != null);

  const addVocab = (v: { es: string; zh: string; note?: string }) => {
    addItem({
      es: v.es,
      zh: v.zh,
      note: v.note,
      source: 'AI 听力',
      kind: v.es.includes(' ') ? 'chunk' : 'word',
    });
  };

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div className="accum-panel accum-panel-wide aitutor-panel" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="accum-header">
          <h2>🎧 AI {language.label}听力</h2>
          <span className="accum-count">{level} · {effectiveTopic || topic}</span>
          <button type="button" className="accum-close" onClick={onClose}>
            ✕
          </button>
        </header>

        {!passage ? (
          <div className="aitutor-setup">
            <p className="accum-tip">按你的水平生成{language.nativeName}听力材料：先听，再看原文/翻译，做精听听写与理解题，生词一键进 SRS。</p>
            <label className="aitutor-field">
              <span>主题</span>
              <div className="listen-topics">
                {[...TOPICS, '自定义'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`aitutor-scenario ${topic === t ? 'active' : ''}`}
                    onClick={() => setTopic(t)}
                  >
                    <span>{t}</span>
                  </button>
                ))}
              </div>
            </label>
            {topic === '自定义' && (
              <label className="aitutor-field">
                <span>自定义主题</span>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="例如：在西班牙办手机卡 / 谈环保 / 看足球比赛"
                />
              </label>
            )}
            <div className="listen-setup-row">
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
              <label className="aitutor-field aitutor-level">
                <span>形式</span>
                <select value={format} onChange={(e) => setFormat(e.target.value as 'dialogue' | 'article')}>
                  <option value="dialogue">对话</option>
                  <option value="article">短文</option>
                </select>
              </label>
            </div>
            {error && <p className="aitutor-error">{error}</p>}
            <button type="button" className="btn btn-primary" onClick={() => void generate()} disabled={loading}>
              {loading ? 'AI 生成中…' : '生成听力 →'}
            </button>
          </div>
        ) : (
          <div className="listen-view">
            <div className="aitutor-chat-bar">
              <span className="aitutor-chat-meta">{passage.title}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setPassage(null)}>
                ↺ 换一篇
              </button>
            </div>

            <div className="listen-controls">
              <button type="button" className="btn btn-primary btn-sm" onClick={playAll}>
                🔊 播放全文
              </button>
              <div className="listen-speed">
                {SPEEDS.map((s) => (
                  <button
                    key={s.rate}
                    type="button"
                    className={`btn btn-sm ${rate === s.rate ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setRate(s.rate)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="listen-toggles">
              <button type="button" className={`btn btn-sm ${showText ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowText((v) => !v)}>
                {showText ? '隐藏原文' : '显示原文'}
              </button>
              <button type="button" className={`btn btn-sm ${showZh ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setShowZh((v) => !v)}>
                {showZh ? '隐藏翻译' : '显示翻译'}
              </button>
              <button type="button" className={`btn btn-sm ${intensive ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setIntensive((v) => !v)}>
                {intensive ? '退出精听' : '精听听写'}
              </button>
            </div>

            <ol className="listen-lines">
              {passage.lines.map((line, i) => {
                const dic = dictation[i] ?? '';
                const dicResult = intensive && dic ? scorePronunciation(dic, line.es) : null;
                return (
                  <li key={i} className="listen-line">
                    <button type="button" className="btn-icon" onClick={() => speak(line.es, rate)} title="播放本句">
                      🔊
                    </button>
                    <div className="listen-line-body">
                      {line.speaker && <span className="listen-speaker">{line.speaker}</span>}
                      {showText && <p className="listen-es">{line.es}</p>}
                      {showZh && <p className="listen-zh">{line.zh}</p>}
                      {intensive && (
                        <div className="listen-dictation">
                          <input
                            type="text"
                            value={dic}
                            placeholder="听写：输入你听到的内容…"
                            onChange={(e) => setDictation((d) => ({ ...d, [i]: e.target.value }))}
                          />
                          {dicResult && (
                            <span className={`listen-dic-score ${dicResult.score >= 70 ? 'good' : 'low'}`}>
                              {dicResult.score}分
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {passage.questions.length > 0 && (
              <div className="listen-quiz">
                <h3>理解题</h3>
                {passage.questions.map((q, qi) => (
                  <div key={qi} className="listen-question">
                    <p className="listen-q-text">
                      {qi + 1}. {q.question}
                    </p>
                    <div className="listen-options">
                      {q.options.map((opt, oi) => {
                        const chosen = answers[qi] === oi;
                        const isCorrect = oi === q.correctIndex;
                        let cls = 'listen-option';
                        if (submitted) {
                          if (isCorrect) cls += ' correct';
                          else if (chosen) cls += ' wrong';
                        } else if (chosen) cls += ' chosen';
                        return (
                          <button
                            key={oi}
                            type="button"
                            className={cls}
                            disabled={submitted}
                            onClick={() => setAnswers((a) => ({ ...a, [qi]: oi }))}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                    {submitted && q.explanation_zh && <p className="listen-explain">解析：{q.explanation_zh}</p>}
                  </div>
                ))}
                {!submitted ? (
                  <button type="button" className="btn btn-primary" disabled={!allAnswered} onClick={() => setSubmitted(true)}>
                    提交答案
                  </button>
                ) : (
                  <p className="listen-score">
                    得分：{score}/{passage.questions.length}
                  </p>
                )}
              </div>
            )}

            {passage.vocab.length > 0 && (
              <div className="listen-vocab">
                <div className="listen-vocab-head">
                  <h3>重点生词</h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => passage.vocab.forEach(addVocab)}
                  >
                    全部加入 SRS
                  </button>
                </div>
                <ul>
                  {passage.vocab.map((v, vi) => (
                    <li key={vi} className="listen-vocab-item">
                      <button type="button" className="btn-icon" onClick={() => speak(v.es, rate)}>
                        🔊
                      </button>
                      <div>
                        <strong>{v.es}</strong> — {v.zh}
                        {v.note && <small>（{v.note}）</small>}
                      </div>
                      <button type="button" className="btn btn-secondary btn-xs" onClick={() => addVocab(v)}>
                        ＋SRS
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
