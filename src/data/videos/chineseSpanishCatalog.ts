import type { CefrLevel } from '../grammar/types';

/** 海外 YouTube 中文西语教学（台湾等地区频道，非大陆平台） */
export interface ChineseVideoRef {
  title: string;
  instructor: string;
  youtubeId: string;
}

const ALICIA = 'Alicia 西语文化';
const JUDIDI = 'Judidi Spanish';

const V: Record<string, ChineseVideoRef> = {
  alphabet: {
    title: '西班牙語發音課：看完就會讀 99% 西班牙語',
    instructor: ALICIA,
    youtubeId: 'l3xkj1Z9YoU',
  },
  pronunciation: {
    title: '西班牙語 R 彈舌音教學',
    instructor: ALICIA,
    youtubeId: 'M7G0y5XC3K4',
  },
  nouns: {
    title: '名詞陰陽性與複數',
    instructor: ALICIA,
    youtubeId: 'dD-Ob5wFdXM',
  },
  grammar: {
    title: '西班牙語文法精講',
    instructor: ALICIA,
    youtubeId: 'NeK4S850oT4',
  },
  subjunctive: {
    title: '虛擬式入門',
    instructor: JUDIDI,
    youtubeId: 'vgPhULP2Dpg',
  },
  subjunctiveAdv: {
    title: '虛擬式進階用法',
    instructor: JUDIDI,
    youtubeId: 'iRfPzayYrvs',
  },
};

const TOPIC_MAP: Partial<Record<CefrLevel, Record<string, ChineseVideoRef>>> = {
  A1: {
    alphabet: V.alphabet,
    articles: V.grammar,
    'nouns-gender': V.nouns,
    'ser-estar-1': V.grammar,
    'present-ar': V.grammar,
    'present-er-ir': V.grammar,
    adjectives: V.grammar,
    questions: V.grammar,
    'numbers-time': V.grammar,
    possessives: V.grammar,
    'irregular-present-1': V.grammar,
    gustar: V.grammar,
    demonstratives: V.grammar,
    'prepositions-basic': V.grammar,
    'irregular-present-2': V.grammar,
    'reflexive-1': V.grammar,
    progressive: V.grammar,
    comparatives: V.grammar,
    'saber-conocer': V.grammar,
    'hay- estar': V.grammar,
    'a1-review': V.alphabet,
  },
  A2: {
    'preterite-regular': V.grammar,
    'preterite-irregular': V.grammar,
    imperfect: V.grammar,
    'preterite-vs-imperfect': V.grammar,
    'present-perfect': V.grammar,
    pluperfect: V.grammar,
    'direct-objects': V.grammar,
    'indirect-objects': V.grammar,
    'pronoun-position': V.grammar,
    'imperative-affirmative': V.grammar,
    'imperative-negative': V.grammar,
    future: V.grammar,
    conditional: V.grammar,
    'por-para': V.grammar,
    'relative-que': V.grammar,
    periphrasis: V.grammar,
    'passive-ser': V.grammar,
    'impersonal-se': V.grammar,
    'hace-time': V.grammar,
    'a2-review': V.grammar,
  },
  B1: {
    'subj-present-intro': V.subjunctive,
    'subj-wishes': V.subjunctive,
    'subj-emotions': V.subjunctiveAdv,
    'subj-doubt': V.subjunctiveAdv,
    'subj-impersonal': V.subjunctive,
    ojala: V.subjunctive,
    'cuando-subj': V.subjunctiveAdv,
    'aunque-subj': V.subjunctiveAdv,
    'para-que': V.subjunctive,
    'subj-imperfect': V.subjunctiveAdv,
    'si-clauses': V.grammar,
    'subj-perfect': V.subjunctive,
    'subj-pluperfect': V.subjunctiveAdv,
    'future-perfect': V.grammar,
    'conditional-perfect': V.grammar,
    'reported-speech': V.grammar,
    'relative-subj': V.subjunctive,
    'formal-commands': V.grammar,
    'verbs-change': V.subjunctive,
    'b1-review': V.grammar,
  },
  B2: {
    'subj-adverbial': V.subjunctiveAdv,
    'subj-nuance': V.subjunctiveAdv,
    'passive-se': V.grammar,
    'periphrasis-adv': V.grammar,
    connectors: V.grammar,
    register: V.grammar,
    'idioms-1': V.grammar,
    'ser-estar-adv': V.grammar,
    'lo-adjective': V.grammar,
    nominalization: V.grammar,
    'false-friends': V.grammar,
    'preterite-anterior': V.grammar,
    debate: V.grammar,
    'b2-review': V.grammar,
  },
  C1: {
    'reported-adv': V.grammar,
    'idioms-2': V.grammar,
    'discourse-markers': V.grammar,
    'academic-writing': V.grammar,
    'media-spanish': V.grammar,
    regional: V.pronunciation,
    'subj-edge': V.subjunctiveAdv,
    ellipsis: V.grammar,
    pragmatics: V.grammar,
    'c1-review': V.grammar,
  },
  C2: {
    literary: V.grammar,
    'legal-professional': V.grammar,
    'humor-irony': V.grammar,
    translation: V.grammar,
    'native-maintenance': V.pronunciation,
    'c2-mastery': V.grammar,
  },
};

const VIDEO_KEY_MAP: Record<string, ChineseVideoRef> = {
  serEstar: V.grammar,
  present: V.grammar,
  preterite: V.grammar,
  imperfect: V.grammar,
  preteriteVsImperfect: V.grammar,
  perfect: V.grammar,
  subjunctive: V.subjunctive,
  subjunctiveMyth: V.subjunctiveAdv,
  cuandoSubj: V.subjunctiveAdv,
  porPara: V.grammar,
  easySpanish: V.grammar,
  easyStreet: V.grammar,
  dreaming: V.grammar,
};

const LEVEL_FALLBACK: Record<CefrLevel, ChineseVideoRef> = {
  A1: V.alphabet,
  A2: V.grammar,
  B1: V.subjunctive,
  B2: V.subjunctiveAdv,
  C1: V.grammar,
  C2: V.grammar,
};

/** 为西语课程解析海外 YouTube 中文讲解视频；非西语课程返回 null */
export function resolveChineseSpanishVideo(
  languageId: string,
  level: CefrLevel,
  topicId: string,
  videoKey?: string,
): ChineseVideoRef | null {
  if (languageId !== 'es') return null;

  const byTopic = TOPIC_MAP[level]?.[topicId];
  if (byTopic) return byTopic;

  if (videoKey && VIDEO_KEY_MAP[videoKey]) return VIDEO_KEY_MAP[videoKey];

  return LEVEL_FALLBACK[level] ?? V.alphabet;
}
