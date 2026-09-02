// @ts-nocheck
/**
 * Canonical K2 scorer — Node + studio share this file.
 * Do not add a second phrase list or CDS path.
 */
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

function tokenize(line) {
  return line
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function parseSections(lyrics) {
  const lines = lyrics.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  let current = { name: "Ungrouped", lines: [] };
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

/** Mid-line Proper Nouns (skip line-initial cap). CDS-only — not a section-gate hint. */
function midLineProperNouns(line) {
  const words = line.trim().split(/\s+/);
  return words.slice(1).filter((w) => /^[A-Z][a-z]{2,}/.test(w.replace(/[^A-Za-z]/g, ""))).length;
}

function cdsFor(line) {
  const lower = line.toLowerCase();
  if (GENERIC_SLOGANS.some((r) => r.test(line))) return 0;
  const tokens = tokenize(line);
  const abs = tokens.filter((t) => ABSTRACT.includes(t)).length;
  const hints = CONCRETE_HINTS.filter((c) => lower.includes(c)).length;
  const conc = hints + (midLineProperNouns(line) > 0 ? 1 : 0);
  if (conc >= 2 && abs <= 1) return 4;
  if (conc >= 1 && tokens.length >= 5) return 3;
  if (conc >= 1) return 2;
  if (abs >= 2 || TIER1_PHRASES.some((p) => lower.includes(p))) return 1;
  if (tokens.length <= 5 && abs >= 1) return 1;
  return 2;
}

function detectClasses(line, section) {
  const classes = [];
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

/*
 * P3 — Rewrite ladder.
 *
 * The old implementation substituted a fixed phrasebook, so every song that
 * tripped "rise above" received the same third-shift stairs. An anti-trope
 * engine that injects its own house clichés homogenises a catalogue faster
 * than the tropes it removes.
 *
 * Now a T2 rewrite is built from THIS song's anchors — persona anchors first,
 * then concrete nouns the lyric already established, then the title. With no
 * anchor to build on, K2 refuses to invent: it emits a directive for the
 * writer instead of a line, and the caller downgrades the verdict.
 *
 * The frames below are scaffolding, not content. Because the noun comes from
 * the song, two songs sharing a frame still do not share a line.
 */
const T2_FRAMES = [
  (a) => `I still count the ${a}`,
  (a) => `nobody moved the ${a}`,
  (a) => `the ${a} is where I left it`,
  (a) => `I keep the ${a} in the same place`,
  (a) => `I stopped explaining the ${a}`,
  (a) => `the ${a} outlasted the argument`,
];

function stableHash(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

/**
 * Anchors this song can borrow from, in tiers of decreasing specificity.
 *
 * Tiers are exhausted in order: a persona anchor is always preferred to a noun
 * the lyric happened to use, and both beat the title. Flattening these into one
 * pool let a shared title bleed identical rewrites across different songs.
 */
function anchorTiers(spec, songNouns) {
  const seen = new Set();
  const take = (value) => {
    const clean = String(value ?? "").trim();
    if (!clean || seen.has(clean)) return null;
    seen.add(clean);
    return clean;
  };
  const persona = (spec.personaAnchors ?? []).map(take).filter(Boolean);
  const own = (songNouns ?? []).map(take).filter(Boolean);
  const titleWord = String(spec.title ?? "").trim().split(/\s+/).slice(-1)[0]?.toLowerCase();
  const title = titleWord && titleWord.length > 2 ? [take(titleWord)].filter(Boolean) : [];
  return [persona, own, title].filter((tier) => tier.length > 0);
}

/**
 * Build a T2 replacement line, or null when the song offers nothing to anchor
 * to. Never returns a string already used elsewhere in this track.
 */
function rewriteLine(line, spec, songNouns, used) {
  const tiers = anchorTiers(spec, songNouns);
  if (!tiers.length) return null;
  const seed = stableHash(line);
  for (const tier of tiers) {
    for (let i = 0; i < tier.length; i++) {
      const anchor = tier[(seed + i) % tier.length];
      for (let f = 0; f < T2_FRAMES.length; f++) {
        const candidate = T2_FRAMES[(seed + f) % T2_FRAMES.length](anchor);
        if (!used.has(candidate)) {
          used.add(candidate);
          return candidate;
        }
      }
    }
  }
  return null;
}

/** What the writer should do when K2 will not invent a line for them. */
function rewriteDirective(classes, cds) {
  const why = classes.length ? classes.join(", ") : `CDS ${cds}`;
  return `${why} — replace with a concrete image from this song's own objects, places or actions. K2 has no persona anchor to build from.`;
}

function interchangeability(line) {
  return (
    GENERIC_SLOGANS.some((r) => r.test(line)) ||
    TIER1_PHRASES.some((p) => line.toLowerCase().includes(p))
  );
}

export function runK2(lyrics, spec) {
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
  const reports = [];
  const changes = [];
  const sectionFailures = [];
  const binding = [];
  const strict = spec.tropeCheck === "strict";

  const verseNouns = {};
  // Anchors are pooled across the whole lyric before scoring, so an early line
  // can borrow a noun the song only establishes later.
  const songNouns = [];
  for (const section of sections) {
    for (const l of section.lines) {
      if (!l.lyric) continue;
      const lower = l.raw.toLowerCase();
      for (const c of CONCRETE_HINTS) {
        if (lower.includes(c) && !songNouns.includes(c)) songNouns.push(c);
      }
    }
  }
  // No T2 string may repeat inside one track.
  const usedRewrites = new Set();

  for (const section of sections) {
    const lyricLines = section.lines.filter((l) => l.lyric);
    let tier1Window = 0;
    for (let i = 0; i < lyricLines.length; i++) {
      const line = lyricLines[i].raw;
      const classes = detectClasses(line, section.name);
      let cds = cdsFor(line);
      if (classes.includes("FC-2") || classes.includes("FC-3")) cds = 0;

      let verdict = "PASS";
      let note = "";
      let rewrite;

      if (classes.includes("FC-2") || classes.includes("FC-3") || cds === 0) {
        // A Tier 0 veto stays a veto. The rewrite is a convenience; when the
        // song offers no anchor the line is still refused, never downgraded.
        verdict = "BLOCK";
        rewrite = rewriteLine(line, spec, songNouns, usedRewrites) ?? undefined;
        note = rewrite
          ? "Tier 0 / portable slogan — replace with scene anchoring"
          : `Tier 0 / portable slogan — ${rewriteDirective(classes, cds)}`;
      } else if (classes.length || cds <= 2) {
        if (interchangeability(line) || cds <= 1) {
          rewrite = rewriteLine(line, spec, songNouns, usedRewrites) ?? undefined;
          if (rewrite) {
            verdict = "REWRITE";
            note = `CDS ${cds}${classes.length ? ` · ${classes.join(", ")}` : ""}`;
          } else {
            // P3: no anchor to build on — flag it, leave the words alone.
            verdict = "CONDITIONAL";
            note = rewriteDirective(classes, cds);
            binding.push(`${section.name} L${i + 1}: ${note}`);
          }
        } else {
          verdict = "CONDITIONAL";
          note = "Concrete detail is decorative until a later line binds it";
          binding.push(`${section.name} L${i + 1}: later lyric must bind this object`);
        }
      }

      if (strict && /chorus/i.test(section.name) && classes.includes("FC-5")) {
        const strictRewrite = rewrite ?? rewriteLine(line, spec, songNouns, usedRewrites);
        if (strictRewrite) {
          verdict = "REWRITE";
          note = "STRICT: Tier 1 in chorus auto-rewrites";
          rewrite = strictRewrite;
        } else if (verdict !== "BLOCK") {
          verdict = "CONDITIONAL";
          note = `STRICT: Tier 1 in chorus — ${rewriteDirective(classes, cds)}`;
        }
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

/**
 * Apply T2 rewrites by (section, lyric index).
 *
 * The previous implementation used an unanchored String.replace, which hit
 * only the first textual occurrence and could match inside a longer line. A
 * repeated chorus line was rewritten once and left alone the second time.
 *
 * Known limitation: section names are not unique — two sections both called
 * "Chorus" share an address here exactly as they do in the report and in gold
 * rows, so a rewrite lands on every section of that name at that index. That
 * is the desired behaviour for a repeated chorus and is faithful to how the
 * report addresses lines; disambiguating it is a schema change, not a fix here.
 */
export function applySilentRewrites(lyrics, report) {
  if (report.mode === "off") return lyrics;

  const targets = new Map();
  for (const line of report.lines) {
    if ((line.verdict === "REWRITE" || line.verdict === "BLOCK") && line.rewrite) {
      targets.set(`${line.section} ${line.index}`, line.rewrite);
    }
  }
  if (targets.size === 0) return lyrics;

  const eol = lyrics.includes("\r\n") ? "\r\n" : "\n";
  const raw = lyrics.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let section = "Ungrouped";
  let index = 0;

  for (const rawLine of raw) {
    const trimmed = rawLine.trim();
    const tag = trimmed.match(/^\[([^\]]+)\]$/);
    if (tag) {
      section = tag[1];
      index = 0;
      out.push(rawLine);
      continue;
    }
    // Blank and staging-only lines are not lyric lines and are not counted,
    // matching parseSections exactly.
    if (!trimmed || /^\(.*\)$/.test(trimmed)) {
      out.push(rawLine);
      continue;
    }
    const replacement = targets.get(`${section} ${index}`);
    index += 1;
    if (replacement) {
      out.push((rawLine.match(/^\s*/)?.[0] ?? "") + replacement);
    } else {
      out.push(rawLine);
    }
  }
  return out.join(eol);
}

export function formatTropeLog(report) {
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
