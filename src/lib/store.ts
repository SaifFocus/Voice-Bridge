import { create } from "zustand";
import { persist } from "zustand/middleware";

export type SignLanguage = "ASL" | "BSL";

export interface TranscriptWord {
  id: string;
  word: string;
  confidence: number;
  ts: number;
}

export interface Sentence {
  id: string;
  text: string;
  words: TranscriptWord[];
  spoken: boolean;
}

export interface SessionRecord {
  id: string;
  startedAt: number;
  endedAt: number;
  language: SignLanguage;
  transcript: string;
}

interface Settings {
  language: SignLanguage;
  autoSpeak: boolean;
  voiceURI: string | null;
  rate: number;
  pitch: number;
  highContrast: boolean;
  fontSize: number; // px
}

interface AppState extends Settings {
  hasOnboarded: boolean;
  sessions: SessionRecord[];
  setLanguage: (l: SignLanguage) => void;
  setAutoSpeak: (v: boolean) => void;
  setVoice: (v: string | null) => void;
  setRate: (v: number) => void;
  setPitch: (v: number) => void;
  setHighContrast: (v: boolean) => void;
  setFontSize: (v: number) => void;
  completeOnboarding: () => void;
  addSession: (s: SessionRecord) => void;
  clearSessions: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasOnboarded: false,
      language: "ASL",
      autoSpeak: false,
      voiceURI: null,
      rate: 1,
      pitch: 1,
      highContrast: false,
      fontSize: 16,
      sessions: [],
      setLanguage: (language) => set({ language }),
      setAutoSpeak: (autoSpeak) => set({ autoSpeak }),
      setVoice: (voiceURI) => set({ voiceURI }),
      setRate: (rate) => set({ rate }),
      setPitch: (pitch) => set({ pitch }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setFontSize: (fontSize) => set({ fontSize }),
      completeOnboarding: () => set({ hasOnboarded: true }),
      addSession: (s) => set((st) => ({ sessions: [s, ...st.sessions].slice(0, 100) })),
      clearSessions: () => set({ sessions: [] }),
    }),
    { name: "signbridge-store" }
  )
);
