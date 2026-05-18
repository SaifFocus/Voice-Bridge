import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { SettingsDrawer } from "@/components/SettingsDrawer";
import { AppearanceEffects } from "@/components/AppearanceEffects";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { speak } from "@/lib/tts";
import { Volume2, Trash2, Clock } from "lucide-react";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "History — SignBridge" },
      { name: "description", content: "Past SignBridge sessions and transcripts, stored on your device." },
    ],
  }),
  component: HistoryPage,
});

function fmt(ts: number) {
  return new Date(ts).toLocaleString();
}
function duration(a: number, b: number) {
  const s = Math.max(1, Math.floor((b - a) / 1000));
  const m = Math.floor(s / 60); const r = s % 60;
  return `${m}m ${r}s`;
}

function HistoryPage() {
  const [open, setOpen] = useState(false);
  const sessions = useAppStore((s) => s.sessions);
  const clear = useAppStore((s) => s.clearSessions);
  const language = useAppStore((s) => s.language);

  return (
    <div className="min-h-dvh flex flex-col bg-background">
      <AppearanceEffects />
      <TopBar onOpenSettings={() => setOpen(true)} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Session history</h1>
            <p className="text-sm text-muted-foreground">Stored locally on your device.</p>
          </div>
          {sessions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear}>
              <Trash2 className="h-4 w-4" /> Clear all
            </Button>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <div className="h-14 w-14 mx-auto rounded-full bg-secondary grid place-items-center text-primary">
              <Clock className="h-6 w-6" />
            </div>
            <p className="mt-4 font-medium text-foreground">No sessions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start a session and your transcripts will appear here.</p>
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {sessions.map((s) => (
              <AccordionItem key={s.id} value={s.id} className="border rounded-xl bg-card px-4">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between gap-3 w-full pr-2">
                    <div className="text-left">
                      <div className="font-medium text-foreground">{fmt(s.startedAt)}</div>
                      <div className="text-xs text-muted-foreground">
                        {s.language} · {duration(s.startedAt, s.endedAt)}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[40%]">
                      {s.transcript.slice(0, 60)}{s.transcript.length > 60 ? "…" : ""}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-foreground leading-relaxed">{s.transcript}</p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-3"
                    onClick={() => speak(s.transcript, { lang: s.language === "ASL" ? "en-US" : "en-GB" })}
                  >
                    <Volume2 className="h-4 w-4" /> Replay
                  </Button>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <p className="text-xs text-muted-foreground mt-6">Current language: <span className="font-medium">{language}</span></p>
      </main>

      <SettingsDrawer open={open} onOpenChange={setOpen} />
    </div>
  );
}
