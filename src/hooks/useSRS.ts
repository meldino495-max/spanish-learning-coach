import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { SRSRating } from './srsCore';
import {
  computeNextReview,
  getDueItems,
  getNewItemsToday,
  loadSRSItems,
  saveSRSItems,
  srsBus,
  srsEventName,
  type SRSItem,
} from './srsCore';
import { logActivity } from '../utils/activityLog';

export type { SRSItem, SRSRating };

export function useSRS(storagePrefix: string) {
  const [items, setItems] = useState<SRSItem[]>(() => loadSRSItems(storagePrefix));
  // 记录最近一次「已同步」的序列化值，用于区分本地修改与外部更新，避免回环
  const lastSerialized = useRef<string>(JSON.stringify(items));

  // 切换语言：重新加载该语言的库
  useEffect(() => {
    const loaded = loadSRSItems(storagePrefix);
    lastSerialized.current = JSON.stringify(loaded);
    setItems(loaded);
  }, [storagePrefix]);

  // 本地发生真实变化时：持久化并广播给其它实例
  useEffect(() => {
    const serialized = JSON.stringify(items);
    if (serialized === lastSerialized.current) return; // 外部同步导致的相同数据，跳过避免回环
    lastSerialized.current = serialized;
    saveSRSItems(storagePrefix, items);
    srsBus.dispatchEvent(new Event(srsEventName(storagePrefix)));
  }, [storagePrefix, items]);

  // 监听其它实例 / 其它标签页的更新，重新加载
  useEffect(() => {
    const reload = () => {
      const loaded = loadSRSItems(storagePrefix);
      const serialized = JSON.stringify(loaded);
      if (serialized === lastSerialized.current) return;
      lastSerialized.current = serialized;
      setItems(loaded);
    };
    const name = srsEventName(storagePrefix);
    srsBus.addEventListener(name, reload);
    window.addEventListener('storage', reload);
    return () => {
      srsBus.removeEventListener(name, reload);
      window.removeEventListener('storage', reload);
    };
  }, [storagePrefix]);

  const dueItems = useMemo(() => getDueItems(items), [items]);
  const newToday = useMemo(() => getNewItemsToday(items), [items]);

  const addItem = useCallback(
    (entry: {
      es: string;
      zh: string;
      note?: string;
      source?: string;
      kind?: SRSItem['kind'];
    }) => {
      setItems((prev) => {
        if (prev.some((i) => i.es.toLowerCase() === entry.es.toLowerCase())) return prev;
        const now = Date.now();
        return [
          ...prev,
          {
            id: `${now}-${entry.es.slice(0, 20)}`,
            es: entry.es,
            zh: entry.zh,
            note: entry.note,
            source: entry.source,
            kind: entry.kind ?? (entry.es.includes(' ') ? 'chunk' : 'word'),
            addedAt: now,
            srsStage: 0,
            nextReview: now,
            lastReview: 0,
            reviewCount: 0,
          },
        ];
      });
    },
    [],
  );

  const addMany = useCallback(
    (
      entries: { es: string; zh: string; note?: string; kind?: SRSItem['kind'] }[],
      source?: string,
    ) => {
      entries.forEach((e) => addItem({ ...e, source }));
    },
    [addItem],
  );

  const rateItem = useCallback((id: string, rating: SRSRating) => {
    const now = Date.now();
    logActivity(storagePrefix);
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const nextReview = computeNextReview(i.srsStage, rating, now);
        let srsStage = i.srsStage;
        if (rating === 'again') srsStage = 0;
        else if (rating === 'good') srsStage = Math.min(5, srsStage + 1);
        else if (rating === 'easy') srsStage = Math.min(5, srsStage + 2);
        else if (rating === 'hard') srsStage = Math.max(0, srsStage);
        return {
          ...i,
          srsStage,
          nextReview,
          lastReview: now,
          reviewCount: i.reviewCount + 1,
        };
      }),
    );
  }, [storagePrefix]);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if (window.confirm('清空间隔重复库？所有语块进度将丢失。')) setItems([]);
  }, []);

  return { items, dueItems, newToday, addItem, addMany, rateItem, removeItem, clearAll };
}

/** @deprecated 使用 useSRS(storagePrefix) */
export function useAccumulation() {
  const srs = useSRS('es-coach');
  return {
    items: srs.items.map((i) => ({
      id: i.id,
      es: i.es,
      zh: i.zh,
      note: i.note,
      source: i.source,
      addedAt: i.addedAt,
      reviewCount: i.reviewCount,
    })),
    addItem: srs.addItem,
    addMany: srs.addMany,
    removeItem: srs.removeItem,
    markReviewed: (id: string) => srs.rateItem(id, 'good'),
    clearAll: srs.clearAll,
  };
}
