import type { PerformanceTarget, SpecBlock } from "../types";

/**
 * K3-R — render routing.
 *
 * This is an execution adapter on the existing Sound phase, not a new K module.
 * It derives a Venice model + duration from the locked spec; the user may
 * override within the song allowlist. It never writes lyrics.
 */

export type RenderTier = "draft" | "release";

export interface ModelCapability {
  id: string;
  label: string;
  role: string;
  supportsLyrics: boolean;
  supportsInstrumental: boolean;
  supportsLoop: boolean;
  /** false → omit duration_seconds entirely and take the model default. */
  supportsDuration: boolean;
  /**
   * Venice caps `prompt` per model and 400s past it. The K3 brief is built to
   * 1000 chars, so it must be fitted before queueing. 512 is the conservative
   * observed floor; `/models` widens it via `prompt_character_limit`.
   */
  promptCharacterLimit: number;
  minPromptLength?: number;
  /** Exact legal values. When present, a duration MUST snap to a member. */
  durationOptions?: number[];
  durationMin?: number;
  durationMax?: number;
}

/**
 * Song allowlist (v1). SFX / TTS / video models are deliberately absent —
 * an id outside this table is never queued, even if /models advertises it.
 */
export const SONG_MODELS: ModelCapability[] = [
  {
    id: "ace-step-15",
    label: "ACE-Step 1.5",
    role: "default draft",
    supportsLyrics: true,
    // Venice does not list force_instrumental for this model: omit the field.
    supportsInstrumental: false,
    supportsLoop: false,
    supportsDuration: true,
    promptCharacterLimit: 512,
    durationOptions: [60, 90, 120, 150, 180, 210],
  },
  {
    id: "elevenlabs-music",
    label: "ElevenLabs Music",
    role: "default release",
    supportsLyrics: true,
    supportsInstrumental: true,
    supportsLoop: false,
    supportsDuration: true,
    promptCharacterLimit: 512,
    durationMin: 3,
    durationMax: 600,
  },
  {
    id: "minimax-music-v2",
    label: "MiniMax Music 2.0",
    role: "cheap clip",
    supportsLyrics: true,
    supportsInstrumental: false,
    supportsLoop: false,
    // Range is not documented; take the model default unless /models says more.
    supportsDuration: false,
    promptCharacterLimit: 512,
  },
  {
    id: "minimax-music-v25",
    label: "MiniMax Music 2.5",
    role: "mid",
    supportsLyrics: true,
    supportsInstrumental: true,
    supportsLoop: false,
    supportsDuration: false,
    promptCharacterLimit: 512,
  },
  {
    id: "minimax-music-v26",
    label: "MiniMax Music 2.6",
    role: "mid",
    supportsLyrics: true,
    supportsInstrumental: true,
    supportsLoop: false,
    supportsDuration: false,
    promptCharacterLimit: 512,
  },
];

export function findModel(id: string): ModelCapability | null {
  return SONG_MODELS.find((m) => m.id === id) ?? null;
}

export function isAllowedModel(id: string): boolean {
  return SONG_MODELS.some((m) => m.id === id);
}

/** Shape of one entry from `GET /models?type=music`, all fields optional. */
export interface ModelMetadata {
  id?: string;
  duration_options?: number[];
  duration_min?: number;
  duration_max?: number;
  supports_loop?: boolean;
  supports_instrumental?: boolean;
  supports_lyrics?: boolean;
  prompt_character_limit?: number;
  min_prompt_length?: number;
}

/**
 * Runtime metadata may widen or correct the static table, but may never add a
 * model to the allowlist. Missing fields keep the static value.
 */
export function applyModelMetadata(
  cap: ModelCapability,
  meta: ModelMetadata | null | undefined,
): ModelCapability {
  if (!meta) return cap;
  const next: ModelCapability = { ...cap };
  if (Array.isArray(meta.duration_options) && meta.duration_options.length) {
    next.durationOptions = [...meta.duration_options].sort((a, b) => a - b);
    next.supportsDuration = true;
  }
  if (typeof meta.duration_min === "number") {
    next.durationMin = meta.duration_min;
    next.supportsDuration = true;
  }
  if (typeof meta.duration_max === "number") {
    next.durationMax = meta.duration_max;
    next.supportsDuration = true;
  }
  if (typeof meta.supports_loop === "boolean") next.supportsLoop = meta.supports_loop;
  if (typeof meta.supports_instrumental === "boolean") {
    next.supportsInstrumental = meta.supports_instrumental;
  }
  if (typeof meta.supports_lyrics === "boolean") next.supportsLyrics = meta.supports_lyrics;
  if (typeof meta.prompt_character_limit === "number" && meta.prompt_character_limit > 0) {
    next.promptCharacterLimit = meta.prompt_character_limit;
  }
  if (typeof meta.min_prompt_length === "number" && meta.min_prompt_length > 0) {
    next.minPromptLength = meta.min_prompt_length;
  }
  return next;
}

/**
 * Fit the K3 brief to a model's prompt cap without cutting mid-word.
 *
 * The brief is ordered Identity → Emotion → Genre → Production → Structure, so
 * the front carries the most signal and trimming from the tail is the least
 * destructive cut. Prefer a clause boundary; fall back to a word boundary.
 */
export function fitPrompt(text: string, max: number): { prompt: string; trimmed: boolean } {
  const clean = text.trim();
  if (clean.length <= max) return { prompt: clean, trimmed: false };

  const window = clean.slice(0, max);
  const minKeep = Math.floor(max * 0.6);
  const boundary = Math.max(
    window.lastIndexOf(". "),
    window.lastIndexOf("; "),
    window.lastIndexOf(", "),
  );
  let cut = boundary >= minKeep ? boundary : window.lastIndexOf(" ");
  if (cut < minKeep) cut = max;

  return { prompt: clean.slice(0, cut).replace(/[\s,;.\-—]+$/, "").trim(), trimmed: true };
}

