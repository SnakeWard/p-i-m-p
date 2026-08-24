import type { ReleasePackage, SpecBlock } from "../types";
import { getGenre } from "../knowledge/genres";
import {
  inferMood,
  inferThemes,
  MOOD_PALETTES,
  NEGATIVE_PROMPT,
  THEME_SYMBOLS,
} from "../knowledge/visuals";

function hookType(spec: SpecBlock): string {
  const themes = inferThemes(spec.intent, spec.title).join(" ");
  if (spec.genreSpine.includes("Metal") || /vengeance|war/.test(themes)) return "shock";
  if (spec.genreSpine.includes("Country") || spec.genreSpine.includes("Americana"))
    return "cinematic";
  if (spec.genreSpine.includes("EDM")) return "beat-drop";
  if (/grief|love|redemption/.test(themes)) return "emotional";
  return "curiosity";
}

function hookPlan(spec: SpecBlock, type: string, line: string): string {
  const title = spec.title || "Untitled";
  const sheets: Record<string, string> = {
    shock: `0.0–1.2s  ${line || title} — hard cut, immediate focal impact\n1.2–3.0s  Straight into conflict — kinetic text, impact transition`,
    emotional: `0.0–2.0s  Setup — slow zoom on one object from the verse\n2.0–5.0s  Payoff — “${line || title}” on the lift`,
    cinematic: `0.0–2.0s  Title atmospheric reveal using 1–2 symbols\n2.0–5.0s  Camera push: something is coming. Hold the last image.`,
    curiosity: `0.0–2.5s  A question built from the stakes — bold centered type\n2.5–5.0s  Reveal to title / chorus cue`,
    "lyric-first": `0.0–3.0s  The strongest single line over a still plate\nHold. No extra motion.`,
    "beat-drop": `0.0–2.0s  Pre-drop line, tight crop, restrained motion\n2.0–4.0s  Drop — smash cut synced to impact`,
  };
  return sheets[type] ?? sheets.curiosity;
}

function strongestLine(lyrics: string, title: string): string {
  const lines = lyrics
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("[") && !l.startsWith("(") && l.length > 12);
  const hit = lines.find((l) => l.includes(title.split(" ")[0] ?? "")) ?? lines[0];
  return hit || title;
}

function genreHashtag(name: string): string {
  return "#" + name.replace(/[^A-Za-z0-9]+/g, "");
}

export function buildRelease(spec: SpecBlock, lyrics: string, personaName?: string): ReleasePackage {
  const mood = inferMood(spec.emotionPath, spec.toneFlags);
  const palette = MOOD_PALETTES[mood] ?? "black, gray, white";
  const themes = inferThemes(spec.intent, spec.title);
  const symbols = themes
    .flatMap((t) => THEME_SYMBOLS[t] ?? [])
    .slice(0, 6);
  const spine = getGenre(spec.genreSpine);
  const color = spec.genreColor !== "none" ? getGenre(spec.genreColor) : null;
  const textures = spine.visuals;
  const line = strongestLine(lyrics, spec.title);
  const type = hookType(spec);
  const title = spec.title || "Untitled";
  const genres = [spec.genreSpine, spec.genreColor !== "none" ? spec.genreColor : ""]
    .filter(Boolean)
    .join(" / ");

  const coverPrompt = [
    "professional-grade cinematic album cover",
    `color palette of ${palette}`,
    `symbolic elements: ${symbols.join(", ") || "story-driven symbolism"}`,
    `textures: ${textures}`,
    color ? `${color.visuals}` : "",
    "moody dusk lighting, wide lonely frame, grounded realism",
    "square albumCover, center-weighted, crop-safe subject, 3000x3000, 1:1",
    "ultra-detailed, emotionally resonant, polished release-ready finish",
    "no lettering, no artist name, no title text",
  ]
    .filter(Boolean)
    .join(", ");

  const coverAlts: [string, string] = [
    `${coverPrompt}. Minimalist variant with stronger negative space, single object, vast field.`,
    `${coverPrompt}. Poster-like variant with more dramatic scale, vertical monumentality, headline-safe sky.`,
  ];

  const caption = `${line} — ${title} is out now. ${genres}. ${spec.emotionPath.replace("→", "to")}.`;
  const shortCaption = `${title} — out now.`;
  const hashtags = [
    "#NewMusic",
    "#OriginalSong",
    genreHashtag(spec.genreSpine.split("/")[0] ?? "Alt"),
    "#" + title.replace(/[^A-Za-z0-9]/g, ""),
    personaName && personaName !== "—" ? "#" + personaName.replace(/\s+/g, "") : "",
  ]
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 8);

  const cta = "Out now";
  const tiktok = `${title} // ${cta}  ${hashtags.join(" ")}`;

  return {
    coverPrompt,
    negativePrompt: NEGATIVE_PROMPT,
    coverAlts,
    hookType: type,
    hookPlan: hookPlan(spec, type, line),
    caption,
    shortCaption,
    hashtags,
    facebook: `${caption}\n\n${hashtags.join(" ")}`,
    instagram: `${caption}\n.\n.\n.\n${hashtags.join(" ")}`,
    tiktok,
  };
}

export function sunoPack(spec: SpecBlock, style: string, lyrics: string): string {
  return [
    `TITLE: ${spec.title}`,
    `PERSONA: ${spec.persona}`,
    `SPINE / COLOR: ${spec.genreSpine} / ${spec.genreColor}`,
    "",
    "— STYLE (paste in Style) —",
    style,
    "",
    "— LYRICS (paste in Lyrics) —",
    lyrics.trim(),
    "",
    "— NOTES —",
    `Custom Mode. ${spec.structureTemplate}.`,
    `Emotion: ${spec.emotionPath}. Arc: ${spec.narrativeArc}.`,
    `TropeCheck: ${spec.tropeCheck} / ${spec.tropeTone}.`,
  ].join("\n");
}
