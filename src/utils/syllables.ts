/**
 * 西班牙语音节切分 + 音素提示（离线，基于西语规整的拼读规则）。
 * 用于发音练习里「音节级薄弱定位」：把读得不准/漏读的词拆成音节，
 * 并针对其中的难点字母（颤音 r/rr、c/z、j/g、ll/y、ñ、b/v、重音等）给出中文提示。
 */

const VOWELS = 'aeiouáéíóúüAEIOUÁÉÍÓÚÜ';
const STRONG = 'aeoáéóAEOÁÉÓ';
const WEAK_ACCENTED = 'íúÍÚ';
const DIGRAPHS = new Set(['ch', 'll', 'rr']);
const L_CLUSTER_FIRST = 'bcfgp';
const R_CLUSTER_FIRST = 'bcdfgpt';

function isVowel(c: string): boolean {
  return VOWELS.includes(c);
}
function isStrong(c: string): boolean {
  return STRONG.includes(c);
}
function isWeakAccented(c: string): boolean {
  return WEAK_ACCENTED.includes(c);
}

/** 把一个词切成音节（尽力而为，足够给提示用）。 */
export function splitSyllablesEs(wordRaw: string): string[] {
  const chars = [...wordRaw];
  if (chars.length < 2) return [wordRaw];

  // 1) 找出元音核（把连续元音按二重元音/隔写规则拆成若干核）
  const nuclei: { start: number; end: number }[] = [];
  let i = 0;
  while (i < chars.length) {
    if (isVowel(chars[i])) {
      let j = i;
      while (j + 1 < chars.length && isVowel(chars[j + 1])) j++;
      let start = i;
      for (let k = i; k < j; k++) {
        const a = chars[k];
        const b = chars[k + 1];
        const hiatus =
          (isStrong(a) && isStrong(b)) || isWeakAccented(a) || isWeakAccented(b);
        if (hiatus) {
          nuclei.push({ start, end: k });
          start = k + 1;
        }
      }
      nuclei.push({ start, end: j });
      i = j + 1;
    } else {
      i++;
    }
  }

  if (nuclei.length <= 1) return [wordRaw];

  // 2) 在相邻元音核之间，按辅音数量与可分性决定切点
  const cuts: number[] = [];
  for (let n = 0; n < nuclei.length - 1; n++) {
    const endV = nuclei[n].end;
    const nextStart = nuclei[n + 1].start;
    const consonants = chars.slice(endV + 1, nextStart);

    let cut: number;
    if (consonants.length === 0) {
      cut = nextStart; // 隔写（hiato）
    } else {
      // 构造辅音单元（二合字母算一个）
      const units: { text: string; start: number }[] = [];
      let p = 0;
      while (p < consonants.length) {
        const two = (consonants[p] + (consonants[p + 1] ?? '')).toLowerCase();
        if (DIGRAPHS.has(two)) {
          units.push({ text: two, start: endV + 1 + p });
          p += 2;
        } else {
          units.push({ text: consonants[p], start: endV + 1 + p });
          p += 1;
        }
      }
      let onset = 1;
      if (units.length >= 2) {
        const a = units[units.length - 2].text;
        const b = units[units.length - 1].text;
        const insep =
          a.length === 1 &&
          ((b === 'l' && L_CLUSTER_FIRST.includes(a)) ||
            (b === 'r' && R_CLUSTER_FIRST.includes(a)));
        onset = insep ? 2 : 1;
      }
      cut = units[units.length - onset].start;
    }
    cuts.push(cut);
  }

  // 3) 依切点切片
  const syllables: string[] = [];
  let prev = 0;
  for (const c of cuts) {
    syllables.push(chars.slice(prev, c).join(''));
    prev = c;
  }
  syllables.push(chars.slice(prev).join(''));
  return syllables.filter((s) => s.length > 0);
}

/** 针对一个词里的难点字母给出中文发音提示（去重）。 */
export function phonemeTips(wordRaw: string): string[] {
  const w = wordRaw.toLowerCase();
  const tips: string[] = [];
  const add = (t: string) => {
    if (!tips.includes(t)) tips.push(t);
  };

  if (/rr/.test(w) || /^r/.test(w) || /[nls]r/.test(w)) {
    add('「rr / 词首 r」是多击大舌颤音，舌尖在上齿龈连续振动。');
  }
  if (/[aeiouáéíóú]r[aeiouáéíóú]/.test(w)) {
    add('元音间的单个 r 是「单击颤音」，轻轻一弹，别发成英语的 r。');
  }
  if (/c[eiéí]/.test(w) || /z/.test(w)) {
    add('「ce/ci/z」西班牙半岛读 /θ/（类似英语 th），拉美读 /s/；保持一致即可。');
  }
  if (/j/.test(w) || /g[eiéí]/.test(w)) {
    add('「j、ge/gi」是喉部摩擦音 /x/，像用力呵气的 h，不要读成英语 j。');
  }
  if (/ll/.test(w) || /y[aeiouáéíóú]/.test(w)) {
    add('「ll / y」读 /ʝ/，接近汉语「ya」的声母，别读成英语 l。');
  }
  if (/ñ/.test(w)) {
    add('「ñ」读 /ɲ/，类似「ni」连读（如 niño）。');
  }
  if (/h/.test(w)) {
    add('「h」永远不发音，直接跳过。');
  }
  if (/[bv]/.test(w)) {
    add('「b 和 v」发音相同，都读 /b/；词中常为双唇轻触的软音。');
  }
  if (/gu[eiéí]/.test(w)) {
    add('「gue/gui」里的 u 不发音（除非写成 ü）。');
  }
  if (/qu/.test(w)) {
    add('「qu」里的 u 不发音，读 /k/。');
  }
  if (/x/.test(w)) {
    add('「x」一般读 /ks/（如 taxi）。');
  }
  if (/[áéíóú]/.test(w)) {
    add('带重音符号的音节要读得更重、更长（重音落在此处）。');
  }
  return tips;
}

export interface WeakWordAnalysis {
  word: string;
  syllables: string[];
  tips: string[];
}

/** 仅保留字母与重音符号，去掉标点 */
function cleanWord(w: string): string {
  return w.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, '');
}

/** 针对一批「读得不准/漏读」的词，生成音节切分 + 提示 */
export function analyzeWeakWords(words: string[]): WeakWordAnalysis[] {
  const seen = new Set<string>();
  const out: WeakWordAnalysis[] = [];
  for (const raw of words) {
    const word = cleanWord(raw);
    if (!word || seen.has(word.toLowerCase())) continue;
    seen.add(word.toLowerCase());
    const tips = phonemeTips(word);
    out.push({ word, syllables: splitSyllablesEs(word), tips });
  }
  return out;
}
