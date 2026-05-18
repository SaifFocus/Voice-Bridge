import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Sentence, TranscriptWord } from "@/lib/store";

interface Props {
  sentences: Sentence[];
  currentWords: TranscriptWord[];
  speakingId: string | null;
  onSpeak: (s: Sentence) => void;
  onClear: () => void;
}

export function TranscriptPanel({ sentences, currentWords, speakingId, onSpeak, onClear }: Props) {
  const hasAny = sentences.length > 0 || currentWords.length > 0;

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between px-5 py-3 border-b">
        <div>
          <h2 className="font-semibold text-foreground">Live transcript</h2>
          <p className="text-xs text-muted-foreground">Recognised signs become spoken words</p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClear} disabled={!hasAny}>Clear</Button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {!hasAny && (
          <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <div className="h-12 w-12 rounded-full bg-secondary grid place-items-center text-2xl">👋</div>
            <p className="text-sm font-medium">Waiting for signs…</p>
            <p className="text-xs">Start signing, or toggle Demo Mode to preview.</p>
          </div>
        )}

        {sentences.map((s) => (
          <div key={s.id} className="group rounded-xl bg-secondary/60 p-4 animate-[fade-in_0.4s_ease-out]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-foreground leading-relaxed flex-1">{s.text}</p>
              <Button
                size="sm"
                variant={speakingId === s.id ? "default" : "secondary"}
                onClick={() => onSpeak(s)}
                aria-label={`Speak sentence: ${s.text}`}
                className="shrink-0"
              >
                {speakingId === s.id ? (
                  <SpeakingPulse />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
                {speakingId === s.id ? "Speaking" : "Speak"}
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {s.words.map((w) => (
                <span key={w.id} className="text-[10px] text-muted-foreground bg-background/60 px-1.5 py-0.5 rounded">
                  {w.word} · {Math.round(w.confidence * 100)}%
                </span>
              ))}
            </div>
          </div>
        ))}

        {currentWords.length > 0 && (
          <div className="rounded-xl border-2 border-dashed border-primary/40 p-4">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1.5">Building…</p>
            <p className="text-foreground leading-relaxed">
              {currentWords.map((w) => (
                <span key={w.id} className="inline-block mr-1.5 animate-[fade-in_0.3s_ease-out]">
                  {w.word}
                </span>
              ))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SpeakingPulse() {
  return (
    <span className="inline-flex items-end gap-0.5 h-4">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-0.5 bg-current rounded-full origin-bottom animate-[waveform_1s_ease-in-out_infinite]"
          style={{ height: "100%", animationDelay: `${i * 0.12}s` }}
        />
      ))}
    </span>
  );
}
