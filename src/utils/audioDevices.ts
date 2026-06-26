import { DEFAULT_DEVICE, getStoredOutputDeviceId } from './audioDeviceStore';



export interface AudioDeviceOption {

  deviceId: string;

  label: string;

  kind: MediaDeviceKind;

}



let activeMicStream: MediaStream | null = null;

let sharedSpeakAudio: HTMLAudioElement | null = null;

let currentSinkId = DEFAULT_DEVICE;



export function supportsSetSinkId(): boolean {

  return typeof HTMLAudioElement !== 'undefined' && 'setSinkId' in HTMLAudioElement.prototype;

}



export function supportsSelectAudioOutput(): boolean {

  return typeof (navigator.mediaDevices as MediaDevices & { selectAudioOutput?: unknown })

    .selectAudioOutput === 'function';

}



function getSpeakAudio(): HTMLAudioElement {

  if (!sharedSpeakAudio) {

    sharedSpeakAudio = new Audio();

    sharedSpeakAudio.crossOrigin = 'anonymous';

  }

  return sharedSpeakAudio;

}



/** 切换输出设备时预先绑定 sink，后续朗读复用同一 Audio 元素 */

export async function bindOutputDevice(deviceId: string): Promise<void> {

  currentSinkId = deviceId || DEFAULT_DEVICE;

  if (!supportsSetSinkId() || currentSinkId === DEFAULT_DEVICE) return;

  try {

    const audio = getSpeakAudio();

    await audio.setSinkId(currentSinkId);

  } catch {

    /* 设备可能已断开 */

  }

}



/** 请求麦克风权限并枚举设备 */

export async function enumerateAudioDevices(): Promise<AudioDeviceOption[]> {

  if (!navigator.mediaDevices?.enumerateDevices) return [];



  try {

    const stream = await navigator.mediaDevices.getUserMedia({

      audio: { echoCancellation: true, noiseSuppression: true },

    });

    stream.getTracks().forEach((t) => t.stop());

  } catch {

    /* 用户拒绝权限时仍尝试枚举 */

  }



  if (supportsSelectAudioOutput()) {

    try {

      const outputs = await navigator.mediaDevices.enumerateDevices();

      if (!outputs.some((d) => d.kind === 'audiooutput' && d.label)) {

        /* 输出设备标签为空时，引导用户用系统选择器授权 */

      }

    } catch {

      /* ignore */

    }

  }



  const devices = await navigator.mediaDevices.enumerateDevices();

  const seen = new Set<string>();

  return devices

    .filter((d) => d.kind === 'audioinput' || d.kind === 'audiooutput')

    .filter((d) => {

      const id = d.deviceId || DEFAULT_DEVICE;

      const key = `${d.kind}:${id}`;

      if (seen.has(key)) return false;

      seen.add(key);

      return true;

    })

    .map((d, i) => ({

      deviceId: d.deviceId || DEFAULT_DEVICE,

      label: d.label || (d.kind === 'audioinput' ? `麦克风 ${i + 1}` : `扬声器 ${i + 1}`),

      kind: d.kind,

    }));

}



export async function promptSelectAudioOutput(): Promise<string | null> {

  const md = navigator.mediaDevices as MediaDevices & {

    selectAudioOutput?: () => Promise<MediaDeviceInfo>;

  };

  if (!md.selectAudioOutput) return null;

  try {

    const device = await md.selectAudioOutput();

    const id = device.deviceId || DEFAULT_DEVICE;

    await bindOutputDevice(id);

    return id;

  } catch {

    return null;

  }

}



/** 锁定指定麦克风（口语步骤前调用；语音识别仍跟随系统默认输入） */

export async function acquireMicrophone(deviceId?: string): Promise<MediaStream> {

  releaseMicrophone();

  const constraints: MediaTrackConstraints = {

    echoCancellation: true,

    noiseSuppression: true,

  };

  if (deviceId && deviceId !== DEFAULT_DEVICE) {

    constraints.deviceId = { ideal: deviceId };

  }

  try {

    activeMicStream = await navigator.mediaDevices.getUserMedia({ audio: constraints });

  } catch (err) {

    if (deviceId && deviceId !== DEFAULT_DEVICE) {

      activeMicStream = await navigator.mediaDevices.getUserMedia({

        audio: { echoCancellation: true, noiseSuppression: true },

      });

    } else {

      throw err;

    }

  }

  return activeMicStream;

}



