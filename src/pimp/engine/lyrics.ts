import type { SpecBlock } from "../types";
import { extractWorld, type World } from "./world";

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function staging(spec: SpecBlock, kind: string): string {
  const e = spec.emotionPath.toLowerCase();
  if (kind === "verse1") {
    if (e.includes("whisper") || spec.toneFlags.includes("intimate"))
      return "(whispered verse; close-mic)";
    if (e.includes("cold") || spec.toneFlags.includes("darker"))
      return "(spoken-sung; dry, report-like)";
    return "(restrained; leave air)";
  }
  if (kind === "pre") return "(pull forward; do not belt yet)";
  if (kind === "chorus") {
    if (e.includes("explosive") || spec.toneFlags.includes("anthemic"))
      return "(lift; worn belt, tight harmony above)";
    return "(release; forward vocal, harmony in last line)";
  }
  if (kind === "verse2") return "(more grain; new facts only)";
  if (kind === "bridge") return "(drop the band; tense shift)";
  if (kind === "final") return "(consequence of the bridge; do not copy chorus 1)";
  if (kind === "vamp") return "(ad-lib lane; dissolve, don't summarize)";
  if (kind === "hook") return "(headline; leave space around the title)";
  return "(hold)";
}

function titleLine(spec: SpecBlock): string {
  return spec.title.replace(/\.$/, "");
}

function verse1(spec: SpecBlock, w: World): string[] {
  const tone = spec.tropeTone;
  if (tone === "Plainspoken" || spec.genreSpine.includes("Country")) {
    return [
      `${cap(w.time)} ended and I still ${w.habit}`,
      `${cap(w.person)} waved me down outside the ${w.place}`,
      `${cap(w.paper)} still unsigned on the ${w.surface}`,
      `I kept ${w.kept}; you kept ${w.cost}`,
    ];
  }
  if (tone === "Violent" || spec.genreSpine.includes("Metal")) {
    return [
      `I clocked out with ${w.time} still in my boots`,
      `${cap(w.person)} caught me on the ${w.place}`,
      `${cap(w.object3)} crushed in my fist on the ${w.surface}`,
      `I kept ${w.kept}. You can keep ${w.cost}`,
    ];
  }
  if (tone === "Tender") {
    return [
      `I still ${w.habit} like you might come up the stair`,
      `${cap(w.person)} left a bag by the ${w.place}`,
      `${cap(w.object)} hanging off the ${w.surface} like a question`,
      `I kept ${w.kept} fed. That's the whole report`,
    ];
  }
  return [
    `${cap(w.time)} on my clothes when I hit the ${w.place}`,
    `${cap(w.person)} flagged me down under the lot light`,
    `${cap(w.paper)} waiting on the ${w.surface} like a dare`,
    `I kept ${w.kept}; you kept ${w.cost}`,
  ];
}

function verse2(spec: SpecBlock, w: World): string[] {
  return [
    `Glovebox still holds a lighter and your ${w.object}`,
    `Mileage on ${w.vehicle} doesn't match the story you sold`,
    `I took the ${w.place2} road so I wouldn't pass the house`,
    `Left ${w.object2} where the heat could take it`,
  ];
}

function verse3(spec: SpecBlock, w: World): string[] {
  return [
    `First frost on the ${w.surface} and I still set a second mug`,
    `Unopened mail in your name under the ${w.object3}`,
    `I drove ${w.vehicle} past the ${w.place2} and did not stop`,
    `That's the closest I come to calling it even`,
  ];
}

function preChorus(spec: SpecBlock, w: World): string[] {
  return [
    `I counted the miles in the rearview glass`,
    `Every ${w.place} sign a smaller version of us`,
  ];
}

function chorus(spec: SpecBlock, w: World, variant: "a" | "final"): string[] {
  const title = titleLine(spec);
  const last =
    variant === "final"
      ? `I ${w.action} and I did not turn around`
      : `And left the heat behind me in ${w.destination}`;
  return [
    title,
    `${cap(w.object)} in the ashtray, dates I never learned`,
    `Drove ${w.vehicle} through the ${w.place2} with the windows down`,
    last,
  ];
}

function bridge(spec: SpecBlock, w: World): string[] {
  return [
    `I'm gonna sell ${w.paper} before the first of the month`,
    `I won't ${w.habit} like you're still on the lease`,
    `I'll leave ${w.object2} at the ${w.place} if that's what it costs`,
    `And I will not come back for ${w.cost}`,
  ];
}

