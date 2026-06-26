import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useLanguageSRS } from '../hooks/useLanguageData';
import { logActivity } from '../utils/activityLog';
import { useAudioDevices } from '../context/AudioDeviceContext';
import { getSpeechRecognition } from '../utils/speech';
import { acquireMicrophone, releaseMicrophone } from '../utils/audioDevices';
import {
  streamChatCompletion,
  extractStreamingReply,
  parseTutorReply,
  hasOpenAIKey,
  getOpenAIConfig,
  PROVIDERS,
  getAIProvider,
  setAIProvider,
  getProviderEntry,
  saveProviderEntry,
  type ProviderId,
  type ChatMessage,
  type TutorCorrection,
} from '../utils/openaiClient';
import {
  loadConversations,
  upsertConversation,
  deleteConversation,
  newConversationId,
  type SavedConversation,
  type UIMessage,
} from '../utils/tutorHistory';

interface Props {
  open: boolean;
  onClose: () => void;
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type Level = (typeof LEVELS)[number];

interface Scenario {
  id: string;
  emoji: string;
  label: string;
  desc: string;
}

const SCENARIOS: Scenario[] = [
  { id: 'cafe', emoji: '☕', label: '咖啡馆 / 酒吧点单', desc: '学习者走进一家西班牙的咖啡馆或 bar，想点早餐或饮料。你扮演服务员（camarero）。' },
  { id: 'directions', emoji: '🗺️', label: '问路 / 交通', desc: '学习者在城市里迷路了，向你（路人）询问怎么去某个地方、坐什么交通工具。' },
  { id: 'rent', emoji: '🏠', label: '租房 / 找公寓', desc: '学习者想租房子，正在和你（房东 / 中介）沟通房子的情况、价格和看房时间。' },
  { id: 'interview', emoji: '💼', label: '求职面试', desc: '学习者来参加工作面试。你扮演面试官，询问其经历、技能和动机。' },
  { id: 'doctor', emoji: '🩺', label: '看医生 / 药店', desc: '学习者身体不舒服，来到诊所或药店。你扮演医生或药剂师，询问症状并给建议。' },
  { id: 'shopping', emoji: '🛍️', label: '购物 / 退换货', desc: '学习者在商店买东西，或想退换商品。你扮演店员，帮助处理。' },
  { id: 'smalltalk', emoji: '💬', label: '日常闲聊 / 自我介绍', desc: '学习者和你（新认识的朋友）闲聊：自我介绍、爱好、家庭、周末计划等。' },
  { id: 'free', emoji: '✨', label: '自由对话（自定主题）', desc: '' },
];

export function AITutorPanel({ open, onClose }: Props) {
  const { language, speak } = useLanguage();
  const { addItem } = useLanguageSRS();
  const { inputDeviceId } = useAudioDevices();

  const [configured, setConfigured] = useState(hasOpenAIKey);
  const [showSettings, setShowSettings] = useState(false);
  const [provider, setProvider] = useState<ProviderId>(getAIProvider);
  const [keyInput, setKeyInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('');

  const [scenarioId, setScenarioId] = useState<string>('cafe');
  const [customTopic, setCustomTopic] = useState('');
  const [level, setLevel] = useState<Level>('A2');

  const [started, setStarted] = useState(false);
  const [apiMessages, setApiMessages] = useState<ChatMessage[]>([]);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SavedConversation[]>([]);
  const convIdRef = useRef<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const SR = getSpeechRecognition();

  const prefix = language.storagePrefix;

  const refreshHistory = () => setHistory(loadConversations(prefix));

  useEffect(() => {
    if (open) {
      const p = getAIProvider();
      const e = getProviderEntry(p);
      const def = PROVIDERS[p];
      setProvider(p);
      setKeyInput(e.apiKey ?? '');
      setModelInput(e.model ?? '');
      setBaseUrlInput(e.baseUrl ?? def.baseUrl);
      setConfigured(hasOpenAIKey());
      setShowSettings(!hasOpenAIKey());
    }
  }, [open]);

  const onProviderChange = (p: ProviderId) => {
    setProvider(p);
    const e = getProviderEntry(p);
    const def = PROVIDERS[p];
    setKeyInput(e.apiKey ?? '');
    setModelInput(e.model ?? '');
    setBaseUrlInput(e.baseUrl ?? def.baseUrl);
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (open) refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, prefix]);

  // 自动保存当前会话（流式生成中不保存，避免频繁写入）
  useEffect(() => {
    if (!started || !convIdRef.current || messages.length === 0) return;
    if (messages.some((m) => m.streaming)) return;
    const sc = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];
    const now = Date.now();
    const existing = loadConversations(prefix).find((c) => c.id === convIdRef.current);
    upsertConversation(prefix, {
      id: convIdRef.current,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      scenarioId,
      scenarioLabel: scenarioId === 'free' ? customTopic || '自由对话' : sc.label,
      level,
      customTopic,
      messages,
      apiMessages,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, apiMessages, started, prefix]);

  if (!open) return null;

  const targetName = language.nativeName;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) ?? SCENARIOS[0];

  const saveSettings = () => {
    setAIProvider(provider);
    saveProviderEntry(provider, {
      apiKey: keyInput.trim(),
      model: modelInput.trim(),
      baseUrl: baseUrlInput.trim(),
    });
    setConfigured(!!keyInput.trim());
    if (keyInput.trim()) setShowSettings(false);
  };

  const buildSystemPrompt = (): string => {
    const desc =
      scenarioId === 'free'
        ? `自由对话，主题：${customTopic.trim() || '由学习者引导的任意日常话题'}。`
        : scenario.desc;
    return [
      `你是一位友好、耐心的${language.label}（${targetName}）口语陪练兼老师。`,
      `当前情景：${desc}请你在这个情景中扮演相应的角色，主动、自然地推进对话。`,
      `学习者的水平是 ${level}（欧洲语言共同参考框架 CEFR）。请严格使用与该水平相符的词汇与语法，句子简短、地道。`,
      `语言风格对标西班牙本土语言学校（EOI）与塞万提斯学院教材，使用地道的半岛${targetName}；不要使用来自中国大陆的教材风格内容。`,
      `每一轮你都要做两件事：(1) 用${targetName}以角色身份回复（1~3 句，并自然地提出一个问题以延续对话）；(2) 分析学习者上一条消息中的语言错误。`,
      `你必须只输出一个 JSON 对象，不要输出任何其它文字，结构如下：`,
      `{"reply":"你的${targetName}回复","reply_translation_zh":"该回复的简体中文翻译","corrections":[{"original":"学习者原文里的错误片段","corrected":"改正后的写法","explanation_zh":"用简体中文解释原因","type":"grammar|vocab|spelling|naturalness"}],"tip_zh":"可选：一句简短的简体中文鼓励或提示"}`,
      `如果学习者没有错误，corrections 必须是空数组 []。所有解释必须用简体中文。`,
    ].join('\n');
  };

  const callTutor = async (history: ChatMessage[], showUserText?: string) => {
    setLoading(true);
    setError(null);
    if (showUserText !== undefined) {
      setMessages((m) => [...m, { role: 'user', text: showUserText }]);
    }
    // 占位的助手气泡，流式更新其 text
    setMessages((m) => [...m, { role: 'assistant', text: '', streaming: true }]);
    const updateLastAssistant = (patch: Partial<UIMessage>) => {
      setMessages((m) => {
        const copy = [...m];
        for (let i = copy.length - 1; i >= 0; i--) {
          if (copy[i].role === 'assistant') {
            copy[i] = { ...copy[i], ...patch };
            break;
          }
        }
        return copy;
      });
    };
    try {
      let buffer = '';
      let lastShown = '';
      const raw = await streamChatCompletion(history, {
        jsonMode: true,
        temperature: 0.6,
        onDelta: (delta) => {
          buffer += delta;
          const partial = extractStreamingReply(buffer);
          if (partial && partial !== lastShown) {
            lastShown = partial;
            updateLastAssistant({ text: partial });
          }
        },
      });
      const parsed = parseTutorReply(raw);
      updateLastAssistant({
        text: parsed.reply,
        translation: parsed.reply_translation_zh,
        corrections: parsed.corrections,
        tip: parsed.tip_zh,
        streaming: false,
      });
      setApiMessages([...history, { role: 'assistant', content: parsed.reply }]);
      if (parsed.reply) speak(parsed.reply, 0.95);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      // 移除失败的占位气泡
      setMessages((m) => {
        const copy = [...m];
        if (copy.length && copy[copy.length - 1].role === 'assistant' && !copy[copy.length - 1].text) {
          copy.pop();
        }
        return copy;
      });
    } finally {
      setLoading(false);
    }
  };

  const startConversation = () => {
    if (scenarioId === 'free' && !customTopic.trim()) {
      setError('请先填写自由对话的主题。');
      return;
    }
    const system: ChatMessage = { role: 'system', content: buildSystemPrompt() };
    const kickoff: ChatMessage = {
      role: 'user',
      content: `（请用${targetName}开始这个情景对话，主动说出第一句，简短自然，并提出一个问题。）`,
    };
    convIdRef.current = newConversationId();
    setMessages([]);
    setStarted(true);
    void callTutor([system, kickoff]);
  };

  const resumeConversation = (conv: SavedConversation) => {
    convIdRef.current = conv.id;
    setScenarioId(conv.scenarioId);
    setCustomTopic(conv.customTopic ?? '');
    setLevel(conv.level as Level);
    setMessages(conv.messages);
    setApiMessages(conv.apiMessages);
    setShowHistory(false);
    setError(null);
    setStarted(true);
  };

  const removeConversation = (id: string) => {
    deleteConversation(prefix, id);
    refreshHistory();
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text || loading) return;
    logActivity(language.storagePrefix);
    const history = [...apiMessages, { role: 'user', content: text } as ChatMessage];
    setApiMessages(history);
    setInput('');
    void callTutor(history, text);
  };

