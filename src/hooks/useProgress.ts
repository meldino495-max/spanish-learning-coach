import { useCallback, useEffect, useState } from 'react';
import type { ProgressMap } from '../types';

export function useProgress(storagePrefix: string) {
  const storageKey = `${storagePrefix}-progress-v1`;

  const [progress, setProgress] = useState<ProgressMap>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as ProgressMap) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    setProgress(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        return raw ? (JSON.parse(raw) as ProgressMap) : {};
      } catch {
        return {};
      }
    });
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [storageKey, progress]);

  const toggleStep = useCallback((stepId: string) => {
    setProgress((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  }, []);

  const markStep = useCallback((stepId: string, done: boolean) => {
    setProgress((prev) => ({ ...prev, [stepId]: done }));
  }, []);

  const resetAll = useCallback(() => {
    if (window.confirm('确定清空所有学习进度？此操作不可撤销。')) {
      setProgress({});
      localStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  return { progress, toggleStep, markStep, resetAll };
}
