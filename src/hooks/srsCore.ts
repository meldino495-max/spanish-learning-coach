/** 艾宾浩斯间隔：第 1/3/7/14/30 天复习 */
export const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;

export type SRSRating = 'again' | 'hard' | 'good' | 'easy';

export interface SRSItem {
  id: string;
  /** 西语句子或语块（优先记整句，不是孤立的词） */
  es: string;
  zh: string;
  note?: string;
  source?: string;
  /** chunk | word | scenario */
  kind: 'chunk' | 'word' | 'scenario';
  addedAt: number;
  srsStage: number;
  nextReview: number;
  lastReview: number;
  reviewCount: number;
}

const LEGACY_ES_KEY = 'es-coach-srs-v2';

function srsKey(prefix: string) {
  return `${prefix}-srs-v2`;
}

function dayMs(days: number) {
  return days * 24 * 60 * 60 * 1000;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function computeNextReview(stage: number, rating: SRSRating, from = Date.now()): number {
  let newStage = stage;
  if (rating === 'again') newStage = 0;
  else if (rating === 'hard') newStage = Math.max(0, stage);
  else if (rating === 'good') newStage = Math.min(SRS_INTERVALS_DAYS.length, stage + 1);
  else if (rating === 'easy') newStage = Math.min(SRS_INTERVALS_DAYS.length, stage + 2);

  const intervalDays =
    rating === 'again'
      ? 1
      : rating === 'hard'
        ? SRS_INTERVALS_DAYS[Math.max(0, newStage - 1)] ?? 1
        : SRS_INTERVALS_DAYS[Math.min(newStage - 1, SRS_INTERVALS_DAYS.length - 1)] ?? 30;

  return from + dayMs(intervalDays);
}

function migrateFromV1(): SRSItem[] {
  try {
    const raw = localStorage.getItem('es-coach-accumulation-v1');
    if (!raw) return [];
    const old = JSON.parse(raw) as { es: string; zh: string; note?: string; source?: string; id: string; addedAt: number; reviewCount: number }[];
    const now = Date.now();
    return old.map((o) => ({
      id: o.id,
      es: o.es,
      zh: o.zh,
      note: o.note,
      source: o.source,
      kind: o.es.includes(' ') ? 'chunk' : 'word',
      addedAt: o.addedAt,
      srsStage: 0,
      nextReview: now,
      lastReview: 0,
      reviewCount: o.reviewCount ?? 0,
    }));
  } catch {
    return [];
  }
}

export function loadSRSItems(storagePrefix: string): SRSItem[] {
  const key = srsKey(storagePrefix);
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as SRSItem[];
    if (storagePrefix === 'es-coach') {
      const legacy = localStorage.getItem(LEGACY_ES_KEY);
      if (legacy) {
        localStorage.setItem(key, legacy);
        return JSON.parse(legacy) as SRSItem[];
      }
      const migrated = migrateFromV1();
      if (migrated.length) localStorage.setItem(key, JSON.stringify(migrated));
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveSRSItems(storagePrefix: string, items: SRSItem[]) {
  localStorage.setItem(srsKey(storagePrefix), JSON.stringify(items));
}

/**
 * 跨实例同步：应用里有多处各自调用 useSRS（顶栏徽标、看板、各面板）。
 * 任意一处增删/评分后，通过该总线通知其它实例从 localStorage 重新加载，
 * 避免「加入记忆库后徽标/看板不刷新」的问题。
 */
export const srsBus = new EventTarget();

export function srsEventName(prefix: string) {
  return `srs:${prefix}`;
}

export function getDueItems(items: SRSItem[], now = Date.now()): SRSItem[] {
  return items.filter((i) => i.nextReview <= now);
}

export function getNewItemsToday(items: SRSItem[], max = 15): SRSItem[] {
  const today = startOfToday();
  return items.filter((i) => i.addedAt >= today).slice(0, max);
}
