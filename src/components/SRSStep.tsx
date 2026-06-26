import { useState } from 'react';
import type { Step } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import type { SRSRating } from '../hooks/srsCore';
import { SRS_INTERVALS_DAYS } from '../hooks/srsCore';

interface Props {
  step: Step;
  done: boolean;
  onToggle: () => void;
}

/** 间隔重复复习（艾宾浩斯：1/3/7/14/30 天） */
export function SRSStep({ step, done, onToggle }: Props) {
  const { speak } = useLanguage();
  const { dueItems, rateItem, items } = useLanguageSRS();
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const queue = dueItems.length > 0 ? dueItems : items.slice(0, 5);
  const card = queue[idx];

  const rate = (rating: SRSRating) => {
    if (card) rateItem(card.id, rating);
    setRevealed(false);
    if (idx < queue.length - 1) setIdx((i) => i + 1);
    else onToggle();
  };

  if (!card) {
    return (
      <div className="step-body">
        <p className="step-instructions">
          暂无到期复习。请先在「语块学习」步骤把句子加入 SRS。间隔：第{' '}
          {SRS_INTERVALS_DAYS.join('/')} 天。
        </p>
        <button type="button" className={`btn ${done ? 'btn-done' : 'btn-secondary'}`} onClick={onToggle}>
          {done ? '✓ 已完成' : '标记完成'}
        </button>
      </div>
    );
  }

  return (
    <div className="step-body">
      <p className="step-instructions">
        {step.instructions ??
          '间隔重复：在「快忘」时复习，效率远高于死背。看西语 → 想意思 → 翻转 → 自评。'}
      </p>
      <div className="method-badge">
        🔁 SRS · 到期 {dueItems.length} 条 · 进度 {idx + 1}/{queue.length}
      </div>
      <div className="srs-card" onClick={() => setRevealed((r) => !r)} role="button" tabIndex={0}>
        <p className="srs-es">{card.es}</p>
        {revealed ? (
          <p className="srs-zh">{card.zh}</p>
        ) : (
          <p className="srs-tap">点击显示中文</p>
        )}
        {card.note && revealed && <p className="srs-note">{card.note}</p>}
        <button
          type="button"
          className="btn-icon srs-speak"
          onClick={(e) => {
            e.stopPropagation();
            speak(card.es);
          }}
        >
          🔊
        </button>
      </div>
      {revealed && (
        <div className="srs-rating">
          <button type="button" className="btn srs-again" onClick={() => rate('again')}>
            忘了 · 1 天后
          </button>
          <button type="button" className="btn srs-hard" onClick={() => rate('hard')}>
            模糊
          </button>
          <button type="button" className="btn srs-good" onClick={() => rate('good')}>
            记得 · 下次延长
          </button>
          <button type="button" className="btn srs-easy" onClick={() => rate('easy')}>
            简单 · 跳级
          </button>
        </div>
      )}
    </div>
  );
}
