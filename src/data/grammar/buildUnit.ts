import type { DayPlan, Step, WeekPlan } from '../../types';
import type { CefrLevel, GrammarTopic } from './types';
import { HOLA_PLAYLIST_URL, YOUTUBE_MAP, youtubeSearchUrl } from './types';

function videoStep(id: string, topic: GrammarTopic, session: 'micro' | 'deep'): Step {
  const key = topic.videoKey;
  if (key && YOUTUBE_MAP[key]) {
    const v = YOUTUBE_MAP[key];
    return {
      id: `${id}-video`,
      type: 'video',
      session,
      title: `观看：${topic.titleEs}`,
      durationMin: session === 'micro' ? 8 : 15,
      youtubeId: v.id.startsWith('PL') ? undefined : v.id,
      youtubeTitle: v.title,
      instructions: `观看视频，记录：① 本语法点的 2 条核心规则 ② 视频中的 3 个例句。\n\n主题：${topic.title}`,
      url: v.id.startsWith('PL') ? HOLA_PLAYLIST_URL : undefined,
      urlLabel: v.id.startsWith('PL') ? '打开 Hola Spanish 播放列表' : undefined,
    };
  }
  const search = topic.videoSearch ?? `${topic.titleEs} español gramática`;
  return {
    id: `${id}-video`,
    type: 'link',
    session,
    title: `观看：${topic.titleEs}`,
    durationMin: 10,
    url: youtubeSearchUrl(search),
    urlLabel: '在 YouTube 搜索教学视频',
    instructions: `打开 YouTube 搜索「${search}」，选 8–15 分钟的教学视频观看。记 3 个例句。`,
  };
}

export function buildGrammarDay(level: CefrLevel, index: number, topic: GrammarTopic): DayPlan {
  const id = `${level.toLowerCase()}-${topic.id}`;
  const opts = topic.quiz.options.map((text, i) => ({
    text,
    correct: i === topic.quiz.correctIndex,
  }));

  const steps: Step[] = [
    videoStep(id, topic, 'micro'),
    {
      id: `${id}-read`,
      type: 'read',
      session: 'deep',
      title: '语法规则',
      durationMin: 10,
      instructions: `${topic.rules}\n\n例句（抄写并翻译）：\n${topic.examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
    },
    {
      id: `${id}-practice`,
      type: 'practice',
      session: 'deep',
      title: '练习',
      durationMin: 15,
      instructions:
        topic.practiceItems?.join('\n') ??
        `用「${topic.titleEs}」造 5 个原创句子，写在本子上。至少 2 句用于口语，3 句用于书面。`,
      checklist: topic.practiceItems,
    },
    topic.dictation
      ? {
          id: `${id}-dictation`,
          type: 'dictation',
          session: 'micro',
          title: '听写',
          durationMin: 5,
          dictationText: topic.dictation,
          dictationHint: topic.titleEs,
          instructions: '播放朗读，写下听到的内容，然后核对答案。',
        }
      : {
          id: `${id}-speak`,
          type: 'speak',
          session: 'deep',
          title: '口语',
          durationMin: 8,
          speakPrompt: topic.speakPrompt,
          speakHint: topic.speakHint,
          instructions: '点击开始录音，用西语说出参考内容（可换成你自己的话，但要用本课语法）。',
        },
    {
      id: `${id}-quiz`,
      type: 'quiz',
      session: 'deep',
      title: '测验',
      durationMin: 5,
      quizQuestion: topic.quiz.question,
      quizOptions: opts,
      quizExplanation: topic.quiz.explanation,
    },
  ];

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
  return {
    id,
    dayLabel: `${level} 复习 W${weekNum}`,
    title: `${level} 第 ${weekNum} 周复习`,
    goal: `巩固本周 ${topics.length} 个语法点`,
    steps: [
      {
        id: `${id}-list`,
        type: 'read',
        session: 'deep',
        title: '本周语法清单',
        durationMin: 10,
        instructions: `回顾以下语法点，每个用 1 句话总结规则：\n${topics.map((t, i) => `${i + 1}. ${t.title} (${t.titleEs})`).join('\n')}`,
      },
      {
        id: `${id}-speak`,
        type: 'speak',
        session: 'deep',
        title: '综合口语',
        durationMin: 10,
        instructions: `用本周学过的语法自由说 3 分钟。必须用到至少 3 个本周知识点。`,
        speakPrompt: `（自由发挥，涵盖：${topics.map((t) => t.titleEs).join('、')}）`,
      },
      {
        id: `${id}-quiz`,
        type: 'practice',
        session: 'deep',
        title: '自测',
        durationMin: 20,
        instructions: '重做一次本周所有测验错题。在 Conjuguemos 或 Anki 补充练习 15 分钟。',
      },
      {
        id: `${id}-link`,
        type: 'link',
        session: 'micro',
        title: '补充资源',
        url: 'https://conjuguemos.com',
        urlLabel: 'Conjuguemos 变位练习',
        instructions: '打开变位/语法练习网站，选择对应时态强化训练。',
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
