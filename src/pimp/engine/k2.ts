import type { LineReport, SpecBlock, TropeReport } from "../types";

const TIER0_MYTH = [
  /\bphoenix\b/i,
  /\bicarus\b/i,
  /\bjuggernaut\b/i,
  /\btitan\b/i,
  /\brise from the ashes\b/i,
];

const TIER1_PHRASES = [
  "rise above",
  "shattered dreams",
  "neon lights",
  "concrete jungle",
  "city of angels",
  "sin city",
  "broken dreams",
  "whispers in the dark",
  "echoes of the night",
  "fire burns inside",
  "can't go on without you",
  "we're all in this together",
  "tomorrow it gets better",
  "gonna rise",
  "break free",
  "make it through the night",
];

const GENERIC_SLOGANS = [
  /we will rise above the pain/i,
  /i can't go on without you/i,
  /the fire burns inside my soul/i,
  /lost inside the silence/i,
  /your shadow follows me/i,
];

const ABSTRACT = [
  "pain",
  "soul",
  "dreams",
  "destiny",
  "hope",
  "love",
  "heart",
  "fate",
  "eternity",
  "forever",
  "silence",
  "darkness",
  "light",
  "shadow",
  "echoes",
  "whispers",
  "grace",
  "glory",
];

const CONCRETE_HINTS = [
  "door",
  "alarm",
  "counter",
  "lease",
  "pharmacy",
  "jacket",
  "nightstand",
  "windshield",
  "shift",
  "key",
  "amp",
  "ring",
  "dog",
  "kitchen",
  "porch",
  "receipt",
  "bus",
  "parking",
  "paycheck",
  "voicemail",
  "ashtray",
  "boot",
  "meter",
  "locker",
  "badge",
  "third shift",
];

function tokenize(line: string) {
  return line
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function parseSections(lyrics: string) {
  const lines = lyrics.replace(/\r\n/g, "\n").split("\n");
  const sections: { name: string; lines: { raw: string; lyric: boolean }[] }[] =
    [];
  let current = { name: "Ungrouped", lines: [] as { raw: string; lyric: boolean }[] };
  sections.push(current);
  for (const raw of lines) {
    const trimmed = raw.trim();
    const tag = trimmed.match(/^\[([^\]]+)\]$/);
    if (tag) {
      current = { name: tag[1], lines: [] };
      sections.push(current);
      continue;
    }
    if (!trimmed) continue;
    const staging = /^\(.*\)$/.test(trimmed);
    current.lines.push({ raw: trimmed, lyric: !staging });
  }
  return sections.filter((s) => s.lines.length > 0);
}

function cdsFor(line: string): number {
  const lower = line.toLowerCase();
  if (GENERIC_SLOGANS.some((r) => r.test(line))) return 0;
  const tokens = tokenize(line);
  const abs = tokens.filter((t) => ABSTRACT.includes(t)).length;
  const conc = CONCRETE_HINTS.filter((c) => lower.includes(c)).length;
  if (conc >= 2 && abs <= 1) return 4;
  if (conc >= 1 && tokens.length > 5) return 3;
  if (conc >= 1) return 2;
  if (abs >= 2 || TIER1_PHRASES.some((p) => lower.includes(p))) return 1;
  if (tokens.length <= 5 && abs >= 1) return 1;
  return 2;
}

