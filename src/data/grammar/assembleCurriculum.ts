import type { Curriculum, PhasePlan } from '../../types';
import { buildGrammarDay, groupIntoWeeks } from './buildUnit';
import { enrichTopic } from './enrichTopic';
import type { CefrLevel, GrammarTopic } from './types';
import { LEVEL_META } from './types';
import { A1_TOPICS } from './levels/a1';
import { A2_TOPICS } from './levels/a2';
import { B1_TOPICS } from './levels/b1';
import { B2_TOPICS } from './levels/b2';
import { C1_TOPICS, C2_TOPICS } from './levels/b2-c2';

function buildPhase(level: CefrLevel, topics: GrammarTopic[]): PhasePlan {
  const meta = LEVEL_META[level];
  const items = topics.map((t, i) => {
    const enriched = enrichTopic(level, i, t);
    return {
      topic: enriched,
      day: buildGrammarDay(level, i, enriched),
    };
  });
  const globalWeekOffset = getWeekOffset(level);
  const weeks = groupIntoWeeks(level, items, globalWeekOffset);

  return {
    id: level.toLowerCase(),
    phaseNum: meta.phaseNum,
    title: meta.title,
    level,
    description: `${meta.description}\n\n🎯 本级能力：${meta.canDo}\n📚 共 ${topics.length} 个语法单元`,
    weeks,
  };
}

/** 累计周次偏移，使全局 weekNum 连续 */
function getWeekOffset(level: CefrLevel): number {
  const order: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const counts: Record<CefrLevel, number> = {
    A1: A1_TOPICS.length,
    A2: A2_TOPICS.length,
    B1: B1_TOPICS.length,
    B2: B2_TOPICS.length,
    C1: C1_TOPICS.length,
    C2: C2_TOPICS.length,
  };
  let offset = 1;
  for (const l of order) {
    if (l === level) return offset;
    offset += Math.ceil(counts[l] / 5); // 5 topics per week + review
  }
  return 1;
}

export function buildFullCurriculum(): Curriculum {
  const phases = [
    buildPhase('A1', A1_TOPICS),
    buildPhase('A2', A2_TOPICS),
    buildPhase('B1', B1_TOPICS),
    buildPhase('B2', B2_TOPICS),
    buildPhase('C1', C1_TOPICS),
    buildPhase('C2', C2_TOPICS),
  ];

  const totalTopics =
    A1_TOPICS.length +
    A2_TOPICS.length +
    B1_TOPICS.length +
    B2_TOPICS.length +
    C1_TOPICS.length +
    C2_TOPICS.length;

  return {
    title: '西语完整语法路线 A1→C2',
    subtitle: `${totalTopics} 语法单元 · SRS + 语块 + 跟读 + 费曼 · A1→C2`,
    startLevel: 'A1（零基础）',
    targetLevel: 'C2（精通）',
    phases,
  };
}

export const GRAMMAR_INDEX = [
  { level: 'A1' as const, count: A1_TOPICS.length, topics: A1_TOPICS.map((t) => t.title) },
  { level: 'A2' as const, count: A2_TOPICS.length, topics: A2_TOPICS.map((t) => t.title) },
  { level: 'B1' as const, count: B1_TOPICS.length, topics: B1_TOPICS.map((t) => t.title) },
  { level: 'B2' as const, count: B2_TOPICS.length, topics: B2_TOPICS.map((t) => t.title) },
  { level: 'C1' as const, count: C1_TOPICS.length, topics: C1_TOPICS.map((t) => t.title) },
  { level: 'C2' as const, count: C2_TOPICS.length, topics: C2_TOPICS.map((t) => t.title) },
];
