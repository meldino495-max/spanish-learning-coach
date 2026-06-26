import type { ReadingComprehensionQuestion, ReadingTurn, Step } from '../../types';
import type { CefrLevel, GrammarTopic } from './types';

interface SentencePair {
  es: string;
  zh: string;
}

const SENTENCES_BY_LEVEL: Record<CefrLevel, number> = {
  A1: 4,
  A2: 5,
  B1: 6,
  B2: 6,
  C1: 7,
  C2: 7,
};

const DIALOGUE_LEVELS: CefrLevel[] = ['A1', 'A2'];

const SPEAKER_NAMES = ['Ana', 'Luis'];

/** 干扰用语法术语池（按需排除当前课程标题） */
const GRAMMAR_TERM_POOL = [
  '名词阴阳性',
  '定冠词与不定冠词',
  '现在时变位',
  'Ser 与 Estar',
  '直接宾语代词',
  '过去未完成时',
  '简单过去时',
  '虚拟式现在时',
  'Por 与 Para',
  '自反动词',
  '命令式',
  '将来时',
  '条件式',
  '形容词一致',
  '比较级与最高级',
];

/** 与课文无关的句子，用作「哪句出现过」的干扰项 */
const DISTRACTOR_SENTENCES = [
  'Hoy hace muy buen tiempo.',
  'Me gusta mucho el café por la mañana.',
  'Vivo cerca de la estación de tren.',
  'El fin de semana descanso en casa.',
  'Mañana voy a comprar pan y fruta.',
];

/** 与课文无关的中文释义，用作词义题干扰项 */
const DISTRACTOR_MEANINGS = ['天气很好', '我住在城里', '这很有意思', '我们一起出发吧', '价格有点贵'];

function dedupe<T>(arr: T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

function buildSentencePairs(topic: GrammarTopic): SentencePair[] {
  const fromChunks = (topic.chunks ?? [])
    .filter((c) => c.es && c.es.length > 3)
    .map((c) => ({ es: c.es.trim(), zh: c.zh?.trim() || '' }));

  const zhByEs = new Map(fromChunks.map((c) => [c.es, c.zh]));
  const fromExamples = topic.examples
    .filter((e) => e && e.length > 3)
    .map((e) => ({ es: e.trim(), zh: zhByEs.get(e.trim()) || '' }));

  return dedupe([...fromChunks, ...fromExamples], (x) => x.es);
}

function buildQuestions(
  topic: GrammarTopic,
  used: SentencePair[],
  unused: SentencePair[],
): ReadingComprehensionQuestion[] {
  const questions: ReadingComprehensionQuestion[] = [];

  // Q1 主旨题：考查本课语法点
  const termDistractors = GRAMMAR_TERM_POOL.filter((t) => t !== topic.title).slice(0, 3);
  questions.push({
    question: '这段内容主要练习哪个语法点？',
    options: [topic.title, ...termDistractors],
    correctIndex: 0,
    explanation: topic.goal,
  });

  // Q2 细节题：哪句话确实出现在课文中
  if (used.length > 0) {
    const correct = used[Math.min(1, used.length - 1)].es;
    const wrongPool = dedupe(
      [...unused.map((u) => u.es), ...DISTRACTOR_SENTENCES],
      (x) => x,
    ).filter((s) => s !== correct);
    const distractors = wrongPool.slice(0, 3);
    if (distractors.length >= 2) {
      questions.push({
        question: '根据上文，下列哪一句确实出现过？',
        options: [correct, ...distractors],
        correctIndex: 0,
        explanation: '其余选项没有在课文中出现。',
      });
    }
  }

  // Q3 词义题：课文中某句/词块的含义
  const vocabPair = used.find((u) => u.zh) ?? used[0];
  if (vocabPair && vocabPair.zh) {
    const meaningDistractors = dedupe(
      [
        ...used.filter((u) => u.zh && u.zh !== vocabPair.zh).map((u) => u.zh),
        ...DISTRACTOR_MEANINGS,
      ],
      (x) => x,
    ).slice(0, 3);
    if (meaningDistractors.length >= 2) {
      questions.push({
        question: `课文中「${vocabPair.es}」的意思是？`,
        options: [vocabPair.zh, ...meaningDistractors],
        correctIndex: 0,
      });
    }
  }

  return questions;
}

/** 把生成结果中的正确项打乱位置，避免答案永远是第一个 */
function shuffleOptions(q: ReadingComprehensionQuestion, seed: number): ReadingComprehensionQuestion {
  const correct = q.options[q.correctIndex];
  // 用 seed 决定正确项放到第几位（确定性，避免每次渲染变化）
  const target = q.options.length > 0 ? seed % q.options.length : 0;
  const rest = q.options.filter((_, i) => i !== q.correctIndex);
  const options: string[] = [];
  let r = 0;
  for (let i = 0; i < q.options.length; i++) {
    if (i === target) options.push(correct);
    else options.push(rest[r++]);
  }
  return { ...q, options, correctIndex: target };
}

export function buildReadingStep(level: CefrLevel, topic: GrammarTopic, id: string): Step {
  const override = topic.reading;
  const isDialogue = (override?.format ?? (DIALOGUE_LEVELS.includes(level) ? 'dialogue' : 'article')) === 'dialogue';

  // 句子来源
  const allPairs = override?.sentences?.length
    ? override.sentences.map((s) => ({ es: s.es.trim(), zh: s.zh?.trim() ?? '' }))
    : buildSentencePairs(topic);
  const count = SENTENCES_BY_LEVEL[level] ?? 5;
  const used = allPairs.slice(0, count);
  const unused = allPairs.slice(count);

  const title = override?.title ?? (isDialogue ? `情景对话：${topic.title}` : `阅读短文：${topic.titleEs}`);
  const context =
    override?.context ??
    (isDialogue
      ? `下面是一段围绕「${topic.title}」的日常对话。先朗读西语，再看中文，最后完成理解题。`
      : `阅读下面这段关于「${topic.title}」的短文，理解大意后完成下方理解题。生词可点 🔊 跟读。`);

  // 题目
  const baseQuestions =
    override?.questions?.length ? override.questions : buildQuestions(topic, used, unused);
  const seed = topic.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const questions = baseQuestions.map((q, i) => shuffleOptions(q, seed + i + 1));

  const step: Step = {
    id: `${id}-reading`,
    type: 'reading',
    session: 'deep',
    title: isDialogue ? '⑩ 读：情景对话 + 理解' : '⑩ 读：阅读理解',
    durationMin: 12,
    readingFormat: isDialogue ? 'dialogue' : 'article',
    readingContext: context,
    readingQuestions: questions,
    instructions: title,
  };

  if (isDialogue) {
    const turns: ReadingTurn[] =
      override?.turns?.length
        ? override.turns
        : used.map((p, i) => ({
            speaker: SPEAKER_NAMES[i % SPEAKER_NAMES.length],
            es: p.es,
            zh: p.zh,
          }));
    step.readingTurns = turns;
  } else {
    step.readingSentences = used;
  }

  return step;
}
