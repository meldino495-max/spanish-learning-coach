import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SRSRating } from './srsCore';
import {
  computeNextReview,
  getDueItems,
  getNewItemsToday,
  loadSRSItems,
  saveSRSItems,
  type SRSItem,
} from './srsCore';

export type { SRSItem, SRSRating };

export function useSRS() {
  const [items, setItems] = useState<SRSItem[]>(() => loadSRSItems());

  useEffect(() => {
    saveSRSItems(items);
  }, [items]);

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
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    if (window.confirm('清空间隔重复库？所有语块进度将丢失。')) setItems([]);
  }, []);

  return { items, dueItems, newToday, addItem, addMany, rateItem, removeItem, clearAll };
}

/** @deprecated 使用 useSRS */
export function useAccumulation() {
  const srs = useSRS();
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
