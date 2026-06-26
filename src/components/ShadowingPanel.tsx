import { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAudioDevices } from '../context/AudioDeviceContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { getSpeechRecognition } from '../utils/speech';
import { acquireMicrophone, releaseMicrophone } from '../utils/audioDevices';
import { scorePronunciation, scoreLabel } from '../utils/pronunciation';
import { analyzeWeakWords } from '../utils/syllables';
import { logActivity } from '../utils/activityLog';
import { getAppSetting, setAppSetting } from '../utils/appSettings';
import { startRecording, type ActiveRecording } from '../utils/recorder';
import { assessPronunciation, hasAzure, phonemeTone, type AzurePronResult } from '../utils/azurePron';

interface Props {
  open: boolean;
  onClose: () => void;
}

const PRESETS: { label: string; text: string }[] = [
  {
    label: '日常问候',
    text: 'Buenos días. ¿Qué tal estás? Yo estoy muy bien, gracias. Hoy hace un día estupendo. ¿Te apetece tomar un café?',
  },
  {
    label: '在餐厅',
    text: 'Buenas tardes. ¿Tienen mesa para dos? Quería ver la carta, por favor. De primero voy a tomar una ensalada. ¿Me trae la cuenta, por favor?',
  },
  {
    label: '介绍自己',
    text: 'Me llamo Ana y soy de Valencia. Trabajo como profesora en un instituto. En mi tiempo libre me gusta leer y pasear. Estoy aprendiendo idiomas porque me encanta viajar.',
  },
];

