import type { DayPlan, Step, WeekPlan } from '../../types';
import type { CefrLevel, GrammarTopic } from './types';
import { getEnrichedScenario, isVerbTopic } from './enrichTopic';
import { HOLA_PLAYLIST_URL, YOUTUBE_MAP, youtubeSearchUrl } from './types';

function videoStep(id: string, topic: GrammarTopic, session: 'micro' | 'deep'): Step {
  const key = topic.videoKey;
  if (key && YOUTUBE_MAP[key]) {
    const v = YOUTUBE_MAP[key];
    return {
      id: `${id}-video`,
      type: 'video',
      session,
      title: `① 听：${topic.titleEs}`,
      durationMin: session === 'micro' ? 8 : 15,
      youtubeId: v.id.startsWith('PL') ? undefined : v.id,
      youtubeTitle: v.title,
      instructions: `【听】观看视频，记录 2 条规则 + 3 个例句。\n\n学习顺序：听 → 说 → 读 → 写`,
      url: v.id.startsWith('PL') ? HOLA_PLAYLIST_URL : undefined,
      urlLabel: v.id.startsWith('PL') ? '打开 Hola Spanish 播放列表' : undefined,
    };
  }
  const search = topic.videoSearch ?? `${topic.titleEs} español gramática`;
  return {
    id: `${id}-video`,
    type: 'link',
    session,
    title: `① 听：${topic.titleEs}`,
    durationMin: 10,
    url: youtubeSearchUrl(search),
    urlLabel: '在 YouTube 搜索教学视频',
    instructions: `【听】搜索「${search}」，选 8–15 分钟视频。`,
  };
}

function quizStep(id: string, suffix: string, q: GrammarTopic['quiz'], session: 'micro' | 'deep'): Step {
  return {
    id: `${id}-quiz-${suffix}`,
    type: 'quiz',
    session,
    title: suffix === '1' ? '⑭ 写：测验' : `加练测验 ${suffix}`,
    durationMin: 5,
    quizQuestion: q.question,
    quizOptions: q.options.map((text, i) => ({ text, correct: i === q.correctIndex })),
    quizExplanation: q.explanation,
  };
}

/**
 * 学习顺序：听 → 说 → 读 → 写
 * 方法融合：SRS + 语块 + 影子跟读 + 费曼 + 场景
 */
