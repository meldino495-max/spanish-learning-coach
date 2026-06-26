import type { CoachTool, DayPlan, Step, WeekPlan } from '../../types';
import type { CefrLevel, GrammarTopic } from './types';
import { isVerbTopic } from './enrichTopic';
import { buildReadingStep } from './buildReading';
import { HOLA_PLAYLIST_URL, YOUTUBE_MAP, youtubeSearchUrl } from './types';
import { resolveChineseSpanishVideo } from '../videos/chineseSpanishCatalog';

function videoStep(
  id: string,
  level: CefrLevel,
  topic: GrammarTopic,
  session: 'micro' | 'deep',
  languageId: string,
): Step {
  const chinese = resolveChineseSpanishVideo(languageId, level, topic.id, topic.videoKey);
  if (chinese?.youtubeId) {
    return {
      id: `${id}-video`,
      type: 'video',
      session,
      title: `① 听：${topic.titleEs}`,
      durationMin: session === 'micro' ? 8 : 15,
      youtubeId: chinese.youtubeId,
      youtubeTitle: chinese.title,
      videoInstructor: chinese.instructor,
      instructions: `【听】观看中文讲解「${chinese.title}」，记录 2 条规则 + 3 个例句。\n\n学习顺序：听 → 说 → 读 → 写`,
    };
  }

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

/** 课中训练工具步骤：把顶栏的训练面板按学习法编排进课程里。 */
function coachStep(
  id: string,
  tool: CoachTool,
  opts: {
    title: string;
    session: 'micro' | 'deep';
    durationMin: number;
    instructions: string;
    method: string;
    cta?: string;
  },
): Step {
  return {
    id,
    type: 'coach',
    coachTool: tool,
    session: opts.session,
    title: opts.title,
    durationMin: opts.durationMin,
    instructions: opts.instructions,
    coachMethod: opts.method,
    coachCta: opts.cta,
  };
}

/** 说阶段的"开口短句"热身（Kazu 第一步）。A1/A2 每课，B1+ 隔课，频率随水平递减。 */
function phraseWarmupStep(id: string): Step {
  return coachStep(`${id}-coach-phrase`, 'phrase', {
    title: '🗣️ 开口短句（热身）',
    session: 'micro',
    durationMin: 4,
    instructions: '正式练语法前，先用高频短句开口热身：听原音 → 几乎同时影子跟读 → 录下自己 A/B 对比。',
    method:
      'Kazu 学习法 / 影子跟读：母语习得靠"先大胆开口、再逐步纠正"。每天重复核心短句，练到不用思考就能脱口而出，再迁移到今天的新句型。',
    cta: '开始开口热身',
  });
}

/** 写阶段的"逆翻译"巩固（Kazu 第二步 + 提取练习）。每课都有。 */
function backTranslateStep(id: string): Step {
  return coachStep(`${id}-coach-writing`, 'writing', {
    title: '✍️ 逆翻译（巩固）',
    session: 'deep',
    durationMin: 8,
    instructions: '看中文，凭记忆写出本课句型的西语，再点开对照标准答案，逐词比对差异并修正。',
    method:
      '提取练习 + 生成效应（测试效应，Roediger & Bjork）：主动回忆并产出，比反复阅读记得更牢；逆翻译能立刻暴露你的薄弱句型并当场修正。',
    cta: '开始逆翻译',
  });
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
export function buildGrammarDay(
  level: CefrLevel,
  index: number,
  topic: GrammarTopic,
  languageId = 'es',
): DayPlan {
  const id = `${level.toLowerCase()}-${topic.id}`;
  const scenario = topic.unitScenario ?? {
    title: '场景',
    icon: '🎬',
    chunks: topic.chunks?.slice(0, 6) ?? [],
  };

  // 开口短句热身频率：A1/A2 每课建立"开口反射"，B1+ 隔课（已有反射，转向自由产出）
  const includePhraseWarmup = level === 'A1' || level === 'A2' || index % 2 === 0;

  const steps: Step[] = [
    // —— 听 ——
    videoStep(id, level, topic, 'micro', languageId),
    {
      id: `${id}-shadowing`,
      type: 'shadowing',
      session: 'micro',
      title: '② 听+说：影子跟读',
      durationMin: 8,
      shadowingLines: topic.shadowingLines,
      instructions: 'Shadowing：播放后几乎同时跟读，模仿语调。每句 3 遍。',
    },
    ...(includePhraseWarmup ? [phraseWarmupStep(id)] : []),
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
      scenarioItems: scenario.chunks.map((c) => ({ es: c.es, zh: c.zh, note: c.note })),
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
    buildReadingStep(level, topic, id),

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
    backTranslateStep(id),
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

  const mergedTopic: GrammarTopic = {
    ...topics[0],
    id: `${id}-merged`,
    title: `${level} 第 ${weekNum} 周综合`,
    titleEs: `Repaso semana ${weekNum}`,
    goal: `综合复习：${topics.map((t) => t.title).join('、')}`,
    examples: topics.flatMap((t) => t.examples).slice(0, 10),
    chunks: allChunks,
  };
  const reviewReading = buildReadingStep(level, mergedTopic, id);
  reviewReading.title = '阅读理解：本周综合';

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
      coachStep(`${id}-coach-adaptive`, 'adaptive', {
        title: '🎯 AI 弱项特训',
        session: 'deep',
        durationMin: 10,
        instructions: '让 AI 从你 SRS 里挑出最薄弱 / 到期的词与语块，生成针对性的挖空和翻译练习。',
        method:
          '针对性提取 + 合意困难（Bjork）：把复习火力集中在最易遗忘处，难度略高于舒适区，记忆增益最大。',
      }),
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
      reviewReading,
      coachStep(`${id}-coach-listening`, 'listening', {
        title: '🎧 AI 分级听力',
        session: 'deep',
        durationMin: 12,
        instructions: '按你的水平生成一段听力：先盲听抓大意 → 精听听写 → 看原文与翻译 → 生词进 SRS。',
        method:
          '可理解输入 i+1（Krashen）+ 精听：略高于当前水平的真实语料是习得主引擎；先听后看，强迫耳朵先工作。',
      }),
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
      coachStep(`${id}-coach-tutor`, 'tutor', {
        title: '🤖 AI 对话陪练（本周综合应用）',
        session: 'deep',
        durationMin: 12,
        instructions: '用本周学到的语法和语块，与 AI 进行一段情景对话，让它即时纠正你的表达。',
        method:
          '输出假设（Swain）+ 交际法：被迫产出才能发现"想说但不会说"的缺口；即时纠错把缺口变成真正的习得。',
      }),
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
