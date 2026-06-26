import type { CefrLevel, GrammarTopic } from '../../grammar/types';
import type { ScenarioPack, ScenarioPhrase } from '../../scenarios/types';

export function makePickChunks(core: ScenarioPhrase[]) {
  return (
    _level: CefrLevel,
    unitIndex: number,
    examples: string[],
    count = 6,
  ): ScenarioPhrase[] => {
    const fromExamples = examples.slice(0, 3).map((es) => ({
      es,
      zh: '（本课例句，请对照语法理解）',
      note: '情景联想：想象使用场合',
    }));
    const start = (unitIndex * 4) % Math.max(core.length, 1);
    const fromCore = core.slice(start, start + count);
    return [...fromExamples, ...fromCore].slice(0, count + 2);
  };
}

export function enrichTopicForLanguage(
  coreChunks: ScenarioPhrase[],
  getScenario: (unitIndex: number) => { chunks: ScenarioPhrase[]; title?: string; icon?: string },
  level: CefrLevel,
  unitIndex: number,
  topic: GrammarTopic,
): GrammarTopic {
  const pickChunks = makePickChunks(coreChunks);
  const chunks =
    topic.chunks?.length ? topic.chunks : pickChunks(level, unitIndex, topic.examples, 8);

  return {
    ...enrichTopicForLanguageBase(level, unitIndex, topic, chunks),
    unitScenario: getScenario(unitIndex) as ScenarioPack,
  };
}

function enrichTopicForLanguageBase(
  _level: CefrLevel,
  _unitIndex: number,
  topic: GrammarTopic,
  chunks: ScenarioPhrase[],
): GrammarTopic {
  return {
    ...topic,
    chunks,
    feynmanQuestion:
      topic.feynmanQuestion ??
      `用中文解释：为什么本课例句「${topic.examples[0] ?? topic.title}」这样说？`,
    feynmanHint: topic.feynmanHint ?? `参考：${topic.rules.slice(0, 100)}…`,
    shadowingLines:
      topic.shadowingLines ??
      [...topic.examples, topic.speakPrompt].filter((s) => s.length > 5 && s.length < 120).slice(0, 5),
    fillBlanks:
      topic.fillBlanks?.length ?
        topic.fillBlanks
      : topic.examples.slice(0, 3).map((ex) => {
          const words = ex.split(/\s+/);
          const idx = Math.min(1, words.length - 2);
          const answer = words[idx]?.replace(/[.,!?¿¡]/g, '') ?? '';
          return {
            prompt: words.map((w, i) => (i === idx ? '______' : w)).join(' '),
            answer,
          };
        }),
    translationDrills:
      topic.translationDrills ??
      topic.examples.slice(0, 3).map((es, i) => ({
        zh: `请用本课语法翻译例句 ${i + 1}`,
        es,
      })),
    practiceItems: topic.practiceItems ?? [
      '【语块】背 3 个整句',
      '【费曼】用中文讲解本课语法',
      '【跟读】每句 3 遍',
      '【场景】用本课语法描述身边 3 样东西',
    ],
  };
}
