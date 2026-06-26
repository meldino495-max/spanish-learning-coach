import type { Curriculum, PhasePlan } from '../../../types';
import type { CefrLevel, GrammarTopic } from '../../grammar/types';
import { LEVEL_META } from '../../grammar/types';
import { buildGrammarDay, groupIntoWeeks } from '../../grammar/buildUnit';
import { enrichTopic as enrichTopicGeneric } from '../../grammar/enrichTopic';

type LevelBlock = { level: CefrLevel; topics: GrammarTopic[] };

function getWeekOffset(levels: LevelBlock[], level: CefrLevel): number {
  const order = levels.map((l) => l.level);
  const counts = Object.fromEntries(levels.map((l) => [l.level, l.topics.length])) as Record<
    CefrLevel,
    number
  >;
  let offset = 1;
  for (const l of order) {
    if (l === level) return offset;
    offset += Math.ceil((counts[l] ?? 0) / 5);
  }
  return 1;
}

function buildPhase(
  level: CefrLevel,
  topics: GrammarTopic[],
  levels: LevelBlock[],
  enrich: (level: CefrLevel, index: number, topic: GrammarTopic) => GrammarTopic,
  languageId: string,
): PhasePlan {
  const meta = LEVEL_META[level];
  const items = topics.map((t, i) => {
    const enriched = enrich(level, i, t);
    return { topic: enriched, day: buildGrammarDay(level, i, enriched, languageId) };
  });
  return {
    id: level.toLowerCase(),
    phaseNum: meta.phaseNum,
    title: meta.title,
    level,
    description: `${meta.description}\n\n🎯 本级能力：${meta.canDo}\n📚 共 ${topics.length} 个语法单元`,
    weeks: groupIntoWeeks(level, items, getWeekOffset(levels, level)),
  };
}

/** 从分级话题构建课程（西语 A1–C2 及其他语言 A1–B1 等） */
export function buildCurriculumFromLevels(
  meta: Omit<Curriculum, 'phases'>,
  levels: LevelBlock[],
  enrich: (level: CefrLevel, index: number, topic: GrammarTopic) => GrammarTopic = enrichTopicGeneric,
  languageId = 'es',
): Curriculum {
  const phases = levels
    .filter((l) => l.topics.length > 0)
    .map((l) => buildPhase(l.level, l.topics, levels, enrich, languageId));
  return { ...meta, phases };
}
