import { buildFullCurriculum } from '../../grammar/assembleCurriculum';
import { enrichTopic } from '../../grammar/enrichTopic';
import { CORE_CHUNKS } from '../../grammar/coreChunks';
import { pickChunksForTopic } from '../../grammar/pickChunks';
import {
  LIFE_SCENARIOS,
  PROFESSION_PACKS,
  SCENARIO_PACKS,
  getScenarioForUnit,
} from '../../scenarios';
import type { LanguagePack } from '../packTypes';

export const ES_PACK: LanguagePack = {
  id: 'es',
  curriculum: buildFullCurriculum(),
  lifeScenarios: LIFE_SCENARIOS,
  professionPacks: PROFESSION_PACKS,
  coreChunks: CORE_CHUNKS,
  scenarioPacks: SCENARIO_PACKS,
  enrichTopic,
  getScenarioForUnit,
  pickChunksForTopic,
};
