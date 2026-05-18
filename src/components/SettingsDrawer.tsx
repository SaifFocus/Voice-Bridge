import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore } from "@/lib/store";
import { useVoices, speak } from "@/lib/tts";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SettingsDrawer({ open, onOpenChange }: Props) {
  const s = useAppStore();
  const voices = useVoices();
  const langCode = s.language === "ASL" ? "en-US" : "en-GB";
  const filteredVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langCode.toLowerCase().slice(0, 2)));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6">
        <SheetHeader className="p-0 mb-6">
          <SheetTitle>Settings</SheetTitle>
          <SheetDescription>Customize SignBridge for your needs.</SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Sign language</h3>
            <div className="grid grid-cols-2 gap-2">
              {(["ASL", "BSL"] as const).map((lang) => (
                <button
                  key={lang}
                  onClick={() => s.setLanguage(lang)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    s.language === lang
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="text-2xl">{lang === "ASL" ? "🇺🇸" : "🇬🇧"}</div>
                  <div className="font-semibold text-sm mt-1">{lang}</div>
                  <div className="text-xs text-muted-foreground">
                    {lang === "ASL" ? "American" : "British"}
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Speech</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-speak" className="cursor-pointer">Auto-speak sentences</Label>
              <Switch id="auto-speak" checked={s.autoSpeak} onCheckedChange={s.setAutoSpeak} />
            </div>

            <div className="space-y-2">
              <Label>Voice</Label>
              <Select
                value={s.voiceURI ?? "default"}
                onValueChange={(v) => s.setVoice(v === "default" ? null : v)}
              >
                <SelectTrigger><SelectValue placeholder="System default" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">System default ({langCode})</SelectItem>
                  {filteredVoices.map((v) => (
                    <SelectItem key={v.voiceURI} value={v.voiceURI}>
                      {v.name} ({v.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm"><Label>Rate</Label><span className="text-muted-foreground">{s.rate.toFixed(1)}x</span></div>
              <Slider min={0.5} max={2} step={0.1} value={[s.rate]} onValueChange={([v]) => s.setRate(v)} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><Label>Pitch</Label><span className="text-muted-foreground">{s.pitch.toFixed(1)}</span></div>
              <Slider min={0.5} max={2} step={0.1} value={[s.pitch]} onValueChange={([v]) => s.setPitch(v)} />
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => speak("This is a preview of your selected voice.", {
                lang: langCode, voiceURI: s.voiceURI, rate: s.rate, pitch: s.pitch,
              })}
            >
              Preview voice
            </Button>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Accessibility</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="hc" className="cursor-pointer">High-contrast mode</Label>
              <Switch id="hc" checked={s.highContrast} onCheckedChange={s.setHighContrast} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><Label>Font size</Label><span className="text-muted-foreground">{s.fontSize}px</span></div>
              <Slider min={14} max={22} step={1} value={[s.fontSize]} onValueChange={([v]) => s.setFontSize(v)} />
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
