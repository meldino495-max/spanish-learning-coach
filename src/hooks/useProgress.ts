import { useCallback, useEffect, useState } from 'react';
import type { ProgressMap } from '../types';

const STORAGE_KEY = 'es-coach-progress-v1';

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ProgressMap) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const toggleStep = useCallback((stepId: string) => {
    setProgress((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  }, []);

  const markStep = useCallback((stepId: string, done: boolean) => {
    setProgress((prev) => ({ ...prev, [stepId]: done }));
  }, []);

  const resetAll = useCallback(() => {
    if (window.confirm('确定清空所有学习进度？此操作不可撤销。')) {
      setProgress({});
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { progress, toggleStep, markStep, resetAll };
}
