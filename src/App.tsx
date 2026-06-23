import { useMemo, useState } from 'react';
import { curriculum, countSteps, countGrammarUnits } from './data/curriculum';
import { useProgress } from './hooks/useProgress';
import { StepCard } from './components/StepCard';
import { GoogleLoginBar } from './components/GoogleLoginBar';
import { AccumulationPanel } from './components/AccumulationPanel';
import { DailyRoutinePanel } from './components/DailyRoutinePanel';
import { useSRS } from './hooks/useSRS';
import type { DayPlan, WeekPlan } from './types';
import './App.css';

function flattenDays(): { week: WeekPlan; day: DayPlan }[] {
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
  const allDays = useMemo(() => flattenDays(), []);
  const [selectedDayId, setSelectedDayId] = useState(allDays[0]?.day.id ?? '');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [accumOpen, setAccumOpen] = useState(false);
  const [accumReview, setAccumReview] = useState(false);
  const { progress, toggleStep, resetAll } = useProgress();
  const { items: srsItems, dueItems } = useSRS();

  const totalSteps = countSteps();
  const doneCount = Object.values(progress).filter(Boolean).length;
  const pct = totalSteps ? Math.round((doneCount / totalSteps) * 100) : 0;

  const current = allDays.find((d) => d.day.id === selectedDayId) ?? allDays[0];
  const currentWeek = current?.week;
  const currentDay = current?.day;

  const dayDone = currentDay?.steps.every((s) => progress[s.id]) ?? false;

  return (
    <div className="app">
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
          <span className="brand-flag">🇪🇸</span>
          <div>
            <h1>{curriculum.title}</h1>
            <p>{curriculum.subtitle}</p>
          </div>
        </div>
        <div className="topbar-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="progress-text">
            {doneCount}/{totalSteps} 步骤 · {pct}%
          </span>
        </div>
        <GoogleLoginBar />
        <button
          type="button"
          className={`btn-accum ${dueItems.length > 0 ? 'btn-accum-due' : ''}`}
          onClick={() => {
            setAccumReview(false);
            setAccumOpen(true);
          }}
          title="间隔重复 SRS"
        >
          🔁 {dueItems.length > 0 ? dueItems.length : srsItems.length || ''}
        </button>
      </header>

      <AccumulationPanel
        open={accumOpen}
        onClose={() => {
          setAccumOpen(false);
          setAccumReview(false);
        }}
        startReview={accumReview}
      />

      <div className="layout">
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

        <main className="main">
          {currentDay && currentWeek && (
            <>
              <section className="day-hero">
                <DailyRoutinePanel
                  onOpenSRS={() => {
                    setAccumReview(dueItems.length > 0);
                    setAccumOpen(true);
                  }}
                />
                <div className="breadcrumb">
                  第 {currentWeek.weekNum} 周 · {currentWeek.focus}
                </div>
                <h2>{currentDay.dayLabel} — {currentDay.title}</h2>
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
                    onToggle={() => toggleStep(step.id)}
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
                        <button type="button" className="btn btn-secondary" onClick={() => setSelectedDayId(prev.day.id)}>
                          ← {prev.day.dayLabel}
                        </button>
                      ) : (
                        <span />
                      )}
                      {next ? (
                        <button type="button" className="btn btn-primary" onClick={() => setSelectedDayId(next.day.id)}>
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
          {curriculum.startLevel} → {curriculum.targetLevel} · {countGrammarUnits()} 语法单元 · 建议每天：碎片 10 分钟 + 深度 45 分钟
        </p>
        <p className="footer-tip">口语/听写推荐 Microsoft Edge · 允许麦克风权限</p>
      </footer>
    </div>
  );
}

export default App;
