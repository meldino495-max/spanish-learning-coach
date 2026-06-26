import { createMultiLangPack } from '../shared/createMultiLangPack';
import { RU_A1, RU_A2, RU_B1, RU_CORE_CHUNKS, RU_PROFESSIONS, RU_SCENARIOS } from './content';
import { RU_EXTENDED } from './extended';

export const RU_PACK = createMultiLangPack(
  'ru',
  {
    A1: RU_A1,
    A2: RU_A2,
    B1: RU_B1,
    CORE_CHUNKS: RU_CORE_CHUNKS,
    SCENARIOS: RU_SCENARIOS,
    PROFESSIONS: RU_PROFESSIONS,
  },
  RU_EXTENDED,
);
