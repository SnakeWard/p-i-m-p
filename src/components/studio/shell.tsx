import {
  AudioLines,
  Cpu,
  FileJson,
  KeyRound,
  LayoutList,
  Mic2,
  Package,
  PenLine,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { StudioPhase } from "@/pimp/types";
import { usePimp } from "@/pimp/store";
import { HandoffView } from "./handoff-view";
import { IntentView } from "./intent-view";
import { LyricsView } from "./lyrics-view";
import { ModuleView } from "./module-view";
import { PersonasView } from "./personas-view";
import { ProvidersView } from "./providers-view";
import { ReleaseView } from "./release-view";
import { SoundView } from "./sound-view";
import { SpecRail } from "./spec-rail";
import { SpecView } from "./spec-view";
import { TracksDrawer } from "./tracks-drawer";

const NAV: { id: StudioPhase; label: string; icon: typeof PenLine }[] = [
  { id: "intent", label: "Intent", icon: PenLine },
  { id: "spec", label: "Spec", icon: LayoutList },
  { id: "lyrics", label: "Lyrics", icon: Mic2 },
  { id: "sound", label: "Sound", icon: AudioLines },
  { id: "release", label: "Release", icon: Package },
  { id: "personas", label: "Personas", icon: Users },
  { id: "module", label: "Module Lab", icon: Cpu },
  { id: "providers", label: "Providers", icon: KeyRound },
  { id: "handoff", label: "Handoff", icon: FileJson },
];

export function StudioShell() {
  const [ready, setReady] = useState(false);
  const phase = usePimp((s) => s.phase);
  const setPhase = usePimp((s) => s.setPhase);

  useEffect(() => {
    const unsub = usePimp.persist.onFinishHydration(() => setReady(true));
    usePimp.persist.rehydrate();
    if (usePimp.persist.hasHydrated()) setReady(true);
    return unsub;
  }, []);

  if (!ready) {
    return (
      <div className="min-h-dvh bg-bg text-muted flex items-center justify-center">
        <p className="text-sm tracking-widest uppercase">P.I.M.P.</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bg text-fg">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 md:px-6 h-14 shrink-0">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-display text-lg tracking-tight">P.I.M.P.</span>
          <span className="hidden sm:inline text-xs uppercase tracking-[0.18em] text-subtle truncate">
            Identity · Tension · Release
          </span>
        </div>
        <p className="text-[11px] text-subtle hidden md:block">Studio loop live</p>
      </header>
      <div className="flex flex-1 min-h-0">
        <nav className="hidden md:flex w-52 shrink-0 flex-col border-r border-border bg-bg-elevated">
          <div className="flex-1 overflow-auto py-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const on = phase === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPhase(item.id)}
                  className={`w-full flex items-center gap-2.5 px-4 h-10 text-sm ${
                    on ? "text-fg bg-bg-subtle" : "text-muted hover:text-fg"
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
          <TracksDrawer />
        </nav>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="md:hidden overflow-x-auto border-b border-border flex">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setPhase(item.id)}
                className={`h-12 px-3 text-xs whitespace-nowrap ${
                  phase === item.id ? "text-fg border-b border-accent" : "text-muted"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-8">
            {phase === "intent" && <IntentView />}
            {phase === "spec" && <SpecView />}
            {phase === "lyrics" && <LyricsView />}
            {phase === "sound" && <SoundView />}
            {phase === "release" && <ReleaseView />}
            {phase === "personas" && <PersonasView />}
            {phase === "module" && <ModuleView />}
            {phase === "providers" && <ProvidersView />}
            {phase === "handoff" && <HandoffView />}
          </div>
        </div>
        <SpecRail />
      </div>
    </div>
  );
}
