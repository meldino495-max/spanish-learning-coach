import { useState } from 'react';
import type { Step } from '../types';
import { getSpeechRecognition } from '../utils/speech';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

/** 费曼学习法：用自己的话解释语法 */
export function FeynmanStep({ step, done, onToggle }: Props) {
  const [explanation, setExplanation] = useState('');
  const [spoken, setSpoken] = useState('');
  const SR = getSpeechRecognition();

  const startExplain = () => {
    if (!SR) {
      setSpoken('（浏览器不支持语音识别，请口头解释后文字写下）');
      return;
    }
    const rec = new SR();
    rec.lang = 'zh-CN';
    rec.continuous = true;
    rec.interimResults = true;
    let text = '';
    rec.onresult = (ev) => {
      for (let i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript;
      setSpoken(text.trim());
    };
    rec.start();
    setTimeout(() => rec.stop(), 60000);
  };

  const canComplete = explanation.trim().length >= 30 || spoken.trim().length >= 20;

  return (
    <div className="step-body">
      <p className="step-instructions">
        {step.instructions ??
          '费曼学习法：假装教一个完全不懂的人。用中文讲明白「为什么这样说」，不要只背规则。'}
      </p>
      <div className="method-badge">🧠 费曼学习法 · 能讲明白 = 真懂了</div>
      <div className="feynman-prompt">
        <strong>解释这个问题：</strong>
        <p>{step.feynmanPrompt}</p>
        {step.feynmanHint && <p className="feynman-hint">提示：{step.feynmanHint}</p>}
      </div>
      <textarea
        className="dictation-input"
        rows={5}
        placeholder="用中文写下你的解释（至少 30 字）…"
        value={explanation}
        onChange={(e) => setExplanation(e.target.value)}
      />
      <div className="step-actions">
        <button type="button" className="btn btn-secondary" onClick={startExplain}>
          🎤 口头解释（中文，录音）
        </button>
      </div>
      {spoken && (
        <div className="result-box">
          <span className="result-label">语音识别</span>
          <p>{spoken}</p>
        </div>
      )}
      <div className="step-actions">
        <button
          type="button"
          className="btn btn-primary"
          disabled={!canComplete}
          onClick={() => onToggle()}
        >
          我讲得明白，标记完成
        </button>
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '跳过'}
        </button>
      </div>
    </div>
  );
}
