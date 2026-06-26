/** AI 听力生成：构造提示词 + 解析模型返回的听力材料 JSON */
import type { ChatMessage } from './openaiClient';

export interface ListeningLine {
  speaker?: string;
  es: string;
  zh: string;
}

export interface ListeningQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation_zh?: string;
}

export interface ListeningVocab {
  es: string;
  zh: string;
  note?: string;
}

export interface ListeningPassage {
  title: string;
  format: 'dialogue' | 'article';
  lines: ListeningLine[];
  questions: ListeningQuestion[];
  vocab: ListeningVocab[];
}

export function buildListeningPrompt(
  langLabel: string,
  langNative: string,
  level: string,
  topic: string,
  format: 'dialogue' | 'article',
): ChatMessage[] {
  const formatZh = format === 'dialogue' ? '对话' : '短文';
  const system = [
    `你是一位${langLabel}（${langNative}）听力材料编写专家。`,
    `请生成一段适合 ${level}（CEFR）水平的${formatZh}听力材料，主题：${topic}。`,
    `要求：使用地道的半岛${langNative}，风格对标西班牙本土语言学校（EOI）与塞万提斯学院教材；不要使用来自中国大陆的教材内容。`,
    `难度严格匹配 ${level}：A1/A2 用简单高频词与短句；B1/B2 适度复杂；C1/C2 可用地道、抽象表达。`,
    format === 'dialogue'
      ? '对话需 6~10 轮，自然真实，每轮标注说话人。'
      : '短文需 6~10 句，连贯成篇。',
    `还要给出 3~4 道单项选择理解题，以及 6~8 个本篇重点生词/短语。`,
    `只输出一个 JSON 对象，不要任何额外文字，结构如下：`,
    `{"title":"标题（${langNative}）","format":"${format}","lines":[{"speaker":"仅对话时填说话人，短文可省略","es":"${langNative}原句","zh":"简体中文翻译"}],"questions":[{"question":"中文或${langNative}的问题","options":["选项1","选项2","选项3"],"correctIndex":0,"explanation_zh":"简体中文解析"}],"vocab":[{"es":"词或短语","zh":"中文释义","note":"可选用法备注"}]}`,
    `所有中文必须是简体中文。`,
  ].join('\n');
  return [
    { role: 'system', content: system },
    { role: 'user', content: `请生成关于「${topic}」的 ${level} ${formatZh}听力材料。` },
  ];
}

export function parseListening(raw: string): ListeningPassage {
  let text = raw.trim();
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
  const obj = JSON.parse(text);
  const format: 'dialogue' | 'article' = obj.format === 'dialogue' ? 'dialogue' : 'article';
  const lines: ListeningLine[] = Array.isArray(obj.lines)
    ? obj.lines
        .filter((l: unknown) => l && typeof l === 'object')
        .map((l: Record<string, unknown>) => ({
          speaker: l.speaker ? String(l.speaker) : undefined,
          es: String(l.es ?? '').trim(),
          zh: String(l.zh ?? '').trim(),
        }))
        .filter((l: ListeningLine) => l.es)
    : [];
  const questions: ListeningQuestion[] = Array.isArray(obj.questions)
    ? obj.questions
        .filter((q: unknown) => q && typeof q === 'object')
        .map((q: Record<string, unknown>) => ({
          question: String(q.question ?? '').trim(),
          options: Array.isArray(q.options) ? q.options.map((o: unknown) => String(o)) : [],
          correctIndex: Number(q.correctIndex ?? 0),
          explanation_zh: q.explanation_zh ? String(q.explanation_zh).trim() : undefined,
        }))
        .filter((q: ListeningQuestion) => q.question && q.options.length >= 2)
    : [];
  const vocab: ListeningVocab[] = Array.isArray(obj.vocab)
    ? obj.vocab
        .filter((v: unknown) => v && typeof v === 'object')
        .map((v: Record<string, unknown>) => ({
          es: String(v.es ?? '').trim(),
          zh: String(v.zh ?? '').trim(),
          note: v.note ? String(v.note).trim() : undefined,
        }))
        .filter((v: ListeningVocab) => v.es)
    : [];
  return {
    title: String(obj.title ?? '听力材料').trim(),
    format,
    lines,
    questions,
    vocab,
  };
}
