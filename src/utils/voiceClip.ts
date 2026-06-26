/**
 * 轻量录音：录下用户声音并返回可回放的 Blob URL。
 * 用于 Kazu 学习法的「录自己 → 和母语原音 A/B 对比」环节（与 Azure 评测的 PCM 录音分开）。
 */

export interface ActiveClip {
  /** 停止录音并返回可回放的对象 URL */
  stop: () => Promise<string>;
  /** 取消录音并释放资源 */
  cancel: () => void;
}

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  for (const t of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(t)) return t;
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

export function clipSupported(): boolean {
  return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
}

export async function startVoiceClip(deviceId?: string): Promise<ActiveClip> {
  if (!clipSupported()) throw new Error('当前环境不支持录音（缺少 MediaRecorder）。');

  const constraints: MediaStreamConstraints = {
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const mimeType = pickMimeType();
  const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  const release = () => stream.getTracks().forEach((t) => t.stop());

  recorder.start();

  return {
    cancel: () => {
      try {
        if (recorder.state !== 'inactive') recorder.stop();
      } catch {
        /* ignore */
      }
      release();
    },
    stop: () =>
      new Promise<string>((resolve, reject) => {
        recorder.onstop = () => {
          release();
          try {
            const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
            resolve(URL.createObjectURL(blob));
          } catch (e) {
            reject(e);
          }
        };
        try {
          if (recorder.state !== 'inactive') recorder.stop();
          else reject(new Error('录音已结束'));
        } catch (e) {
          release();
          reject(e);
        }
      }),
  };
}