export function releaseMicrophone() {

  activeMicStream?.getTracks().forEach((t) => t.stop());

  activeMicStream = null;

}



function stopSpeakAudio() {

  const audio = sharedSpeakAudio;

  if (!audio) return;

  audio.pause();

  audio.removeAttribute('src');

  audio.load();

}



async function applySinkId(audio: HTMLAudioElement, deviceId?: string) {

  const sink = deviceId ?? currentSinkId ?? getStoredOutputDeviceId();

  if (sink && sink !== DEFAULT_DEVICE && supportsSetSinkId()) {

    await audio.setSinkId(sink);

    currentSinkId = sink;

  }

}



async function speakViaAudioElement(

  text: string,

  lang: string,

  rate: number,

  outputDeviceId?: string,

): Promise<void> {

  stopSpeakAudio();

  window.speechSynthesis.cancel();



  const tl = lang.split('-')[0];

  const chunk = text.slice(0, 180);

  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(chunk)}`;



  const audio = getSpeakAudio();

  await applySinkId(audio, outputDeviceId);

  audio.playbackRate = Math.max(0.5, Math.min(1.5, rate));



  await new Promise<void>((resolve, reject) => {

    const onEnd = () => {

      audio.removeEventListener('ended', onEnd);

      audio.removeEventListener('error', onErr);

      resolve();

    };

    const onErr = () => {

      audio.removeEventListener('ended', onEnd);

      audio.removeEventListener('error', onErr);

      reject(new Error('audio play failed'));

    };

    audio.addEventListener('ended', onEnd);

    audio.addEventListener('error', onErr);

    audio.src = url;

    void audio.play().catch(reject);

  });

}



function speakViaSpeechSynthesis(text: string, lang: string, rate: number) {

  stopSpeakAudio();

  window.speechSynthesis.cancel();

  const utter = new SpeechSynthesisUtterance(text);

  utter.lang = lang;

  utter.rate = rate;

  const voices = window.speechSynthesis.getVoices();

  const prefix = lang.split('-')[0];

  const voice =

    voices.find((v) => v.lang === lang) ??

    voices.find((v) => v.lang.startsWith(prefix)) ??

    voices.find((v) => v.lang.includes(prefix.toUpperCase()));

  if (voice) utter.voice = voice;

  window.speechSynthesis.speak(utter);

}



/** 朗读文本；优先用 setSinkId 路由到所选扬声器 */

export async function speakWithDevices(

  text: string,

  lang: string,

  rate = 0.85,

  outputDeviceId?: string,

): Promise<void> {

  const sink = outputDeviceId ?? currentSinkId ?? getStoredOutputDeviceId();

  const useCustomSink = sink && sink !== DEFAULT_DEVICE && supportsSetSinkId();



  if (useCustomSink) {

    try {

      await speakViaAudioElement(text, lang, rate, sink);

      return;

    } catch {

      /* 网络 TTS 失败时回退 */

    }

  }

  speakViaSpeechSynthesis(text, lang, rate);

}



export function stopAllAudioOutput() {

  stopSpeakAudio();

  window.speechSynthesis.cancel();

}



export async function playOutputTestTone(outputDeviceId?: string): Promise<void> {

  const sink = outputDeviceId ?? currentSinkId ?? getStoredOutputDeviceId();

  const ctx = new AudioContext();

  try {

    if (sink && sink !== DEFAULT_DEVICE && 'setSinkId' in ctx) {

      await (ctx as AudioContext & { setSinkId: (id: string) => Promise<void> }).setSinkId(sink);

    }

    const osc = ctx.createOscillator();

    const gain = ctx.createGain();

    osc.frequency.value = 880;

    gain.gain.value = 0.12;

    osc.connect(gain);

    gain.connect(ctx.destination);

    osc.start();

    osc.stop(ctx.currentTime + 0.25);

    await new Promise((r) => setTimeout(r, 300));

  } finally {

    await ctx.close();

  }

}



export function openSystemSoundSettings() {

  if (window.electronAPI?.openSoundSettings) {

    window.electronAPI.openSoundSettings();

    return;

  }

  window.electronAPI?.openExternal?.('ms-settings:sound');

}

