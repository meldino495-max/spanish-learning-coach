import type { Curriculum } from '../types';
import { buildFullCurriculum } from './grammar/assembleCurriculum';

export const curriculum: Curriculum = buildFullCurriculum();

/** 扁平化所有步骤，便于统计进度 */
export function getAllStepIds(): string[] {
  const ids: string[] = [];
  for (const phase of curriculum.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        for (const step of day.steps) {
          ids.push(step.id);
        }
      }
    }
  }
  return ids;
}

export function countSteps() {
  return getAllStepIds().length;
}

export function countGrammarUnits() {
  let n = 0;
  for (const phase of curriculum.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        if (!day.id.includes('review')) n++;
      }
    }
  }
  return n;
}

export { GRAMMAR_INDEX } from './grammar/assembleCurriculum';