export function targetDuration(target: PerformanceTarget): number {
  switch (target) {
    case "short-form":
    case "trailer":
      return 60;
    case "club":
    case "sync":
      return 120;
    case "radio":
    case "streaming":
    default:
      return 180;
  }
}

export function defaultModel(tier: RenderTier, _target: PerformanceTarget): string {
  if (tier === "release") return "elevenlabs-music";
  return "ace-step-15";
}

export function deriveInstrumental(spec: SpecBlock, userOverride?: boolean): boolean {
  if (typeof userOverride === "boolean") return userOverride;
  const v = spec.vocalProtocol.toLowerCase();
  if (/\binstrumental\b/.test(v) || v.includes("no vocal")) return true;
  return spec.performanceTarget === "trailer" && !/\bvocal/.test(v);
}

export function snapDuration(
  seconds: number,
  durationOptions?: number[],
  min?: number,
  max?: number,
): number {
  if (durationOptions?.length) {
    return durationOptions.reduce((best, n) =>
      Math.abs(n - seconds) < Math.abs(best - seconds) ? n : best,
    );
  }
  const lo = min ?? 1;
  const hi = max ?? seconds;
  return Math.min(hi, Math.max(lo, Math.round(seconds)));
}

/** Keep [Section] tags. Strip (staging notes) so models do not sing them. */
export function serializeLyrics(lyrics: string): string {
  return lyrics
    .replace(/\(([^)]*)\)/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface RenderPlanInput {
  spec: SpecBlock;
  stylePrompt: string;
  lyrics: string;
  cap: ModelCapability;
  /** User override; undefined means "derive from spec". */
  instrumental?: boolean;
  /** User override; undefined means "derive from performance target". */
  durationSeconds?: number;
}

export interface RenderPlan {
  model: string;
  /** Body for POST /audio/queue — unsupported keys are absent, never false. */
  body: {
    model: string;
    prompt: string;
    lyrics_prompt?: string;
    duration_seconds?: number;
    force_instrumental?: boolean;
    loop?: boolean;
  };
  /** Effective instrumental decision, for UI display. */
  instrumental: boolean;
  /** Always a number — /audio/quote wants one even when queue omits it. */
  quoteDurationSeconds: number;
  /** True when the K3 brief did not fit the model's prompt cap. */
  promptTrimmed: boolean;
  /** The cap applied, so the UI can show a real budget. */
  promptLimit: number;
  /** Length of the untrimmed brief, for the "N of M" readout. */
  promptSourceLength: number;
}

/**
 * Build the queue body. Optional fields Venice does not list for the model are
 * omitted entirely rather than sent as false, because unsupported keys 400.
 */
export function buildRenderPlan(input: RenderPlanInput): RenderPlan {
  const { spec, cap } = input;
  const wanted = input.durationSeconds ?? targetDuration(spec.performanceTarget);
  const snapped = snapDuration(wanted, cap.durationOptions, cap.durationMin, cap.durationMax);
  const instrumental = deriveInstrumental(spec, input.instrumental);

  const fitted = fitPrompt(input.stylePrompt, cap.promptCharacterLimit);
  const body: RenderPlan["body"] = {
    model: cap.id,
    prompt: fitted.prompt,
  };

  if (cap.supportsDuration) body.duration_seconds = snapped;

  if (!instrumental && cap.supportsLyrics) {
    const serialized = serializeLyrics(input.lyrics);
    if (serialized) body.lyrics_prompt = serialized;
  }

  if (instrumental && cap.supportsInstrumental) body.force_instrumental = true;

  if (spec.performanceTarget === "club" && cap.supportsLoop) body.loop = true;

  return {
    model: cap.id,
    body,
    instrumental,
    quoteDurationSeconds: cap.supportsDuration ? snapped : wanted,
    promptTrimmed: fitted.trimmed,
    promptLimit: cap.promptCharacterLimit,
    promptSourceLength: input.stylePrompt.trim().length,
  };
}

/** Pre-flight gate. Returns an error string, or null when safe to queue. */
export function gateRender(opts: {
  plan: RenderPlan;
  hasKey: boolean;
}): string | null {
  const { plan, hasKey } = opts;
  if (!hasKey) return "Add a Venice API key in Providers before rendering.";
  if (!isAllowedModel(plan.model)) return `Model ${plan.model} is not in the song allowlist.`;
  if (!plan.body.prompt) return "Style prompt is empty. Build the K3 brief first.";
  if (plan.body.prompt.length > plan.promptLimit) {
    return `Style prompt is ${plan.body.prompt.length} chars; ${plan.model} caps at ${plan.promptLimit}.`;
  }
  const capMin = findModel(plan.model)?.minPromptLength;
  if (capMin && plan.body.prompt.length < capMin) {
    return `Style prompt must be at least ${capMin} characters for ${plan.model}.`;
  }
  if (!plan.instrumental && !plan.body.lyrics_prompt) {
    return "No lyrics to sing. Write lyrics or switch to instrumental.";
  }
  const cap = findModel(plan.model);
  if (cap?.durationOptions && typeof plan.body.duration_seconds === "number") {
    if (!cap.durationOptions.includes(plan.body.duration_seconds)) {
      return `${cap.label} only accepts ${cap.durationOptions.join(", ")} seconds.`;
    }
  }
  return null;
}