  const resetConversation = () => {
    setStarted(false);
    setMessages([]);
    setApiMessages([]);
    setInput('');
    setError(null);
    convIdRef.current = null;
    refreshHistory();
  };

  const startListen = async () => {
    if (!SR) {
      setError('当前环境不支持语音识别，请直接打字。');
      return;
    }
    try {
      await acquireMicrophone(inputDeviceId);
      releaseMicrophone();
    } catch {
      setError('无法访问麦克风，请在顶部「音频」检查输入设备与权限。');
      return;
    }
    const rec = new SR();
    rec.lang = language.speechLang;
    rec.continuous = true;
    rec.interimResults = true;
    setListening(true);
    let text = '';
    rec.onresult = (ev) => {
      text = '';
      for (let i = 0; i < ev.results.length; i++) text += ev.results[i][0].transcript + ' ';
      setInput(text.trim());
    };
    const finish = () => {
      setListening(false);
      releaseMicrophone();
    };
    rec.onerror = finish;
    rec.onend = finish;
    rec.start();
    setTimeout(() => rec.stop(), 20000);
  };

  const addCorrectionToSRS = (c: TutorCorrection) => {
    if (!c.corrected) return;
    addItem({
      es: c.corrected,
      zh: c.explanation_zh || c.original || '纠错',
      note: c.original ? `原: ${c.original}` : undefined,
      source: 'AI 陪练',
      kind: c.corrected.includes(' ') ? 'chunk' : 'word',
    });
  };

