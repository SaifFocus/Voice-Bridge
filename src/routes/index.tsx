import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppStore, type SignLanguage } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ArrowRight, Hand, Heart, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SignBridge — Your voice, your signs" },
      { name: "description", content: "Real-time sign language interpretation for meetings and healthcare. Sign to your camera, SignBridge speaks for you." },
      { property: "og:title", content: "SignBridge — Your voice, your signs" },
      { property: "og:description", content: "Real-time sign language interpretation for digital meetings and healthcare." },
    ],
  }),
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { language, setLanguage, completeOnboarding } = useAppStore();
  const [selected, setSelected] = useState<SignLanguage>(language);

  const start = () => {
    setLanguage(selected);
    completeOnboarding();
    navigate({ to: "/session" });
  };

  return (
    <main className="min-h-dvh bg-gradient-to-br from-secondary/50 via-background to-background">
      <div className="max-w-5xl mx-auto px-6 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
              <Heart className="h-3.5 w-3.5" /> Built for accessibility
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-primary-foreground font-bold text-lg shadow-lg">
                  SB
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
                  SignBridge
                </h1>
              </div>
              <p className="text-xl text-muted-foreground">Your voice, your signs.</p>
            </div>
            <p className="text-foreground/80 leading-relaxed max-w-md">
              Real-time sign language interpretation for digital meetings and healthcare
              appointments. Sign naturally to your camera — SignBridge listens, builds your
              sentences, and speaks them aloud.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <Feature icon={<Hand />} title="Hand tracking" />
              <Feature icon={<Stethoscope />} title="Medical vocab" />
              <Feature icon={<Heart />} title="Calm UI" />
            </div>
          </div>

          <div className="bg-card rounded-3xl shadow-xl border p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Choose your sign language</h2>
            <p className="text-sm text-muted-foreground mt-1">You can change this anytime in settings.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              {(["ASL", "BSL"] as const).map((lang) => {
                const active = selected === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => setSelected(lang)}
                    aria-pressed={active}
                    className={`text-left p-5 rounded-2xl border-2 transition-all ${
                      active
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-border hover:border-primary/40 hover:bg-secondary/40"
                    }`}
                  >
                    <div className="text-3xl">{lang === "ASL" ? "🇺🇸" : "🇬🇧"}</div>
                    <div className="mt-2 font-semibold">{lang}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {lang === "ASL" ? "American Sign Language" : "British Sign Language"}
                    </div>
                  </button>
                );
              })}
            </div>

            <Button onClick={start} size="lg" className="w-full mt-6 group">
              Start signing
              <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Button>

            <p className="text-[11px] text-muted-foreground text-center mt-4">
              SignBridge uses your camera for hand tracking only. Nothing is uploaded — everything runs on your device.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Feature({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="rounded-xl bg-card border p-3 flex flex-col items-start gap-2">
      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary grid place-items-center">{icon}</div>
      <div className="text-xs font-medium text-foreground">{title}</div>
    </div>
  );
}
