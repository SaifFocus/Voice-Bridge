import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function AppearanceEffects() {
  const highContrast = useAppStore((s) => s.highContrast);
  const fontSize = useAppStore((s) => s.fontSize);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty("--app-font-size", `${fontSize}px`);
  }, [fontSize]);

  return null;
}
