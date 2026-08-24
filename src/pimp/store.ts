import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nowIso, uid } from "@/lib/utils";
import { architectSpec, buildStylePrompt } from "./engine/architect";
import { scanConflicts } from "./engine/conflicts";
import {
  applySelfPlugRetention,
  assertModuleWriteAllowed,
  hasReviewedSample,
  makeRecord,
  parseIngest,
  SEED_PD,
} from "./engine/corpus";
import { applySilentRewrites, runK2 } from "./engine/k2";
import { buildRelease } from "./engine/k4";
import { scaffoldLyrics } from "./engine/scaffold-lyrics";
import type {
  CollectionId,
  ConflictAlert,
  LyricRecord,
  ModuleVersion,
  Persona,
  ProviderConfig,
  SpecBlock,
  StudioPhase,
  Track,
  TropeCheckMode,
} from "./types";
import { EMPTY_SPEC } from "./types";

export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    id: "grok",
    label: "Grok (xAI native)",
    key: "",
    baseUrl: "https://api.x.ai/v1",
    model: "grok-4.5",
  },
  {
    id: "openai",
    label: "OpenAI",
    key: "",
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4.1",
  },
  {
    id: "gemini",
    label: "Gemini",
    key: "",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-flash",
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    key: "",
    baseUrl: "https://api.deepseek.com",
    model: "deepseek-chat",
  },
];

interface PimpState {
  phase: StudioPhase;
  draft: SpecBlock;
  conflicts: ConflictAlert[];
  tracks: Track[];
  activeId: string | null;
  personas: Persona[];
  corpus: LyricRecord[];
  moduleVersions: ModuleVersion[];
  providers: ProviderConfig[];
  defaultGenerateProvider: string;
  defaultEvalProvider: string;
  selfPlugOptIn: boolean;
  generating: boolean;
  lastError: string | null;
  setPhase: (p: StudioPhase) => void;
  patchDraft: (p: Partial<SpecBlock>) => void;
  toggleMod: (mod: string) => void;
  toggleTone: (flag: string) => void;
  lockSpec: () => void;
  setLyrics: (lyrics: string) => void;
  setStyle: (style: string) => void;
  runQc: () => void;
  applyRewrites: () => void;
  buildReleasePackage: () => void;
  saveTrack: () => void;
  loadTrack: (id: string) => void;
  newTrack: () => void;
  loadExample: () => void;
  setGenerating: (v: boolean) => void;
  setLastError: (v: string | null) => void;
  applyGeneration: (lyrics: string, style?: string, providerUsed?: string) => void;
  upsertPersona: (p: Persona) => void;
  dropPersona: (id: string) => void;
  usePersona: (id: string) => void;
  ingestText: (text: string, collection: CollectionId, provenance: string) => void;
  overrideRecord: (id: string, note: string) => void;
  dropRecord: (id: string) => void;
  selfPlugActive: () => void;
  pruneSelfPlugs: () => void;
  setProviderKey: (id: string, key: string) => void;
  setDefaultProvider: (kind: "generate" | "eval", id: string) => void;
  setSelfPlugOptIn: (v: boolean) => void;
  proposeModule: (module: string, notes: string, diff: string) => void;
  acceptModule: (id: string, opts?: { forceUnreviewed?: boolean }) => void;
}

function activeTrack(tracks: Track[], id: string | null) {
  return tracks.find((t) => t.id === id) ?? null;
}

const BASE_SPEC: SpecBlock = {
  ...EMPTY_SPEC,
  genreSpine: "Pop (streaming-era)",
};

