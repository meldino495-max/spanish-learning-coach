import { createMultiLangPack } from '../shared/createMultiLangPack';
import { UK_A1, UK_A2, UK_B1, UK_CORE_CHUNKS, UK_PROFESSIONS, UK_SCENARIOS } from './content';
import { UK_EXTENDED } from './extended';

export const UK_PACK = createMultiLangPack(
  'uk',
  {
    A1: UK_A1,
    A2: UK_A2,
    B1: UK_B1,
    CORE_CHUNKS: UK_CORE_CHUNKS,
    SCENARIOS: UK_SCENARIOS,
    PROFESSIONS: UK_PROFESSIONS,
  },
  UK_EXTENDED,
);
