import { useEffect, useState } from 'react';
import { speakSpanish } from '../utils/speech';
import { useSRS } from '../hooks/useSRS';
import type { SRSRating } from '../hooks/srsCore';
import { SRS_INTERVALS_DAYS } from '../hooks/srsCore';

interface Props {
  open: boolean;
  onClose: () => void;
  startReview?: boolean;
}

export function AccumulationPanel({ open, onClose, startReview }: Props) {
  const { items, dueItems, rateItem, removeItem, clearAll } = useSRS();
  const [reviewMode, setReviewMode] = useState(false);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (open && startReview && dueItems.length > 0) {
      setReviewMode(true);
      setIdx(0);
      setRevealed(false);
    }
  }, [open, startReview, dueItems.length]);

  if (!open) return null;

  const queue = dueItems.length > 0 ? dueItems : items;
  const card = reviewMode ? queue[idx] : null;

  const start = () => {
    setReviewMode(true);
    setIdx(0);
    setRevealed(false);
  };

  const rate = (rating: SRSRating) => {
    if (card) rateItem(card.id, rating);
    setRevealed(false);
    if (idx < queue.length - 1) setIdx((i) => i + 1);
    else setReviewMode(false);
  };

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div className="accum-panel accum-panel-wide" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="accum-header">
          <h2>🔁 间隔重复库（SRS）</h2>
          <span className="accum-count">
            {items.length} 条 · 到期 {dueItems.length}
          </span>
          <button type="button" className="accum-close" onClick={onClose}>
            ✕
          </button>
        </header>

        {reviewMode && card ? (
          <div className="srs-review-mode">
            <p className="accum-tip">
              复习 {idx + 1}/{queue.length} · 间隔：{SRS_INTERVALS_DAYS.join('/')} 天
            </p>
            <div className="srs-card" onClick={() => setRevealed((r) => !r)} role="button" tabIndex={0}>
              <span className="srs-kind">{card.kind === 'chunk' ? '语块' : card.kind === 'scenario' ? '场景' : '词条'}</span>
              <p className="srs-es">{card.es}</p>
              {revealed ? <p className="srs-zh">{card.zh}</p> : <p className="srs-tap">点击显示中文</p>}
              <button
                type="button"
                className="btn-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  speakSpanish(card.es);
                }}
              >
                🔊
              </button>
            </div>
            {revealed && (
              <div className="srs-rating">
                <button type="button" className="btn srs-again" onClick={() => rate('again')}>
                  忘了
                </button>
                <button type="button" className="btn srs-hard" onClick={() => rate('hard')}>
                  模糊
                </button>
                <button type="button" className="btn srs-good" onClick={() => rate('good')}>
                  记得
                </button>
                <button type="button" className="btn srs-easy" onClick={() => rate('easy')}>
                  简单
                </button>
              </div>
            )}
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReviewMode(false)}>
              退出复习
            </button>
          </div>
        ) : (
          <>
            <p className="accum-tip">
              背<strong>整句语块</strong>，不背孤立单词。在「语块学习」加入后，系统会在第 1/3/7/14/30 天提醒复习。
            </p>
            {dueItems.length > 0 && (
              <button type="button" className="btn btn-primary accum-start-review" onClick={start}>
                开始复习到期 {dueItems.length} 条
              </button>
            )}
            {items.length === 0 ? (
              <p className="accum-empty">还没有语块。完成课程的「语块学习」→「加入 SRS」。</p>
            ) : (
              <ul className="accum-list">
                {[...items].reverse().map((item) => {
                  const due = item.nextReview <= Date.now();
                  return (
                    <li key={item.id} className={`accum-item ${due ? 'due' : ''}`}>
                      <div className="accum-word">
                        <strong>{item.es}</strong>
                        <span>{item.zh}</span>
                        <small>
                          {item.kind} · 阶段 {item.srsStage}/{SRS_INTERVALS_DAYS.length}
                          {due ? ' · ⏰ 待复习' : ''}
                        </small>
                      </div>
                      <div className="accum-item-actions">
                        <button type="button" className="btn-icon" onClick={() => speakSpanish(item.es)}>
                          🔊
                        </button>
                        <button type="button" className="btn-icon" onClick={() => removeItem(item.id)}>
                          🗑
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <footer className="accum-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={clearAll} disabled={!items.length}>
                清空 SRS 库
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