  return (
    <div className="accum-overlay" onClick={onClose} role="presentation">
      <div
        className="accum-panel accum-panel-wide aitutor-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
      >
        <header className="accum-header">
          <h2>🤖 AI {language.label}陪练</h2>
          <span className="accum-count">
            {configured ? `${PROVIDERS[getAIProvider()].label} · ${getOpenAIConfig().model}` : '未配置'}
          </span>
          <button
            type="button"
            className="btn-icon"
            title="历史对话"
            onClick={() => {
              refreshHistory();
              setShowHistory((v) => !v);
              setShowSettings(false);
            }}
          >
            🕘{history.length > 0 ? ` ${history.length}` : ''}
          </button>
          <button
            type="button"
            className="btn-icon"
            title="设置 API Key / 模型"
            onClick={() => {
              setShowSettings((v) => !v);
              setShowHistory(false);
            }}
          >
            ⚙
          </button>
          <button type="button" className="accum-close" onClick={onClose}>
            ✕
          </button>
        </header>

        {showSettings ? (
          <div className="aitutor-settings">
            <p className="accum-tip">
              选择一个 AI 提供方并填入你自己的 API Key。Key 仅保存在<strong>本机</strong>，
              请求经桌面端直接发往对应服务，不经任何第三方服务器。各提供方的 Key 会分别记住，可随时切换。
            </p>
            <label className="aitutor-field">
              <span>提供方</span>
              <select value={provider} onChange={(e) => onProviderChange(e.target.value as ProviderId)}>
                {Object.values(PROVIDERS).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="aitutor-field">
              <span>{PROVIDERS[provider].label} API Key</span>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="API Key"
                autoComplete="off"
              />
            </label>
            <label className="aitutor-field">
              <span>模型</span>
              <select value={modelInput} onChange={(e) => setModelInput(e.target.value)}>
                {!PROVIDERS[provider].models.includes(modelInput) && modelInput && (
                  <option value={modelInput}>{modelInput}（自定义）</option>
                )}
                {PROVIDERS[provider].models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                    {PROVIDERS[provider].modelNotes[m] ? ` — ${PROVIDERS[provider].modelNotes[m]}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <ul className="aitutor-model-notes">
              {PROVIDERS[provider].models.map((m) => (
                <li key={m} className={m === modelInput ? 'current' : ''}>
                  <code>{m}</code>
                  <span>{PROVIDERS[provider].modelNotes[m] ?? ''}</span>
                </li>
              ))}
            </ul>
            {PROVIDERS[provider].editableBaseUrl && (
              <label className="aitutor-field">
                <span>自定义模型名（可选）</span>
                <input
                  type="text"
                  value={modelInput}
                  onChange={(e) => setModelInput(e.target.value)}
                  placeholder={PROVIDERS[provider].defaultModel}
                />
              </label>
            )}
            {PROVIDERS[provider].editableBaseUrl && (
              <label className="aitutor-field">
                <span>接口地址（Base URL）</span>
                <input
                  type="text"
                  value={baseUrlInput}
                  onChange={(e) => setBaseUrlInput(e.target.value)}
                  placeholder={PROVIDERS[provider].baseUrl || 'https://...'}
                />
              </label>
            )}
            <p className="aitutor-hint">{PROVIDERS[provider].keyHelp}</p>
            <div className="step-actions">
              <button type="button" className="btn btn-primary" onClick={saveSettings}>
                保存
              </button>
              {configured && (
                <button type="button" className="btn btn-secondary" onClick={() => setShowSettings(false)}>
                  返回
                </button>
              )}
            </div>
          </div>
        ) : showHistory ? (
          <div className="aitutor-history">
            <p className="accum-tip">这里保存了你最近的对话（仅存本机）。点击可继续聊，纠错记录也会一并恢复。</p>
            {history.length === 0 ? (
              <p className="aitutor-hint">还没有历史对话。开始一次对话后会自动保存到这里。</p>
            ) : (
              <div className="aitutor-history-list">
                {history.map((c) => {
                  const userTurns = c.messages.filter((m) => m.role === 'user').length;
                  return (
                    <div key={c.id} className="aitutor-history-item">
                      <button
                        type="button"
                        className="aitutor-history-main"
                        onClick={() => resumeConversation(c)}
                      >
                        <span className="aitutor-history-title">{c.scenarioLabel}</span>
                        <span className="aitutor-history-meta">
                          {c.level} · {userTurns} 轮 · {new Date(c.updatedAt).toLocaleString()}
                        </span>
                      </button>
                      <button
                        type="button"
                        className="btn-icon aitutor-history-del"
                        title="删除"
                        onClick={() => removeConversation(c.id)}
                      >
                        🗑
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="step-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowHistory(false)}>
                返回
              </button>
            </div>
          </div>
        ) : !started ? (
          <div className="aitutor-setup">
            <p className="accum-tip">选择一个情景，AI 会用{targetName}和你对话，并在每句后给出纠错。</p>
            <div className="aitutor-scenarios">
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`aitutor-scenario ${scenarioId === s.id ? 'active' : ''}`}
                  onClick={() => setScenarioId(s.id)}
                >
                  <span className="aitutor-scenario-emoji">{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            {scenarioId === 'free' && (
              <label className="aitutor-field">
                <span>自由对话主题</span>
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="例如：聊聊我上周末的旅行 / 讨论环保 / 谈谈我的工作"
                />
              </label>
            )}
            <label className="aitutor-field aitutor-level">
              <span>难度（CEFR）</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </label>
            {error && <p className="aitutor-error">{error}</p>}
            <button type="button" className="btn btn-primary" onClick={startConversation}>
              开始对话 →
            </button>
          </div>
        ) : (
          <div className="aitutor-chat">
            <div className="aitutor-chat-bar">
              <span className="aitutor-chat-meta">
                {scenario.emoji} {scenarioId === 'free' ? customTopic : scenario.label} · {level}
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetConversation}>
                ↺ 换情景
              </button>
            </div>

            <div className="aitutor-messages" ref={scrollRef}>
              {messages.map((m, i) => (
                <div key={i} className={`aitutor-msg ${m.role}`}>
                  <div className="aitutor-bubble">
                    <p className="aitutor-text">
                      {m.text}
                      {m.streaming && m.text && <span className="aitutor-cursor" />}
                    </p>
                    {m.role === 'assistant' && !m.streaming && m.text && (
                      <button
                        type="button"
                        className="btn-icon aitutor-speak"
                        onClick={() => speak(m.text, 0.95)}
                        title="朗读"
                      >
                        🔊
                      </button>
                    )}
                  </div>
                  {m.translation && <p className="aitutor-translation">{m.translation}</p>}
                  {m.tip && <p className="aitutor-tip">💡 {m.tip}</p>}
                  {m.corrections && m.corrections.length > 0 && (
                    <div className="aitutor-corrections">
                      <p className="aitutor-corrections-title">📝 纠错</p>
                      {m.corrections.map((c, j) => (
                        <div key={j} className="aitutor-correction">
                          <p>
                            <span className="aitutor-wrong">{c.original}</span>
                            {' → '}
                            <span className="aitutor-right">{c.corrected}</span>
                          </p>
                          {c.explanation_zh && <p className="aitutor-explain">{c.explanation_zh}</p>}
                          <button
                            type="button"
                            className="btn btn-secondary btn-xs"
                            onClick={() => addCorrectionToSRS(c)}
                          >
                            ＋ 加入 SRS
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {messages.length > 0 &&
                messages[messages.length - 1].role === 'assistant' &&
                (messages[messages.length - 1].corrections?.length ?? 0) === 0 &&
                !loading && <p className="aitutor-allgood">✓ 上一句没有发现错误，很棒！</p>}
              {loading &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'assistant' &&
                !messages[messages.length - 1].text && (
                  <p className="aitutor-loading">AI 正在思考…</p>
                )}
            </div>

            {error && <p className="aitutor-error">{error}</p>}

            <div className="aitutor-input-row">
              <textarea
                className="aitutor-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={`用${targetName}回复…（Enter 发送，Shift+Enter 换行）`}
                rows={2}
                disabled={loading}
              />
              <div className="aitutor-input-actions">
                {SR && (
                  <button
                    type="button"
                    className={`btn-icon ${listening ? 'listening' : ''}`}
                    onClick={startListen}
                    disabled={loading || listening}
                    title="语音输入"
                  >
                    🎤
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
