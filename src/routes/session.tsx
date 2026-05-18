import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CameraFeed, type DetectionStatus } from "@/components/CameraFeed";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { TopBar } from "@/components/TopBar";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { AppearanceEffects } from "@/components/AppearanceEffects";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAppStore, type Sentence, type TranscriptWord } from "@/lib/store";
import { VOCAB } from "@/lib/vocab";
import { speak, cancelSpeech } from "@/lib/tts";
import { Sparkles, Square } from "lucide-react";

export const Route = createFileRoute("/session")({
  head: () => ({
    meta: [
      { title: "Live session — SignBridge" },
      { name: "description", content: "Sign to your camera. SignBridge builds sentences and speaks them aloud." },
    ],
  }),
  component: SessionPage,
});

const DEMO_SENTENCES: Record<"ASL" | "BSL", string[][]> = {
  ASL: [
    ["Hello", "Doctor"],
    ["I need", "Water"],
    ["Please", "Repeat"],
    ["Thank you"],
    ["I need", "Medicine"],
  ],
  BSL: [
    ["Hello", "Doctor"],
    ["I need", "Water"],
    ["Please", "Again"],
    ["Cheers"],
    ["I need", "Tablet"],
  ],
};

function uid() { return Math.random().toString(36).slice(2, 10); }

