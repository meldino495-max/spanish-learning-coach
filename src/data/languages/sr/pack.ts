import { createMultiLangPack } from '../shared/createMultiLangPack';
import { SR_A1, SR_A2, SR_B1, SR_CORE_CHUNKS, SR_PROFESSIONS, SR_SCENARIOS } from './content';
import { SR_EXTENDED } from './extended';

export const SR_PACK = createMultiLangPack(
  'sr',
  {
    A1: SR_A1,
    A2: SR_A2,
    B1: SR_B1,
    CORE_CHUNKS: SR_CORE_CHUNKS,
    SCENARIOS: SR_SCENARIOS,
    PROFESSIONS: SR_PROFESSIONS,
  },
  SR_EXTENDED,
);
