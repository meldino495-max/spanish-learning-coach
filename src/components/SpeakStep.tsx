import { useMemo, useState } from 'react';
import type { Step } from '../types';
import { getSpeechRecognition } from '../utils/speech';
import { scorePronunciation, scoreLabel } from '../utils/pronunciation';
import { analyzeWeakWords } from '../utils/syllables';
import { acquireMicrophone, releaseMicrophone } from '../utils/audioDevices';
import { useLanguage } from '../context/LanguageContext';
import { useAudioDevices } from '../context/AudioDeviceContext';
import { chatCompletion, hasOpenAIKey } from '../utils/openaiClient';
import { getAppSetting, setAppSetting } from '../utils/appSettings';
import { startRecording, type ActiveRecording } from '../utils/recorder';
import {
  assessPronunciation,
  getAzureConfig,
  saveAzureConfig,
  hasAzure,
  phonemeTone,
  type AzurePronResult,
} from '../utils/azurePron';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

type PronMode = 'local' | 'azure';

export function SpeakStep({ step, done, onToggle }: Props) {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { language, speak } = useLanguage();
  const { inputDeviceId } = useAudioDevices();
  const SR = getSpeechRecognition();

  const [mode, setMode] = useState<PronMode>(
    (getAppSetting('pronMode') as PronMode) === 'azure' ? 'azure' : 'local',
  );
  const [showAzureSettings, setShowAzureSettings] = useState(false);
  const [azureKeyInput, setAzureKeyInput] = useState(getAzureConfig().key);
  const [azureRegionInput, setAzureRegionInput] = useState(getAzureConfig().region);
  const [recording, setRecording] = useState<ActiveRecording | null>(null);
  const [azureResult, setAzureResult] = useState<AzurePronResult | null>(null);
  const [azureLoading, setAzureLoading] = useState(false);
  const [azureError, setAzureError] = useState<string | null>(null);

  const result = useMemo(
    () => (transcript && step.speakPrompt ? scorePronunciation(transcript, step.speakPrompt) : null),
    [transcript, step.speakPrompt],
  );

  const weakWords = useMemo(() => {
    if (!result) return [];
    const weak = result.words.filter((w) => w.status !== 'ok').map((w) => w.display);
    return analyzeWeakWords(weak);
  }, [result]);

  const changeMode = (m: PronMode) => {
    setMode(m);
    setAppSetting('pronMode', m);
    if (m === 'azure' && !hasAzure()) setShowAzureSettings(true);
  };

  const saveAzure = () => {
    saveAzureConfig({ key: azureKeyInput, region: azureRegionInput });
    if (azureKeyInput.trim() && azureRegionInput.trim()) setShowAzureSettings(false);
  };

  const startListen = async () => {
    if (!SR) {
      setFeedback('你的浏览器不支持语音识别。请允许麦克风权限。');
      return;
    }
    try {
      await acquireMicrophone(inputDeviceId);
      releaseMicrophone();
    } catch {
      setFeedback('无法访问所选麦克风，请检查权限或在顶部「音频」中更换输入设备。');
      return;
    }

    const rec = new SR();
    rec.lang = language.speechLang;
    rec.continuous = true;
    rec.interimResults = true;
    setListening(true);
    setFeedback(null);
    setAiFeedback(null);
    setTranscript('');
    let text = '';
    rec.onresult = (ev) => {
      text = '';
      for (let i = 0; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript + ' ';
      }
      setTranscript(text.trim());
    };
    const finish = () => {
      setListening(false);
      releaseMicrophone();
    };
    rec.onerror = () => {
      finish();
      setFeedback('录音出错，请检查麦克风权限后重试。');
    };
    rec.onend = () => {
      finish();
      if (text.trim() && step.speakPrompt) {
        const r = scorePronunciation(text.trim(), step.speakPrompt);
        if (r.score >= 70 && !done) onToggle();
      }
    };
    rec.start();
    setTimeout(() => rec.stop(), 30000);
  };

  const startAzure = async () => {
    setAzureError(null);
    setAzureResult(null);
    try {
      const rec = await startRecording(inputDeviceId);
      setRecording(rec);
    } catch (e) {
      setAzureError('无法开始录音：' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const stopAzure = async () => {
    if (!recording || !step.speakPrompt) return;
    const rec = recording;
    setRecording(null);
    setAzureLoading(true);
    try {
      const wav = await rec.stop();
      const res = await assessPronunciation(step.speakPrompt, wav, language.speechLang);
      setAzureResult(res);
      if (res.pron >= 70 && !done) onToggle();
    } catch (e) {
      setAzureError('Azure 评测失败：' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setAzureLoading(false);
    }
  };

  const askAI = async () => {
    if (!step.speakPrompt || !transcript) return;
    setAiLoading(true);
    setAiFeedback(null);
    try {
      const content = await chatCompletion(
        [
          {
            role: 'system',
            content: `你是一位${language.label}（${language.nativeName}）发音教练。学习者朗读了一句话，下面给出目标句和语音识别听到的内容。请用简体中文做音素级点评：1) 逐一指出最可能读错的「词→具体音素」（结合${language.nativeName}音系，如大舌颤音 rr、单击 r、c/z 的 /θ/、j 与 ge/gi 的 /x/、ll/y、ñ、b/v、重音位置等）；2) 给出针对这些音素的 2~3 条可操作练习建议。不超过 150 字，不要用 JSON。`,
          },
          {
            role: 'user',
            content: `目标句：${step.speakPrompt}\n识别听到：${transcript}`,
          },
        ],
        { temperature: 0.4 },
      );
      setAiFeedback(content.trim());
    } catch (e) {
      setAiFeedback('AI 点评失败：' + (e instanceof Error ? e.message : String(e)) + '（可在「🤖 陪练」中设置 API Key）');
    } finally {
      setAiLoading(false);
    }
  };

  const label = result ? scoreLabel(result.score) : null;
  const azureLabel = azureResult ? scoreLabel(Math.round(azureResult.pron)) : null;

  return (
    <div className="step-body">
      <p className="step-instructions">{step.instructions}</p>

      <div className="pron-mode-bar">
        <span className="pron-mode-title">评测模式</span>
        <div className="pron-mode-switch">
          <button
            type="button"
            className={`pron-mode-btn ${mode === 'local' ? 'active' : ''}`}
            onClick={() => changeMode('local')}
          >
            本地 + AI
          </button>
          <button
            type="button"
            className={`pron-mode-btn ${mode === 'azure' ? 'active' : ''}`}
            onClick={() => changeMode('azure')}
          >
            Azure 音素级
          </button>
        </div>
        {mode === 'azure' && (
          <button
            type="button"
            className="btn-icon"
            title="设置 Azure Key / 区域"
            onClick={() => setShowAzureSettings((v) => !v)}
          >
            ⚙
          </button>
        )}
      </div>

      {mode === 'azure' && showAzureSettings && (
        <div className="azure-settings">
          <p className="prompt-hint">
            使用 <strong>Azure 语音服务</strong>的「发音评测」，可给出音素级准确度。需要你自己的 Key 与区域，仅存本机。
            在 Azure 门户创建「语音服务（Speech）」资源后获取。
          </p>
          <label className="aitutor-field">
            <span>Azure 语音 Key</span>
            <input
              type="password"
              value={azureKeyInput}
              onChange={(e) => setAzureKeyInput(e.target.value)}
              placeholder="订阅密钥"
              autoComplete="off"
            />
          </label>
          <label className="aitutor-field">
            <span>区域（Region）</span>
            <input
              type="text"
              value={azureRegionInput}
              onChange={(e) => setAzureRegionInput(e.target.value)}
              placeholder="如 eastus、westeurope"
            />
          </label>
          <button type="button" className="btn btn-primary btn-sm" onClick={saveAzure}>
            保存
          </button>
        </div>
      )}

      <div className="prompt-box">
        <span className="prompt-label">🎤 参考句 / 话题</span>
        <p className="prompt-text">{step.speakPrompt}</p>
        {step.speakHint && <p className="prompt-hint">提示：{step.speakHint}</p>}
        {step.speakPrompt && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => step.speakPrompt && speak(step.speakPrompt, 0.9)}
          >
            🔊 听参考发音
          </button>
        )}
      </div>

      {mode === 'local' ? (
        <div className="step-actions">
          <button type="button" className="btn btn-primary" onClick={() => void startListen()} disabled={listening}>
            {listening ? '录音中…（最长 30 秒）' : transcript ? '再录一次' : '开始录音'}
          </button>
          <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
            {done ? '✓ 已完成' : '手动标记完成'}
          </button>
        </div>
      ) : (
        <div className="step-actions">
          {recording ? (
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
              {azureLoading ? 'Azure 评测中…' : azureResult ? '再录一次' : '开始录音'}
            </button>
          )}
          <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
            {done ? '✓ 已完成' : '手动标记完成'}
          </button>
          {!hasAzure() && <span className="warn">请先在上方 ⚙ 设置 Azure Key 与区域。</span>}
        </div>
      )}

      {mode === 'local' && result && label && (
        <div className="pron-result">
          <div className={`pron-score pron-${label.tone}`}>
            <span className="pron-score-num">{result.score}</span>
            <span className="pron-score-max">/100</span>
            <span className="pron-score-label">{label.text}</span>
          </div>
          <p className="pron-sentence">
            {result.words.map((w, i) => (
              <span key={i} className={`pron-word pron-word-${w.status}`}>
                {w.display}{' '}
              </span>
            ))}
          </p>
          <p className="pron-legend">
            <span className="pron-word pron-word-ok">绿=准确</span>{' '}
            <span className="pron-word pron-word-near">黄=接近</span>{' '}
            <span className="pron-word pron-word-missing">红=未识别/漏读</span>
          </p>
          <div className="result-box">
            <span className="result-label">识别到</span>
            <p>
              {transcript}
              {result.extra.length > 0 && (
                <span className="pron-extra">（多出：{result.extra.join(' ')}）</span>
              )}
            </p>
          </div>

          {weakWords.length > 0 && (
            <div className="syll-box">
              <p className="syll-title">🔍 重点音节与发音提示</p>
              {weakWords.map((w) => (
                <div key={w.word} className="syll-word">
                  <p className="syll-syllables">
                    {w.word}
                    <span className="syll-split">
                      {' '}
                      ({w.syllables.join(' · ')})
                    </span>
                  </p>
                  {w.tips.length > 0 ? (
                    <ul className="syll-tips">
                      {w.tips.map((t, k) => (
                        <li key={k}>{t}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="syll-tips-empty">放慢逐音节朗读，对照参考发音多跟读几遍。</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasOpenAIKey() && (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => void askAI()} disabled={aiLoading}>
              {aiLoading ? 'AI 点评中…' : '🤖 AI 音素点评'}
            </button>
          )}
          {aiFeedback && <p className="pron-ai-feedback">{aiFeedback}</p>}
        </div>
      )}

      {mode === 'azure' && azureResult && azureLabel && (
        <div className="pron-result">
          <div className={`pron-score pron-${azureLabel.tone}`}>
            <span className="pron-score-num">{Math.round(azureResult.pron)}</span>
            <span className="pron-score-max">/100</span>
            <span className="pron-score-label">综合发音分</span>
          </div>
          <div className="azure-subscores">
            <span>准确度 {Math.round(azureResult.accuracy)}</span>
            <span>流利度 {Math.round(azureResult.fluency)}</span>
            <span>完整度 {Math.round(azureResult.completeness)}</span>
          </div>
          {azureResult.recognized && (
            <div className="result-box">
              <span className="result-label">识别到</span>
              <p>{azureResult.recognized}</p>
            </div>
          )}
          <div className="azure-words">
            {azureResult.words.map((w, i) => (
              <div key={i} className={`azure-word ${w.errorType && w.errorType !== 'None' ? 'azure-word-err' : ''}`}>
                <div className="azure-word-head">
                  <span className="azure-word-text">{w.word}</span>
                  <span className={`azure-word-score pron-${phonemeTone(w.score)}`}>{Math.round(w.score)}</span>
                  {w.errorType && w.errorType !== 'None' && (
                    <span className="azure-word-tag">
                      {w.errorType === 'Mispronunciation'
                        ? '读错'
                        : w.errorType === 'Omission'
                          ? '漏读'
                          : w.errorType === 'Insertion'
                            ? '多读'
                            : w.errorType}
                    </span>
                  )}
                </div>
                {w.phonemes.length > 0 && (
                  <div className="azure-phonemes">
                    {w.phonemes.map((p, j) => (
                      <span key={j} className={`azure-phoneme pron-${phonemeTone(p.score)}`} title={`${Math.round(p.score)}`}>
                        {p.phoneme}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="pron-legend">音素颜色：绿≥80 · 黄60-79 · 红&lt;60，点住可看分数。</p>
        </div>
      )}

      {azureError && <p className="feedback">{azureError}</p>}
      {feedback && <p className="feedback">{feedback}</p>}
      {mode === 'local' && !SR && <p className="warn">若无法录音，请在顶部「音频」中检查麦克风设备与权限。</p>}
    </div>
  );
}