function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?。！？…])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function ShadowingPanel({ open, onClose }: Props) {
  const { language, speak } = useLanguage();
  const { inputDeviceId } = useAudioDevices();
  const { addItem } = useLanguageSRS();
  const SR = getSpeechRecognition();

  const [sourceText, setSourceText] = useState('');
  const [sentences, setSentences] = useState<string[]>([]);
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<'local' | 'azure'>(
    (getAppSetting('pronMode') as 'local' | 'azure') === 'azure' ? 'azure' : 'local',
  );
  const [recording, setRecording] = useState<ActiveRecording | null>(null);
  const [azureResult, setAzureResult] = useState<AzurePronResult | null>(null);
  const [azureLoading, setAzureLoading] = useState(false);

  const current = sentences[index] ?? '';

  const result = useMemo(
    () => (transcript && current ? scorePronunciation(transcript, current) : null),
    [transcript, current],
  );
  const weakWords = useMemo(() => {
    if (!result) return [];
    return analyzeWeakWords(result.words.filter((w) => w.status !== 'ok').map((w) => w.display));
  }, [result]);

  const avg = useMemo(() => {
    const vals = Object.values(scores);
    if (vals.length === 0) return 0;
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [scores]);

  if (!open) return null;

  const start = () => {
    const list = splitSentences(sourceText);
    if (list.length === 0) {
      setError('请先粘贴或选择一段文本。');
      return;
    }
    setSentences(list);
    setIndex(0);
    setScores({});
    setTranscript('');
    setError(null);
  };

  const reset = () => {
    setSentences([]);
    setTranscript('');
    setScores({});
    setIndex(0);
    setError(null);
  };

  const goTo = (i: number) => {
    if (i < 0 || i >= sentences.length) return;
    setIndex(i);
    setTranscript('');
    setAzureResult(null);
    setError(null);
  };

  const changeMode = (m: 'local' | 'azure') => {
    setMode(m);
    setAppSetting('pronMode', m);
    setTranscript('');
    setAzureResult(null);
  };

  const startAzure = async () => {
    setError(null);
    setAzureResult(null);
    try {
      const rec = await startRecording(inputDeviceId);
      setRecording(rec);
    } catch (e) {
      setError('无法开始录音：' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const stopAzure = async () => {
    if (!recording || !current) return;
    const rec = recording;
    setRecording(null);
    setAzureLoading(true);
    try {
      const wav = await rec.stop();
      const res = await assessPronunciation(current, wav, language.speechLang);
      setAzureResult(res);
      setScores((prev) => ({ ...prev, [index]: Math.round(res.pron) }));
      logActivity(language.storagePrefix);
    } catch (e) {
      setError('Azure 评测失败：' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setAzureLoading(false);
    }
  };

  const record = async () => {
    if (!SR) {
      setError('当前环境不支持语音识别，请允许麦克风权限或更换浏览器内核。');
      return;
    }
    try {
      await acquireMicrophone(inputDeviceId);
      releaseMicrophone();
    } catch {
      setError('无法访问麦克风，请在顶部「音频」检查输入设备与权限。');
      return;
    }
    const rec = new SR();
    rec.lang = language.speechLang;
    rec.continuous = true;
    rec.interimResults = true;
    setListening(true);
    setTranscript('');
    setError(null);
    let text = '';
    rec.onresult = (ev) => {
      text = '';
      for (let i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript + ' ';
      setTranscript(text.trim());
    };
    const finish = () => {
      setListening(false);
      releaseMicrophone();
    };
    rec.onerror = () => {
      finish();
      setError('录音出错，请重试。');
    };
    rec.onend = () => {
      finish();
      if (text.trim() && current) {
        const r = scorePronunciation(text.trim(), current);
        setScores((prev) => ({ ...prev, [index]: r.score }));
        logActivity(language.storagePrefix);
      }
    };
    rec.start();
    setTimeout(() => rec.stop(), 15000);
  };

  const label = result ? scoreLabel(result.score) : null;
  const allDone = sentences.length > 0 && Object.keys(scores).length >= sentences.length;

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div className="accum-panel accum-panel-wide shadow-panel" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="accum-header">
          <h2>🗣️ 影子跟读</h2>
          {sentences.length > 0 && (
            <span className="accum-count">
              第 {index + 1}/{sentences.length} 句 · 均分 {avg}
            </span>
          )}
          <button type="button" className="accum-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </header>

        <div className="shadow-body">
          {sentences.length === 0 ? (
            <div className="shadow-setup">
              <p className="accum-tip">
                影子跟读：听一句、立刻模仿跟读一句，逐句打分。可粘贴任意{language.label}文本，或选下面的范例（半岛西语风格）。
              </p>
              <div className="shadow-presets">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    className="shadow-preset"
                    onClick={() => setSourceText(p.text)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <textarea
                className="shadow-input"
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder={`粘贴一段${language.label}文本（句子会自动切分逐句跟读）…`}
                rows={5}
              />
              {error && <p className="aitutor-error">{error}</p>}
              <button type="button" className="btn btn-primary" onClick={start}>
                开始跟读 →
              </button>
            </div>
          ) : (
            <div className="shadow-practice">
              <div className="pron-mode-bar">
                <span className="pron-mode-title">评测模式</span>
                <div className="pron-mode-switch">
                  <button
                    type="button"
                    className={`pron-mode-btn ${mode === 'local' ? 'active' : ''}`}
                    onClick={() => changeMode('local')}
                  >
                    本地
                  </button>
                  <button
                    type="button"
                    className={`pron-mode-btn ${mode === 'azure' ? 'active' : ''}`}
                    onClick={() => changeMode('azure')}
                  >
                    Azure 音素级
                  </button>
                </div>
                {mode === 'azure' && !hasAzure() && (
                  <span className="warn">未配置 Azure，请在课程「口语练习」步骤的 ⚙ 里设置 Key 与区域。</span>
                )}
              </div>
              <div className="shadow-progress-row">
                {sentences.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`shadow-dot ${i === index ? 'active' : ''} ${
                      scores[i] != null ? (scores[i] >= 70 ? 'good' : 'mid') : ''
                    }`}
                    onClick={() => goTo(i)}
                    title={scores[i] != null ? `第 ${i + 1} 句：${scores[i]} 分` : `第 ${i + 1} 句`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <div className="shadow-sentence-box">
                <p className="shadow-sentence">
                  {result
                    ? result.words.map((w, i) => (
                        <span key={i} className={`pron-word pron-word-${w.status}`}>
                          {w.display}{' '}
                        </span>
                      ))
                    : current}
                </p>
                <div className="shadow-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => speak(current, 0.95)}>
                    🔊 听一遍
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => speak(current, 0.7)}>
                    🐢 慢速
                  </button>
                  {mode === 'local' ? (
                    <button type="button" className="btn btn-primary" onClick={() => void record()} disabled={listening}>
                      {listening ? '录音中…' : '🎤 跟读'}
                    </button>
                  ) : recording ? (
                    <button type="button" className="btn btn-primary" onClick={() => void stopAzure()}>
                      ⏺ 停止并评测
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => void startAzure()}
                      disabled={azureLoading || !hasAzure()}
                    >
                      {azureLoading ? 'Azure 评测中…' : '🎤 跟读'}
                    </button>
                  )}
                </div>
              </div>

              {mode === 'local' && result && label && (
                <div className="pron-result">
                  <div className={`pron-score pron-${label.tone}`}>
                    <span className="pron-score-num">{result.score}</span>
                    <span className="pron-score-max">/100</span>
                    <span className="pron-score-label">{label.text}</span>
                  </div>
                  <div className="result-box">
                    <span className="result-label">识别到</span>
                    <p>{transcript}</p>
                  </div>
                  {weakWords.length > 0 && (
                    <div className="syll-box">
                      <p className="syll-title">🔍 重点音节与提示</p>
                      {weakWords.map((w) => (
                        <div key={w.word} className="syll-word">
                          <p className="syll-syllables">
                            {w.word}
                            <span className="syll-split"> ({w.syllables.join(' · ')})</span>
                          </p>
                          {w.tips.length > 0 && (
                            <ul className="syll-tips">
                              {w.tips.map((t, k) => (
                                <li key={k}>{t}</li>
                              ))}
                            </ul>
                          )}
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() =>
                              addItem({
                                es: w.word,
                                zh: '跟读难点',
                                source: '影子跟读',
                                kind: 'word',
                              })
                            }
                          >
                            ＋ 加入 SRS
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {mode === 'azure' && azureResult && (
                <div className="pron-result">
                  <div className={`pron-score pron-${phonemeTone(azureResult.pron)}`}>
                    <span className="pron-score-num">{Math.round(azureResult.pron)}</span>
                    <span className="pron-score-max">/100</span>
                    <span className="pron-score-label">综合发音分</span>
                  </div>
                  <div className="azure-subscores">
                    <span>准确度 {Math.round(azureResult.accuracy)}</span>
                    <span>流利度 {Math.round(azureResult.fluency)}</span>
                    <span>完整度 {Math.round(azureResult.completeness)}</span>
                  </div>
                  <div className="azure-words">
                    {azureResult.words.map((w, i) => {
                      const weak = w.score < 60 || (!!w.errorType && w.errorType !== 'None');
                      return (
                        <div key={i} className={`azure-word ${weak ? 'azure-word-err' : ''}`}>
                          <div className="azure-word-head">
                            <span className="azure-word-text">{w.word}</span>
                            <span className={`azure-word-score pron-${phonemeTone(w.score)}`}>
                              {Math.round(w.score)}
                            </span>
                            {weak && /\p{L}/u.test(w.word) && (
                              <button
                                type="button"
                                className="azure-word-add"
                                title="加入 SRS"
                                onClick={() =>
                                  addItem({
                                    es: w.word,
                                    zh: `发音难点（${Math.round(w.score)}分）`,
                                    source: '影子跟读·Azure',
                                    kind: 'word',
                                  })
                                }
                              >
                                ＋
                              </button>
                            )}
                          </div>
                          {w.phonemes.length > 0 && (
                            <div className="azure-phonemes">
                              {w.phonemes.map((p, j) => (
                                <span
                                  key={j}
                                  className={`azure-phoneme pron-${phonemeTone(p.score)}`}
                                  title={`${Math.round(p.score)}`}
                                >
                                  {p.phoneme}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {azureResult.words.some((w) => w.score < 60 || (w.errorType && w.errorType !== 'None')) && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        azureResult.words
                          .filter((w) => (w.score < 60 || (w.errorType && w.errorType !== 'None')) && /\p{L}/u.test(w.word))
                          .forEach((w) =>
                            addItem({
                              es: w.word,
                              zh: `发音难点（${Math.round(w.score)}分）`,
                              source: '影子跟读·Azure',
                              kind: 'word',
                            }),
                          );
                      }}
                    >
                      ＋ 全部难点词入 SRS
                    </button>
                  )}
                  <p className="pron-legend">音素颜色：绿≥80 · 黄60-79 · 红&lt;60，点住看分数。红框词可单独或一键加入 SRS。</p>
                </div>
              )}

              {error && <p className="aitutor-error">{error}</p>}

              <div className="shadow-nav">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => goTo(index - 1)}
                  disabled={index === 0}
                >
                  ← 上一句
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>
                  ↺ 换文本
                </button>
                {index < sentences.length - 1 ? (
                  <button type="button" className="btn btn-primary" onClick={() => goTo(index + 1)}>
                    下一句 →
                  </button>
                ) : (
                  <span className="shadow-final">
                    {allDone ? `🎉 全部完成！平均 ${avg} 分` : '已是最后一句'}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
