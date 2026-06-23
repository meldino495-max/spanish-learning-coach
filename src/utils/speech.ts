/** 浏览器 TTS 朗读西语 */
export function speakSpanish(text: string, rate = 0.85) {
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'es-ES';
  utter.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const esVoice =
    voices.find((v) => v.lang.startsWith('es')) ?? voices.find((v) => v.lang.includes('ES'));
  if (esVoice) utter.voice = esVoice;
  window.speechSynthesis.speak(utter);
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
}

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: { length: number; [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** 简单相似度：忽略大小写、标点和多余空格 */
export function normalizeForCompare(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!,.\-;:'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function textsMatch(a: string, b: string) {
  const na = normalizeForCompare(a);
  const nb = normalizeForCompare(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const wordsA = na.split(' ');
  const wordsB = nb.split(' ');
  const common = wordsA.filter((w) => wordsB.includes(w)).length;
  const ratio = common / Math.max(wordsA.length, wordsB.length);
  return ratio >= 0.85;
}
