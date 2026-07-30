import type { StopCSettings } from "@/store/settingsStore";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  // Browsers suspend AudioContext until a user gesture; the tray/global
  // key events that trigger our toasts aren't DOM gestures, so resume()
  // defensively on every play call — it's a no-op if already running.
  if (ctx.state === "suspended") {
    void ctx.resume();
  }
  return ctx;
}

function tone(
  audioCtx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine"
) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const now = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);
  osc.stop(now + duration + 0.02);
}

type SoundSettings = Pick<StopCSettings, "soundEnabled" | "soundPack" | "soundVolume">;

function packTones(audioCtx: AudioContext, settings: SoundSettings, v: number) {
  switch (settings.soundPack) {
    case "pop":
      tone(audioCtx, 740, 0, 0.12, v, "sine");
      tone(audioCtx, 1108, 0.04, 0.1, v * 0.7, "sine");
      break;
    case "click":
      tone(audioCtx, 1500, 0, 0.045, v, "square");
      break;
    case "bubble":
      tone(audioCtx, 520, 0, 0.09, v, "sine");
      tone(audioCtx, 780, 0.06, 0.12, v * 0.8, "sine");
      tone(audioCtx, 1040, 0.12, 0.14, v * 0.6, "sine");
      break;
    case "retro":
      tone(audioCtx, 523, 0, 0.07, v, "square");
      tone(audioCtx, 659, 0.07, 0.07, v, "square");
      tone(audioCtx, 784, 0.14, 0.1, v, "square");
      break;
    default:
      break;
  }
}

/** Plays the configured sound pack for a copy notification. No-op if sound is disabled. */
export function playNotificationSound(settings: SoundSettings) {
  if (!settings.soundEnabled) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  const v = Math.max(0, Math.min(1, settings.soundVolume)) * 0.35; // headroom so it's never jarring
  packTones(audioCtx, settings, v);
}

/** Same pack, but with an extra low "heads up" tone underneath for Funny Mode. */
export function playFunnySound(settings: SoundSettings) {
  if (!settings.soundEnabled) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  const v = Math.max(0, Math.min(1, settings.soundVolume)) * 0.35;
  tone(audioCtx, 392, 0, 0.1, v, "triangle");
  tone(audioCtx, 330, 0.09, 0.16, v * 0.85, "triangle");
  packTones(audioCtx, settings, v * 0.6);
}

/** A short, subtle blip for in-app system toasts (settings saved, etc). */
export function playSystemSound(settings: SoundSettings) {
  if (!settings.soundEnabled) return;
  const audioCtx = getContext();
  if (!audioCtx) return;
  const v = Math.max(0, Math.min(1, settings.soundVolume)) * 0.3;
  tone(audioCtx, 880, 0, 0.06, v, "sine");
}
