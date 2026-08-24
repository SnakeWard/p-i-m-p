import type { SpecBlock, ConflictAlert, PerformanceTarget, TropeTone } from "../types";
import { EMPTY_SPEC } from "../types";
import { GENRES, getGenre } from "../knowledge/genres";
import { selectTemplate, applyMods, getTemplate } from "../knowledge/structures";
import { inferArc, inferEmotion } from "../knowledge/arcs";
import { extractWorld } from "./world";
import { detectConflicts } from "./conflicts";

const SPINE_HINTS: [RegExp, string][] = [
  [/dark americana|gothic country|murder ballad|gallows/, "Dark Americana / Gothic Country"],
  [/country|heartland|nashville|honky/, "Country / Heartland Rock"],
  [/trap|hip-?hop|rap|808/, "Hip-Hop / Trap"],
  [/metal|hard rock|riff|scream/, "Metal / Hard Rock"],
  [/r&b|neo-?soul|quiet storm/, "R&B / Soul"],
  [/gospel|choir|hymn/, "Gospel"],
  [/edm|house|techno|dnb|dance floor/, "EDM / Dance"],
  [/synthwave|retrowave|outrun|80s synth/, "Synthwave / Retrowave"],
  [/cinematic|trailer|orchestral/, "Cinematic / Trailer"],
  [/folk|singer-songwriter|acoustic ballad/, "Singer-Songwriter / Folk"],
  [/indie|alternative|alt rock|post-punk/, "Indie / Alternative"],
  [/grunge|post-grunge/, "Indie / Alternative"],
  [/pop/, "Pop (streaming-era)"],
];

const COLOR_HINTS: [RegExp, string][] = [
  [/cinematic|strings|trailer|orchestra/, "Cinematic / Trailer"],
  [/synthwave|neon|retrowave/, "Synthwave / Retrowave"],
  [/gospel|choir/, "Gospel"],
  [/mariachi|trumpet/, "Country / Heartland Rock"],
  [/trap|808/, "Hip-Hop / Trap"],
  [/r&b|soul runs/, "R&B / Soul"],
  [/folk|banjo|fiddle/, "Singer-Songwriter / Folk"],
];

function inferSpine(intent: string, explicit?: string): string {
  if (explicit && GENRES.some((g) => g.name === explicit)) return explicit;
  const t = intent.toLowerCase();
  for (const [re, name] of SPINE_HINTS) if (re.test(t)) return name;
  return "Pop (streaming-era)";
}

function inferColor(intent: string, spine: string, explicit?: string): string {
  if (explicit && explicit !== "none" && explicit !== spine) return explicit;
  const t = intent.toLowerCase();
  for (const [re, name] of COLOR_HINTS) {
    if (re.test(t) && name !== spine) return name;
  }
  if (/scale|wide|epic|cinematic/.test(t) && spine !== "Cinematic / Trailer")
    return "Cinematic / Trailer";
  return "none";
}

function inferTitle(intent: string, spine: string): string {
  const q = intent.match(/[“"]([^”"]{3,48})[”"]/);
  if (q) return q[1];
  const world = extractWorld(intent, spine);
  if (/reno/i.test(intent) && /ring|pawn/i.test(intent))
    return "The Ring You Pawned in Reno";
  if (world.object && world.place && world.place.length < 18) {
    const obj = world.object.replace(/^\w/, (c) => c.toUpperCase());
    return `${obj} at ${world.place.replace(/^\w/, (c) => c.toUpperCase())}`;
  }
  if (world.object && world.object.length > 3) {
    return world.object.replace(/^\w/, (c) => c.toUpperCase());
  }
  return "Untitled Track";
}

function vocalFor(spine: string, intent: string, flags: string[]): string {
  const g = getGenre(spine);
  const gender = /female|woman|she\b/.test(intent.toLowerCase())
    ? "female lead"
    : /male|man|he\b/.test(intent.toLowerCase())
      ? "male lead"
      : "lead vocal";
  const age = /late 20|twenties/.test(intent.toLowerCase())
    ? "late 20s"
    : /teen/.test(intent.toLowerCase())
      ? "young"
      : "adult";
  const texture = flags.includes("intimate")
    ? "close-mic, breath detail, restrained"
    : flags.includes("more aggressive")
      ? "forward, worn, strain on the lift"
      : g.vocal.split(";")[0];
  return `${gender}, ${age}; ${texture}. ${g.vocal}`;
}

export interface ArchitectInput {
  intent: string;
  title?: string;
  persona?: string;
  genreSpine?: string;
  genreColor?: string;
  performanceTarget?: PerformanceTarget;
  tropeCheck?: SpecBlock["tropeCheck"];
  tropeTone?: TropeTone;
  toneFlags?: string[];
  structureMods?: string[];
  narrativeArc?: string;
  emotionPath?: string;
}

export function architectSpec(input: ArchitectInput): {
  spec: SpecBlock;
  conflicts: ConflictAlert[];
} {
  const flags = input.toneFlags ?? [];
  const spine = inferSpine(input.intent, input.genreSpine);
  const color = inferColor(input.intent, spine, input.genreColor);
  const genre = getGenre(spine);
  const target = input.performanceTarget ?? "streaming";
  const tmpl = selectTemplate({
    performanceTarget: target,
    genreTemplate: genre.defaultTemplate,
  });
  const mods = input.structureMods ?? [];
  if (target === "short-form" && !mods.includes("Short-Form Hook Cut")) {
    mods.push("Cold Open Hook");
  }
  const sections = applyMods(tmpl.sections, mods);
  const title =
    input.title?.trim() && input.title !== "Untitled Track"
      ? input.title.trim()
      : inferTitle(input.intent, spine);
  const spec: SpecBlock = {
    ...EMPTY_SPEC,
    title,
    persona: input.persona?.trim() || "—",
    genreSpine: spine,
    genreColor: color,
    narrativeArc: input.narrativeArc || inferArc(input.intent, spine),
    emotionPath: input.emotionPath || inferEmotion(input.intent, flags),
    structureTemplate: tmpl.name,
    structureSections: sections,
    structureMods: mods,
    vocalProtocol: vocalFor(spine, input.intent, flags),
    performanceTarget: target,
    tropeCheck: input.tropeCheck ?? "standard",
    tropeTone: input.tropeTone ?? "Poetic",
    intent: input.intent.trim(),
    toneFlags: flags,
  };
  const conflicts = detectConflicts(spec);
  if (conflicts.length) {
    for (const c of conflicts) {
      if (c.field === "structureTemplate" && c.fix) {
        spec.structureTemplate = c.fix;
        spec.structureSections = applyMods(getTemplate(c.fix).sections, spec.structureMods);
      }
    }
  }
  return { spec, conflicts };
}