export function buildGrammarDay(level: CefrLevel, index: number, topic: GrammarTopic): DayPlan {
  const id = `${level.toLowerCase()}-${topic.id}`;
  const scenario = getEnrichedScenario(index);

  const steps: Step[] = [
    // —— 听 ——
    videoStep(id, topic, 'micro'),
    {
      id: `${id}-shadowing`,
      type: 'shadowing',
      session: 'micro',
      title: '② 听+说：影子跟读',
      durationMin: 8,
      shadowingLines: topic.shadowingLines,
      instructions: 'Shadowing：播放后几乎同时跟读，模仿语调。每句 3 遍。',
    },
    {
      id: `${id}-dictation-1`,
      type: 'dictation',
      session: 'micro',
      title: '③ 听：听写 ①',
      durationMin: 5,
      dictationText: topic.dictation ?? topic.examples[0] ?? topic.speakPrompt.slice(0, 80),
      dictationHint: topic.titleEs,
      instructions: '【听→写】先听再写，训练耳朵。',
    },
    ...(topic.extraDictations ?? []).slice(0, 1).map((text, i) => ({
      id: `${id}-dictation-${i + 2}`,
      type: 'dictation' as const,
      session: 'micro' as const,
      title: `听写 ${['②', '③'][i] ?? ''}`,
      durationMin: 5,
      dictationText: text,
      instructions: '再听一遍，加深语块印象。',
    })),

    // —— 说 ——
    {
      id: `${id}-chunks`,
      type: 'chunk',
      session: 'deep',
      title: '④ 说：语块学习（背整句）',
      durationMin: 10,
      chunkItems: topic.chunks,
      instructions:
        '不要记 hambre=饥饿，要记 Tengo hambre. 整句加入 SRS，间隔 1/3/7/14/30 天复习。',
    },
    {
      id: `${id}-speak-1`,
      type: 'speak',
      session: 'deep',
      title: '⑤ 说：口语 ①',
      durationMin: 8,
      speakPrompt: topic.speakPrompt,
      speakHint: topic.speakHint,
      instructions: '【说】用本课语法开口，不要只在心里翻译。',
    },
    ...(topic.extraSpeakPrompts ?? []).slice(0, 1).map((prompt, i) => ({
      id: `${id}-speak-${i + 2}`,
      type: 'speak' as const,
      session: 'deep' as const,
      title: `⑥ 说：口语 ${['②', '③'][i]}`,
      durationMin: 8,
      speakPrompt: prompt,
    })),
    {
      id: `${id}-feynman`,
      type: 'feynman',
      session: 'deep',
      title: '⑦ 说：费曼讲解',
      durationMin: 8,
      feynmanPrompt: topic.feynmanQuestion,
      feynmanHint: topic.feynmanHint,
      instructions: '费曼法：用中文把语法讲给「完全不懂的人」。讲明白 = 真懂。',
    },
    {
      id: `${id}-scenario`,
      type: 'scenario',
      session: 'deep',
      title: `⑧ 说：场景联想 ${scenario.icon}`,
      durationMin: 8,
      scenarioTitle: `${scenario.icon} ${scenario.title}`,
      scenarioItems: [
        ...scenario.chunks.map((c: { es: string }) => c.es),
        `（练习）环顾四周，用西语描述 3 样东西`,
      ],
      instructions: '场景记忆：在脑海中「进入」这个场景，说出每句话。',
    },

    // —— 读 ——
    {
      id: `${id}-read`,
      type: 'read',
      session: 'deep',
      title: '⑨ 读：语法规则',
      durationMin: 10,
      instructions: `${topic.rules}\n\n例句（朗读 3 遍 + 翻译）：\n${topic.examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
    },

    // —— 写 ——
    {
      id: `${id}-fillblank`,
      type: 'fillblank',
      session: 'deep',
      title: '⑩ 写：填空',
      durationMin: 10,
      fillBlanks: topic.fillBlanks,
    },
    {
      id: `${id}-translate`,
      type: 'translate',
      session: 'deep',
      title: '⑪ 写：翻译',
      durationMin: 12,
      translationItems: topic.translationDrills,
    },
    {
      id: `${id}-practice`,
      type: 'practice',
      session: 'deep',
      title: '⑫ 写：综合练习',
      durationMin: 15,
      checklist: topic.practiceItems,
    },
    quizStep(id, '1', topic.quiz, 'deep'),
    ...(topic.extraQuizzes ?? []).slice(0, 2).map((q, i) => quizStep(id, String(i + 2), q, 'micro')),

    // —— SRS 复习 ——
    {
      id: `${id}-srs`,
      type: 'srs',
      session: 'micro',
      title: '⑮ 间隔重复复习',
      durationMin: 5,
      instructions: '复习已到期的语块。今天新学的会在 1/3/7/14/30 天后再次出现。',
    },
    {
      id: `${id}-reflect`,
      type: 'reflect',
      session: 'micro',
      title: '⑯ 复盘',
      durationMin: 5,
      instructions:
        '① 费曼：能否用一句话解释本课语法？\n② SRS：今日新语块是否已加入？\n③ 场景：能说出 1 个生活场景中的句子吗？\n④ 错题写入错题本',
    },
  ];

  if (isVerbTopic(topic)) {
    steps.push({
      id: `${id}-conjuguemos`,
      type: 'link',
      session: 'micro',
      title: '变位加练',
      url: 'https://conjuguemos.com',
      urlLabel: 'Conjuguemos',
      instructions: `针对「${topic.title}」练变位 10 分钟。`,
    });
  }

  return {
    id,
    dayLabel: `${level}-${String(index + 1).padStart(2, '0')}`,
    title: topic.title,
    goal: topic.goal,
    steps,
  };
}

export function buildReviewDay(level: CefrLevel, weekNum: number, topics: GrammarTopic[]): DayPlan {
  const id = `${level.toLowerCase()}-review-w${weekNum}`;
  const allChunks = topics.flatMap((t) => t.chunks ?? []).slice(0, 12);

  return {
    id,
    dayLabel: `${level} 复习 W${weekNum}`,
    title: `${level} 第 ${weekNum} 周复习`,
    goal: `SRS + 语块 + 影子跟读 + 费曼 综合复习`,
    steps: [
      {
        id: `${id}-srs`,
        type: 'srs',
        session: 'deep',
        title: 'SRS 到期复习',
        durationMin: 10,
        instructions: '优先复习所有到期语块。',
      },
      {
        id: `${id}-chunks`,
        type: 'chunk',
        session: 'deep',
        title: '本周语块总复习',
        durationMin: 10,
        chunkItems: allChunks,
        instructions: '整句复习，全部重新加入 SRS 或自评。',
      },
      {
        id: `${id}-shadowing`,
        type: 'shadowing',
        session: 'deep',
        title: '影子跟读综合',
        durationMin: 10,
        shadowingLines: topics.flatMap((t) => t.examples).slice(0, 8),
      },
      {
        id: `${id}-feynman`,
        type: 'feynman',
        session: 'deep',
        title: '费曼：讲解本周语法',
        durationMin: 10,
        feynmanPrompt: `选本周 2 个语法点，用中文向朋友解释区别：\n${topics.map((t) => `- ${t.title}`).join('\n')}`,
      },
      {
        id: `${id}-speak`,
        type: 'speak',
        session: 'deep',
        title: '综合口语 5 分钟',
        durationMin: 10,
        speakPrompt: `（用本周语法自由说 5 分钟：${topics.map((t) => t.titleEs).join('、')}）`,
      },
      {
        id: `${id}-link`,
        type: 'link',
        session: 'micro',
        title: '在线加练',
        url: 'https://conjuguemos.com',
        urlLabel: 'Conjuguemos',
        instructions: '补充 15 分钟。',
      },
    ],
  };
}

const DAYS_PER_WEEK = 6;
const TOPICS_BEFORE_REVIEW = 5;

export function groupIntoWeeks(
  level: CefrLevel,
  items: { day: DayPlan; topic: GrammarTopic }[],
  startWeekNum: number,
): WeekPlan[] {
  const weeks: WeekPlan[] = [];
  let weekNum = startWeekNum;
  let i = 0;

  while (i < items.length) {
    const chunk = items.slice(i, i + TOPICS_BEFORE_REVIEW);
    const weekDays = chunk.map((c) => c.day);
    if (chunk.length > 0) {
      weekDays.push(
        buildReviewDay(
          level,
          weekNum - startWeekNum + 1,
          chunk.map((c) => c.topic),
        ),
      );
    }
    weeks.push({
      id: `${level.toLowerCase()}-w${weekNum}`,
      weekNum,
      title: `${level} · ${chunk[0]?.topic.title ?? ''}${chunk.length > 1 ? ` → ${chunk[chunk.length - 1]?.topic.title}` : ''}`,
      focus: chunk.map((c) => c.topic.title).join(' · '),
      days: weekDays.slice(0, DAYS_PER_WEEK + 1),
    });
    i += TOPICS_BEFORE_REVIEW;
    weekNum++;
  }
  return weeks;
}
