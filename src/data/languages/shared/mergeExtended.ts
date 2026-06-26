import type { LanguageId } from '../../../languages/registry';
import type { GrammarTopic } from '../../grammar/types';
import type { LifeScenario, ProfessionPack, ScenarioPhrase } from '../../scenarios/types';

export interface ExtendedLanguageContent {
  extraA1: GrammarTopic[];
  extraA2: GrammarTopic[];
  extraB1: GrammarTopic[];
  b2: GrammarTopic[];
  c1: GrammarTopic[];
  c2: GrammarTopic[];
  extraChunks: ScenarioPhrase[];
  extraScenarios: LifeScenario[];
  extraProfessions: ProfessionPack[];
}

export function mergeGrammarLevels(
  base: { A1: GrammarTopic[]; A2: GrammarTopic[]; B1: GrammarTopic[] },
  ext: ExtendedLanguageContent,
) {
  return {
    A1: [...base.A1, ...ext.extraA1],
    A2: [...base.A2, ...ext.extraA2],
    B1: [...base.B1, ...ext.extraB1],
    B2: ext.b2,
    C1: ext.c1,
    C2: ext.c2,
  };
}

export function mergeScenarios(base: LifeScenario[], extra: LifeScenario[]): LifeScenario[] {
  const byId = new Map<string, LifeScenario>();
  for (const s of base) byId.set(s.id, s);
  for (const s of extra) {
    const prev = byId.get(s.id);
    if (!prev) {
      byId.set(s.id, s);
      continue;
    }
    byId.set(s.id, {
      ...prev,
      description: s.description || prev.description,
      sections: [...prev.sections, ...s.sections.filter((sec) => !prev.sections.some((p) => p.id === sec.id))],
    });
  }
  return [...byId.values()];
}

export function mergeProfessions(base: ProfessionPack[], extra: ProfessionPack[]): ProfessionPack[] {
  const byId = new Map<string, ProfessionPack>();
  for (const p of base) byId.set(p.id, p);
  for (const p of extra) if (!byId.has(p.id)) byId.set(p.id, p);
  return [...byId.values()];
}

export type MultiLangId = Exclude<LanguageId, 'es'>;

export const FULL_CURRICULUM_META: Record<
  MultiLangId,
  { title: string; subtitle: string; startLevel: string; targetLevel: string }
> = {
  fr: {
    title: '法语完整路线 A1→C2',
    subtitle: 'SRS + 语块 + 跟读 + 费曼 · 听→说→读→写',
    startLevel: 'A1（零基础）',
    targetLevel: 'C2（近母语）',
  },
  sr: {
    title: '塞尔维亚语完整路线 A1→C2',
    subtitle: 'SRS + 语块 + 跟读 + 费曼 · 拉丁/西里尔',
    startLevel: 'A1（零基础）',
    targetLevel: 'C2（近母语）',
  },
  uk: {
    title: '乌克兰语完整路线 A1→C2',
    subtitle: 'SRS + 语块 + 跟读 + 费曼 · 乌克兰西里尔',
    startLevel: 'A1（零基础）',
    targetLevel: 'C2（近母语）',
  },
  ru: {
    title: '俄语完整路线 A1→C2',
    subtitle: 'SRS + 语块 + 跟读 + 费曼 · 俄语西里尔',
    startLevel: 'A1（零基础）',
    targetLevel: 'C2（近母语）',
  },
};
