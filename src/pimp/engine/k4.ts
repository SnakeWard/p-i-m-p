import { getGenre } from "../knowledge/genres";
import type { ReleasePackage, SpecBlock } from "../types";

const PALETTES: Record<string, string> = {
  wrathful: "crimson, black, ember orange",
  mournful: "slate blue, ash gray, cold white",
  hopeful: "gold, ivory, sky blue",
  haunted: "deep teal, charcoal, violet haze",
  triumphant: "gold, red, obsidian",
  intimate: "warm amber, dusty rose, midnight blue",
  apocalyptic: "burnt orange, ash black, sickly yellow",
  redemptive: "white, gold, indigo",
  yearning: "faded rose, dusk violet, pale gold",
  defiant: "steel gray, blood red, off-white",
  nostalgic: "sepia, cream, washed teal",
  serene: "seafoam, bone white, soft slate",
};

function moodFrom(path: string) {
  const p = path.toLowerCase();
  if (p.includes("grief") || p.includes("mourn")) return "mournful";
  if (p.includes("haunt")) return "haunted";
  if (p.includes("defiant") || p.includes("anger")) return "defiant";
  if (p.includes("hope") || p.includes("lift")) return "hopeful";
  if (p.includes("yearn")) return "yearning";
  if (p.includes("triumph")) return "triumphant";
  if (p.includes("intimate") || p.includes("tender")) return "intimate";
  if (p.includes("redempt")) return "redemptive";
  return "haunted";
}

function hookType(spec: SpecBlock) {
  const g = spec.genreSpine.toLowerCase();
  const e = spec.emotionPath.toLowerCase();
  if (g.includes("metal") || e.includes("venge")) return "shock";
  if (g.includes("country") || g.includes("americana")) return "cinematic";
  if (g.includes("edm")) return "beat-drop";
  if (e.includes("grief") || e.includes("love") || e.includes("redempt")) {
    return "emotional";
  }
  return "curiosity";
}

export function buildRelease(spec: SpecBlock, lyrics: string): ReleasePackage {
  const mood = moodFrom(spec.emotionPath);
  const palette = PALETTES[mood] ?? "black, gray, white";
  const genre = getGenre(spec.genreSpine);
  const hook = hookType(spec);
  const strongest =
    lyrics
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l && !l.startsWith("[") && !l.startsWith("(")) ?? spec.title;

  const coverPrompt = [
    "professional-grade cinematic album cover",
    `${spec.genreSpine}${spec.genreColor !== "none" ? ` with ${spec.genreColor} color` : ""}`,
    `color palette of ${palette}`,
    "symbolic elements: single subject, empty chair or unplowed road, one lit window",
    `textures: ${genre.visuals}`,
    "cinematic dramatic lighting, balanced story-driven framing",
    "albumCover, square, center-weighted, crop-safe subject",
    "3000x3000, 1:1",
    "ultra-detailed, emotionally resonant, polished release-ready finish",
    "no lettering, no typography",
  ].join(", ");

  const negative =
    "extra fingers, extra limbs, mangled hands, blurry face, generic neon city, floating random objects, text artifacts, watermark, signature, logo clutter, plastic skin, unreadable typography, oversaturated AI glow, deformed anatomy";

  const beat =
    hook === "shock"
      ? "0.0–1.2: TITLE hard cut → 1.2–3.0: kinetic text of the conflict line, no warm-up"
      : hook === "emotional"
        ? `0.0–2.0: setup — slow zoom on the object → 2.0–5.0: payoff line “${strongest}”`
        : hook === "cinematic"
          ? "0.0–2.0: title over lantern dusk / empty road → 2.0–5.0: camera push, something is coming"
          : hook === "beat-drop"
            ? "0.0–2.0: pre-drop crop, restrained → 2.0–4.0: smash cut on drop"
            : `0.0–2.5: a question built from the stakes → 2.5–5.0: reveal title “${spec.title}”`;

  const caption = `${spec.title} is out. ${spec.genreSpine.replace(/\s+/g, " ")}. ${spec.emotionPath}.`;
  const shortCaption = `${spec.title} — out now.`;
  const tags = [
    "#NewMusic",
    "#OriginalSong",
    `#${spec.genreSpine.split(" ")[0].replace(/[^A-Za-z]/g, "")}`,
    `#${spec.title.replace(/[^A-Za-z0-9]/g, "")}`,
  ].slice(0, 8);

  return {
    coverPrompt,
    negativePrompt: negative,
    coverAlts: [
      coverPrompt + ", minimalist variant with stronger negative space",
      coverPrompt + ", poster-like variant with more dramatic scale, vertical",
    ],
    hookType: hook,
    hookPlan: `TikTok / Reels / Shorts · 9:16 · 5–15s · caption-safe lower third · ${hook}\n${beat}\nCTA: Out now`,
    caption,
    shortCaption,
    hashtags: tags,
    facebook: `${caption}\n\n${tags.join(" ")}`,
    instagram: `${caption}\n.\n.\n${tags.join(" ")}`,
    tiktok: `${spec.title} // Out now\n${tags.join(" ")}`,
  };
}
