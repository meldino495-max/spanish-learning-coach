import type { Achievement } from '../utils/achievements';

interface Props {
  open: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export function AchievementsPanel({ open, onClose, achievements }: Props) {
  if (!open) return null;

  const unlocked = achievements.filter((a) => a.unlocked);
  const pct = achievements.length
    ? Math.round((unlocked.length / achievements.length) * 100)
    : 0;

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div className="accum-panel accum-panel-wide ach-panel" onClick={(e) => e.stopPropagation()} role="dialog">
        <header className="accum-header">
          <h2>🏆 成就</h2>
          <span className="accum-count">
            已解锁 {unlocked.length}/{achievements.length} · {pct}%
          </span>
          <button type="button" className="accum-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </header>

        <div className="ach-body">
          <div className="ach-overall">
            <div className="ach-overall-track">
              <div className="ach-overall-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="dash-hint">每完成一点都会点亮新徽章，坚持下去解锁全部成就！</p>
          </div>

          <div className="ach-grid">
            {achievements.map((a) => (
              <div key={a.id} className={`ach-card ${a.unlocked ? 'unlocked' : 'locked'}`}>
                <div className="ach-icon">{a.unlocked ? a.icon : '🔒'}</div>
                <div className="ach-info">
                  <span className="ach-title">{a.title}</span>
                  <span className="ach-desc">{a.unlocked ? a.cheer : a.desc}</span>
                  {!a.unlocked && a.goal > 1 && (
                    <div className="ach-progress">
                      <div className="ach-progress-track">
                        <div
                          className="ach-progress-fill"
                          style={{ width: `${Math.min(100, (a.current / a.goal) * 100)}%` }}
                        />
                      </div>
                      <span className="ach-progress-text">
                        {a.current}/{a.goal}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
