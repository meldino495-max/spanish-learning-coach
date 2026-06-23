import type { Curriculum } from '../types';
import { week01 } from './weeks/week01';
import { week02 } from './weeks/week02';
import { week03, week04 } from './weeks/week03-04';
import { week05, week06, week07, week08 } from './weeks/week05-08';
import { week09, week10, week11, week12 } from './weeks/week09-12';

export const curriculum: Curriculum = {
  title: '西语母语冲刺计划',
  subtitle: '12 周系统路线 · 从能交流到接近母语表达',
  startLevel: 'B1（能简单交流）',
  targetLevel: 'C1+（地道表达、自如辩论）',
  phases: [
    {
      id: 'p1',
      phaseNum: 1,
      title: '夯实 B1 地基',
      level: 'B1',
      description: '过去时、代词、将来/条件式——把「能说」变成「说得对」。',
      weeks: [week01, week02, week03, week04],
    },
    {
      id: 'p2',
      phaseNum: 2,
      title: '攻克 B2 核心',
      level: 'B2',
      description: '虚拟式全家桶、por/para、连接词——西语分水岭。',
      weeks: [week05, week06, week07, week08],
    },
    {
      id: 'p3',
      phaseNum: 3,
      title: '流利与地道',
      level: 'B2+',
      description: '习语、语域、辩论——听起来像「自己人」。',
      weeks: [week09, week10, week11],
    },
    {
      id: 'p4',
      phaseNum: 4,
      title: '母语感与终身系统',
      level: 'C1',
      description: '沉浸式日程、影视、毕业口试——建立可持续习惯。',
      weeks: [week12],
    },
  ],
};

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
