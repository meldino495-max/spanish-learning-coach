export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface GrammarTopic {
  id: string;
  title: string;
  titleEs: string;
  goal: string;
  /** 语法规则说明（显示在阅读步骤） */
  rules: string;
  examples: string[];
  /** youtubeMap 中的键名 */
  videoKey?: string;
  /** 无专用视频时，YouTube 搜索词 */
  videoSearch?: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  };
  speakPrompt: string;
  speakHint?: string;
  dictation?: string;
  practiceItems?: string[];
  /** 本课词汇（可选，否则自动生成） */
  vocabulary?: { es: string; zh: string; note?: string }[];
  /** 额外测验 */
  extraQuizzes?: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }[];
  extraDictations?: string[];
  extraSpeakPrompts?: string[];
  fillBlanks?: { prompt: string; answer: string; hint?: string }[];
  translationDrills?: { zh: string; es: string }[];
  chunks?: { es: string; zh: string; note?: string; chunkLabel?: string }[];
  feynmanQuestion?: string;
  feynmanHint?: string;
  shadowingLines?: string[];
}

export const LEVEL_META: Record<
  CefrLevel,
  { title: string; description: string; phaseNum: number; canDo: string }
> = {
  A1: {
    phaseNum: 1,
    title: '入门级 A1',
    description: '零基础到能进行最简单日常对话：名词、现在时、ser/estar、基础疑问句。',
    canDo: '自我介绍、点单、问路、数字时间',
  },
  A2: {
    phaseNum: 2,
    title: '基础级 A2',
    description: '过去时全家桶、代词、命令式、将来/条件式、基础从句。',
    canDo: '讲述过去经历、表达计划、简单邮件',
  },
  B1: {
    phaseNum: 3,
    title: '进阶级 B1',
    description: '虚拟式系统、条件句、间接引语、被动语态、复杂时态组合。',
    canDo: '工作沟通、表达观点、处理多数旅行/生活场景',
  },
  B2: {
    phaseNum: 4,
    title: '高阶 B2',
    description: '虚拟式细微差别、书面语、连接词、习语、语域切换。',
    canDo: '流利讨论抽象话题、看新闻、写议论文',
  },
  C1: {
    phaseNum: 5,
    title: '流利级 C1',
    description: '学术/专业表达、语用学、区域变体、复杂语篇结构。',
    canDo: '专业工作、辩论、理解隐含意义',
  },
  C2: {
    phaseNum: 6,
    title: '精通级 C2',
    description: '接近母语：文学、法律、幽默、翻译、语用细微差别。',
    canDo: '几乎任何场合自如表达',
  },
};

/** 常用 YouTube 视频 ID */
export const YOUTUBE_MAP: Record<string, { id: string; title: string }> = {
  serEstar: { id: 'Pr239xOgLBg', title: 'Butterfly Spanish - Ser vs Estar' },
  present: { id: '6dtwAn9MU00', title: 'Butterfly Spanish - Present/Preterite' },
  preterite: { id: '6dtwAn9MU00', title: 'Butterfly Spanish - Preterite' },
  imperfect: { id: 'wTMgrhHKk20', title: 'Butterfly Spanish - Imperfect' },
  preteriteVsImperfect: { id: 'Omgk17jdbKs', title: 'Pretérito vs Imperfecto Podcast' },
  perfect: { id: 'wTMgrhHKk20', title: 'Butterfly Spanish - Perfect tenses' },
  subjunctive: { id: 'EbKMCFHj8cs', title: 'Nomad Spanish - Subjunctive' },
  subjunctiveMyth: { id: 'kEcsKYhcpxM', title: 'Spanish Chevere - Subjunctive' },
  cuandoSubj: { id: 'Ui1EuvVZ6kA', title: 'Sol Cabrera - Cuando + Subjuntivo' },
  porPara: { id: 'pDd6X3tpNyc', title: 'Butterfly Spanish - Por vs Para' },
  easySpanish: { id: 'Nt00P1Kp1Q4', title: 'Easy Spanish - Super Easy' },
  easyStreet: { id: 'gxmv-WHi9Yk', title: 'Easy Spanish - Mexico Street' },
  dreaming: { id: 'srnEZq2yoM0', title: 'Dreaming Spanish - Method' },
  holaPlaylist: {
    id: 'PLA5UIoabheFNMfoCOc7Zz4Mlc7XxnLHRi',
    title: 'Hola Spanish Grammar Playlist',
  },
};

export function youtubeSearchUrl(query: string) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export const HOLA_PLAYLIST_URL =
  'https://www.youtube.com/playlist?list=PLA5UIoabheFNMfoCOc7Zz4Mlc7XxnLHRi';
