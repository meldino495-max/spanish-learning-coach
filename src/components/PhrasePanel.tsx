import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAudioDevices } from '../context/AudioDeviceContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { getPhrasePacks } from '../data/phrases/essentialPhrases';
import { logActivity } from '../utils/activityLog';
import { startVoiceClip, clipSupported, type ActiveClip } from '../utils/voiceClip';
import {
  loadLearnedPhrases,
  saveLearnedPhrases,
  bumpPhraseDaily,
} from '../utils/phraseProgress';

interface Props {
  open: boolean;
  onClose: () => void;
}

const phraseKey = (es: string) => es.trim().toLowerCase();

export function PhrasePanel({ open, onClose }: Props) {
  const { language, languageId, pack, speak } = useLanguage();
  const { inputDeviceId } = useAudioDevices();
  const { addItem } = useLanguageSRS();

  const packs = useMemo(() => getPhrasePacks(languageId, pack), [languageId, pack]);
  const [selectedId, setSelectedId] = useState(packs[0]?.id ?? '');
  const selected = packs.find((p) => p.id === selectedId) ?? packs[0];

  const [learned, setLearned] = useState<Set<string>>(() => loadLearnedPhrases(language.storagePrefix));
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [clips, setClips] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const clipRef = useRef<ActiveClip | null>(null);

  useEffect(() => {
    setLearned(loadLearnedPhrases(language.storagePrefix));
    setSelectedId(packs[0]?.id ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language.storagePrefix]);

  // 切换语言/关闭时清理录音剪辑
  useEffect(() => {
    return () => {
      Object.values(clips).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageId]);

  if (!open) return null;
  if (!selected) {
    return (
      <div className="accum-overlay" onClick={onClose} role="presentation">
        <div className="accum-panel" onClick={(e) => e.stopPropagation()} role="dialog">
          <header className="accum-header">
            <h2>🗣️ 开口短句</h2>
            <button type="button" className="accum-close" onClick={onClose} aria-label="关闭">
              ✕
            </button>
          </header>
          <div className="shadow-body">
            <p className="accum-tip">该语言暂无短句包，可在「🗣️ 跟读」里粘贴任意文本练习。</p>
          </div>
        </div>
      </div>
    );
  }

  const learnedInPack = selected.phrases.filter((p) => learned.has(phraseKey(p.es))).length;

  const toggleLearned = (es: string) => {
    const k = phraseKey(es);
    setLearned((prev) => {
      const next = new Set(prev);
      if (next.has(k)) {
        next.delete(k);
      } else {
        next.add(k);
        bumpPhraseDaily(language.storagePrefix);
        logActivity(language.storagePrefix);
      }
      saveLearnedPhrases(language.storagePrefix, next);
      return next;
    });
  };

  const startRec = async (es: string) => {
    setError(null);
    const k = phraseKey(es);
    try {
      const clip = await startVoiceClip(inputDeviceId);
      clipRef.current = clip;
      setRecordingKey(k);
    } catch (e) {
      setError('无法开始录音：' + (e instanceof Error ? e.message : String(e)) + '（可在顶部「音频」检查麦克风）');
    }
  };

  const stopRec = async (es: string) => {
    const clip = clipRef.current;
    if (!clip) return;
    clipRef.current = null;
    setRecordingKey(null);
    try {
      const url = await clip.stop();
      const k = phraseKey(es);
      setClips((prev) => {
        if (prev[k]) URL.revokeObjectURL(prev[k]);
        return { ...prev, [k]: url };
      });
      logActivity(language.storagePrefix);
    } catch (e) {
      setError('录音失败：' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const playClip = (es: string) => {
    const url = clips[phraseKey(es)];
    if (!url) return;
    const audio = new Audio(url);
    void audio.play().catch(() => setError('无法回放录音。'));
  };

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div
        className="accum-panel accum-panel-wide phrase-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className="accum-header">
          <h2>🗣️ 开口短句</h2>
          <span className="accum-count">
            {selected.title} · 学过 {learnedInPack}/{selected.phrases.length}
          </span>
          <button type="button" className="accum-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </header>

        <div className="phrase-body">
          <div className="phrase-method">
            <strong>Kazu 学习法 · 第一步</strong>
            <span>
              先别背单词 → 听母语者发音 🔊 → 张口模仿 → 录下自己 🎤 → 和原音 A/B 对比 → 顺口了就标「✓ 学过」并加入记忆库。
            </span>
          </div>

          <div className="phrase-packs">
            {packs.map((p) => {
              const done = p.phrases.filter((x) => learned.has(phraseKey(x.es))).length;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`phrase-pack-chip ${p.id === selected.id ? 'active' : ''} ${
                    p.essential ? 'essential' : ''
                  }`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <span>{p.icon} {p.title}</span>
                  <span className="phrase-pack-count">{done}/{p.phrases.length}</span>
                </button>
              );
            })}
          </div>

          {selected.intro && <p className="phrase-intro">💡 {selected.intro}</p>}
          {error && <p className="aitutor-error">{error}</p>}
          {!clipSupported() && (
            <p className="phrase-warn">当前环境不支持录音回放，但仍可听原音、模仿与加入记忆库。</p>
          )}

          <ul className="phrase-list">
            {selected.phrases.map((p) => {
              const k = phraseKey(p.es);
              const isRec = recordingKey === k;
              const hasClip = !!clips[k];
              const isLearned = learned.has(k);
              return (
                <li key={k} className={`phrase-card ${isLearned ? 'learned' : ''}`}>
                  <div className="phrase-main">
                    <p className="phrase-es">{p.es}</p>
                    <p className="phrase-zh">{p.zh}</p>
                    {(p.note || p.chunkLabel) && (
                      <p className="phrase-note">
                        {p.chunkLabel && <span className="phrase-tag">{p.chunkLabel}</span>}
                        {p.note}
                      </p>
                    )}
                  </div>
                  <div className="phrase-actions">
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => speak(p.es, 0.95)}>
                      🔊 原音
                    </button>
                    <button type="button" className="btn btn-secondary btn-xs" onClick={() => speak(p.es, 0.6)}>
                      🐢 慢速
                    </button>
                    {clipSupported() &&
                      (isRec ? (
                        <button type="button" className="btn btn-primary btn-xs" onClick={() => void stopRec(p.es)}>
                          ⏺ 停止
                        </button>
                      ) : (
                        <button type="button" className="btn btn-secondary btn-xs" onClick={() => void startRec(p.es)}>
                          🎤 模仿
                        </button>
                      ))}
                    {hasClip && (
                      <button type="button" className="btn btn-secondary btn-xs" onClick={() => playClip(p.es)}>
                        ▶ 我的
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary btn-xs"
                      onClick={() =>
                        addItem({ es: p.es, zh: p.zh, note: p.note, source: '开口短句', kind: 'chunk' })
                      }
                      title="加入间隔重复记忆库"
                    >
                      ＋ 记忆库
                    </button>
                    <button
                      type="button"
                      className={`btn btn-xs phrase-learn-btn ${isLearned ? 'on' : ''}`}
                      onClick={() => toggleLearned(p.es)}
                    >
                      {isLearned ? '✓ 学过' : '标为学过'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="phrase-footer">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() =>
                addItem &&
                selected.phrases.forEach((p) =>
                  addItem({ es: p.es, zh: p.zh, note: p.note, source: '开口短句', kind: 'chunk' }),
                )
              }
            >
              ＋ 本组全部加入记忆库
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
