export type StepType =
  | 'video'
  | 'speak'
  | 'dictation'
  | 'quiz'
  | 'read'
  | 'practice'
  | 'reflect'
  | 'link'
  | 'vocab'
  | 'fillblank'
  | 'translate'
  | 'chunk'
  | 'feynman'
  | 'shadowing'
  | 'scenario'
  | 'srs';

export type SessionKind = 'micro' | 'deep' | 'review';

export interface QuizOption {
  text: string;
  correct?: boolean;
}

export interface Step {
  id: string;
  type: StepType;
  title?: string;
  instructions?: string;
  durationMin?: number;
  session: SessionKind;
  youtubeId?: string;
  youtubeTitle?: string;
  url?: string;
  urlLabel?: string;
  /** 口语练习：你需要用西语说的话 */
  speakPrompt?: string;
  speakHint?: string;
  /** 听写：系统会朗读的句子 */
  dictationText?: string;
  dictationHint?: string;
  quizQuestion?: string;
  quizOptions?: QuizOption[];
  quizExplanation?: string;
  checklist?: string[];
  /** 词汇/语块 */
  vocabItems?: { es: string; zh: string; note?: string; chunkLabel?: string }[];
  fillBlanks?: { prompt: string; answer: string; hint?: string }[];
  translationItems?: { zh: string; es: string }[];
  chunkItems?: { es: string; zh: string; note?: string; chunkLabel?: string }[];
  feynmanPrompt?: string;
  feynmanHint?: string;
  shadowingLines?: string[];
  scenarioTitle?: string;
  scenarioItems?: string[];
}

export interface DayPlan {
  id: string;
  dayLabel: string;
  title: string;
  goal: string;
  steps: Step[];
}

export interface WeekPlan {
  id: string;
  weekNum: number;
  title: string;
  focus: string;
  days: DayPlan[];
}

export interface PhasePlan {
  id: string;
  phaseNum: number;
  title: string;
  level: string;
  description: string;
  weeks: WeekPlan[];
}

export interface Curriculum {
  title: string;
  subtitle: string;
  targetLevel: string;
  startLevel: string;
  phases: PhasePlan[];
}

export type ProgressMap = Record<string, boolean>;
