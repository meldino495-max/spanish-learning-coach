import type { LanguageId } from '../../languages/registry';
import { ES_PACK } from './es/pack';
import { FR_PACK } from './fr/pack';
import { SR_PACK } from './sr/pack';
import { UK_PACK } from './uk/pack';
import { RU_PACK } from './ru/pack';
import type { LanguagePack } from './packTypes';
import type { LifeScenario, ProfessionPack, ScenarioPhrase } from '../scenarios/types';

const PACKS: Record<LanguageId, LanguagePack> = {
  es: ES_PACK,
  fr: FR_PACK,
  sr: SR_PACK,
  uk: UK_PACK,
  ru: RU_PACK,
};

export function getLanguagePack(id: LanguageId): LanguagePack {
  return PACKS[id];
}

export function getAllLanguagePacks(): LanguagePack[] {
  return Object.values(PACKS);
}

/** 当前语言包快捷导出（供旧模块兼容，默认西语） */
export { ES_PACK };

export function countScenarioPhrasesForPack(pack: LanguagePack): number {
  const life = pack.lifeScenarios.reduce(
    (n, s) => n + s.sections.reduce((m, sec) => m + sec.phrases.length, 0),
    0,
  );
  const prof = pack.professionPacks.reduce(
    (n, p) => n + p.sections.reduce((m, sec) => m + sec.phrases.length, 0),
    0,
  );
  return life + prof;
}

export function getAllPhrasesFromScenario(scenario: LifeScenario): ScenarioPhrase[] {
  return scenario.sections.flatMap((s) => s.phrases);
}

export function getAllPhrasesFromProfession(prof: ProfessionPack): ScenarioPhrase[] {
  return prof.sections.flatMap((s) => s.phrases);
}

export const SPAIN_COMMON_PROFESSION_COUNT = (pack: LanguagePack) =>
  pack.professionPacks.filter((p) => p.spainCommon).length;

export const SCENARIO_CATEGORIES = [
  { id: 'universal', label: '通用沟通', icon: '💬' },
  { id: 'medical', label: '医疗', icon: '🏥' },
  { id: 'finance', label: '银行金融', icon: '🏦' },
  { id: 'government', label: '政府政务', icon: '🏛️' },
  { id: 'daily', label: '日常生活', icon: '🏠' },
] as const;
