import { useEffect, useState } from "react";

export function useVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);
  return voices;
}

export interface SpeakOptions {
  lang?: string;
  voiceURI?: string | null;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts.lang ?? "en-US";
  u.rate = opts.rate ?? 1;
  u.pitch = opts.pitch ?? 1;
  if (opts.voiceURI) {
    const v = window.speechSynthesis.getVoices().find((v) => v.voiceURI === opts.voiceURI);
    if (v) u.voice = v;
  }
  if (opts.onStart) u.onstart = opts.onStart;
  if (opts.onEnd) {
    u.onend = opts.onEnd;
    u.onerror = opts.onEnd;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function cancelSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
