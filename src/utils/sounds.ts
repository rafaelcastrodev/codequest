export type SoundEffect = 'success' | 'error' | 'levelup' | 'badge';

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function playTone(freq: number, duration: number, gainVal: number, when: number, ctx: AudioContext): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, when);
  gain.gain.setValueAtTime(gainVal, when);
  gain.gain.exponentialRampToValueAtTime(0.001, when + duration);
  osc.start(when);
  osc.stop(when + duration);
}

const SOUNDS: Record<SoundEffect, (ctx: AudioContext) => void> = {
  success: (ctx) => {
    const now = ctx.currentTime;
    playTone(523.25, 0.12, 0.3, now, ctx);
    playTone(659.25, 0.12, 0.3, now + 0.1, ctx);
    playTone(783.99, 0.2, 0.3, now + 0.2, ctx);
  },
  error: (ctx) => {
    const now = ctx.currentTime;
    playTone(220, 0.1, 0.2, now, ctx);
    playTone(196, 0.15, 0.2, now + 0.12, ctx);
  },
  levelup: (ctx) => {
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      playTone(f, 0.15, 0.25, now + i * 0.1, ctx);
    });
  },
  badge: (ctx) => {
    const now = ctx.currentTime;
    playTone(880, 0.08, 0.2, now, ctx);
    playTone(1108.73, 0.08, 0.2, now + 0.08, ctx);
    playTone(1318.51, 0.15, 0.25, now + 0.16, ctx);
  },
};

export function playSound(effect: SoundEffect): void {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    SOUNDS[effect](ctx);
  } catch {
    // Web Audio not available — silent fail
  }
}
