/**
 * AI 客户端：用户自带 API Key，支持多家 OpenAI 兼容服务（OpenAI / Groq / Gemini / Cursor / 自定义）。
 * 优先走 Electron 主进程代理（避免渲染进程 CORS），否则在浏览器/开发环境直接 fetch。
 */
import { getAppSetting, setAppSetting } from './appSettings';

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
export const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';

export type ProviderId = 'openai' | 'groq' | 'gemini' | 'cursor';

export interface ProviderDef {
  id: ProviderId;
  label: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  /** 每个模型的优势/区别说明，显示在模型选择旁 */
  modelNotes: Record<string, string>;
  /** 是否允许用户自定义 Base URL（自定义/网关用） */
  editableBaseUrl: boolean;
  keyHelp: string;
}

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4.1-mini', 'o4-mini'],
    modelNotes: {
      'gpt-4o-mini': '便宜快速，日常对话/批改够用，性价比首选 ⭐',
      'gpt-4o': '更聪明、理解力强，复杂讲解/长对话更稳，价格较高',
      'gpt-4.1-mini': '4.1 轻量版，指令遵循好、速度快，介于 mini 与 4o 之间',
      'o4-mini': '推理型，擅长语法分析/纠错讲解，回复稍慢、偏贵',
    },
    editableBaseUrl: true,
    keyHelp: '在 platform.openai.com 的 API Keys 页面创建（sk- 开头）。',
  },
  groq: {
    id: 'groq',
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'openai/gpt-oss-120b'],
    modelNotes: {
      'llama-3.3-70b-versatile': '综合最强(70B)，对话/讲解质量最好，推荐 ⭐',
      'llama-3.1-8b-instant': '体积小、响应极快，适合快速练习，质量略弱',
      'openai/gpt-oss-120b': '开源大模型(120B)，能力强、知识广，速度中等',
    },
    editableBaseUrl: false,
    keyHelp: '在 console.groq.com 的 API Keys 创建（gsk_ 开头）。速度很快、有免费额度。',
  },
  gemini: {
    id: 'gemini',
    label: 'Google Gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    defaultModel: 'gemini-2.0-flash',
    models: ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    modelNotes: {
      'gemini-2.0-flash': '快又便宜，日常练习首选 ⭐',
      'gemini-2.5-flash': '更新一代 flash，质量更好、略贵一点',
      'gemini-1.5-flash': '上一代快速款，便宜、能力中规中矩',
      'gemini-1.5-pro': '能力更强，适合复杂讲解/长文，速度较慢',
    },
    editableBaseUrl: false,
    keyHelp: '在 aistudio.google.com 的 API Key 页面创建，走 Gemini 的 OpenAI 兼容接口。',
  },
  cursor: {
    id: 'cursor',
    label: 'Cursor / 自定义 (OpenAI 兼容)',
    baseUrl: '',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'claude-3-5-sonnet'],
    modelNotes: {
      'gpt-4o-mini': '便宜快速，性价比首选 ⭐',
      'gpt-4o': '更聪明、理解力强，价格较高',
      'claude-3-5-sonnet': 'Claude，语言表达自然、讲解细腻，适合写作/对话',
    },
    editableBaseUrl: true,
    keyHelp: '填入任意 OpenAI 兼容网关的 Base URL 与 Key（例如自建/Cursor 网关）。',
  },
};

export interface OpenAIConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StoredEntry {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

interface StoredAI {
  provider: ProviderId;
  entries: Partial<Record<ProviderId, StoredEntry>>;
}

function loadAI(): StoredAI {
  const data: StoredAI = { provider: 'openai', entries: {} };
  const raw = getAppSetting('aiConfig');
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<StoredAI>;
      if (parsed.provider && PROVIDERS[parsed.provider]) data.provider = parsed.provider;
      if (parsed.entries && typeof parsed.entries === 'object') data.entries = parsed.entries;
    } catch {
      /* ignore */
    }
  }
  // 兼容旧版：把单一的 openai 旧设置迁移过来
  if (!data.entries.openai) {
    const legacyKey = getAppSetting('openaiKey');
    if (legacyKey) {
      data.entries.openai = {
        apiKey: legacyKey,
        model: getAppSetting('openaiModel') || undefined,
        baseUrl: getAppSetting('openaiBaseUrl') || undefined,
      };
    }
  }
  return data;
}

