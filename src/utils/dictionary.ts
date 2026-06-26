/**
 * 词典查询。释义来源：Wiktionary（维基媒体基金会，国际非营利、开放许可）。
 * 外部权威链接：RAE（西班牙皇家语言学院，西语官方）、CNRTL（法国 CNRS 国家科研中心）、
 * 以及对应语言的 Wiktionary。不使用任何中国大陆词典来源。
 */

export interface DictEntry {
  partOfSpeech: string;
  definitions: string[];
}

export interface DictSource {
  label: string;
  url: string;
}

function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
}

/* ---- 本地缓存：避免对同一词重复请求 Wiktionary ---- */
const CACHE_KEY = 'coach-dict-cache-v1';
const CACHE_MAX = 500;

type DictCache = Record<string, DictEntry[]>;

function loadCache(): DictCache {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as DictCache) : {};
  } catch {
    return {};
  }
}

function readCache(key: string): DictEntry[] | undefined {
  return loadCache()[key];
}

function writeCache(key: string, entries: DictEntry[]) {
  try {
    const cache = loadCache();
    cache[key] = entries;
    const keys = Object.keys(cache);
    if (keys.length > CACHE_MAX) {
      // 简单裁剪：丢弃最早插入的若干项
      for (const k of keys.slice(0, keys.length - CACHE_MAX)) delete cache[k];
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
}

/**
 * 用 Wiktionary 的 definition REST 接口（按语言分组、结构化）。
 * @param wikiHost 取释义的 Wiktionary 站点：'en'（英文释义）或 'zh'（中文释义，维基媒体中文版）。
 */
export async function lookupWord(
  word: string,
  langCode: string,
  wikiHost: 'en' | 'zh' = 'en',
): Promise<DictEntry[]> {
  const clean = word.trim().toLowerCase();
  if (!clean) return [];

  const cacheKey = `${wikiHost}:${langCode}:${clean}`;
  const cached = readCache(cacheKey);
  if (cached) return cached;

  // 中文版 Wiktionary 不提供 definition REST 接口（会返回 501），
  // 改用标准 MediaWiki parse 接口取页面 wikitext，再解析对应语言小节的释义。
  if (wikiHost === 'zh') {
    const entries = await lookupZhWiktionary(clean, langCode);
    writeCache(cacheKey, entries);
    return entries;
  }

  const url = `https://${wikiHost}.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(clean)}`;
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  if (resp.status === 404) {
    writeCache(cacheKey, []);
    return [];
  }
  if (!resp.ok) throw new Error(`词典服务返回 ${resp.status}`);
  const data = (await resp.json()) as Record<
    string,
    { partOfSpeech?: string; definitions?: { definition?: string }[] }[]
  >;
  const groups = data[langCode] ?? [];
  const entries: DictEntry[] = [];
  for (const g of groups) {
    const defs = (g.definitions ?? [])
      .map((d) => stripHtml(d.definition ?? ''))
      .filter((d) => d.length > 0)
      .slice(0, 6);
    if (defs.length > 0) {
      entries.push({ partOfSpeech: g.partOfSpeech ?? '', definitions: defs });
    }
  }
  writeCache(cacheKey, entries);
  return entries;
}

/* ---- 中文释义：解析 zh.wiktionary 页面 wikitext ---- */

// 各语言在中文维基词典里的小节标题（含繁/简两种写法）
const ZH_SECTION_NAMES: Record<string, string[]> = {
  es: ['西班牙語', '西班牙语'],
  fr: ['法語', '法语'],
  ru: ['俄語', '俄语'],
  uk: ['烏克蘭語', '乌克兰语'],
  sr: ['塞爾維亞語', '塞尔维亚语', '塞爾維亞-克羅地亞語', '塞尔维亚-克罗地亚语', '塞爾維亞-克羅埃西亞語'],
};

function cleanWikitext(s: string): string {
  let t = s;
  // 处理中文繁简转换标记 -{zh-hans:简;zh-hant:繁}- ，取其中一个变体
  t = t.replace(/-\{([^{}]*)\}-/g, (_m, inner: string) => {
    const m2 = inner.match(/zh-(?:hans|cn)\s*:\s*([^;]*)/);
    if (m2) return m2[1];
    const m3 = inner.match(/[^:;]*:\s*([^;]*)/);
    if (m3) return m3[1];
    return inner;
  });
  // 反复去除模板 {{...}}（处理简单嵌套）
  let prev: string;
  do {
    prev = t;
    t = t.replace(/\{\{[^{}]*\}\}/g, ' ');
  } while (t !== prev);
  // 内链 [[目标|显示]] -> 显示，[[目标]] -> 目标
  t = t.replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1');
  // 外链 [url 文字] -> 文字
  t = t.replace(/\[(?:https?:\/\/\S+)\s+([^\]]*)\]/g, '$1');
  // 加粗/斜体标记
  t = t.replace(/'''?/g, '');
  // 残留 HTML 标签
  t = t.replace(/<[^>]+>/g, '');
  return t.replace(/\s+/g, ' ').trim();
}

// 非释义小节（词源/发音/变位/用法等），不当作释义采集
const NON_DEF_SECTIONS = new Set([
  '詞源',
  '词源',
  '發音',
  '发音',
  '變位',
  '变位',
  '變格',
  '变格',
  '用法',
  '用法說明',
  '用法说明',
  '參見',
  '参见',
  '來源',
  '来源',
  '參考',
  '参考',
  '參考資料',
  '参考资料',
  '延伸閱讀',
  '延伸阅读',
  '同義詞',
  '同义词',
  '近義詞',
  '近义词',
  '反義詞',
  '反义词',
  '派生詞',
  '派生词',
  '派生詞彙',
  '相關詞',
  '相关词',
  '相關詞彙',
  '複合詞',
  '复合词',
  '慣用語',
  '惯用语',
  '註釋',
  '注释',
  '注釋',
  '異體',
  '异体',
  '替代形式',
]);

function parseZhSection(wikitext: string, sectionNames: string[]): DictEntry[] {
  const lines = wikitext.split('\n');
  let inSection = false;
  let pos = '';
  const groups: { pos: string; defs: string[] }[] = [];
  const byPos = new Map<string, string[]>();

  const pushDef = (p: string, def: string) => {
    let arr = byPos.get(p);
    if (!arr) {
      arr = [];
      byPos.set(p, arr);
      groups.push({ pos: p, defs: arr });
    }
    if (arr.length < 6) arr.push(def);
  };

  for (const raw of lines) {
    const line = raw.trim();
    // 二级标题 == 语言 ==（不是 === 三级）
    const l2 = line.match(/^==([^=].*?)==$/);
    if (l2) {
      const name = l2[1].trim();
      inSection = sectionNames.includes(name);
      pos = '';
      continue;
    }
    if (!inSection) continue;
    if (!line) continue;
    // 三级及以上标题作为词性/小节名
    const h = line.match(/^={3,}\s*(.+?)\s*={3,}$/);
    if (h) {
      pos = h[1].trim();
      continue;
    }
    // 词源/发音等非释义小节跳过
    if (NON_DEF_SECTIONS.has(pos)) continue;
    // 例句 #: 与引文 #* 跳过
    if (/^#[:*]/.test(line)) continue;
    const d = line.match(/^#+\s*(.+)/);
    if (d) {
      const def = cleanWikitext(d[1]);
      if (def) pushDef(pos, def);
      continue;
    }
    // 旧版简单格式：语言小节下直接给出的纯文本释义行（跳过链接/模板/分类/列表）
    if (/^[[{*:;|<>]/.test(line)) continue;
    const plain = cleanWikitext(line);
    if (plain && /[\u4e00-\u9fff]/.test(plain)) pushDef(pos, plain);
  }

  return groups.filter((g) => g.defs.length > 0).map((g) => ({ partOfSpeech: g.pos, definitions: g.defs }));
}

async function lookupZhWiktionary(word: string, langCode: string): Promise<DictEntry[]> {
  const names = ZH_SECTION_NAMES[langCode];
  if (!names) return [];
  const url =
    `https://zh.wiktionary.org/w/api.php?action=parse&prop=wikitext&format=json&redirects=1&origin=*&page=` +
    encodeURIComponent(word);
  const resp = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!resp.ok) throw new Error(`词典服务返回 ${resp.status}`);
  const data = (await resp.json()) as {
    error?: { code?: string };
    parse?: { wikitext?: { '*'?: string } };
  };
  if (data.error) return []; // 页面不存在等
  const wt = data.parse?.wikitext?.['*'] ?? '';
  if (!wt) return [];
  return parseZhSection(wt, names);
}

/** 权威 / 国际外链 */
export function dictSources(word: string, langId: string): DictSource[] {
  const w = encodeURIComponent(word.trim());
  const sources: DictSource[] = [];
  if (langId === 'es') {
    sources.push({ label: 'RAE（西班牙皇家语言学院）', url: `https://dle.rae.es/${w}` });
  }
  if (langId === 'fr') {
    sources.push({ label: 'CNRTL（法国国家科研中心）', url: `https://www.cnrtl.fr/definition/${w}` });
  }
  sources.push({ label: `Wiktionary（${langId}）`, url: `https://${langId}.wiktionary.org/wiki/${w}` });
  sources.push({ label: 'Wiktionary（中文）', url: `https://zh.wiktionary.org/wiki/${w}` });
  sources.push({ label: 'Wiktionary（英文）', url: `https://en.wiktionary.org/wiki/${w}` });
  sources.push({ label: 'IATE（欧盟术语库）', url: `https://iate.europa.eu/search/result?query=${w}` });
  return sources;
}
