/** 错误驱动自适应：围绕学习者 SRS 中的薄弱词/语块生成针对性练习 */
import type { ChatMessage } from './openaiClient';

export interface DrillFill {
  sentence: string; // 含 ___ 的句子
  answer: string;
  translation_zh?: string;
}

export interface DrillTranslate {
  zh: string;
  answer_es: string;
}

export interface AdaptiveSet {
  intro_zh?: string;
  fills: DrillFill[];
  translations: DrillTranslate[];
}

export function buildAdaptivePrompt(
  langLabel: string,
  langNative: string,
  level: string,
  items: { es: string; zh: string }[],
): ChatMessage[] {
  const list = items.map((it) => `「${it.es}」(${it.zh})`).join('、');
  const system = [
    `你是一位${langLabel}（${langNative}）个性化辅导老师。`,
    `学习者在间隔重复中反复需要复习以下词/语块：${list}。`,
    `请围绕这些词，设计针对性强化练习，难度匹配 ${level}（CEFR）：`,
    `1) fills：5 道挖空题，每题一个自然句子，挖去的正是上述某个词/语块，answer 就是被挖去的内容；并给出整句的简体中文翻译。`,
    `2) translations：4 道中译${langNative}，每题都必须用到上述至少一个词/语块，answer_es 给出地道参考答案。`,
    `使用地道的半岛${langNative}，风格对标西班牙本土语言学校（EOI）；不要中国大陆教材风格内容。`,
    `只输出一个 JSON 对象，不要任何额外文字：`,
    `{"intro_zh":"一句中文说明本次特训重点","fills":[{"sentence":"句子，挖空用三个下划线 ___","answer":"被挖去的词或语块","translation_zh":"整句简体中文"}],"translations":[{"zh":"中文句子","answer_es":"${langNative}参考答案"}]}`,
  ].join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: `请基于上述薄弱词生成 ${level} 的强化练习。` },
  ];
}

export function parseAdaptive(raw: string): AdaptiveSet {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
  const obj = JSON.parse(text);
  const fills: DrillFill[] = Array.isArray(obj.fills)
    ? obj.fills
        .filter((f: unknown) => f && typeof f === 'object')
        .map((f: Record<string, unknown>) => ({
          sentence: String(f.sentence ?? '').trim(),
          answer: String(f.answer ?? '').trim(),
          translation_zh: f.translation_zh ? String(f.translation_zh).trim() : undefined,
        }))
        .filter((f: DrillFill) => f.sentence && f.answer)
    : [];
  const translations: DrillTranslate[] = Array.isArray(obj.translations)
    ? obj.translations
        .filter((t: unknown) => t && typeof t === 'object')
        .map((t: Record<string, unknown>) => ({
          zh: String(t.zh ?? '').trim(),
          answer_es: String(t.answer_es ?? '').trim(),
        }))
        .filter((t: DrillTranslate) => t.zh && t.answer_es)
    : [];
  return {
    intro_zh: obj.intro_zh ? String(obj.intro_zh).trim() : undefined,
    fills,
    translations,
  };
}
