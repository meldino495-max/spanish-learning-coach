import type { ChatMessage, TutorCorrection } from './openaiClient';

export interface UIMessage {
  role: 'user' | 'assistant';
  text: string;
  translation?: string;
  corrections?: TutorCorrection[];
  tip?: string;
  /** 流式生成中（不持久化语义，仅用于 UI 显示光标） */
  streaming?: boolean;
}

export interface SavedConversation {
  id: string;
  createdAt: number;
  updatedAt: number;
  scenarioId: string;
  scenarioLabel: string;
  level: string;
  customTopic?: string;
  messages: UIMessage[];
  apiMessages: ChatMessage[];
}

const MAX_SAVED = 30;

function storageKey(prefix: string) {
  return `${prefix}-tutor-history-v1`;
}

export function loadConversations(prefix: string): SavedConversation[] {
  try {
    const raw = localStorage.getItem(storageKey(prefix));
    if (!raw) return [];
    const list = JSON.parse(raw) as SavedConversation[];
    return Array.isArray(list) ? list.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

function persist(prefix: string, list: SavedConversation[]) {
  try {
    const trimmed = list.sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_SAVED);
    localStorage.setItem(storageKey(prefix), JSON.stringify(trimmed));
  } catch {
    /* ignore */
  }
}

export function upsertConversation(prefix: string, conv: SavedConversation) {
  if (!prefix || !conv.id) return;
  const list = loadConversations(prefix);
  const idx = list.findIndex((c) => c.id === conv.id);
  if (idx >= 0) list[idx] = conv;
  else list.push(conv);
  persist(prefix, list);
}

export function deleteConversation(prefix: string, id: string) {
  const list = loadConversations(prefix).filter((c) => c.id !== id);
  persist(prefix, list);
}

export function newConversationId(): string {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
