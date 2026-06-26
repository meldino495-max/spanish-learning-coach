import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageProgress, useLanguageSRS } from '../hooks/useLanguageData';
import { getDailyCounts, getStreak, getTotalActivity } from '../utils/activityLog';
import { downloadBackup, importData } from '../utils/backup';
import type { Achievement } from '../utils/achievements';
import {
  type ReminderConfig,
  saveReminderConfig,
  requestNotifyPermission,
  notifySupported,
  showReminder,
} from '../utils/reminder';

interface Props {
  open: boolean;
  onClose: () => void;
  onOpenSRS?: () => void;
  onOpenAdaptive?: () => void;
  onOpenListening?: () => void;
  onOpenTutor?: () => void;
  achievements?: Achievement[];
  onOpenAchievements?: () => void;
  reminder?: ReminderConfig;
  onChangeReminder?: (cfg: ReminderConfig) => void;
}

interface Suggestion {
  emoji: string;
  text: string;
  action?: () => void;
  done?: boolean;
}

const STAGE_LABELS = ['新学', '初记', '巩固', '熟练', '牢固', '精通'];
const STAGE_COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#0ea5e9'];

export function DashboardPanel({
  open,
  onClose,
  onOpenSRS,
  onOpenAdaptive,
  onOpenListening,
  onOpenTutor,
  achievements = [],
  onOpenAchievements,
  reminder,
  onChangeReminder,
}: Props) {
  const { curriculum, language } = useLanguage();
  const { progress } = useLanguageProgress();
  const { items, dueItems } = useLanguageSRS();
  const prefix = language.storagePrefix;

  const [includeKeys, setIncludeKeys] = useState(false);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [backupMsg, setBackupMsg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      downloadBackup(includeKeys);
      setBackupMsg('已导出备份文件。');
    } catch (e) {
      setBackupMsg('导出失败：' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const toggleReminder = async (enabled: boolean) => {
    if (!reminder || !onChangeReminder) return;
    if (enabled) {
      const ok = await requestNotifyPermission();
      if (!ok) {
        setBackupMsg('未获得通知权限，请在系统设置中允许本应用发送通知。');
      }
    }
    saveReminderConfig({ enabled });
    onChangeReminder({ ...reminder, enabled });
  };

  const changeReminderTime = (time: string) => {
    if (!reminder || !onChangeReminder) return;
    saveReminderConfig({ time });
    onChangeReminder({ ...reminder, time });
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const res = importData(String(reader.result), importMode);
        setBackupMsg(`已导入 ${res.imported} 项数据，正在刷新…`);
        setTimeout(() => window.location.reload(), 800);
      } catch (e) {
        setBackupMsg('导入失败：' + (e instanceof Error ? e.message : String(e)));
      }
    };
    reader.onerror = () => setBackupMsg('读取文件失败。');
    reader.readAsText(file);
  };

  const phaseStats = useMemo(() => {
    return curriculum.phases.map((p) => {
      let total = 0;
      let done = 0;
      for (const week of p.weeks) {
        for (const day of week.days) {
          for (const step of day.steps) {
            total++;
            if (progress[step.id]) done++;
          }
        }
      }
      return {
        id: p.id,
        title: p.title,
        level: p.level,
        phaseNum: p.phaseNum,
        total,
        done,
        pct: total ? Math.round((done / total) * 100) : 0,
      };
    });
  }, [curriculum, progress]);

  const totals = useMemo(() => {
    const total = phaseStats.reduce((a, p) => a + p.total, 0);
    const done = phaseStats.reduce((a, p) => a + p.done, 0);
    return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
  }, [phaseStats]);

  const stageCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0];
    for (const it of items) {
      const s = Math.max(0, Math.min(5, it.srsStage));
      counts[s]++;
    }
    return counts;
  }, [items]);

  const maxStage = Math.max(1, ...stageCounts);

  const daily = useMemo(() => (open ? getDailyCounts(prefix, 14) : []), [open, prefix, items, progress]);
  const streak = useMemo(() => (open ? getStreak(prefix) : 0), [open, prefix, items, progress]);
  const totalActs = useMemo(() => (open ? getTotalActivity(prefix) : 0), [open, prefix, items, progress]);
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const last7 = daily.slice(-7).reduce((a, d) => a + d.count, 0);

  const nextDay = useMemo(() => {
    for (const p of curriculum.phases) {
      for (const w of p.weeks) {
        for (const d of w.days) {
          if (!d.steps.every((s) => progress[s.id])) {
            return { title: d.title, label: d.dayLabel };
          }
        }
      }
    }
    return null;
  }, [curriculum, progress]);

  const weakCount = stageCounts[0] + stageCounts[1];
  const todayCount = daily.length ? daily[daily.length - 1].count : 0;

  const suggestions = useMemo<Suggestion[]>(() => {
    const list: Suggestion[] = [];
    if (dueItems.length > 0) {
      list.push({
        emoji: '🔁',
        text: `有 ${dueItems.length} 个语块到期，先复习巩固记忆`,
        action: onOpenSRS,
      });
    }
    if (weakCount >= 3 && onOpenAdaptive) {
      list.push({
        emoji: '🎯',
        text: `${weakCount} 个薄弱语块，做一次针对性特训`,
        action: onOpenAdaptive,
      });
    }
    if (nextDay) {
      list.push({
        emoji: '📚',
        text: `继续课程：${nextDay.label} ${nextDay.title}`,
        action: onClose,
      });
    }
    if (onOpenListening) {
      list.push({ emoji: '🎧', text: '练一篇分级听力，磨耳朵 + 扩词', action: onOpenListening });
    }
    if (onOpenTutor) {
      list.push({ emoji: '🤖', text: '和 AI 来一段情景对话，开口说', action: onOpenTutor });
    }
    if (todayCount === 0) {
      list.unshift({ emoji: '🔥', text: '今天还没有学习记录，完成任意一项即可续上连续天数' });
    }
    return list;
  }, [dueItems.length, weakCount, nextDay, todayCount, onOpenSRS, onOpenAdaptive, onOpenListening, onOpenTutor, onClose]);

  const achUnlocked = useMemo(() => achievements.filter((a) => a.unlocked), [achievements]);
  const nextAch = useMemo(() => {
    const locked = achievements.filter((a) => !a.unlocked && a.goal > 0);
    if (locked.length === 0) return null;
    return [...locked].sort((a, b) => b.current / b.goal - a.current / a.goal)[0];
  }, [achievements]);
  const achPct = achievements.length
    ? Math.round((achUnlocked.length / achievements.length) * 100)
    : 0;

  if (!open) return null;

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div
        className="accum-panel accum-panel-wide dashboard-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className="accum-header">
          <h2>📊 学习数据看板</h2>
          <span className="accum-count">{language.flag} {language.label}</span>
          <button type="button" className="accum-close" onClick={onClose} aria-label="关闭">
            ✕
          </button>
        </header>

        <div className="dashboard-body">
          <div className="dash-cards">
            <div className="dash-card">
              <span className="dash-card-num">{totals.pct}%</span>
              <span className="dash-card-label">课程总进度</span>
              <span className="dash-card-sub">
                {totals.done}/{totals.total} 步骤
              </span>
            </div>
            <div className="dash-card">
              <span className="dash-card-num">{streak}</span>
              <span className="dash-card-label">连续学习天数</span>
              <span className="dash-card-sub">近 7 天 {last7} 次活动</span>
            </div>
            <div className="dash-card">
              <span className="dash-card-num">{items.length}</span>
              <span className="dash-card-label">记忆库语块</span>
              <span className="dash-card-sub">累计活动 {totalActs} 次</span>
            </div>
            <div className={`dash-card ${dueItems.length > 0 ? 'dash-card-due' : ''}`}>
              <span className="dash-card-num">{dueItems.length}</span>
              <span className="dash-card-label">今日待复习</span>
              <span className="dash-card-sub">{dueItems.length > 0 ? '建议先清复习' : '已清空 👍'}</span>
            </div>
          </div>

          <section className="dash-section">
            <h3>今日建议</h3>
            <div className="dash-suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className={`dash-suggest ${s.action ? '' : 'dash-suggest-done'}`}
                  onClick={s.action}
                  disabled={!s.action}
                >
                  <span className="dash-suggest-emoji">{s.emoji}</span>
                  <span className="dash-suggest-text">{s.text}</span>
                  {s.action && <span className="dash-suggest-arrow">→</span>}
                </button>
              ))}
            </div>
          </section>

          {achievements.length > 0 && (
            <section className="dash-section">
              <div className="dash-ach-head">
                <h3>成就 · 已解锁 {achUnlocked.length}/{achievements.length}（{achPct}%）</h3>
                {onOpenAchievements && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenAchievements}>
                    查看全部 🏆
                  </button>
                )}
              </div>
              {achUnlocked.length > 0 && (
                <div className="dash-ach-strip">
                  {achUnlocked.slice(-8).map((a) => (
                    <span key={a.id} className="dash-ach-badge" title={`${a.title}：${a.cheer}`}>
                      {a.icon}
                    </span>
                  ))}
                </div>
              )}
              {nextAch && (
                <div className="dash-ach-next">
                  <span className="dash-ach-next-icon">🔒</span>
                  <div className="dash-ach-next-info">
                    <span className="dash-ach-next-title">
                      距下一个徽章「{nextAch.title}」还差 {Math.max(0, nextAch.goal - nextAch.current)}
                      {nextAch.goal > 1 ? '' : ' 步'}
                    </span>
                    <div className="dash-ach-next-track">
                      <div
                        className="dash-ach-next-fill"
                        style={{ width: `${Math.min(100, (nextAch.current / nextAch.goal) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="dash-section">
            <h3>近 14 天学习活跃度</h3>
            <div className="dash-activity">
              {daily.map((d) => (
                <div key={d.full} className="dash-act-col" title={`${d.full}：${d.count} 次`}>
                  <div className="dash-act-bar-wrap">
                    <div
                      className={`dash-act-bar ${d.count > 0 ? 'has' : ''}`}
                      style={{ height: `${Math.max(d.count > 0 ? 8 : 2, (d.count / maxDaily) * 100)}%` }}
                    />
                  </div>
                  <span className="dash-act-label">{d.date.slice(3)}</span>
                </div>
              ))}
            </div>
            <p className="dash-hint">每完成一个步骤、复习一个语块、做一次特训都会被记录。坚持每天有活动，连续天数才不会断。</p>
          </section>

          <section className="dash-section">
            <h3>记忆强度分布（弱项热力）</h3>
            {items.length === 0 ? (
              <p className="dash-hint">记忆库还是空的。学习时点击「加入记忆库」收集句子和语块，这里会显示遗忘曲线分布。</p>
            ) : (
              <div className="dash-stages">
                {stageCounts.map((c, i) => (
                  <div key={i} className="dash-stage-row">
                    <span className="dash-stage-name" style={{ color: STAGE_COLORS[i] }}>
                      {STAGE_LABELS[i]}
                    </span>
                    <div className="dash-stage-track">
                      <div
                        className="dash-stage-fill"
                        style={{ width: `${(c / maxStage) * 100}%`, background: STAGE_COLORS[i] }}
                      />
                    </div>
                    <span className="dash-stage-count">{c}</span>
                  </div>
                ))}
              </div>
            )}
            {items.length > 0 && (
              <p className="dash-hint">
                越靠左（新学/初记）的越是薄弱项，建议用顶部「🎯 特训」针对性练习；越靠右说明记得越牢。
              </p>
            )}
          </section>

          <section className="dash-section">
            <h3>各阶段进度</h3>
            <div className="dash-phases">
              {phaseStats.map((p) => (
                <div key={p.id} className="dash-phase-row">
                  <div className="dash-phase-head">
                    <span className="dash-phase-title">
                      <span className="dash-phase-level">{p.level}</span> 阶段{p.phaseNum} · {p.title}
                    </span>
                    <span className="dash-phase-frac">
                      {p.done}/{p.total}
                    </span>
                  </div>
                  <div className="dash-phase-track">
                    <div className="dash-phase-fill" style={{ width: `${p.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {reminder && onChangeReminder && (
            <section className="dash-section">
              <h3>每日学习提醒</h3>
              <p className="dash-hint">到点用桌面通知提醒你来学习/复习，帮助保持连续天数。提醒只在本机触发，需保持应用运行。</p>
              <div className="dash-reminder">
                <label className="dash-backup-check">
                  <input
                    type="checkbox"
                    checked={reminder.enabled}
                    onChange={(e) => void toggleReminder(e.target.checked)}
                  />
                  <span>开启每日提醒</span>
                </label>
                <label className="dash-backup-check">
                  <span>提醒时间：</span>
                  <input
                    type="time"
                    value={reminder.time}
                    onChange={(e) => changeReminderTime(e.target.value)}
                    disabled={!reminder.enabled}
                  />
                </label>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    const ok = await requestNotifyPermission();
                    if (ok) showReminder('🦴 学习提醒', '这就是提醒通知的样子，到点会这样提醒你～');
                    else setBackupMsg('未获得通知权限，请在系统设置中允许通知。');
                  }}
                  disabled={!notifySupported()}
                >
                  🔔 测试通知
                </button>
              </div>
            </section>
          )}

          <section className="dash-section">
            <h3>数据备份 / 迁移</h3>
            <p className="dash-hint">
              把进度、记忆库、学习记录和陪练历史导出成一个文件，换设备时导入即可恢复。数据仅在本机，不上传。
            </p>
            <div className="dash-backup">
              <label className="dash-backup-check">
                <input
                  type="checkbox"
                  checked={includeKeys}
                  onChange={(e) => setIncludeKeys(e.target.checked)}
                />
                <span>导出时包含 API Key（OpenAI / Azure 等，含敏感信息，请妥善保管）</span>
              </label>
              <div className="dash-backup-row">
                <button type="button" className="btn btn-primary btn-sm" onClick={handleExport}>
                  ⬇ 导出备份
                </button>
              </div>

              <label className="dash-backup-check">
                <span>导入方式：</span>
                <select
                  value={importMode}
                  onChange={(e) => setImportMode(e.target.value as 'merge' | 'replace')}
                >
                  <option value="merge">合并（保留现有，覆盖同名项）</option>
                  <option value="replace">替换（先清空本机再导入）</option>
                </select>
              </label>
              <div className="dash-backup-row">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => fileRef.current?.click()}
                >
                  ⬆ 选择备份文件导入
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleImportFile(f);
                    e.target.value = '';
                  }}
                />
              </div>
              {backupMsg && <p className="dash-backup-msg">{backupMsg}</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
