import type { LanguagePack } from '../packTypes';
import { buildCurriculumFromLevels } from './buildCurriculum';
import { enrichTopicForLanguage, makePickChunks } from './languageEnrich';
import type { CefrLevel, GrammarTopic } from '../../grammar/types';
import type { LifeScenario, ProfessionPack, ScenarioPhrase } from '../../scenarios/types';
import {
  FULL_CURRICULUM_META,
  mergeGrammarLevels,
  mergeProfessions,
  mergeScenarios,
  type ExtendedLanguageContent,
  type MultiLangId,
} from './mergeExtended';

interface BaseContent {
  A1: GrammarTopic[];
  A2: GrammarTopic[];
  B1: GrammarTopic[];
  CORE_CHUNKS: ScenarioPhrase[];
  SCENARIOS: LifeScenario[];
  PROFESSIONS: ProfessionPack[];
}

export function createMultiLangPack(
  id: MultiLangId,
  base: BaseContent,
  extended: ExtendedLanguageContent,
): LanguagePack {
  const levels = mergeGrammarLevels(
    { A1: base.A1, A2: base.A2, B1: base.B1 },
    extended,
  );
  const coreChunks = [...base.CORE_CHUNKS, ...extended.extraChunks];
  const lifeScenarios = mergeScenarios(base.SCENARIOS, extended.extraScenarios);
  const professionPacks = mergeProfessions(base.PROFESSIONS, extended.extraProfessions);

  const SCENARIO_PACKS = Object.fromEntries(
    lifeScenarios.map((s) => [
      s.id,
      { title: s.title, icon: s.icon, chunks: s.sections.flatMap((sec) => sec.phrases).slice(0, 8) },
    ]),
  );

  function getScenarioForUnit(unitIndex: number) {
    const keys = Object.keys(SCENARIO_PACKS);
    return SCENARIO_PACKS[keys[unitIndex % keys.length]];
  }

  const pickChunks = makePickChunks(coreChunks);

  function enrich(level: CefrLevel, index: number, topic: GrammarTopic) {
    return enrichTopicForLanguage(coreChunks, getScenarioForUnit, level, index, topic);
  }

  const meta = FULL_CURRICULUM_META[id];

  return {
    id,
    curriculum: buildCurriculumFromLevels(meta, [
      { level: 'A1', topics: levels.A1 },
      { level: 'A2', topics: levels.A2 },
      { level: 'B1', topics: levels.B1 },
      { level: 'B2', topics: levels.B2 },
      { level: 'C1', topics: levels.C1 },
      { level: 'C2', topics: levels.C2 },
    ], enrich, id),
    lifeScenarios,
    professionPacks,
    coreChunks,
    scenarioPacks: SCENARIO_PACKS,
    enrichTopic: enrich,
    getScenarioForUnit,
    pickChunksForTopic: pickChunks,
  };
}
