import { useEffect } from 'react';
import type { Achievement } from '../utils/achievements';

interface Props {
  toasts: Achievement[];
  onDismiss: (id: string) => void;
}

export function AchievementToast({ toasts, onDismiss }: Props) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => setTimeout(() => onDismiss(t.id), 6000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="ach-toast-stack">
      {toasts.map((t) => (
        <div key={t.id} className="ach-toast" role="status" onClick={() => onDismiss(t.id)}>
          <span className="ach-toast-icon">{t.icon}</span>
          <div className="ach-toast-text">
            <span className="ach-toast-head">🎉 解锁成就 · {t.title}</span>
            <span className="ach-toast-cheer">{t.cheer}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
