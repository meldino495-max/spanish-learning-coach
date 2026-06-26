import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from './context/LanguageContext';
import { countGrammarUnits, countSteps } from './data/curriculumUtils';
import { useLanguageProgress, useLanguageSRS } from './hooks/useLanguageData';
import { StepCard } from './components/StepCard';
import { GoogleLoginBar } from './components/GoogleLoginBar';
import { AccumulationPanel } from './components/AccumulationPanel';
import { AITutorPanel } from './components/AITutorPanel';
import { PhrasePanel } from './components/PhrasePanel';
import { WritingPanel } from './components/WritingPanel';
import { ListeningPanel } from './components/ListeningPanel';
import { AdaptivePanel } from './components/AdaptivePanel';
import { ShadowingPanel } from './components/ShadowingPanel';
import { DashboardPanel } from './components/DashboardPanel';
import { AchievementsPanel } from './components/AchievementsPanel';
import { AchievementToast } from './components/AchievementToast';
import { DictionaryPopup } from './components/DictionaryPopup';
import { DailyRoutinePanel } from './components/DailyRoutinePanel';
import { ScenarioLibraryView } from './components/ScenarioLibraryView';
import { ThemePicker } from './components/ThemePicker';
import { AudioDevicePicker } from './components/AudioDevicePicker';
import { TopbarMenu } from './components/TopbarMenu';
import { ChiikawaBackground } from './components/ChiikawaBackground';
import { CustomBackgroundLayer } from './components/CustomBackgroundLayer';
import { LanguageWelcomeModal } from './components/LanguageWelcomeModal';
import { logActivity, getStreak, getTotalActivity, getDailyCounts } from './utils/activityLog';
import { buildAchievements, syncAchievements, type Achievement } from './utils/achievements';
import { playUnlockSound } from './utils/sound';
import {
  getReminderConfig,
  showReminder,
  msUntilNext,
  notifiedToday,
  markNotifiedToday,
  isPastTimeToday,
} from './utils/reminder';
import type { Curriculum, DayPlan, WeekPlan } from './types';
import './App.css';

type AppView = 'grammar' | 'scenarios';

function flattenDays(curriculum: Curriculum) {
  const result: { week: WeekPlan; day: DayPlan }[] = [];
  for (const phase of curriculum.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        result.push({ week, day });
      }
    }
  }
  return result;
}

