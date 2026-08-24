import type { LineReport, SpecBlock, TropeReport } from "../types";
import {
  ABSTRACT_NOUNS,
  AI_TELL_PAIRS,
  CONCRETE_HINTS,
  COUNTRY_ALLOW,
  HIPHOP_ALLOW,
  METAL_ALLOW,
  OVER_RHYME,
  TIER0_PHRASES,
  TIER1_PHRASES,
  TIER2_PHRASES,
} from "../knowledge/tropes";
import { getGenre } from "../knowledge/genres";
import { parseLyricsSections } from "./lyrics";
import { extractWorld } from "./world";

const WORD = /[A-Za-z']+/g;

function tokenize(line: string): string[] {
  return (line.toLowerCase().match(WORD) ?? []).filter((w) => w.length > 1);
}

function isDirective(line: string): boolean {
  const t = line.trim();
  return t.length === 0 || /^\(.*\)$/.test(t) || /^\[.*\]$/.test(t);
}

function hasConcrete(line: string): boolean {
  const l = line.toLowerCase();
  return CONCRETE_HINTS.some((c) => l.includes(c)) || /\b\d/.test(line) || /[A-Z][a-z]+/.test(line);
}

function abstractCount(line: string): number {
  const l = line.toLowerCase();
  return ABSTRACT_NOUNS.filter((a) => new RegExp(`\\b${a}\\b`).test(l)).length;
}

function allowedTrope(word: string, spine: string): boolean {
  if (spine.includes("Country") || spine.includes("Americana"))
    return COUNTRY_ALLOW.some((w) => word.includes(w));
  if (spine.includes("Metal")) return METAL_ALLOW.some((w) => word.includes(w));
  if (spine.includes("Hip-Hop") || spine.includes("Trap"))
    return HIPHOP_ALLOW.some((w) => word.includes(w));
  return false;
}

function cdsFor(line: string, classes: string[]): number {
  if (classes.includes("FC-2") || classes.includes("FC-3")) return 0;
  if (TIER1_PHRASES.some((p) => line.toLowerCase().includes(p))) return 1;
  const abs = abstractCount(line);
  const conc = hasConcrete(line);
  if (abs >= 2 && !conc) return 1;
  if (conc && abs === 0 && /[A-Z][a-z]+/.test(line) && /\d|pawn|lease|pharmacy|amp|ticket/.test(line.toLowerCase()))
    return 4;
  if (conc && abs <= 1) return 3;
  if (conc) return 2;
  if (abs) return 1;
  return 2;
}

function detectLine(line: string, section: string, spine: string): { classes: string[]; note: string } {
  const l = line.toLowerCase();
  const classes: string[] = [];
  const notes: string[] = [];

  for (const p of TIER0_PHRASES) {
    if (l.includes(p)) {
      classes.push("FC-2");
      notes.push(`Tier 0: “${p}”`);
    }
  }
  if (/and then i (realized|knew|understood)/.test(l) && /bridge/i.test(section)) {
    classes.push("FC-3");
    notes.push("Epiphany declaration in a bridge");
  }
  for (const p of TIER1_PHRASES) {
    if (l.includes(p) && !allowedTrope(p, spine)) {
      classes.push("FC-5");
      notes.push(`Tier 1 phrase: “${p}”`);
    }
  }
  for (const p of TIER2_PHRASES) {
    if (l.includes(p)) {
      classes.push("FC-8");
      notes.push(`Superlative erasure: “${p}”`);
    }
  }
  if (/\bborrowed (light|grace|time|name|hope)\b/.test(l) && !/from |of /.test(l)) {
    classes.push("ADD-1");
    notes.push("Borrowed Rule: no lender/debt/object");
  }
  if (/gonna (rise|make it|break free|be okay)/.test(l)) {
    classes.push("FC-5");
    notes.push("Generic action-resolution");
  }
  if (/can't (breathe|feel|stop|go on)/.test(l)) {
    classes.push("FC-1");
    notes.push("Emotional shorthand (can't + verb)");
  }
  if (abstractCount(line) >= 2 && !hasConcrete(line)) {
    classes.push("FC-1");
    notes.push("Abstraction without anchor");
  }
  for (const [a, b] of AI_TELL_PAIRS) {
    if (l.includes(a) && l.includes(b)) {
      classes.push("FC-4");
      notes.push(`AI-tell cluster: ${a}+${b}`);
    }
  }
  if (/\b(hope flies|dreams bleed|soul cries|heart screams)\b/.test(l)) {
    classes.push("FC-4");
    notes.push("Abstract noun + human verb");
  }
  return { classes: [...new Set(classes)], note: notes.join("; ") };
}

function rewriteLine(line: string, spec: SpecBlock): string {
  const w = extractWorld(spec.intent || spec.title, spec.genreSpine);
  const l = line.toLowerCase();
  if (l.includes("rise above") || l.includes("we will rise"))
    return `I climbed the ${w.place2} grade in ${w.vehicle} with the hazard lights on`;
  if (l.includes("shattered dreams") || l.includes("broken dreams"))
    return `${w.paper} still unsigned on the ${w.surface}`;
  if (l.includes("whispers in the dark") || l.includes("echoes of the night"))
    return `Your key still ticks in the lock of a door I don't open`;
  if (l.includes("gonna make it") || l.includes("break free"))
    return `I'm gonna sell ${w.paper} before the first of the month`;
  if (l.includes("you're everything") || l.includes("nothing matters"))
    return `I kept ${w.kept}; you kept ${w.cost}`;
  if (l.includes("can't breathe") || l.includes("can't feel"))
    return `I haven't left the house since ${w.time}`;
  if (abstractCount(line) && !hasConcrete(line))
    return `${cap(w.time)} and the ${w.object} still on the ${w.surface}`;
  return line;
}

function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

export function runTropeCheck(lyrics: string, spec: SpecBlock): { report: TropeReport; lyrics: string } {
  const mode = spec.tropeCheck;
  if (mode === "off") {
    return {
      lyrics,
      report: {
        mode,
        lines: [],
        changes: [],
        sectionFailures: [],
        binding: [],
        passed: true,
      },
    };
  }

  const sections = parseLyricsSections(lyrics);
  const reports: LineReport[] = [];
  const changes: string[] = [];
  const sectionFailures: string[] = [];
  const binding: string[] = [];
  const rewritten: string[] = [];
  const spine = spec.genreSpine;
  const genre = getGenre(spine);

  const v1Nouns = new Set<string>();
  const v2Nouns = new Set<string>();

  for (const sec of sections) {
    rewritten.push(`[${sec.section}]`);
    let t1InWindow = 0;
    let abs = 0;
    let conc = 0;
    sec.lines.forEach((line, index) => {
      if (isDirective(line)) {
        rewritten.push(line);
        return;
      }
      const { classes, note } = detectLine(line, sec.section, spine);
      const cds = cdsFor(line, classes);
      let verdict: LineReport["verdict"] = "PASS";
      let out = line;
      let usedNote = note;

      if (classes.includes("FC-2") || classes.includes("FC-3")) {
        verdict = "BLOCK";
      } else if (cds <= 1 || classes.length) {
        verdict = mode === "strict" || genre.tropeTier === "STRICT" ? "REWRITE" : "REWRITE";
      } else if (cds === 2) {
        verdict = "CONDITIONAL";
        binding.push(`${sec.section}/L${index + 1} needs a later load-bearing callback`);
      }

      if (verdict === "REWRITE" || verdict === "BLOCK") {
        const next = rewriteLine(line, spec);
        if (next !== line) {
          changes.push(`[${sec.section}/L${index + 1}] ${classes[0] ?? "CDS " + cds} → T2: ${next}`);
          out = next;
          verdict = "REWRITE";
        }
      }

      const words = tokenize(out);
      if (/verse 1/i.test(sec.section)) words.forEach((w) => v1Nouns.add(w));
      if (/verse 2/i.test(sec.section)) words.forEach((w) => v2Nouns.add(w));

      if (abstractCount(out) > 0) abs += abstractCount(out);
      if (hasConcrete(out)) conc += 1;
      if (classes.length) t1InWindow += 1;

      reports.push({
        section: sec.section,
        index,
        line: out,
        cds: cdsFor(out, classes),
        classes,
        verdict: cdsFor(out, classes) >= 3 && !classes.includes("FC-2") ? "PASS" : verdict,
        note: usedNote,
        rewrite: out !== line ? out : undefined,
      });
      rewritten.push(out);
    });

    if (t1InWindow >= 3) sectionFailures.push(`${sec.section}: 3+ Tier 1 tropes in window`);
    if (abs > conc && conc === 0) sectionFailures.push(`${sec.section}: abstract nouns outnumber concrete (FC-1)`);
    rewritten.push("");
  }

  const newInV2 = [...v2Nouns].filter((w) => !v1Nouns.has(w) && w.length > 3);
  if (v2Nouns.size && newInV2.length < 2) {
    sectionFailures.push("Verse 2 adds fewer than 2 new concrete nouns vs Verse 1");
  }

  const choruses = sections.filter((s) => /chorus|hook|drop/i.test(s.section));
  if (choruses.length >= 2) {
    const a = choruses[0].lines.filter((l) => !isDirective(l)).join("\n");
    const b = choruses[choruses.length - 1].lines.filter((l) => !isDirective(l)).join("\n");
    if (a && a === b) sectionFailures.push("Final chorus identical to first (QG-4)");
  }

  const passed =
    reports.every((r) => r.verdict === "PASS" || r.verdict === "CONDITIONAL") &&
    sectionFailures.length === 0;

  return {
    lyrics: rewritten.join("\n").trim() + "\n",
    report: {
      mode,
      lines: reports,
      changes,
      sectionFailures,
      binding,
      passed,
    },
  };
}

export function overRhymeFlag(lyrics: string): string[] {
  const flags: string[] = [];
  const lines = lyrics.split("\n").filter((l) => !isDirective(l));
  for (let i = 0; i < lines.length - 1; i++) {
    const a = lines[i].toLowerCase();
    const b = lines[i + 1].toLowerCase();
    for (const [x, y] of OVER_RHYME) {
      if (a.endsWith(x) && b.endsWith(y)) flags.push(`Over-rhyme ${x}/${y}`);
    }
  }
  return flags;
}
