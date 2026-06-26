/**
 * 发音评分：基于语音识别结果与目标句的逐词对齐。
 * 原理：发音越准，识别器越能正确识别该词；错读的词会识别错或丢失。
 * 因此用「识别文本 vs 目标句」的模糊逐词对齐，可作为可用的发音近似评分。
 */
import { normalizeForCompare } from './speech';

export type WordStatus = 'ok' | 'near' | 'missing';

export interface ScoredWord {
  display: string;
  status: WordStatus;
}

export interface PronunciationResult {
  score: number; // 0-100
  words: ScoredWord[];
  extra: string[]; // 识别到但目标句中没有的词
  ok: number;
  near: number;
  total: number;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array(n + 1);
  const cur = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = cur[j];
  }
  return prev[n];
}

/** 两个词的相似度 0..1 */
export function wordSimilarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const d = levenshtein(a, b);
  return 1 - d / Math.max(a.length, b.length);
}

const MATCH_THRESHOLD = 0.82;
const NEAR_THRESHOLD = 0.5;

/** 对目标句中的非空词做 LCS 模糊对齐，返回匹配上的目标/识别下标集合 */
function lcsAlign(target: string[], spoken: string[]): { tMatched: Set<number>; sMatched: Set<number> } {
  const m = target.length;
  const n = spoken.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const eq = wordSimilarity(target[i - 1], spoken[j - 1]) >= MATCH_THRESHOLD;
      dp[i][j] = eq ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const tMatched = new Set<number>();
  const sMatched = new Set<number>();
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    const eq = wordSimilarity(target[i - 1], spoken[j - 1]) >= MATCH_THRESHOLD;
    if (eq && dp[i][j] === dp[i - 1][j - 1] + 1) {
      tMatched.add(i - 1);
      sMatched.add(j - 1);
      i--;
      j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  return { tMatched, sMatched };
}

export function scorePronunciation(spoken: string, targetRaw: string): PronunciationResult {
  const tokens = targetRaw
    .split(/\s+/)
    .map((display) => ({ display, norm: normalizeForCompare(display) }))
    .filter((t) => t.norm.length > 0);
  const spokenTokens = normalizeForCompare(spoken).split(' ').filter(Boolean);

  if (tokens.length === 0) {
    return { score: 0, words: [], extra: spokenTokens, ok: 0, near: 0, total: 0 };
  }

  const targetNorm = tokens.map((t) => t.norm);
  const { tMatched, sMatched } = lcsAlign(targetNorm, spokenTokens);

  const spokenUsed = new Set<number>(sMatched);
  const words: ScoredWord[] = [];
  let ok = 0;
  let near = 0;

  tokens.forEach((tok, idx) => {
    if (tMatched.has(idx)) {
      words.push({ display: tok.display, status: 'ok' });
      ok++;
      return;
    }
    // 未对齐：在未使用的识别词中找最相近的
    let bestSim = 0;
    let bestJ = -1;
    spokenTokens.forEach((sw, j) => {
      if (spokenUsed.has(j)) return;
      const sim = wordSimilarity(tok.norm, sw);
      if (sim > bestSim) {
        bestSim = sim;
        bestJ = j;
      }
    });
    if (bestSim >= NEAR_THRESHOLD && bestJ >= 0) {
      spokenUsed.add(bestJ);
      words.push({ display: tok.display, status: 'near' });
      near++;
    } else {
      words.push({ display: tok.display, status: 'missing' });
    }
  });

  const extra = spokenTokens.filter((_, j) => !spokenUsed.has(j));
  const base = ((ok + near * 0.5) / tokens.length) * 100;
  const penalty = Math.min(extra.length * 2, 10);
  const score = Math.max(0, Math.min(100, Math.round(base - penalty)));

  return { score, words, extra, ok, near, total: tokens.length };
}

export function scoreLabel(score: number): { text: string; tone: 'good' | 'mid' | 'low' } {
  if (score >= 85) return { text: '发音很棒！', tone: 'good' };
  if (score >= 70) return { text: '基本准确，继续打磨', tone: 'mid' };
  if (score >= 45) return { text: '能听懂，但有明显偏差', tone: 'low' };
  return { text: '识别度较低，请放慢重读', tone: 'low' };
}
