import { HOSPITAL_SCENARIO } from './hospital';

import { BANK_SCENARIO } from './bank';

import { GOVERNMENT_SCENARIO } from './government';

import { UNIVERSAL_COMMUNICATION_SCENARIO } from './universal';

import { DAILY_LIFE_SCENARIOS } from './dailyLife';

import { PROFESSION_PACKS } from './industries';

import type { LifeScenario, ProfessionPack, ScenarioPack, ScenarioPhrase } from './types';



/** 核心生活场景：医疗、金融、政务 + 日常 */

export const LIFE_SCENARIOS: LifeScenario[] = [

  UNIVERSAL_COMMUNICATION_SCENARIO,

  HOSPITAL_SCENARIO,

  BANK_SCENARIO,

  GOVERNMENT_SCENARIO,

  ...DAILY_LIFE_SCENARIOS,

];



export { PROFESSION_PACKS };



export const SPAIN_COMMON_PROFESSION_COUNT = PROFESSION_PACKS.filter((p) => p.spainCommon).length;



export const SCENARIO_CATEGORIES = [

  { id: 'universal', label: '通用沟通', icon: '💬' },

  { id: 'medical', label: '医疗', icon: '🏥' },

  { id: 'finance', label: '银行金融', icon: '🏦' },

  { id: 'government', label: '政府政务', icon: '🏛️' },

  { id: 'daily', label: '日常生活', icon: '🏠' },

] as const;



export function getLifeScenarioById(id: string): LifeScenario | undefined {

  return LIFE_SCENARIOS.find((s) => s.id === id);

}



export function getProfessionById(id: string): ProfessionPack | undefined {

  return PROFESSION_PACKS.find((p) => p.id === id);

}



/** 统计场景总句数 */

export function countScenarioPhrases(): number {

  const life = LIFE_SCENARIOS.reduce(

    (n, s) => n + s.sections.reduce((m, sec) => m + sec.phrases.length, 0),

    0,

  );

  const prof = PROFESSION_PACKS.reduce(

    (n, p) => n + p.sections.reduce((m, sec) => m + sec.phrases.length, 0),

    0,

  );

  return life + prof;

}



/** 供语法课 buildUnit 轮播的轻量场景包 */

export const SCENARIO_PACKS: Record<string, ScenarioPack> = Object.fromEntries(

  LIFE_SCENARIOS.map((s) => [

    s.id,

    {

      title: s.title,

      icon: s.icon,

      chunks: s.sections.flatMap((sec) => sec.phrases).slice(0, 8),

    },

  ]),

);



export function getScenarioForUnit(unitIndex: number): ScenarioPack {

  const keys = Object.keys(SCENARIO_PACKS);

  return SCENARIO_PACKS[keys[unitIndex % keys.length]];

}



export function getAllPhrasesFromScenario(scenario: LifeScenario): ScenarioPhrase[] {

  return scenario.sections.flatMap((s) => s.phrases);

}



export function getAllPhrasesFromProfession(prof: ProfessionPack): ScenarioPhrase[] {
  const sectionPhrases = prof.sections.flatMap((s) => s.phrases);
  const dialoguePhrases =
    prof.readingDialogues?.flatMap((d) =>
      d.turns.map((t) => ({ es: t.es, zh: t.zh, note: t.speaker, chunkLabel: t.speaker })),
    ) ?? [];
  const tutorialPhrases =
    prof.tutorials?.flatMap((t) =>
      t.keyPhrase ? [{ es: t.keyPhrase.es, zh: t.keyPhrase.zh, note: t.title }] : [],
    ) ?? [];
  return [...sectionPhrases, ...dialoguePhrases, ...tutorialPhrases];
}