function App() {
  const { curriculum, language, languages, setLanguageId, languageId } = useLanguage();
  const allDays = useMemo(() => flattenDays(curriculum), [curriculum]);
  const [appView, setAppView] = useState<AppView>('grammar');
  const [selectedDayId, setSelectedDayId] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accumOpen, setAccumOpen] = useState(false);
  const [accumReview, setAccumReview] = useState(false);
  const [phraseOpen, setPhraseOpen] = useState(false);
  const [writingOpen, setWritingOpen] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [listenOpen, setListenOpen] = useState(false);
  const [adaptiveOpen, setAdaptiveOpen] = useState(false);
  const [shadowOpen, setShadowOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [toasts, setToasts] = useState<Achievement[]>([]);
  const [dictWord, setDictWord] = useState<string | null>(null);
  const [dictOpen, setDictOpen] = useState(false);
  const [reminder, setReminder] = useState(getReminderConfig);
  const { progress, toggleStep, resetAll } = useLanguageProgress();
  const { items: srsItems, dueItems } = useLanguageSRS();

  const handleToggleStep = (stepId: string) => {
    if (!progress[stepId]) logActivity(language.storagePrefix);
    toggleStep(stepId);
  };

  const openTool = (tool: import('./types').CoachTool) => {
    switch (tool) {
      case 'phrase':
        return setPhraseOpen(true);
      case 'writing':
        return setWritingOpen(true);
      case 'tutor':
        return setTutorOpen(true);
      case 'listening':
        return setListenOpen(true);
      case 'adaptive':
        return setAdaptiveOpen(true);
      case 'shadow':
        return setShadowOpen(true);
    }
  };

  useEffect(() => {
    setSelectedDayId(allDays[0]?.day.id ?? '');
  }, [languageId, allDays]);

  const totalSteps = countSteps(curriculum);
  const doneCount = Object.values(progress).filter(Boolean).length;
  const pct = totalSteps ? Math.round((doneCount / totalSteps) * 100) : 0;

  const achievements = useMemo(() => {
    const phases = curriculum.phases.map((p) => ({
      id: p.id,
      level: p.level,
      title: p.title,
      done: p.weeks.every((w) => w.days.every((d) => d.steps.every((s) => progress[s.id]))),
    }));
    return buildAchievements({
      stepsDone: doneCount,
      totalSteps,
      streak: getStreak(language.storagePrefix),
      srsTotal: srsItems.length,
      srsMastered: srsItems.filter((i) => i.srsStage >= 5).length,
      totalActivity: getTotalActivity(language.storagePrefix),
      phases,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curriculum, progress, srsItems, doneCount, totalSteps, language.storagePrefix]);

  useEffect(() => {
    const newly = syncAchievements(language.storagePrefix, achievements);
    if (newly.length > 0) {
      setToasts((prev) => [...prev, ...newly]);
      playUnlockSound();
    }
  }, [achievements, language.storagePrefix]);

  // 即点即查：双击任意正文中的词即弹词典
  useEffect(() => {
    const onDblClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, button, a, select, .dict-overlay, .dict-popup')) {
        return;
      }
      const sel = window.getSelection?.();
      const raw = sel?.toString().trim() ?? '';
      const cleaned = raw.replace(/[^\p{L}\p{M}'’-]/gu, ' ').trim();
      if (!cleaned || cleaned.length > 40) return;
      const words = cleaned.split(/\s+/);
      if (words.length > 3) return;
      setDictWord(cleaned);
    };
    document.addEventListener('dblclick', onDblClick);
    return () => document.removeEventListener('dblclick', onDblClick);
  }, []);

  // 每日学习提醒：定时桌面通知
  const reminderInfo = useRef({ due: 0, prefix: language.storagePrefix, label: language.label });
  reminderInfo.current = {
    due: dueItems.length,
    prefix: language.storagePrefix,
    label: language.label,
  };
  useEffect(() => {
    if (!reminder.enabled) return;
    let timer: ReturnType<typeof setTimeout>;

    const fire = (catchUp: boolean) => {
      const info = reminderInfo.current;
      const today = getDailyCounts(info.prefix, 1)[0]?.count ?? 0;
      const prefix = catchUp ? '（补提醒）' : '';
      const body =
        today > 0
          ? `${prefix}今天已经学过啦，再来巩固一下？${info.due > 0 ? `有 ${info.due} 个语块待复习。` : ''}`
          : `${prefix}该练${info.label}啦！${info.due > 0 ? `有 ${info.due} 个语块待复习。` : '保持连续天数别中断～'}`;
      showReminder('🦴 学习提醒', body);
      markNotifiedToday();
    };

    // 错过补提醒：启动时若今天已过设定时间、今天还没提醒、且今天没学习，则补一条
    const catchUpTimer = setTimeout(() => {
      const today = getDailyCounts(reminderInfo.current.prefix, 1)[0]?.count ?? 0;
      if (isPastTimeToday(reminder.time) && !notifiedToday() && today === 0) {
        fire(true);
      }
    }, 4000);

    const schedule = () => {
      const ms = msUntilNext(reminder.time);
      if (ms < 0) return;
      timer = setTimeout(() => {
        if (!notifiedToday()) fire(false);
        schedule(); // 安排下一天
      }, ms);
    };
    schedule();
    return () => {
      clearTimeout(timer);
      clearTimeout(catchUpTimer);
    };
  }, [reminder.enabled, reminder.time]);

  const current = allDays.find((d) => d.day.id === selectedDayId) ?? allDays[0];
  const currentWeek = current?.week;
  const currentDay = current?.day;

  const dayDone = currentDay?.steps.every((s) => progress[s.id]) ?? false;

  return (
    <div className="app">
      <LanguageWelcomeModal />
      <CustomBackgroundLayer />
      <ChiikawaBackground />
      <header className="topbar">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="切换侧边栏"
        >
          ☰
        </button>
        <div className="topbar-brand">
          <span className="brand-flag">{language.flag}</span>
          <div>
            <h1>{curriculum.title}</h1>
            <p>{curriculum.subtitle}</p>
          </div>
        </div>
        <select
          className="lang-select"
          value={languageId}
          onChange={(e) => setLanguageId(e.target.value as typeof languageId)}
          title="切换学习语言"
        >
          {languages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.flag} {l.label} ({l.nativeName})
            </option>
          ))}
        </select>
        <ThemePicker />
        <AudioDevicePicker />
        <div className="topbar-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-text">
            {doneCount}/{totalSteps} 步骤 · {pct}%
          </span>
        </div>
        <div className="topbar-nav">
          <button
            type="button"
            className={`topbar-nav-btn ${appView === 'grammar' ? 'active' : ''}`}
            onClick={() => setAppView('grammar')}
          >
            📚 语法课程
          </button>
          <button
            type="button"
            className={`topbar-nav-btn ${appView === 'scenarios' ? 'active' : ''}`}
            onClick={() => setAppView('scenarios')}
          >
            🌍 场景 & 行业
          </button>
        </div>
        <GoogleLoginBar />
        <div className="topbar-actions">
          <TopbarMenu
            icon="✏️"
            label="练习"
            items={[
              { icon: '💬', label: '开口短句', desc: '听 → 模仿 → 录音对比', onClick: () => setPhraseOpen(true) },
              { icon: '✍️', label: '写作 & 归纳', desc: '逆翻译 + 语法归纳', onClick: () => setWritingOpen(true) },
              { icon: '🗣️', label: '影子跟读', desc: '逐句打分纠音', onClick: () => setShadowOpen(true) },
            ]}
          />
          <TopbarMenu
            icon="🤖"
            label="AI"
            items={[
              { icon: '🤖', label: '对话陪练', desc: '情景对话练口语', onClick: () => setTutorOpen(true) },
              { icon: '🎧', label: '分级听力', desc: '按水平生成听力', onClick: () => setListenOpen(true) },
              { icon: '🎯', label: '弱项特训', desc: '针对 SRS 错词', onClick: () => setAdaptiveOpen(true) },
            ]}
          />
          <TopbarMenu
            icon="🧰"
            label="工具"
            items={[
              { icon: '📖', label: '词典', desc: '查词 / 双击正文取词', onClick: () => setDictOpen(true) },
              { icon: '📊', label: '学习看板', desc: '进度与学习数据', onClick: () => setDashboardOpen(true) },
              { icon: '🏆', label: '成就', desc: '徽章与里程碑', onClick: () => setAchievementsOpen(true) },
            ]}
          />
          <button
            type="button"
            className={`btn-accum ${dueItems.length > 0 ? 'btn-accum-due' : ''}`}
            onClick={() => {
              setAccumReview(false);
              setAccumOpen(true);
            }}
            title="间隔重复 SRS：每天复习到期语块"
          >
            🔁 {dueItems.length > 0 ? dueItems.length : srsItems.length || ''}
          </button>
        </div>
      </header>

      <AccumulationPanel
        open={accumOpen}
        onClose={() => {
          setAccumOpen(false);
          setAccumReview(false);
        }}
        startReview={accumReview}
      />

      <PhrasePanel open={phraseOpen} onClose={() => setPhraseOpen(false)} />

      <WritingPanel open={writingOpen} onClose={() => setWritingOpen(false)} />

      <AITutorPanel open={tutorOpen} onClose={() => setTutorOpen(false)} />

      <ListeningPanel open={listenOpen} onClose={() => setListenOpen(false)} />

      <AdaptivePanel open={adaptiveOpen} onClose={() => setAdaptiveOpen(false)} />

      <ShadowingPanel open={shadowOpen} onClose={() => setShadowOpen(false)} />

      <DashboardPanel
        open={dashboardOpen}
        onClose={() => setDashboardOpen(false)}
        onOpenSRS={() => {
          setDashboardOpen(false);
          setAccumReview(dueItems.length > 0);
          setAccumOpen(true);
        }}
        onOpenAdaptive={() => {
          setDashboardOpen(false);
          setAdaptiveOpen(true);
        }}
        onOpenListening={() => {
          setDashboardOpen(false);
          setListenOpen(true);
        }}
        onOpenTutor={() => {
          setDashboardOpen(false);
          setTutorOpen(true);
        }}
        achievements={achievements}
        onOpenAchievements={() => {
          setDashboardOpen(false);
          setAchievementsOpen(true);
        }}
        reminder={reminder}
        onChangeReminder={setReminder}
      />

      <AchievementsPanel
        open={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        achievements={achievements}
      />

      <AchievementToast
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />

      <DictionaryPopup
        word={dictWord}
        open={dictOpen}
        onClose={() => {
          setDictWord(null);
          setDictOpen(false);
        }}
      />

      <div className="layout">
        {appView === 'grammar' && (
          <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
            {curriculum.phases.map((phase) => (
              <div key={phase.id} className="phase-block">
                <div className="phase-header">
                  <span className="phase-num">阶段 {phase.phaseNum}</span>
                  <strong>{phase.title}</strong>
                  <span className="phase-level">{phase.level}</span>
                </div>
                {phase.weeks.map((week) => (
                  <div key={week.id} className="week-block">
                    <div className="week-label">
                      第 {week.weekNum} 周 · {week.title}
                    </div>
                    {week.days.map((day) => {
                      const done = day.steps.every((s) => progress[s.id]);
                      const active = day.id === selectedDayId;
                      const partial = !done && day.steps.some((s) => progress[s.id]);
                      const isReview = day.id.includes('review');
                      return (
                        <button
                          key={day.id}
                          type="button"
                          className={`day-btn ${active ? 'active' : ''} ${done ? 'day-done' : ''} ${partial ? 'day-partial' : ''} ${isReview ? 'day-review' : ''}`}
                          onClick={() => {
                            setSelectedDayId(day.id);
                            if (window.innerWidth < 900) setSidebarOpen(false);
                          }}
                        >
                          <span className="day-status">{done ? '✓' : partial ? '◐' : isReview ? '↻' : '○'}</span>
                          <span>{isReview ? day.title : `${day.dayLabel} ${day.title}`}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
            <button type="button" className="reset-btn" onClick={resetAll}>
              清空进度
            </button>
          </aside>
        )}

        <main className="main">
          {appView === 'scenarios' && <ScenarioLibraryView />}

          {appView === 'grammar' && currentDay && currentWeek && (
            <>
              <section className="day-hero">
                <DailyRoutinePanel
                  onOpenSRS={() => {
                    setAccumReview(dueItems.length > 0);
                    setAccumOpen(true);
                  }}
                  onOpenPhrase={() => setPhraseOpen(true)}
                />
                <div className="breadcrumb">
                  第 {currentWeek.weekNum} 周 · {currentWeek.focus}
                </div>
                <h2>
                  {currentDay.dayLabel} — {currentDay.title}
                </h2>
                <p className="day-goal">🎯 今日目标：{currentDay.goal}</p>
                {dayDone && <div className="day-complete-banner">🎉 今日所有步骤已完成！</div>}
              </section>

              <section className="steps-list">
                {currentDay.steps.map((step, i) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    index={i}
                    done={!!progress[step.id]}
                    onToggle={() => handleToggleStep(step.id)}
                    onOpenTool={openTool}
                  />
                ))}
              </section>

              <nav className="day-nav">
                {(() => {
                  const idx = allDays.findIndex((d) => d.day.id === selectedDayId);
                  const prev = allDays[idx - 1];
                  const next = allDays[idx + 1];
                  return (
                    <>
                      {prev ? (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setSelectedDayId(prev.day.id)}
                        >
                          ← {prev.day.dayLabel}
                        </button>
                      ) : (
                        <span />
                      )}
                      {next ? (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setSelectedDayId(next.day.id)}
                        >
                          {next.day.dayLabel} →
                        </button>
                      ) : (
                        <span />
                      )}
                    </>
                  );
                })()}
              </nav>
            </>
          )}
        </main>
      </div>

      <footer className="footer">
        <p>
          桌面版 · {language.label} · {curriculum.startLevel} → {curriculum.targetLevel} ·{' '}
          {countGrammarUnits(curriculum)} 语法单元
        </p>
        <p className="footer-tip">口语/听写需允许麦克风权限 · 可在顶部「音频」选择设备</p>
      </footer>
    </div>
  );
}

export default App;
