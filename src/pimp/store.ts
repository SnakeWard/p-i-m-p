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
import { buildGoldRow, goldPointer } from "./engine/gold-core.mjs";
import type { GoldRow, PerformanceTarget, TropeTone } from "./types";
import { applySilentRewrites, runK2 } from "./engine/k2";
import { buildRelease } from "./engine/k4";
import { scaffoldLyrics } from "./engine/scaffold-lyrics";
import {
  validatePersona,
  type PersonaV1,
  type PersonaValidateResult,
} from "./persona/schema";
import { SEED_PERSONAS_V1 } from "./persona/seeds";
import { deleteRender } from "./audio/idb";
import type {
  CollectionId,
  ConflictAlert,
  LyricRecord,
  ModuleVersion,
  ProviderConfig,
  RenderStatus,
  SpecBlock,
  StudioPhase,
  Track,
  TrackRender,
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
  {
    id: "venice",
    label: "Venice (audio render)",
    key: "",
    baseUrl: "https://api.venice.ai/api/v1",
    model: "ace-step-15",
  },
];

/** Audio render only — never offered as a lyric generate/eval engine. */
export const AUDIO_PROVIDER_ID = "venice";

interface PimpState {
  phase: StudioPhase;
  draft: SpecBlock;
  conflicts: ConflictAlert[];
  tracks: Track[];
  activeId: string | null;
  personas: PersonaV1[];
  corpus: LyricRecord[];
  goldRows: GoldRow[];
  moduleVersions: ModuleVersion[];
  providers: ProviderConfig[];
  defaultGenerateProvider: string;
  defaultEvalProvider: string;
  selfPlugOptIn: boolean;
  generating: boolean;
  lastError: string | null;
  lastNotice: string | null;
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
  setLastNotice: (v: string | null) => void;
  applyGeneration: (lyrics: string, style?: string, providerUsed?: string) => void;
  importPersona: (raw: unknown) => PersonaValidateResult;
  dropPersona: (id: string) => void;
  usePersona: (id: string, opts?: { overwrite?: boolean }) => "ok" | "missing" | "needs-confirm";
  ingestText: (text: string, collection: CollectionId, provenance: string) => void;
  overrideRecord: (id: string, note: string) => void;
  addGold: (recordId: string, fields: Record<string, unknown>) => void;
  dropRecord: (id: string) => void;
  selfPlugActive: () => void;
  pruneSelfPlugs: () => void;
  setProviderKey: (id: string, key: string) => void;
  setDefaultProvider: (kind: "generate" | "eval", id: string) => void;
  setSelfPlugOptIn: (v: boolean) => void;
  proposeModule: (module: string, notes: string, diff: string) => void;
  acceptModule: (id: string, opts?: { forceUnreviewed?: boolean }) => void;
  setRender: (partial: Partial<TrackRender> & { status: RenderStatus }) => void;
  clearRender: () => void;
}

const EMPTY_RENDER: TrackRender = {
  queueId: "",
  model: "",
  mime: null,
  durationSec: 0,
  costUsd: null,
  status: "idle",
  error: null,
  avgMs: null,
  elapsedMs: null,
  createdAt: "",
};

function activeTrack(tracks: Track[], id: string | null) {
  return tracks.find((t) => t.id === id) ?? null;
}

const TONES: TropeTone[] = [
  "Poetic",
  "Plainspoken",
  "Violent",
  "Tender",
  "Ironic",
  "Character Voice",
];
const PERFS: PerformanceTarget[] = [
  "streaming",
  "radio",
  "short-form",
  "trailer",
  "club",
  "sync",
];

function bindPersonaToSpec(draft: SpecBlock, p: PersonaV1): SpecBlock {
  const tone = TONES.includes(p.defaults.trope_tone as TropeTone)
    ? (p.defaults.trope_tone as TropeTone)
    : "Character Voice";
  const perf = PERFS.includes(p.voice.performance_target as PerformanceTarget)
    ? (p.voice.performance_target as PerformanceTarget)
    : draft.performanceTarget;
  return {
    ...draft,
    persona: p.name,
    genreSpine: p.defaults.genre_spine,
    genreColor: p.defaults.genre_color,
    tropeCheck: p.defaults.trope_check,
    tropeTone: tone,
    vocalProtocol: p.voice.vocal_protocol,
    performanceTarget: perf,
    emotionPath: p.defaults.emotion_path,
    narrativeArc: p.defaults.narrative_arc,
    personaAnchors: [...p.anchors.objects, ...p.anchors.places, ...p.anchors.actions],
    personaForbidden: [...p.voice.forbidden],
  };
}

function specHasBindableWork(d: SpecBlock) {
  return Boolean(d.title.trim() || d.intent.trim() || (d.persona && d.persona !== "—"));
}

