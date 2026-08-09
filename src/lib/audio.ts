// Central audio controller.
// Guarantees only one narration clip plays at a time (starting a new clip
// stops the previous one) and exposes which clip is playing plus its state,
// so the UI can render a live pause/resume/stop button and highlight the
// text that is currently being read out.

export type AudioState = "idle" | "playing" | "paused";

export interface AudioSnapshot {
  state: AudioState;
  /** Stable id of the clip that is currently loaded (e.g. a step id). */
  currentId: string | null;
}

const audios = new Set<HTMLAudioElement>();
let current: HTMLAudioElement | null = null;
let currentId: string | null = null;
const listeners = new Set<(s: AudioSnapshot) => void>();

function currentState(): AudioState {
  if (!current) return "idle";
  if (current.paused) return current.currentTime === 0 ? "idle" : "paused";
  return "playing";
}

function emit() {
  const snap: AudioSnapshot = { state: currentState(), currentId };
  listeners.forEach((l) => l(snap));
}

export function subscribeAudioState(fn: (s: AudioSnapshot) => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function registerAudio(a: HTMLAudioElement): () => void {
  audios.add(a);
  const onEnded = () => {
    if (current === a) {
      current = null;
      currentId = null;
      emit();
    }
  };
  a.addEventListener("ended", onEnded);
  return () => {
    audios.delete(a);
    a.removeEventListener("ended", onEnded);
    if (current === a) {
      current = null;
      currentId = null;
      emit();
    }
  };
}

/** Start a clip from the beginning, stopping any other clip first. */
export function playAudio(id: string, a: HTMLAudioElement): void {
  if (current && current !== a) {
    current.pause();
    current.currentTime = 0;
  }
  current = a;
  currentId = id;
  a.currentTime = 0;
  a.play().catch(() => {});
  emit();
}

export function pauseCurrentAudio(): void {
  if (current && !current.paused) {
    current.pause();
    emit();
  }
}

export function resumeCurrentAudio(): void {
  if (current && current.paused) {
    current.play().catch(() => {});
    emit();
  }
}

export function stopAllAudio(): void {
  audios.forEach((a) => {
    a.pause();
    a.currentTime = 0;
  });
  current = null;
  currentId = null;
  emit();
}