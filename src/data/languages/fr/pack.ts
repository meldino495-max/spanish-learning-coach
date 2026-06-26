import { createMultiLangPack } from '../shared/createMultiLangPack';
import { FR_A1, FR_A2, FR_B1, FR_CORE_CHUNKS, FR_PROFESSIONS, FR_SCENARIOS } from './content';
import { FR_EXTENDED } from './extended';

export const FR_PACK = createMultiLangPack(
  'fr',
  {
    A1: FR_A1,
    A2: FR_A2,
    B1: FR_B1,
    CORE_CHUNKS: FR_CORE_CHUNKS,
    SCENARIOS: FR_SCENARIOS,
    PROFESSIONS: FR_PROFESSIONS,
  },
  FR_EXTENDED,
);
