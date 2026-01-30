import { useCallback, useRef, useEffect } from "react";

type SoundType = "diceRoll" | "turnStart" | "timerWarning" | "win" | "lose" | "trade" | "buy" | "rent" | "chat" | "credit" | "debit";

const SOUND_FREQUENCIES: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; volume: number }[]> = {
  diceRoll: [
    { frequency: 200, duration: 50, type: "square", volume: 0.2 },
    { frequency: 300, duration: 50, type: "square", volume: 0.2 },
    { frequency: 250, duration: 50, type: "square", volume: 0.2 },
    { frequency: 350, duration: 50, type: "square", volume: 0.2 },
    { frequency: 280, duration: 100, type: "square", volume: 0.3 },
  ],
  turnStart: [
    { frequency: 440, duration: 100, type: "sine", volume: 0.3 },
    { frequency: 550, duration: 100, type: "sine", volume: 0.3 },
    { frequency: 660, duration: 150, type: "sine", volume: 0.4 },
  ],
  timerWarning: [
    { frequency: 800, duration: 150, type: "square", volume: 0.4 },
    { frequency: 600, duration: 150, type: "square", volume: 0.3 },
    { frequency: 800, duration: 150, type: "square", volume: 0.4 },
  ],
  win: [
    { frequency: 523, duration: 150, type: "sine", volume: 0.4 },
    { frequency: 659, duration: 150, type: "sine", volume: 0.4 },
    { frequency: 784, duration: 150, type: "sine", volume: 0.4 },
    { frequency: 1047, duration: 300, type: "sine", volume: 0.5 },
  ],
  lose: [
    { frequency: 400, duration: 200, type: "sine", volume: 0.3 },
    { frequency: 350, duration: 200, type: "sine", volume: 0.3 },
    { frequency: 300, duration: 200, type: "sine", volume: 0.3 },
    { frequency: 250, duration: 400, type: "sine", volume: 0.4 },
  ],
  trade: [
    { frequency: 600, duration: 100, type: "sine", volume: 0.3 },
    { frequency: 800, duration: 100, type: "sine", volume: 0.3 },
  ],
  buy: [
    { frequency: 500, duration: 80, type: "sine", volume: 0.3 },
    { frequency: 700, duration: 120, type: "sine", volume: 0.4 },
  ],
  rent: [
    { frequency: 300, duration: 100, type: "triangle", volume: 0.3 },
    { frequency: 250, duration: 150, type: "triangle", volume: 0.3 },
  ],
  chat: [
    { frequency: 800, duration: 50, type: "sine", volume: 0.15 },
    { frequency: 1000, duration: 50, type: "sine", volume: 0.15 },
  ],
  credit: [
    { frequency: 523, duration: 80, type: "sine", volume: 0.3 },
    { frequency: 659, duration: 80, type: "sine", volume: 0.3 },
    { frequency: 784, duration: 120, type: "sine", volume: 0.4 },
  ],
  debit: [
    { frequency: 392, duration: 100, type: "triangle", volume: 0.3 },
    { frequency: 330, duration: 100, type: "triangle", volume: 0.3 },
    { frequency: 262, duration: 150, type: "triangle", volume: 0.35 },
  ],
};

export function useSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  useEffect(() => {
    const stored = localStorage.getItem("soundEnabled");
    enabledRef.current = stored !== "false";
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (!enabledRef.current) return;

    try {
      const ctx = getAudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const notes = SOUND_FREQUENCIES[type];
      let startTime = ctx.currentTime;

      notes.forEach((note) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = note.type;
        oscillator.frequency.value = note.frequency;

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(note.volume, startTime + 0.01);
        gainNode.gain.linearRampToValueAtTime(0, startTime + note.duration / 1000);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration / 1000 + 0.01);

        startTime += note.duration / 1000;
      });
    } catch (e) {
      console.warn("Sound playback failed:", e);
    }
  }, [getAudioContext]);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    localStorage.setItem("soundEnabled", String(enabled));
  }, []);

  const isSoundEnabled = useCallback(() => enabledRef.current, []);

  return { playSound, setSoundEnabled, isSoundEnabled };
}

export type { SoundType };
