import type { Curriculum } from '../types';

export function countSteps(curriculum: Curriculum) {
  let n = 0;
  for (const phase of curriculum.phases) {
    for (const week of phase.weeks) {
      for (const day of week.days) {
        n += day.steps.length;
      }
    }
  }
  return n;
}

export function countGrammarUnits(curriculum: Curriculum) {
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