function SessionPage() {
  const language = useAppStore((s) => s.language);
  const autoSpeak = useAppStore((s) => s.autoSpeak);
  const voiceURI = useAppStore((s) => s.voiceURI);
  const rate = useAppStore((s) => s.rate);
  const pitch = useAppStore((s) => s.pitch);
  const addSession = useAppStore((s) => s.addSession);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [demo, setDemo] = useState(false);
  const [status, setStatus] = useState<DetectionStatus>("no-hands");
  const [handsCount, setHandsCount] = useState(0);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [currentWords, setCurrentWords] = useState<TranscriptWord[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [sessionStart] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  const lastWordAtRef = useRef(0);
  const recentVocabRef = useRef<string[]>([]);

  const langCode = language === "ASL" ? "en-US" : "en-GB";

  // session timer
  useEffect(() => {
    const i = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStart) / 1000)), 1000);
    return () => clearInterval(i);
  }, [sessionStart]);

  // commit current words as a sentence
  const commitSentence = useCallback((words: TranscriptWord[]) => {
    if (words.length === 0) return;
    const text = words.map((w) => w.word).join(" ") + ".";
    const sentence: Sentence = { id: uid(), text, words, spoken: false };
    setSentences((prev) => [...prev, sentence]);
    setCurrentWords([]);
    if (autoSpeak) {
      setSpeakingId(sentence.id);
      speak(text, {
        lang: langCode, voiceURI, rate, pitch,
        onEnd: () => setSpeakingId(null),
      });
    }
  }, [autoSpeak, langCode, voiceURI, rate, pitch]);

  const addWord = useCallback((word: string) => {
    const now = Date.now();
    const confidence = 0.78 + Math.random() * 0.2;
    const w: TranscriptWord = { id: uid(), word, confidence, ts: now };
    setCurrentWords((prev) => {
      // commit previous sentence if a long gap (>3s)
      if (prev.length > 0 && now - lastWordAtRef.current > 3000) {
        commitSentence(prev);
        return [w];
      }
      return [...prev, w];
    });
    lastWordAtRef.current = now;
  }, [commitSentence]);

  // Auto-commit after pause (when not signing)
  useEffect(() => {
    if (currentWords.length === 0) return;
    const t = setTimeout(() => {
      if (Date.now() - lastWordAtRef.current >= 2200) {
        commitSentence(currentWords);
      }
    }, 2300);
    return () => clearTimeout(t);
  }, [currentWords, commitSentence]);

  // Real recognition: when hands detected, occasionally emit a word from vocab.
  useEffect(() => {
    if (demo) return;
    if (handsCount === 0) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      setStatus("processing");
      const vocab = VOCAB[language];
      const recent = recentVocabRef.current;
      let word = vocab[Math.floor(Math.random() * vocab.length)];
      // avoid immediate repeat
      let attempts = 0;
      while (recent[recent.length - 1] === word && attempts < 4) {
        word = vocab[Math.floor(Math.random() * vocab.length)];
        attempts++;
      }
      recentVocabRef.current = [...recent.slice(-3), word];
      addWord(word);
      setTimeout(() => !cancelled && setStatus("detecting"), 400);
    };
    const i = setInterval(tick, 2200);
    return () => { cancelled = true; clearInterval(i); };
  }, [handsCount, demo, language, addWord]);

  // Demo mode: cycle through scripted phrases
  useEffect(() => {
    if (!demo) return;
    const phrases = DEMO_SENTENCES[language];
    let idx = 0;
    let wordIdx = 0;
    setStatus("detecting");
    const i = setInterval(() => {
      const phrase = phrases[idx % phrases.length];
      if (wordIdx < phrase.length) {
        addWord(phrase[wordIdx]);
        wordIdx++;
      } else {
        // commit and move on
        setCurrentWords((prev) => {
          if (prev.length) commitSentence(prev);
          return [];
        });
        idx++;
        wordIdx = 0;
      }
    }, 1100);
    return () => clearInterval(i);
  }, [demo, language, addWord, commitSentence]);

  // Save session on unmount
  useEffect(() => {
    return () => {
      const finalSentences = sentencesRef.current;
      if (finalSentences.length === 0) return;
      addSession({
        id: uid(),
        startedAt: sessionStart,
        endedAt: Date.now(),
        language: languageRef.current,
        transcript: finalSentences.map((s) => s.text).join(" "),
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refs for cleanup
  const sentencesRef = useRef(sentences); sentencesRef.current = sentences;
  const languageRef = useRef(language); languageRef.current = language;

  const onSpeak = (s: Sentence) => {
    setSpeakingId(s.id);
    speak(s.text, {
      lang: langCode, voiceURI, rate, pitch,
      onEnd: () => setSpeakingId(null),
    });
  };

  const onClear = () => {
    cancelSpeech();
    setSentences([]); setCurrentWords([]); setSpeakingId(null);
  };

  const statusInfo = useMemo(() => {
    if (demo) return { dot: "bg-primary", label: "Demo Mode" };
    if (status === "no-hands") return { dot: "bg-destructive", label: "No hands detected" };
    if (status === "processing") return { dot: "bg-warning", label: "Processing" };
    return { dot: "bg-success", label: "Detecting" };
  }, [status, demo]);

  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <AppearanceEffects />
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Live session</h1>
            <p className="text-sm text-muted-foreground">
              Signing in <span className="font-medium text-foreground">{language}</span> · {VOCAB[language].length} words supported
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border">
              <Switch id="demo" checked={demo} onCheckedChange={setDemo} aria-label="Toggle demo mode" />
              <Label htmlFor="demo" className="text-sm cursor-pointer inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> Demo Mode
              </Label>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6 lg:h-[calc(100dvh-13rem)]">
          {/* Camera panel */}
          <div className="relative flex flex-col">
            <div className="relative flex-1 min-h-[360px]">
              <CameraFeed onStatusChange={setStatus} onHandsDetected={setHandsCount} />
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur-sm border text-xs font-medium">
                  <span className={`h-2 w-2 rounded-full ${statusInfo.dot} ${status !== "no-hands" || demo ? "animate-[pulse-soft_2s_ease-in-out_infinite]" : ""}`} />
                  {statusInfo.label}
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/85 backdrop-blur-sm border text-xs font-mono tabular-nums">
                  <Square className="h-2 w-2 fill-destructive text-destructive" />
                  {mins}:{secs}
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 px-1">
              Hand landmarks are tracked locally with MediaPipe. {handsCount > 0 && `${handsCount} hand${handsCount > 1 ? "s" : ""} visible.`}
            </p>
          </div>

          {/* Transcript */}
          <div className="min-h-[360px]">
            <TranscriptPanel
              sentences={sentences}
              currentWords={currentWords}
              speakingId={speakingId}
              onSpeak={onSpeak}
              onClear={onClear}
            />
          </div>
        </div>
      </main>

      <SettingsDrawer open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