function saveAI(data: StoredAI) {
  setAppSetting('aiConfig', JSON.stringify(data));
}

export function getAIProvider(): ProviderId {
  return loadAI().provider;
}

export function setAIProvider(id: ProviderId) {
  const d = loadAI();
  d.provider = id;
  saveAI(d);
}

export function getProviderEntry(id: ProviderId): StoredEntry {
  return loadAI().entries[id] ?? {};
}

export function saveProviderEntry(id: ProviderId, patch: Partial<StoredEntry>) {
  const d = loadAI();
  d.entries[id] = { ...d.entries[id], ...patch };
  saveAI(d);
}

/** 当前激活提供方的有效配置 */
export function getActiveConfig(): OpenAIConfig & { provider: ProviderId } {
  const provider = getAIProvider();
  const def = PROVIDERS[provider];
  const e = getProviderEntry(provider);
  const rawBase = (def.editableBaseUrl ? e.baseUrl || def.baseUrl : def.baseUrl) || '';
  return {
    provider,
    apiKey: (e.apiKey ?? '').trim(),
    model: (e.model ?? '').trim() || def.defaultModel,
    baseUrl: rawBase.replace(/\/+$/, ''),
  };
}

export function getOpenAIConfig(): OpenAIConfig {
  const c = getActiveConfig();
  return { apiKey: c.apiKey, model: c.model, baseUrl: c.baseUrl };
}

export function saveOpenAIConfig(cfg: Partial<OpenAIConfig>) {
  const patch: Partial<StoredEntry> = {};
  if (cfg.apiKey !== undefined) patch.apiKey = cfg.apiKey.trim();
  if (cfg.model !== undefined) patch.model = cfg.model.trim();
  if (cfg.baseUrl !== undefined) patch.baseUrl = cfg.baseUrl.trim();
  saveProviderEntry(getAIProvider(), patch);
}

export function hasOpenAIKey(): boolean {
  return !!getActiveConfig().apiKey;
}

interface ChatCompletionPayload {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  response_format?: { type: 'json_object' };
}

/**
 * 调用 chat/completions，返回 assistant 文本内容。
 * @param jsonMode 是否要求模型返回 JSON 对象
 */
export async function chatCompletion(
  messages: ChatMessage[],
  opts: { temperature?: number; jsonMode?: boolean } = {},
): Promise<string> {
  const cfg = getOpenAIConfig();
  if (!cfg.apiKey) throw new Error('尚未设置 OpenAI API Key。');

  const payload: ChatCompletionPayload = {
    model: cfg.model,
    messages,
    temperature: opts.temperature ?? 0.6,
  };
  if (opts.jsonMode) payload.response_format = { type: 'json_object' };

  // 优先用 Electron 主进程代理
  const proxy = window.electronAPI?.openaiChat;
  if (proxy) {
    const res = await proxy({ baseUrl: cfg.baseUrl, apiKey: cfg.apiKey, payload });
    if (!res.ok) throw new Error(res.error || 'OpenAI 请求失败');
    return res.content ?? '';
  }

  // 浏览器/开发环境：直接请求
  const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`OpenAI ${resp.status}: ${text.slice(0, 400)}`);
  }
  try {
    const data = JSON.parse(text);
    return data?.choices?.[0]?.message?.content ?? '';
  } catch {
    throw new Error('解析 OpenAI 响应失败。');
  }
}

/**
 * 流式调用 chat/completions：边接收边通过 onDelta 回调返回增量文本，最终返回完整内容。
 * Electron 下走主进程 SSE 代理；浏览器/开发环境用 fetch + ReadableStream 解析 SSE。
 */
