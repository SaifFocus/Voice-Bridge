import { Link, useRouterState } from "@tanstack/react-router";
import { Settings, History, Home, Languages } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface Props {
  onOpenSettings: () => void;
}

export function TopBar({ onOpenSettings }: Props) {
  const language = useAppStore((s) => s.language);
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const navClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      active
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 h-16">
        <Link to="/session" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center text-primary-foreground font-bold shadow-md">
            SB
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-tight text-foreground">SignBridge</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Your voice, your signs</span>
          </div>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <Link to="/session" className={navClass(pathname === "/session")}>
            <Home className="h-4 w-4" /> Session
          </Link>
          <Link to="/history" className={navClass(pathname === "/history")}>
            <History className="h-4 w-4" /> History
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
            <Languages className="h-3.5 w-3.5" />
            {language}
          </div>
          <Button variant="ghost" size="icon" onClick={onOpenSettings} aria-label="Open settings">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
