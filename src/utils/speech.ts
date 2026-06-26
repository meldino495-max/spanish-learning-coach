/** 浏览器 TTS 朗读与语音识别工具 */
import { getStoredOutputDeviceId } from './audioDeviceStore';
import { speakWithDevices, stopAllAudioOutput } from './audioDevices';

export { speakWithDevices, stopAllAudioOutput } from './audioDevices';

/** 浏览器 TTS 朗读目标语言 */
export function speakText(text: string, lang: string, rate = 0.85) {
  void speakWithDevices(text, lang, rate, getStoredOutputDeviceId());
}

/** @deprecated 使用 speakText(text, 'es-ES') */
export function speakSpanish(text: string, rate = 0.85) {
  speakText(text, 'es-ES', rate);
}

export function stopSpeaking() {
  stopAllAudioOutput();
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
    .replace(/[¿?¡!,.\-;:'"«»]/g, '')
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
