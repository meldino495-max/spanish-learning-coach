import type { LanguageId } from '../../languages/registry';
import type { Curriculum } from '../../types';
import type { CefrLevel, GrammarTopic } from '../grammar/types';
import type { LifeScenario, ProfessionPack, ScenarioPack, ScenarioPhrase } from '../scenarios/types';

export interface LanguagePack {
  id: LanguageId;
  curriculum: Curriculum;
  lifeScenarios: LifeScenario[];
  professionPacks: ProfessionPack[];
  coreChunks: ScenarioPhrase[];
  scenarioPacks: Record<string, ScenarioPack>;
  enrichTopic: (level: CefrLevel, unitIndex: number, topic: GrammarTopic) => GrammarTopic;
  getScenarioForUnit: (unitIndex: number) => ScenarioPack;
  pickChunksForTopic: (
    level: CefrLevel,
    unitIndex: number,
    examples: string[],
    count?: number,
  ) => ScenarioPhrase[];
}
