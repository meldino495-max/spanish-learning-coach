import { useState } from 'react';
import type { Step } from '../types';
import { getSpeechRecognition, textsMatch } from '../utils/speech';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

export function SpeakStep({ step, done, onToggle }: Props) {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const SR = getSpeechRecognition();

  const startListen = () => {
    if (!SR) {
      setFeedback('你的浏览器不支持语音识别。请用 Edge 或 Chrome，并允许麦克风权限。');
      return;
    }
    const rec = new SR();
    rec.lang = 'es-ES';
    rec.continuous = true;
    rec.interimResults = true;
    setListening(true);
    setFeedback(null);
    let text = '';
    rec.onresult = (ev) => {
      for (let i = 0; i < ev.results.length; i++) {
        text += ev.results[i][0].transcript + ' ';
      }
      setTranscript(text.trim());
    };
    rec.onerror = () => {
      setListening(false);
      setFeedback('录音出错，请检查麦克风权限后重试。');
    };
    rec.onend = () => setListening(false);
    rec.start();
    setTimeout(() => rec.stop(), 30000);
  };

  const check = () => {
    if (!step.speakPrompt) return;
    const ok = textsMatch(transcript, step.speakPrompt);
    setFeedback(
      ok
        ? '很好！内容匹配。发音可以回听录音继续改进。'
        : '已记录你的口语。不必完全一致，但尽量覆盖关键词。可对照参考句再练一次。',
    );
    if (ok) onToggle();
  };

  return (
    <div className="step-body">
      <p className="step-instructions">{step.instructions}</p>
      <div className="prompt-box">
        <span className="prompt-label">🎤 参考句 / 话题</span>
        <p className="prompt-text">{step.speakPrompt}</p>
        {step.speakHint && <p className="prompt-hint">提示：{step.speakHint}</p>}
      </div>
      <div className="step-actions">
        <button type="button" className="btn btn-primary" onClick={startListen} disabled={listening}>
          {listening ? '录音中…（最长 30 秒）' : '开始录音'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={check} disabled={!transcript}>
          核对内容
        </button>
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '手动标记完成'}
        </button>
      </div>
      {transcript && (
        <div className="result-box">
          <span className="result-label">识别结果</span>
          <p>{transcript}</p>
        </div>
      )}
      {feedback && <p className="feedback">{feedback}</p>}
      {!SR && (
        <p className="warn">推荐浏览器：Microsoft Edge（Windows 自带，西语识别较好）</p>
      )}
    </div>
  );
}
