import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { lookupWord, dictSources, type DictEntry } from '../utils/dictionary';
import { chatCompletion, hasOpenAIKey } from '../utils/openaiClient';

interface Props {
  word: string | null;
  open?: boolean;
  onClose: () => void;
}

export function DictionaryPopup({ word, open, onClose }: Props) {
  const { language, speak } = useLanguage();
  const { addItem } = useLanguageSRS();
  const [term, setTerm] = useState<string>(word ?? '');
  const [query, setQuery] = useState<string>('');
  const [entries, setEntries] = useState<DictEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const [showZh, setShowZh] = useState(false);
  const [zhEntries, setZhEntries] = useState<DictEntry[]>([]);
  const [zhLoading, setZhLoading] = useState(false);
  const [zhError, setZhError] = useState<string | null>(null);
  const [aiZh, setAiZh] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (word) {
      setTerm(word);
      setQuery(word);
    }
  }, [word]);

  useEffect(() => {
    if (!term) return;
    let active = true;
    setLoading(true);
    setError(null);
    setEntries([]);
    setAdded(false);
    setShowZh(false);
    setZhEntries([]);
    setZhError(null);
    setAiZh(null);
    lookupWord(term, language.id)
      .then((res) => {
        if (!active) return;
        setEntries(res);
        if (res.length === 0) setError('未在 Wiktionary 找到该词条，可点下方权威来源继续查。');
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [term, language.id]);

  const loadZh = () => {
    if (!term) return;
    if (showZh) {
      setShowZh(false);
      return;
    }
    setShowZh(true);
    if (zhEntries.length > 0 || zhLoading) return;
    setZhLoading(true);
    setZhError(null);
    lookupWord(term, language.id, 'zh')
      .then((res) => {
        setZhEntries(res);
        if (res.length === 0) setZhError('Wiktionary 中文版暂无该词条，可试试下方「AI 翻译」。');
      })
      .catch((e) => setZhError(e instanceof Error ? e.message : String(e)))
      .finally(() => setZhLoading(false));
  };

  const aiTranslate = async () => {
    if (!term) return;
    setAiLoading(true);
    setAiZh(null);
    try {
      const content = await chatCompletion(
        [
          {
            role: 'system',
            content: `你是${language.label}（${language.nativeName}）词典助手。给出该词/短语的简体中文释义：列出主要词义（用「；」分隔），如有需要补一个简短例句及中文翻译。不超过 80 字，直接给内容，不要客套。`,
          },
          { role: 'user', content: term },
        ],
        { temperature: 0.3 },
      );
      setAiZh(content.trim());
    } catch (e) {
      setAiZh('AI 翻译失败：' + (e instanceof Error ? e.message : String(e)) + '（可在「🤖 陪练」设置 Key）');
    } finally {
      setAiLoading(false);
    }
  };

  const submitSearch = () => {
    const t = query.trim();
    if (t) setTerm(t);
  };

  if (!word && !open) return null;

  const openExternal = (url: string) => {
    if (window.electronAPI?.openExternal) window.electronAPI.openExternal(url);
    else window.open(url, '_blank', 'noopener');
  };

  const firstDef = entries[0]?.definitions[0] ?? '';
  const bestZh = aiZh || zhEntries[0]?.definitions[0] || firstDef || '（释义见词典）';

  return (
    <div className="dict-overlay" onClick={onClose} role="presentation">
      <div className="dict-popup" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="dict-head">
          <div className="dict-word-row">
            {term ? (
              <>
                <h3 className="dict-word">{term}</h3>
                <button type="button" className="btn-icon" title="朗读" onClick={() => speak(term, 0.9)}>
                  🔊
                </button>
              </>
            ) : (
              <h3 className="dict-word">📖 词典查词</h3>
            )}
          </div>
          <button type="button" className="accum-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </header>

        <form
          className="dict-search"
          onSubmit={(e) => {
            e.preventDefault();
            submitSearch();
          }}
        >
          <input
            type="text"
            className="dict-search-input"
            placeholder={`输入${language.label}单词或短语…`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus={!word}
          />
          <button type="submit" className="btn btn-primary btn-sm" disabled={!query.trim()}>
            查词
          </button>
        </form>

        <div className="dict-body">
          {!term && !loading && (
            <p className="dict-note">输入要查的词，或在正文中双击任意单词即可查询。</p>
          )}
          {loading && <p className="dict-loading">查询中…</p>}
          {error && <p className="dict-error">{error}</p>}

          {entries.map((e, i) => (
            <div key={i} className="dict-entry">
              {e.partOfSpeech && <span className="dict-pos">{e.partOfSpeech}</span>}
              <ol className="dict-defs">
                {e.definitions.map((d, j) => (
                  <li key={j}>{d}</li>
                ))}
              </ol>
            </div>
          ))}

          {term && !loading && (
            <div className="dict-zh">
              <div className="dict-zh-actions">
                <button type="button" className="btn btn-secondary btn-sm" onClick={loadZh}>
                  {showZh ? '收起中文' : '🇨🇳 中文释义'}
                </button>
                {hasOpenAIKey() && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => void aiTranslate()}
                    disabled={aiLoading}
                  >
                    {aiLoading ? 'AI 翻译中…' : '✨ AI 翻译'}
                  </button>
                )}
              </div>
              {showZh && (
                <div className="dict-zh-body">
                  {zhLoading && <p className="dict-loading">查询中文释义中…</p>}
                  {zhError && <p className="dict-error">{zhError}</p>}
                  {zhEntries.map((e, i) => (
                    <div key={i} className="dict-entry">
                      {e.partOfSpeech && <span className="dict-pos">{e.partOfSpeech}</span>}
                      <ol className="dict-defs">
                        {e.definitions.map((d, j) => (
                          <li key={j}>{d}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
              {aiZh && <p className="dict-ai-zh">{aiZh}</p>}
            </div>
          )}

          {!loading && entries.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={added}
              onClick={() => {
                addItem({
                  es: term,
                  zh: bestZh,
                  source: '词典',
                  kind: term.includes(' ') ? 'chunk' : 'word',
                });
                setAdded(true);
              }}
            >
              {added ? '✓ 已加入 SRS' : '＋ 加入记忆库'}
            </button>
          )}

          {term && (
          <div className="dict-sources">
            <span className="dict-sources-label">权威 / 国际来源：</span>
            <div className="dict-sources-list">
              {dictSources(term, language.id).map((s) => (
                <button key={s.url} type="button" className="dict-source-link" onClick={() => openExternal(s.url)}>
                  {s.label} ↗
                </button>
              ))}
            </div>
          </div>
          )}
          {term && <p className="dict-note">释义来自 Wiktionary（维基媒体基金会，CC BY-SA）。</p>}
        </div>
      </div>
    </div>
  );
}
