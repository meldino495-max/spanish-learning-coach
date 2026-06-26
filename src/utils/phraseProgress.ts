/**
 * 「开口短句」学过进度：按语言命名空间存储已掌握的短句 key。
 * 体现 Kazu 的「按完成量衡量」理念（学了多少句，而不是花了多少分钟）。
 */

const suffix = '-phrases-v1';

function key(prefix: string): string {
  return `${prefix}${suffix}`;
}

export function loadLearnedPhrases(prefix: string): Set<string> {
  try {
    const raw = localStorage.getItem(key(prefix));
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function saveLearnedPhrases(prefix: string, set: Set<string>): void {
  try {
    localStorage.setItem(key(prefix), JSON.stringify([...set]));
  } catch {
    /* ignore */
  }
}

/** 今日学过的短句数（用于完成量目标）。存一个 {date,count} 计数。 */
const dailySuffix = '-phrases-daily-v1';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function bumpPhraseDaily(prefix: string): void {
  try {
    const k = `${prefix}${dailySuffix}`;
    const raw = localStorage.getItem(k);
    const today = todayStr();
    let count = 0;
    if (raw) {
      const data = JSON.parse(raw) as { date: string; count: number };
      if (data.date === today) count = data.count;
    }
    localStorage.setItem(k, JSON.stringify({ date: today, count: count + 1 }));
  } catch {
    /* ignore */
  }
}

export function getPhraseDaily(prefix: string): number {
  try {
    const raw = localStorage.getItem(`${prefix}${dailySuffix}`);
    if (!raw) return 0;
    const data = JSON.parse(raw) as { date: string; count: number };
    return data.date === todayStr() ? data.count : 0;
  } catch {
    return 0;
  }
}