function hook(spec: SpecBlock, w: World): string[] {
  return [titleLine(spec), `I kept ${w.kept} — you can keep ${w.cost}`];
}

function postChorus(spec: SpecBlock): string[] {
  const words = spec.title.split(/\s+/).slice(0, 3).join(" ");
  return [`(wordless tag on “${words}”)`, `(stack a second voice, no new lyric)`];
}

function drop(spec: SpecBlock, w: World): string[] {
  return [titleLine(spec), `(instrumental hit — ${w.object} motif)`];
}

function sectionBody(name: string, spec: SpecBlock, w: World, seenChorus: { n: number }): string[] {
  const n = name.toLowerCase();
  if (n.includes("verse 1")) return verse1(spec, w);
  if (n.includes("verse 2")) return verse2(spec, w);
  if (n.includes("verse 3")) return verse3(spec, w);
  if (n.includes("pre")) return preChorus(spec, w);
  if (n.includes("post")) return postChorus(spec);
  if (n === "hook" || n.includes("hook intro")) return hook(spec, w);
  if (n.includes("final chorus") || n.includes("chorus")) {
    seenChorus.n += 1;
    return chorus(spec, w, seenChorus.n >= 3 || n.includes("final") ? "final" : "a");
  }
  if (n.includes("bridge") || n.includes("c-section") || n.includes("middle"))
    return bridge(spec, w);
  if (n.includes("drop") || n.includes("climax")) return drop(spec, w);
  if (n.includes("vamp")) return [`(ad-lib on the title)`, `I kept ${w.kept}`];
  if (n.includes("breakdown")) return [`(strip to ${w.object} motif)`, `(half-time; spoken last line)`];
  if (n.includes("build")) return [`(risers under the title fragment)`, `(no lyric until impact)`];
  if (n.includes("outro") || n.includes("aftermath") || n.includes("tag") || n.includes("button"))
    return [`(title once, dry)`, `(hard stop — no fade)`];
  if (n.includes("intro") || n.includes("prologue") || n.includes("cold") || n.includes("instrumental") || n.includes("solo") || n.includes("break"))
    return [`(${name.toLowerCase()}: ${w.object} figure, no lyric)`];
  return [`(${name})`];
}

function stageFor(name: string, spec: SpecBlock): string | null {
  const n = name.toLowerCase();
  if (n.includes("verse 1")) return staging(spec, "verse1");
  if (n.includes("verse 2")) return staging(spec, "verse2");
  if (n.includes("pre")) return staging(spec, "pre");
  if (n.includes("final")) return staging(spec, "final");
  if (n.includes("chorus") || n === "hook" || n.includes("drop")) return staging(spec, "chorus");
  if (n.includes("bridge")) return staging(spec, "bridge");
  if (n.includes("vamp")) return staging(spec, "vamp");
  return null;
}

export function composeLyrics(spec: SpecBlock): string {
  const w = extractWorld(spec.intent || spec.title, spec.genreSpine);
  const sections =
    spec.structureSections.length > 0
      ? spec.structureSections
      : ["Verse 1", "Chorus", "Verse 2", "Chorus", "Bridge", "Final Chorus"];
  const seen = { n: 0 };
  const blocks: string[] = [];
  for (const name of sections) {
    const lines = [ `[${name}]` ];
    const st = stageFor(name, spec);
    if (st) lines.push(st);
    lines.push(...sectionBody(name, spec, w, seen));
    blocks.push(lines.join("\n"));
  }
  return blocks.join("\n\n");
}

export function shortFormCut(lyrics: string): string {
  const parts = lyrics.split(/\n(?=\[)/);
  const hook = parts.find((p) => /^\[(Chorus|Hook|Drop|Final Chorus)/m.test(p));
  const v1 = parts.find((p) => /^\[Verse 1/m.test(p));
  const chosen = [hook, v1, hook].filter(Boolean).slice(0, 2);
  return `SHORT-FORM HOOK CUT (≤40s)\nUse this contiguous excerpt:\n\n${chosen.join("\n\n")}`;
}

export function parseLyricsSections(lyrics: string): { section: string; lines: string[] }[] {
  const out: { section: string; lines: string[] }[] = [];
  let current = "Body";
  let buf: string[] = [];
  const flush = () => {
    if (buf.length || current !== "Body") out.push({ section: current, lines: buf });
    buf = [];
  };
  for (const raw of lyrics.split("\n")) {
    const tag = raw.match(/^\[([^\]]+)\]\s*$/);
    if (tag) {
      flush();
      current = tag[1];
      continue;
    }
    buf.push(raw);
  }
  flush();
  return out;
}