function personaForSpec(personas: PersonaV1[], spec: SpecBlock) {
  return personas.find((p) => p.name === spec.persona || spec.persona.includes(p.id)) ?? null;
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
      personas: SEED_PERSONAS_V1,
      corpus: SEED_PD.map((s) => makeRecord({ ...s, humanOverride: s.humanOverride ?? "" })),
      goldRows: [],
      moduleVersions: [],
      providers: DEFAULT_PROVIDERS,
      defaultGenerateProvider: "grok",
      defaultEvalProvider: "grok",
      selfPlugOptIn: false,
      generating: false,
      lastError: null,
      lastNotice: null,
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
        const conflicts = scanConflicts(spec, personaForSpec(get().personas, spec));
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
              render: null,
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
          conflicts: scanConflicts(t.spec, personaForSpec(get().personas, t.spec)),
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
          render: null,
        };
        set({
          draft: spec,
          conflicts: scanConflicts(spec, personaForSpec(get().personas, spec)),
          tracks: [track, ...get().tracks],
          activeId: track.id,
          phase: "lyrics",
        });
      },
      setGenerating: (generating) => set({ generating }),
      setLastError: (lastError) => set({ lastError }),
      setLastNotice: (lastNotice: string | null) => set({ lastNotice }),
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
      importPersona: (raw) => {
        const result = validatePersona(raw);
        if (!result.ok) {
          set({ lastError: result.errors.map((e) => `${e.field}: ${e.message}`).join(" · ") });
          return result;
        }
        const p = result.persona;
        const exists = get().personas.some((x) => x.id === p.id);
        set({
          personas: exists
            ? get().personas.map((x) => (x.id === p.id ? p : x))
            : [p, ...get().personas],
          lastError: null,
          lastNotice: `Loaded ${p.name} (${p.id})`,
        });
        return result;
      },
      dropPersona: (id) =>
        set({
          personas: get().personas.filter((p) => p.id !== id),
          lastNotice: `Dropped ${id}`,
        }),
      usePersona: (id, opts) => {
        const p = get().personas.find((x) => x.id === id);
        if (!p) return "missing";
        const draft = get().draft;
        if (specHasBindableWork(draft) && draft.persona !== p.name && !opts?.overwrite) {
          return "needs-confirm";
        }
        const next = bindPersonaToSpec(draft, p);
        set({
          draft: next,
          conflicts: scanConflicts(next, p),
          lastNotice: `Using ${p.name}`,
          lastError: null,
        });
        return "ok";
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
      addGold: (recordId, fields) => {
        const rec = get().corpus.find((r) => r.id === recordId);
        if (!rec) {
          set({ lastError: `no record ${recordId}` });
          return;
        }
        try {
          const row = buildGoldRow(rec, { ...fields, reviewer: "studio" }) as GoldRow;
          set({
            goldRows: [row, ...get().goldRows],
            corpus: get().corpus.map((r) =>
              r.id === recordId ? { ...r, humanOverride: goldPointer(row.gold_id) } : r,
            ),
            lastError: null,
          });
        } catch (e) {
          set({ lastError: e instanceof Error ? e.message : String(e) });
        }
      },
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
        const gate = assertModuleWriteAllowed(
          get().corpus,
          opts?.forceUnreviewed,
          get().goldRows,
        );
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
                  diff: hasReviewedSample(get().corpus, get().goldRows)
                    ? m.diff
                    : `${m.diff}\n\n[force-unreviewed]`.trim(),
                }
              : m,
          ),
        });
      },
      setRender: (partial) => {
        const t = activeTrack(get().tracks, get().activeId);
        if (!t) return;
        const base = t.render ?? { ...EMPTY_RENDER, createdAt: nowIso() };
        const render: TrackRender = { ...base, ...partial };
        set({
          // updatedAt is deliberately untouched: a poll tick is not user work.
          tracks: get().tracks.map((x) => (x.id === t.id ? { ...x, render } : x)),
        });
      },
      clearRender: () => {
        const t = activeTrack(get().tracks, get().activeId);
        if (!t) return;
        void deleteRender(t.id);
        set({ tracks: get().tracks.map((x) => (x.id === t.id ? { ...x, render: null } : x)) });
      },
    }),
    {
      name: "pimp-console-v1",
      skipHydration: true,
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as typeof current;
        const raw = p.personas;
        const v1 = Array.isArray(raw)
          ? (raw.filter(
              (x) =>
                x &&
                typeof x === "object" &&
                (x as { schema?: string }).schema === "pimp.persona.v1",
            ) as PersonaV1[])
          : [];
        // Providers added after a user's last visit must still show up, and
        // tracks saved before K3-R have no `render` key at all.
        const savedProviders = Array.isArray(p.providers) ? p.providers : [];
        const providers = DEFAULT_PROVIDERS.map(
          (d) => savedProviders.find((s) => s?.id === d.id) ?? d,
        ).concat(savedProviders.filter((s) => !DEFAULT_PROVIDERS.some((d) => d.id === s?.id)));
        const tracks = Array.isArray(p.tracks)
          ? p.tracks.map((t) => ({ ...t, render: t?.render ?? null }))
          : current.tracks;

        return {
          ...current,
          ...p,
          providers,
          tracks,
          personas: v1.length ? v1 : current.personas,
          draft: {
            ...current.draft,
            ...p.draft,
            personaAnchors: p.draft?.personaAnchors ?? current.draft.personaAnchors ?? [],
            personaForbidden: p.draft?.personaForbidden ?? current.draft.personaForbidden ?? [],
          },
        };
      },
      // INVARIANT: everything below goes to localStorage (~5MB/origin).
      // `tracks` may carry `Track.render` METADATA only — never audio bytes,
      // base64, or a blob URL. Audio lives in IndexedDB (see audio/idb.ts);
      // a blob URL is session-scoped and would deserialize as a dead link.
      partialize: (s) => ({
        draft: s.draft,
        tracks: s.tracks,
        activeId: s.activeId,
        personas: s.personas,
        corpus: s.corpus,
        goldRows: s.goldRows,
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