export async function streamChatCompletion(
  messages: ChatMessage[],
  opts: { temperature?: number; jsonMode?: boolean; onDelta?: (delta: string) => void } = {},
): Promise<string> {
  const cfg = getOpenAIConfig();
  if (!cfg.apiKey) throw new Error('尚未设置 OpenAI API Key。');

  const payload: ChatCompletionPayload & { stream?: boolean } = {
    model: cfg.model,
    messages,
    temperature: opts.temperature ?? 0.6,
    stream: true,
  };
  if (opts.jsonMode) payload.response_format = { type: 'json_object' };

  const proxy = window.electronAPI?.openaiChatStream;
  if (proxy) {
    const res = await proxy(
      { baseUrl: cfg.baseUrl, apiKey: cfg.apiKey, payload },
      (delta) => opts.onDelta?.(delta),
    );
    if (!res.ok) throw new Error(res.error || 'OpenAI 请求失败');
    return res.content ?? '';
  }

  // 浏览器/开发环境：fetch 流式
  const resp = await fetch(`${cfg.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!resp.ok || !resp.body) {
    const errText = await resp.text().catch(() => '');
    throw new Error(`OpenAI ${resp.status}: ${errText.slice(0, 400)}`);
  }
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, nl).trim();
      buffer = buffer.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          opts.onDelta?.(delta);
        }
      } catch {
        /* 不完整行，忽略 */
      }
    }
  }
  return full;
}

/** 从仍在流式累积的 JSON 文本里，尽力提取 "reply" 字段当前的字符串值，用于边生成边显示。 */
export function extractStreamingReply(buffer: string): string {
  const keyIdx = buffer.indexOf('"reply"');
  if (keyIdx === -1) return '';
  let i = buffer.indexOf(':', keyIdx);
  if (i === -1) return '';
  i++;
  while (i < buffer.length && /\s/.test(buffer[i])) i++;
  if (buffer[i] !== '"') return '';
  i++;
  let out = '';
  while (i < buffer.length) {
    const ch = buffer[i];
    if (ch === '\\') {
      const next = buffer[i + 1];
      if (next === undefined) break;
      if (next === 'n') out += '\n';
      else if (next === 't') out += '\t';
      else if (next === 'r') out += '\r';
      else if (next === '"') out += '"';
      else if (next === '\\') out += '\\';
      else if (next === '/') out += '/';
      else if (next === 'u') {
        const hex = buffer.slice(i + 2, i + 6);
        if (hex.length < 4) break;
        out += String.fromCharCode(parseInt(hex, 16));
        i += 6;
        continue;
      } else out += next;
      i += 2;
      continue;
    }
    if (ch === '"') break;
    out += ch;
    i++;
  }
  return out;
}

export interface TutorCorrection {
  original: string;
  corrected: string;
  explanation_zh: string;
  type?: 'grammar' | 'vocab' | 'spelling' | 'naturalness' | string;
}

export interface TutorReply {
  reply: string;
  reply_translation_zh?: string;
  corrections: TutorCorrection[];
  tip_zh?: string;
}

/** 安全解析模型返回的 JSON 对话结果 */
export function parseTutorReply(raw: string): TutorReply {
  let text = raw.trim();
  // 去除可能的 ```json 包裹
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();
  try {
    const obj = JSON.parse(text);
    return {
      reply: String(obj.reply ?? '').trim(),
      reply_translation_zh: obj.reply_translation_zh
        ? String(obj.reply_translation_zh).trim()
        : undefined,
      corrections: Array.isArray(obj.corrections)
        ? obj.corrections
            .filter((c: unknown) => c && typeof c === 'object')
            .map((c: Record<string, unknown>) => ({
              original: String(c.original ?? '').trim(),
              corrected: String(c.corrected ?? '').trim(),
              explanation_zh: String(c.explanation_zh ?? '').trim(),
              type: c.type ? String(c.type) : undefined,
            }))
            .filter((c: TutorCorrection) => c.corrected || c.original)
        : [],
      tip_zh: obj.tip_zh ? String(obj.tip_zh).trim() : undefined,
    };
  } catch {
    // 解析失败时退化为纯文本回复
    return { reply: raw.trim(), corrections: [] };
  }
}