function detectClasses(line: string, section: string): string[] {
  const classes: string[] = [];
  const lower = line.toLowerCase();
  if (TIER0_MYTH.some((r) => r.test(line))) classes.push("FC-2");
  if (/and then i (realized|knew|understood)/i.test(line) && /bridge/i.test(section)) {
    classes.push("FC-3");
  }
  if (TIER1_PHRASES.some((p) => lower.includes(p))) classes.push("FC-5");
  if (/we're all in this together|all of us|everybody feels/i.test(line)) {
    classes.push("FC-6");
  }
  if (/tomorrow (it )?gets better|one day we'll/i.test(line)) classes.push("FC-7");
  if (/you're everything|nothing matters but/i.test(line)) classes.push("FC-8");
  if (/\bborrowed (light|grace|time|name|destiny)\b/i.test(line)) classes.push("ADD-1");
  const tokens = tokenize(line);
  const abs = tokens.filter((t) => ABSTRACT.includes(t)).length;
  const conc = CONCRETE_HINTS.filter((c) => lower.includes(c)).length;
  if (abs > conc && abs >= 2) classes.push("FC-1");
  const metaphorHits = [
    /like a (bird|river|fire|shadow)/i,
    /hope flies|dreams bleed|heart screams/i,
  ].filter((r) => r.test(line)).length;
  if (metaphorHits >= 1 && abs >= 2) classes.push("FC-4");
  return [...new Set(classes)];
}

function rewriteLine(line: string, spec: SpecBlock): string {
  const title = spec.title || "the unpaid invoice";
  const object = title.split(" ")[0] || "counter";
  return line
    .replace(/rise above( the pain)?/gi, `climb the ${object} stairs on third shift`)
    .replace(/shattered dreams/gi, "the lease unsigned on the counter")
    .replace(/whispers in the dark/gi, "your key still scraping the lock")
    .replace(/broken dreams/gi, "the voicemail I never deleted")
    .replace(/we're all in this together/gi, "the night crew still clocks the same door")
    .replace(/fire burns inside my soul/gi, "the kettle clicks off and I still wait")
    .replace(/i can't go on without you/gi, "I still set two alarms for a house of one")
    .replace(/lost inside the silence/gi, "the fridge hums louder than the hallway")
    .replace(/you're everything/gi, `you left the ${object} and took the reasons`)
    .replace(/and then i realized.+/gi, "I will leave the spare key on the meter");
}

function interchangeability(line: string) {
  return (
    GENERIC_SLOGANS.some((r) => r.test(line)) ||
    TIER1_PHRASES.some((p) => line.toLowerCase().includes(p))
  );
}

export function runK2(lyrics: string, spec: SpecBlock): TropeReport {
  if (spec.tropeCheck === "off") {
    return {
      mode: "off",
      lines: [],
      changes: [],
      sectionFailures: [],
      binding: [],
      passed: true,
    };
  }

  const sections = parseSections(lyrics);
  const reports: LineReport[] = [];
  const changes: string[] = [];
  const sectionFailures: string[] = [];
  const binding: string[] = [];
  const strict = spec.tropeCheck === "strict";

  const verseNouns: Record<string, Set<string>> = {};

  for (const section of sections) {
    const lyricLines = section.lines.filter((l) => l.lyric);
    let tier1Window = 0;
    for (let i = 0; i < lyricLines.length; i++) {
      const line = lyricLines[i].raw;
      const classes = detectClasses(line, section.name);
      let cds = cdsFor(line);
      if (classes.includes("FC-2") || classes.includes("FC-3")) cds = 0;

      let verdict: LineReport["verdict"] = "PASS";
      let note = "";
      let rewrite: string | undefined;

      if (classes.includes("FC-2") || classes.includes("FC-3") || cds === 0) {
        verdict = "BLOCK";
        note = "Tier 0 / portable slogan — replace with scene anchoring";
        rewrite = rewriteLine(line, spec);
      } else if (classes.length || cds <= 2) {
        if (interchangeability(line) || cds <= 1) {
          verdict = "REWRITE";
          note = `CDS ${cds}${classes.length ? ` · ${classes.join(", ")}` : ""}`;
          rewrite = rewriteLine(line, spec);
        } else {
          verdict = "CONDITIONAL";
          note = "Concrete detail is decorative until a later line binds it";
          binding.push(`${section.name} L${i + 1}: later lyric must bind this object`);
        }
      }

      if (strict && /chorus/i.test(section.name) && classes.includes("FC-5")) {
        verdict = "REWRITE";
        note = "STRICT: Tier 1 in chorus auto-rewrites";
        rewrite = rewriteLine(line, spec);
      }

      if (verdict === "REWRITE" || verdict === "BLOCK") {
        changes.push(
          `[${section.name}/L${i + 1}] ${classes[0] ?? "CDS" + cds} → T2: ${rewrite}`,
        );
      }

      if (classes.includes("FC-5") || classes.includes("FC-1")) tier1Window += 1;
      reports.push({
        section: section.name,
        index: i,
        line,
        cds,
        classes,
        verdict,
        note,
        rewrite,
      });

      if (/verse/i.test(section.name)) {
        verseNouns[section.name] ??= new Set();
        for (const c of CONCRETE_HINTS) {
          if (line.toLowerCase().includes(c)) verseNouns[section.name].add(c);
        }
      }
    }
    if (tier1Window >= 3) {
      sectionFailures.push(`${section.name}: 3+ Tier 1 tropes in window`);
    }
    if (/verse/i.test(section.name) && (verseNouns[section.name]?.size ?? 0) < 3) {
      sectionFailures.push(`${section.name}: fewer than 3 concrete anchors`);
    }
  }

  const v1 = verseNouns["Verse 1"];
  const v2 = verseNouns["Verse 2"];
  if (v1 && v2) {
    const novel = [...v2].filter((n) => !v1.has(n));
    if (novel.length < 2) {
      sectionFailures.push("Verse 2 must add ≥2 concrete nouns absent from Verse 1");
    }
  }

  const choruses = reports.filter((r) => /chorus/i.test(r.section));
  const firstC = choruses.filter((r) => r.section === "Chorus");
  const finalC = choruses.filter((r) => /final/i.test(r.section));
  if (
    firstC.length &&
    finalC.length &&
    firstC.map((r) => r.line).join("\n") === finalC.map((r) => r.line).join("\n")
  ) {
    sectionFailures.push("QG-4: Final chorus identical to first");
  }

  const passed =
    reports.every((r) => r.verdict === "PASS" || r.verdict === "CONDITIONAL") &&
    sectionFailures.length === 0;

  return {
    mode: spec.tropeCheck,
    lines: reports,
    changes,
    sectionFailures,
    binding,
    passed,
  };
}

export function applySilentRewrites(lyrics: string, report: TropeReport) {
  if (report.mode === "off") return lyrics;
  let out = lyrics;
  for (const line of report.lines) {
    if ((line.verdict === "REWRITE" || line.verdict === "BLOCK") && line.rewrite) {
      out = out.replace(line.line, line.rewrite);
    }
  }
  return out;
}

export function formatTropeLog(report: TropeReport) {
  if (report.mode === "off") return "TropeCheck off.";
  const rows =
    report.mode === "strict"
      ? report.lines
          .map(
            (l) =>
              `${l.section} L${l.index + 1} · CDS ${l.cds} · ${l.classes.join("/") || "—"} · ${l.verdict}${l.rewrite ? ` → ${l.rewrite}` : ""}`,
          )
          .join("\n")
      : report.changes.join("\n") || "No silent rewrites.";
  const fails = report.sectionFailures.length
    ? `\nSection gates:\n${report.sectionFailures.map((s) => `• ${s}`).join("\n")}`
    : "";
  return rows + fails;
}
