import type { CefrLevel, GrammarTopic } from './types';
import { pickVocabForUnit, TOPIC_VOCAB, type VocabEntry } from './vocabBank';
import { pickChunksForTopic, getScenarioForUnit } from './chunkBank';

function makeFillBlanksFromExamples(examples: string[]): { prompt: string; answer: string }[] {
  return examples.slice(0, 3).map((ex) => {
    const words = ex.split(/\s+/);
    if (words.length < 3) return { prompt: ex.replace(/\S+/, '______'), answer: words[0] ?? '' };
    const idx = Math.min(1, words.length - 2);
    const answer = words[idx].replace(/[.,!?¿¡]/g, '');
    const prompt = words.map((w, i) => (i === idx ? '______' : w)).join(' ');
    return { prompt, answer };
  });
}

function makeExtraDictations(topic: GrammarTopic): string[] {
  const fromExamples = topic.examples.filter((e) => e.length < 80).slice(0, 2);
  const fromSpeak = topic.speakPrompt
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10 && s.length < 100)
    .slice(0, 2);
  return [...new Set([...fromExamples, ...fromSpeak, ...(topic.extraDictations ?? [])])].slice(0, 3);
}

function makeTranslationDrills(topic: GrammarTopic): { zh: string; es: string }[] {
  const base = topic.translationDrills ?? [];
  const fromExamples = topic.examples.slice(0, 2).map((es, i) => ({
    zh: `请用本课语法翻译例句 ${i + 1} 的含义（对照西语例句）`,
    es,
  }));
  return [...base, ...fromExamples].slice(0, 4);
}

function makeExtraQuizzes(topic: GrammarTopic): GrammarTopic['extraQuizzes'] {
  const extras = topic.extraQuizzes ?? [];
  if (extras.length >= 2) return extras;

  const wrong1 = topic.quiz.options.find((_, i) => i !== topic.quiz.correctIndex) ?? '错误选项';
  const generated = [
    {
      question: `改错：找出更地道的表达（${topic.titleEs}）`,
      options: [
        topic.quiz.options[topic.quiz.correctIndex],
        wrong1,
        topic.quiz.options[(topic.quiz.correctIndex + 2) % topic.quiz.options.length] ?? wrong1,
      ],
      correctIndex: 0,
      explanation: topic.quiz.explanation,
    },
    {
      question: `以下哪句正确使用了「${topic.title}」？`,
      options: [
        topic.examples[0] ?? topic.quiz.options[topic.quiz.correctIndex],
        topic.examples[1] ?? wrong1,
        wrong1,
      ],
      correctIndex: 0,
    },
  ];
  return [...extras, ...generated].slice(0, 3);
}

function makeExtraSpeak(topic: GrammarTopic): string[] {
  const prompts = [
    topic.speakPrompt,
    ...(topic.extraSpeakPrompts ?? []),
    `用「${topic.titleEs}」描述你今天做的一件事（至少 4 句）。`,
    `想象你在和语伴聊天，用本课语法问 3 个问题。`,
  ];
  return [...new Set(prompts)].slice(0, 3);
}

function makePracticeItems(topic: GrammarTopic): string[] {
  const base = topic.practiceItems ?? [];
  const generated = [
    `【语块】背 3 个整句，不要孤立背单词`,
    `【费曼】用自己的话解释本课语法（见费曼步骤）`,
    `【影子跟读】每句跟读 3 遍，模仿语调`,
    `变位快练：针对「${topic.titleEs}」写 10 个不同主语的句子`,
    `【场景】看到身边 3 样东西，用西语描述（Estoy en... Es mi...）`,
    `错题本：把本课例句改写成否定句或疑问句各 2 句`,
  ];
  return [...new Set([...base, ...generated])].slice(0, 6);
}

export function enrichTopic(level: CefrLevel, unitIndex: number, topic: GrammarTopic): GrammarTopic {
  const topicVocab = TOPIC_VOCAB[topic.id] ?? [];
  const levelVocab = pickVocabForUnit(level, unitIndex, 4);
  // 优先整句语块，孤立词仅作补充
  const chunks = topic.chunks?.length
    ? topic.chunks
    : pickChunksForTopic(level, unitIndex, topic.examples, 8);

  const vocabulary: VocabEntry[] = [
    ...chunks.map((c) => ({
      es: c.es,
      zh: c.zh,
      note: c.note ?? c.chunkLabel,
    })),
    ...topicVocab,
    ...levelVocab.filter((v) => !topicVocab.some((t) => t.es === v.es)).slice(0, 3),
  ].slice(0, 12);

  return {
    ...topic,
    vocabulary,
    chunks,
    feynmanQuestion:
      topic.feynmanQuestion ??
      `用中文向「完全不懂西语的朋友」解释：为什么本课例句用这样的语法？（例如：为什么是「${topic.examples[0] ?? topic.titleEs}」而不是别的说法？）`,
    feynmanHint:
      topic.feynmanHint ??
      `参考规则：${topic.rules.slice(0, 120)}…\n能讲明白 = 真懂了。`,
    shadowingLines:
      topic.shadowingLines ??
      [...topic.examples, topic.speakPrompt].filter((s) => s.length > 5 && s.length < 120).slice(0, 5),
    extraQuizzes: makeExtraQuizzes(topic),
    extraDictations: makeExtraDictations(topic),
    extraSpeakPrompts: makeExtraSpeak(topic).slice(1),
    fillBlanks: topic.fillBlanks?.length
      ? topic.fillBlanks
      : makeFillBlanksFromExamples(topic.examples),
    translationDrills: makeTranslationDrills(topic),
    practiceItems: makePracticeItems(topic),
  };
}

/** 供 buildUnit 读取场景包 */
export function getEnrichedScenario(unitIndex: number) {
  return getScenarioForUnit(unitIndex);
}

export function isVerbTopic(topic: GrammarTopic): boolean {
  const keys = ['时', '动词', '变位', 'pretérito', 'subjuntivo', 'imperativo', 'condicional', 'futuro', '虚拟', '过去', '命令'];
  const text = `${topic.title} ${topic.titleEs} ${topic.id}`;
  return keys.some((k) => text.toLowerCase().includes(k.toLowerCase()));
}
