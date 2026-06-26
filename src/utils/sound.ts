/** 轻量提示音：用 WebAudio 即时合成，无需音频文件。 */

type AudioContextCtor = typeof AudioContext;

function getCtor(): AudioContextCtor | null {
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** 成就解锁：一段上行小琶音，听感愉悦。 */
export function playUnlockSound() {
  try {
    const Ctx = getCtor();
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    // C5 - E5 - G5 - C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const start = now + i * 0.1;
      const end = start + 0.22;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(end + 0.02);
    });
    setTimeout(() => void ctx.close(), 900);
  } catch {
    /* ignore */
  }
}
