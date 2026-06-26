/** 轻量学习活动记录：按天计数，用于看板的活跃度与连续天数（streak）。按语言前缀隔离。 */

type DayLog = Record<string, number>; // 'YYYY-MM-DD' -> 次数

function storageKey(prefix: string) {
  return `${prefix}-activity-v1`;
}

function dayStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

function load(prefix: string): DayLog {
  try {
    const raw = localStorage.getItem(storageKey(prefix));
    return raw ? (JSON.parse(raw) as DayLog) : {};
  } catch {
    return {};
  }
}

function save(prefix: string, log: DayLog) {
  try {
    localStorage.setItem(storageKey(prefix), JSON.stringify(log));
  } catch {
    /* ignore */
  }
}

export function logActivity(prefix: string, n = 1) {
  if (!prefix) return;
  const log = load(prefix);
  const key = dayStr(new Date());
  log[key] = (log[key] ?? 0) + n;
  save(prefix, log);
}

export interface DailyCount {
  date: string; // 'MM-DD'
  full: string; // 'YYYY-MM-DD'
  count: number;
}

export function getDailyCounts(prefix: string, days: number): DailyCount[] {
  const log = load(prefix);
  const today = new Date();
  const out: DailyCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = addDays(today, -i);
    const full = dayStr(d);
    out.push({
      date: `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      full,
      count: log[full] ?? 0,
    });
  }
  return out;
}

export function getStreak(prefix: string): number {
  const log = load(prefix);
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 3650; i++) {
    const key = dayStr(addDays(today, -i));
    const c = log[key] ?? 0;
    if (c > 0) {
      streak++;
    } else if (i === 0) {
      // 今天还没活动，不打断（连续天数算到昨天为止）
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export function getTotalActivity(prefix: string): number {
  const log = load(prefix);
  return Object.values(log).reduce((a, b) => a + b, 0);
}
