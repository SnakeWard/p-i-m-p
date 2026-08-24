import type { SpecBlock, Persona } from "../types";
import { getGenre } from "../knowledge/genres";

function tempoFeel(spec: SpecBlock): string {
  const flags = spec.toneFlags;
  if (flags.includes("stripped") || spec.emotionPath.includes("whisper"))
    return "slow-burn, unhurried pulse";
  if (flags.includes("more aggressive")) return "driving mid-tempo, riff-locked";
  if (spec.genreSpine.includes("EDM")) return "four-on-the-floor, energy contour as composition";
  if (spec.genreSpine.includes("Ballad") || spec.genreSpine.includes("Folk"))
    return "rubato-tolerant, lyric sets the meter";
  if (spec.genreSpine.includes("Trap") || spec.genreSpine.includes("Hip-Hop"))
    return "bar-structured, hats busy, 808 as the floor";
  if (spec.emotionPath.includes("slow burn")) return "slow burn to explosive lift";
  return "mid-tempo, human pocket, lift in the chorus";
}

function mixIntent(spec: SpecBlock): string {
  if (spec.toneFlags.includes("cinematic"))
    return "Cinematic Mix — wide depth, controlled low-end, impact percussion in the lift, vocal still readable.";
  if (spec.toneFlags.includes("stripped") || spec.toneFlags.includes("intimate"))
    return "Close-Mic Vocal Detail — narrow verse field, short reverb, chorus opens the stereo without glossy sheen.";
  if (spec.genreSpine.includes("Metal"))
    return "Tight Low-End Mix — kick welded to bass, defined guitar separation, vocal cuts the wall.";
  if (spec.genreSpine.includes("Pop"))
    return "Studio Fidelity Mix — Forward Vocal Mix, punchy drums, chorus density without EDM trappings.";
  return "Studio Fidelity Mix — Forward Vocal Mix, Warm Bass Foundation, Controlled Dynamic Range.";
}

function instrumentBehavior(spec: SpecBlock): string {
  const spine = getGenre(spec.genreSpine);
  const color =
    spec.genreColor !== "none" ? getGenre(spec.genreColor) : null;
  const verse = spec.toneFlags.includes("intimate")
    ? "Intimate verses: restrained drums, space between hits."
    : "Verses leave air; do not pre-stack the chorus.";
  const chorus =
    spec.emotionPath.includes("explosive") || spec.toneFlags.includes("anthemic")
      ? "Chorus swells width and harmonic lift without going full metal."
      : "Chorus adds a layer, not a different song.";
  const colorLine = color
    ? `Color layer (${color.name}): ${color.instruments.split(";")[0]} as accent only — spine keeps rhythm.`
    : "";
  return `${spine.instruments}. ${verse} ${chorus} ${colorLine}`.trim();
}

function negativeClause(spec: SpecBlock): string {
  if (spec.genreSpine.includes("Indie")) return "Avoid pop tropes, avoid glossy autotune.";
  if (spec.genreSpine.includes("Metal")) return "Avoid pop pleas, avoid clean radio sheen.";
  if (spec.genreSpine.includes("Country")) return "Avoid bro-country regression, avoid abstract urban neon.";
  if (spec.genreSpine.includes("Pop")) return "Avoid EDM drums, avoid generic festival drops.";
  return "Avoid generic AI filler sheen.";
}

function provenStack(spec: SpecBlock): string {
  if (spec.performanceTarget === "trailer" || spec.performanceTarget === "sync")
    return "Sync Ready — Cinematic Mix — Broadcast Master";
  if (spec.toneFlags.includes("stripped"))
    return "Artist Pitch Demo — Close-Mic Vocal Detail — Stripped Version";
  return "Artist Pitch Demo — Studio Fidelity Mix — Clear Lead Vocal";
}

export function buildStylePrompt(spec: SpecBlock, persona?: Persona | null): string {
  const spine = getGenre(spec.genreSpine);
  const color =
    spec.genreColor !== "none" ? getGenre(spec.genreColor) : null;
  const identity =
    persona?.voice ||
    spec.vocalProtocol.split(".")[0] ||
    "distinct lead vocal, close-mic, emotionally specific";

  const fusion = color
    ? `Primary spine ${spine.name} owns structure and rhythm. Secondary color ${color.name} owns texture: ${color.fusion}.`
    : `${spine.name} as sole world — do not drift genre.`;

  const parts = [
    `${tempoFeel(spec)}. ${spine.name}${color ? ` with ${color.name} color` : ""}. ${fusion}`,
    instrumentBehavior(spec),
    `Vocal: ${identity}. Emotion path: ${spec.emotionPath}. Arc: ${spec.narrativeArc}.`,
    `Harmony tendency: ${spine.harmony}.`,
    mixIntent(spec),
    provenStack(spec),
    `Structure: ${spec.structureSections.join(" → ")}.`,
    negativeClause(spec),
  ];

  let out = parts.join(" ");
  if (out.length > 980) {
    out = out.slice(0, 977).replace(/\s+\S*$/, "") + ".";
  }
  return out;
}

export function recommendedKnobs(spec: SpecBlock): {
  weirdness: number;
  styleInfluence: number;
  note: string;
} {
  const strict = getGenre(spec.genreSpine).tropeTier === "STRICT";
  return {
    weirdness: strict ? 28 : spec.toneFlags.includes("ironic") ? 55 : 36,
    styleInfluence: spec.genreColor !== "none" ? 72 : 64,
    note: "Too generic → raise Weirdness, loosen Style Influence. Ignoring the brief → raise Style Influence, cut Weirdness.",
  };
}
