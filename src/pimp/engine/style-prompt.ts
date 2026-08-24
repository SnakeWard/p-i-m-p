import { getGenre } from "../knowledge/genres";
import type { SpecBlock } from "../types";

export function buildStylePrompt(spec: SpecBlock) {
  const spine = getGenre(spec.genreSpine);
  const color =
    spec.genreColor !== "none" ? getGenre(spec.genreColor) : null;
  const fusion = color
    ? `Primary spine ${spine.name} owns structure + rhythm (${spine.rhythm}). Secondary color ${color.name} owns texture/harmony/vocals (${color.instruments}; ${color.harmony}).`
    : `${spine.name} as sole identity. ${spine.rhythm}. ${spine.instruments}.`;

  const tempo =
    spec.performanceTarget === "club"
      ? "dance-tempo four-on-the-floor"
      : spec.performanceTarget === "trailer"
        ? "hit-based hybrid percussion, no groove grid"
        : spec.structureTemplate.includes("Ballad")
          ? "slow burn"
          : "mid-tempo streaming feel";

  const vocal = spec.vocalProtocol || spine.vocal;
  const flags = spec.toneFlags.length
    ? `Tone flags: ${spec.toneFlags.join(", ")}.`
    : "";

  const mix =
    "Artist Pitch Demo — Studio Fidelity Mix — Clear Lead Vocal. Forward vocal, controlled low-end, verse intimacy vs chorus width. Avoid glossy autotune.";

  const sections = spec.structureSections.length
    ? `Structure: ${spec.structureSections.join(" → ")}.`
    : "";

  const prompt = [
    `${tempo}. ${fusion}`,
    `Emotion path: ${spec.emotionPath}. Narrative arc: ${spec.narrativeArc}. Intent: ${spec.intent}.`,
    `Lead vocal: ${vocal}. ${flags}`,
    `Instrumentation behavior: ${spine.instruments}${color ? `; color accents: ${color.instruments}` : ""}.`,
    sections,
    spec.personaAnchors?.length
      ? `Bind these objects in verse: ${spec.personaAnchors.slice(0, 6).join(", ")}.`
      : "",
    spec.personaForbidden?.length
      ? `This persona never says: ${spec.personaForbidden.slice(0, 8).join("; ")}.`
      : "",
    mix,
  ]
    .filter(Boolean)
    .join(" ");

  return prompt.slice(0, 1000);
}
