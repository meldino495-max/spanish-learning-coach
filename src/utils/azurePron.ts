/**
 * Azure 语音「发音评测」客户端（用户自带 Key + 区域）。
 * 返回音素级别的准确度评分。Electron 下走主进程代理（避免 CORS / 处理二进制），
 * 浏览器/开发环境直接 fetch。
 */
import { getAppSetting, setAppSetting } from './appSettings';
import { arrayBufferToBase64 } from './recorder';

export interface AzureConfig {
  key: string;
  region: string;
}

export function getAzureConfig(): AzureConfig {
  return {
    key: getAppSetting('azureKey') ?? '',
    region: (getAppSetting('azureRegion') ?? '').trim(),
  };
}

export function saveAzureConfig(cfg: Partial<AzureConfig>) {
  if (cfg.key !== undefined) setAppSetting('azureKey', cfg.key.trim());
  if (cfg.region !== undefined) setAppSetting('azureRegion', cfg.region.trim());
}

export function hasAzure(): boolean {
  const c = getAzureConfig();
  return !!c.key && !!c.region;
}

export interface AzurePhoneme {
  phoneme: string;
  score: number;
}

export interface AzureWord {
  word: string;
  score: number;
  errorType?: string;
  phonemes: AzurePhoneme[];
}

export interface AzurePronResult {
  accuracy: number;
  fluency: number;
  completeness: number;
  pron: number;
  recognized: string;
  words: AzureWord[];
}

function buildAssessmentHeader(referenceText: string): string {
  const params = {
    ReferenceText: referenceText,
    GradingSystem: 'HundredMark',
    Granularity: 'Phoneme',
    Dimension: 'Comprehensive',
    EnableMiscue: true,
  };
  // header 需要 base64(UTF-8 JSON)
  const json = JSON.stringify(params);
  if (typeof TextEncoder !== 'undefined') {
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return btoa(binary);
  }
  return btoa(unescape(encodeURIComponent(json)));
}

function parseAzureResponse(raw: string): AzurePronResult {
  const data = JSON.parse(raw);
  const nbest = data?.NBest?.[0];
  if (!nbest) {
    throw new Error(data?.RecognitionStatus ? `识别状态：${data.RecognitionStatus}` : '未识别到语音。');
  }
  const pa = nbest.PronunciationAssessment ?? {};
  const words: AzureWord[] = Array.isArray(nbest.Words)
    ? nbest.Words.map((w: Record<string, unknown>) => {
        const wpa = (w.PronunciationAssessment ?? {}) as Record<string, unknown>;
        const phonemes: AzurePhoneme[] = Array.isArray(w.Phonemes)
          ? (w.Phonemes as Record<string, unknown>[]).map((p) => ({
              phoneme: String(p.Phoneme ?? ''),
              score: Number(
                (p.PronunciationAssessment as Record<string, unknown> | undefined)?.AccuracyScore ?? 0,
              ),
            }))
          : [];
        return {
          word: String(w.Word ?? ''),
          score: Number(wpa.AccuracyScore ?? 0),
          errorType: wpa.ErrorType ? String(wpa.ErrorType) : undefined,
          phonemes,
        };
      })
    : [];

  return {
    accuracy: Number(pa.AccuracyScore ?? 0),
    fluency: Number(pa.FluencyScore ?? 0),
    completeness: Number(pa.CompletenessScore ?? 0),
    pron: Number(pa.PronScore ?? 0),
    recognized: String(nbest.Display ?? nbest.Lexical ?? ''),
    words,
  };
}

export async function assessPronunciation(
  referenceText: string,
  wav: ArrayBuffer,
  language: string,
): Promise<AzurePronResult> {
  const cfg = getAzureConfig();
  if (!cfg.key || !cfg.region) throw new Error('尚未设置 Azure 语音 Key 与区域。');

  const assessment = buildAssessmentHeader(referenceText);

  const proxy = window.electronAPI?.azurePron;
  if (proxy) {
    const res = await proxy({
      region: cfg.region,
      key: cfg.key,
      language,
      assessment,
      audioBase64: arrayBufferToBase64(wav),
    });
    if (!res.ok) throw new Error(res.error || 'Azure 发音评测失败');
    return parseAzureResponse(res.body ?? '');
  }

  const url = `https://${cfg.region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(
    language,
  )}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Ocp-Apim-Subscription-Key': cfg.key,
      'Content-Type': 'audio/wav; codecs=audio/pcm; samplerate=16000',
      'Pronunciation-Assessment': assessment,
      Accept: 'application/json',
    },
    body: wav,
  });
  const text = await resp.text();
  if (!resp.ok) throw new Error(`Azure ${resp.status}: ${text.slice(0, 300)}`);
  return parseAzureResponse(text);
}

export function phonemeTone(score: number): 'good' | 'mid' | 'low' {
  if (score >= 80) return 'good';
  if (score >= 60) return 'mid';
  return 'low';
}
