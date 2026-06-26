import type { CefrLevel } from '../grammar/types';

export interface ScenarioPhrase {
  es: string;
  zh: string;
  note?: string;
  chunkLabel?: string;
}

export interface ScenarioVocab {
  es: string;
  zh: string;
  note?: string;
}

export interface ScenarioSection {
  id: string;
  title: string;
  description?: string;
  phrases: ScenarioPhrase[];
  vocab?: ScenarioVocab[];
}

export interface LifeScenario {
  id: string;
  category: 'medical' | 'finance' | 'government' | 'daily' | 'universal';
  title: string;
  icon: string;
  description: string;
  level: CefrLevel | 'A1-A2' | 'A2-B1' | 'B1-B2';
  sections: ScenarioSection[];
}

/** 职业实操教程步骤（教人怎么做） */
export interface TutorialStep {
  step: number;
  title: string;
  instruction: string;
  tip?: string;
  keyPhrase?: { es: string; zh: string };
}

/** 对话课文中的角色台词 */
export interface DialogueTurn {
  speaker: string;
  es: string;
  zh: string;
}

/** 阅读理解选择题 */
export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

/** 课文式对话 + 阅读理解 */
export interface ReadingDialogue {
  id: string;
  title: string;
  /** 课文背景 / 场景说明 */
  context: string;
  /** 整段课文（散文式短文，朗读 / 精读用，可选） */
  passage?: { es: string; zh: string };
  turns: DialogueTurn[];
  comprehension: ComprehensionQuestion[];
}

export interface ProfessionPack {
  id: string;
  title: string;
  icon: string;
  industry: string;
  description: string;
  level: CefrLevel | 'A2-B1' | 'B1-B2' | 'B2+';
  /** 在西班牙较常见的行业 */
  spainCommon?: boolean;
  /** 常见度排序，数字越小越靠前 */
  spainCommonRank?: number;
  /** 核心词汇 */
  coreVocab: ScenarioVocab[];
  sections: ScenarioSection[];
  /** 上岗实操教程 */
  tutorials?: TutorialStep[];
  /** 课文式对话与阅读理解 */
  readingDialogues?: ReadingDialogue[];
}

/** 兼容旧 chunkBank 的轻量场景包 */
export interface ScenarioPack {
  title: string;
  icon: string;
  chunks: ScenarioPhrase[];
}
