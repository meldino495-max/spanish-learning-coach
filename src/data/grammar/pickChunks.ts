import type { CefrLevel } from './types';
import type { ScenarioPhrase as ChunkEntry } from '../scenarios/types';
import { CORE_CHUNKS } from './coreChunks';
import { SCENARIO_PACKS } from '../scenarios';

export function pickChunksForTopic(
  _level: CefrLevel,
  unitIndex: number,
  examples: string[],
  count = 6,
): ChunkEntry[] {
  const fromExamples = examples.slice(0, 3).map((es) => ({
    es,
    zh: '（本课例句，请对照语法理解）',
    note: '情景联想：想象你在什么场合说这句话',
  }));

  const coreStart = (unitIndex * 4) % CORE_CHUNKS.length;
  const fromCore = CORE_CHUNKS.slice(coreStart, coreStart + count - fromExamples.length);

  const scenarioKeys = Object.keys(SCENARIO_PACKS);
  const scenario = SCENARIO_PACKS[scenarioKeys[unitIndex % scenarioKeys.length]];
  const fromScenario = scenario.chunks.slice(0, 2);

  return [...fromExamples, ...fromCore, ...fromScenario].slice(0, count + 2);
}