export const usePimp = create<PimpState>()(
  persist(
    (set, get) => ({
      phase: "intent",
      draft: { ...BASE_SPEC },
      conflicts: [],
      tracks: [],
      activeId: null,
      personas: [
        {
          id: "persona_vesper",
          name: "Vesper Hollow",
          voice:
            "female, late 20s, raspy but intimate, restrained then emotionally fragile; close-mic, worn, rarely belts until the last chorus",
          visual:
            "lantern dusk, dust, old wood, wide lonely frames, brimmed-hat shadow, no glamour",
          houseTemplate: "Heartland Rock / Country Rock",
          createdAt: "2026-07-01T00:00:00.000Z",
        },
        {
          id: "persona_ash",
          name: "Ash Calder",
          voice:
            "male, early 30s, close-mic, worn, vulnerable; tight 2nd male harmony above lead in chorus; never glossy autotune",
          visual:
            "smoke, scratched metal, stage haze, hard edge highlights, heavy negative space",
          houseTemplate: "Radio Rock / Alt Rock",
          createdAt: "2026-07-01T00:00:00.000Z",
        },
      ],
      corpus: SEED_PD.map((s) => makeRecord({ ...s, humanOverride: s.humanOverride ?? "" })),
      moduleVersions: [],
      providers: DEFAULT_PROVIDERS,
      defaultGenerateProvider: "grok",
      defaultEvalProvider: "grok",
      selfPlugOptIn: false,
      generating: false,
      lastError: null,
      setPhase: (phase) => set({ phase }),
      patchDraft: (p) => set({ draft: { ...get().draft, ...p } }),
      toggleMod: (mod) => {
        const mods = get().draft.structureMods;
        const next = mods.includes(mod) ? mods.filter((m) => m !== mod) : [...mods, mod];
        set({ draft: { ...get().draft, structureMods: next } });
      },
      toggleTone: (flag) => {
        const flags = get().draft.toneFlags;
        const next = flags.includes(flag)
          ? flags.filter((f) => f !== flag)
          : [...flags, flag];
        set({ draft: { ...get().draft, toneFlags: next } });
      },
      lockSpec: () => {
        const spec = architectSpec(get().draft);
        const conflicts = scanConflicts(spec);
        const style = buildStylePrompt(spec);
        const current = activeTrack(get().tracks, get().activeId);
        const track: Track = current
          ? { ...current, spec, stylePrompt: style, updatedAt: nowIso() }
          : {
              id: uid("trk"),
              createdAt: nowIso(),
              updatedAt: nowIso(),
              spec,
              stylePrompt: style,
              lyrics: "",
              tropeReport: null,
              release: null,
              selfPlugged: false,
              providerUsed: "none",
            };
        const tracks = current
          ? get().tracks.map((t) => (t.id === track.id ? track : t))
          : [track, ...get().tracks];
        set({ draft: spec, conflicts, tracks, activeId: track.id, phase: "spec" });
      },
      setLyrics: (lyrics) => {
        const id = get().activeId;
        if (!id) return;
        set({
          tracks: get().tracks.map((t) =>
            t.id === id ? { ...t, lyrics, updatedAt: nowIso() } : t,
          ),
        });
      },
      setStyle: (stylePrompt) => {
        const id = get().activeId;
        if (!id) return;
        set({
          tracks: get().tracks.map((t) =>
            t.id === id ? { ...t, stylePrompt, updatedAt: nowIso() } : t,
          ),
        });
      },
      runQc: () => {
        const t = activeTrack(get().tracks, get().activeId);
        if (!t?.lyrics) return;
        let report = runK2(t.lyrics, t.spec);
        let lyrics = t.lyrics;
        if (t.spec.tropeCheck === "standard") {
          lyrics = applySilentRewrites(lyrics, report);
          report = runK2(lyrics, t.spec);
        }
        set({
          tracks: get().tracks.map((x) =>
            x.id === t.id ? { ...x, lyrics, tropeReport: report, updatedAt: nowIso() } : x,
          ),
        });
      },
      applyRewrites: () => {
        const t = activeTrack(get().tracks, get().activeId);
        if (!t?.tropeReport) return;
        const lyrics = applySilentRewrites(t.lyrics, t.tropeReport);
        const report = runK2(lyrics, t.spec);
        set({
          tracks: get().tracks.map((x) =>
            x.id === t.id ? { ...x, lyrics, tropeReport: report, updatedAt: nowIso() } : x,
          ),
        });
      },
      buildReleasePackage: () => {
        const t = activeTrack(get().tracks, get().activeId);
        if (!t) return;
        const release = buildRelease(t.spec, t.lyrics);
        set({
          tracks: get().tracks.map((x) =>
            x.id === t.id ? { ...x, release, updatedAt: nowIso() } : x,
          ),
          phase: "release",
        });
      },
      saveTrack: () => {
        const t = activeTrack(get().tracks, get().activeId);
        if (!t) return;
        set({
          tracks: get().tracks.map((x) => (x.id === t.id ? { ...x, updatedAt: nowIso() } : x)),
        });
      },
      loadTrack: (id) => {
        const t = get().tracks.find((x) => x.id === id);
        if (!t) return;
        set({
          activeId: id,
          draft: t.spec,
          phase: "spec",
          conflicts: scanConflicts(t.spec),
        });
      },
      newTrack: () => {
        set({
          draft: { ...BASE_SPEC },
          conflicts: [],
          activeId: null,
          phase: "intent",
          lastError: null,
        });
      },
      loadExample: () => {
        const draft: SpecBlock = {
          ...BASE_SPEC,
          title: "Unsigned Lease",
          intent: "Leave without a speech — lock the door on a life already gone.",
          genreSpine: "Country / Heartland Rock",
          genreColor: "Indie / Alternative",
          narrativeArc: "Dominance→Surrender",
          emotionPath: "restrained verse → defiant chorus → quiet resolve",
          vocalProtocol: "male, late 30s, worn, close-mic, no belting until last line",
          performanceTarget: "streaming",
          tropeCheck: "standard" as TropeCheckMode,
          persona: "—",
        };
        const spec = architectSpec(draft);
        const lyrics = scaffoldLyrics(spec);
        const style = buildStylePrompt(spec);
        let report = runK2(lyrics, spec);
        const gated = applySilentRewrites(lyrics, report);
        report = runK2(gated, spec);
        const track: Track = {
          id: uid("trk"),
          createdAt: nowIso(),
          updatedAt: nowIso(),
          spec,
          stylePrompt: style,
          lyrics: gated,
          tropeReport: report,
          release: buildRelease(spec, gated),
          selfPlugged: false,
          providerUsed: "scaffold",
        };
        set({
          draft: spec,
          conflicts: scanConflicts(spec),
          tracks: [track, ...get().tracks],
          activeId: track.id,
          phase: "lyrics",
        });
      },
      setGenerating: (generating) => set({ generating }),
      setLastError: (lastError) => set({ lastError }),
      applyGeneration: (lyrics, style, providerUsed) => {
        const t = activeTrack(get().tracks, get().activeId);
        if (!t) return;
        let report = runK2(lyrics, t.spec);
        let gated = lyrics;
        if (t.spec.tropeCheck === "standard") {
          gated = applySilentRewrites(lyrics, report);
          report = runK2(gated, t.spec);
        }
        set({
          tracks: get().tracks.map((x) =>
            x.id === t.id
              ? {
                  ...x,
                  lyrics: gated,
                  stylePrompt: style || t.stylePrompt,
                  tropeReport: report,
                  providerUsed: providerUsed ?? t.providerUsed,
                  updatedAt: nowIso(),
                }
              : x,
          ),
          phase: "lyrics",
        });
        if (get().selfPlugOptIn) get().selfPlugActive();
      },
      upsertPersona: (p) => {
        const exists = get().personas.some((x) => x.id === p.id);
        set({
          personas: exists
            ? get().personas.map((x) => (x.id === p.id ? p : x))
            : [p, ...get().personas],
        });
      },
      dropPersona: (id) => set({ personas: get().personas.filter((p) => p.id !== id) }),
      usePersona: (id) => {
        const p = get().personas.find((x) => x.id === id);
        if (!p) return;
        set({
          draft: {
            ...get().draft,
            persona: p.name,
            vocalProtocol: p.voice,
            structureTemplate: p.houseTemplate || get().draft.structureTemplate,
          },
        });
      },
      ingestText: (text, collection, provenance) => {
        try {
          const incoming = parseIngest(text, collection, provenance);
          set({ corpus: [...incoming, ...get().corpus], lastError: null });
        } catch (e) {
          set({ lastError: e instanceof Error ? e.message : String(e) });
        }
      },
      overrideRecord: (id, note) =>
        set({
          corpus: get().corpus.map((r) => (r.id === id ? { ...r, humanOverride: note } : r)),
        }),
      dropRecord: (id) => set({ corpus: get().corpus.filter((r) => r.id !== id) }),
      selfPlugActive: () => {
        const t = activeTrack(get().tracks, get().activeId);
        if (!t?.lyrics) return;
        const rec = makeRecord({
          collection: "self_generated",
          title: t.spec.title || "self-plug",
          lyrics: t.lyrics,
          provenance: `self-plug ${t.id} ${nowIso()}`,
          license: "self",
          humanOverride: "",
          specSnapshot: t.spec,
        });
        const merged = applySelfPlugRetention([rec, ...get().corpus]);
        set({
          corpus: merged,
          tracks: get().tracks.map((x) => (x.id === t.id ? { ...x, selfPlugged: true } : x)),
        });
      },
      pruneSelfPlugs: () => {
        set({ corpus: applySelfPlugRetention(get().corpus) });
      },
      setProviderKey: (id, key) =>
        set({
          providers: get().providers.map((p) => (p.id === id ? { ...p, key } : p)),
        }),
      setDefaultProvider: (kind, id) =>
        set(
          kind === "generate"
            ? { defaultGenerateProvider: id }
            : { defaultEvalProvider: id },
        ),
      setSelfPlugOptIn: (selfPlugOptIn) => set({ selfPlugOptIn }),
      proposeModule: (module, notes, diff) => {
        const v: ModuleVersion = {
          id: uid("mod"),
          module,
          version: `0.${get().moduleVersions.length + 1}.0-proposed`,
          notes,
          diff,
          accepted: false,
          createdAt: nowIso(),
        };
        set({ moduleVersions: [v, ...get().moduleVersions] });
      },
      acceptModule: (id, opts) => {
        const gate = assertModuleWriteAllowed(get().corpus, opts?.forceUnreviewed);
        if (!gate.ok) {
          set({ lastError: gate.message ?? "module write blocked" });
          return;
        }
        if (gate.forced) {
          console.warn("warning: force-unreviewed module accept — no gold-label sample");
        }
        set({
          lastError: gate.forced
            ? "Accepted with --force-unreviewed (no gold-label sample)."
            : null,
          moduleVersions: get().moduleVersions.map((m) =>
            m.id === id
              ? {
                  ...m,
                  accepted: true,
                  version: m.version.replace("-proposed", ""),
                  notes: gate.forced
                    ? `${m.notes}\n[force-unreviewed]`.trim()
                    : m.notes,
                  diff: hasReviewedSample(get().corpus)
                    ? m.diff
                    : `${m.diff}\n\n[force-unreviewed]`.trim(),
                }
              : m,
          ),
        });
      },
    }),
    {
      name: "pimp-console-v1",
      skipHydration: true,
      partialize: (s) => ({
        draft: s.draft,
        tracks: s.tracks,
        activeId: s.activeId,
        personas: s.personas,
        corpus: s.corpus,
        moduleVersions: s.moduleVersions,
        providers: s.providers,
        defaultGenerateProvider: s.defaultGenerateProvider,
        defaultEvalProvider: s.defaultEvalProvider,
        selfPlugOptIn: s.selfPlugOptIn,
        phase: s.phase,
      }),
    },
  ),
);
