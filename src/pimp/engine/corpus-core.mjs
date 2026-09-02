// @ts-nocheck
/**
 * Lyric record schema, ingest, suites, version-diff, self-plug policy.
 * CLI and Module Lab must import this module — never a second scorer.
 */
import { runK2 } from "./k2-core.mjs";
import { engineFired, goldDetectionMetrics, goldSuiteNotes } from "./gold-core.mjs";

/**
 * P5 evidence floors — how much labelled evidence a K2 change must stand on.
 * "threshold" retunes an existing number; "surface" changes how a detector
 * decides. Recorded on the module-version entry so the bar stays auditable.
 */
export const EVIDENCE_FLOOR = Object.freeze({ threshold: 20, surface: 50 });

export const COLLECTIONS = Object.freeze(["human_pd", "ai_permissive", "self_generated"]);

export const SELF_PLUG = Object.freeze({
  optInDefault: false,
  cap: 20,
  retentionDays: 90,
  overuseHits: 4,
});

export const GOLD_LABELS = Object.freeze(["pass", "false_positive", "miss", "partial"]);

export const SUITE_NAMES = Object.freeze({
  detection: "Detection",
  genre: "Genre-strictness",
  rewrite: "Rewrite ladder",
  divergence: "Cross-corpus divergence",
  overuse: "Self-overuse",
});

export const SEED_PD = [
  {
    collection: "human_pd",
    title: "Amazing Grace (PD)",
    lyrics: `[Verse 1]
Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost, but now am found
Was blind, but now I see`,
    provenance: "John Newton, 1779 — public domain",
    license: "PD",
    humanOverride: "",
    specSnapshot: null,
  },
  {
    collection: "human_pd",
    title: "House of the Rising Sun (traditional PD verses)",
    lyrics: `[Verse 1]
There is a house in New Orleans
They call the Rising Sun
It's been the ruin of many a poor boy
And God, I know I'm one`,
    provenance: "Traditional folk — public domain verses",
    license: "PD",
    humanOverride: "",
    specSnapshot: null,
  },
  {
    collection: "human_pd",
    title: "Barbara Allen (PD)",
    lyrics: `[Verse 1]
In Scarlet Town where I was born
There was a fair maid dwellin'
Made every youth cry well-a-day
Her name was Barbara Allen`,
    provenance: "Child ballad — public domain",
    license: "PD",
    humanOverride: "",
    specSnapshot: null,
  },
];

export function uid(prefix = "lyr") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso() {
  return new Date().toISOString();
}

export function assertCollection(value) {
  if (!COLLECTIONS.includes(value)) {
    throw new Error(
      `illegal --source / collection: ${value ?? "(missing)"}. must be human_pd | ai_permissive | self_generated`,
    );
  }
  return value;
}

export function defaultLicense(collection) {
  if (collection === "human_pd") return "PD/CC-attested";
  if (collection === "self_generated") return "self";
  return "permissive-attested";
}

export function fillSpec(rec, spec) {
  const src = { ...(rec.specSnapshot ?? {}), ...(spec ?? {}) };
  return {
    title: src.title ?? rec.title,
    persona: src.persona ?? "—",
    genreSpine: src.genreSpine ?? "Singer-Songwriter / Folk",
    genreColor: src.genreColor ?? "none",
    narrativeArc: src.narrativeArc ?? "Ritual→Ascension",
    emotionPath: src.emotionPath ?? "testimonial",
    structureTemplate: src.structureTemplate ?? "Singer-Songwriter / Acoustic Ballad",
    structureSections: src.structureSections ?? [],
    structureMods: src.structureMods ?? [],
    vocalProtocol: src.vocalProtocol ?? "close-mic",
    performanceTarget: src.performanceTarget ?? "streaming",
    tropeCheck: src.tropeCheck ?? "standard",
    tropeTone: src.tropeTone ?? "Plainspoken",
    intent: src.intent ?? rec.title,
    toneFlags: src.toneFlags ?? [],
  };
}

export function isTropeReport(ann) {
  if (!ann || typeof ann !== "object" || !Array.isArray(ann.lines)) return false;
  if (ann.lines.length === 0) return "mode" in ann && "passed" in ann;
  const line = ann.lines[0];
  return line && typeof line === "object" && "cds" in line && "verdict" in line;
}

export function normalizeRecord(obj) {
  if (!obj || typeof obj !== "object") {
    throw new Error("record must be an object");
  }
  if (obj.collection) assertCollection(obj.collection);
  return {
    id: obj.id ?? uid("lyr"),
    collection: obj.collection,
    title: obj.title ?? "untitled",
    lyrics: obj.lyrics ?? "",
    provenance: obj.provenance ?? "",
    license: obj.license ?? "",
    createdAt: obj.createdAt ?? nowIso(),
    humanOverride: obj.humanOverride ?? "",
    annotation: isTropeReport(obj.annotation) ? obj.annotation : obj.annotation ?? null,
    specSnapshot: obj.specSnapshot ?? null,
  };
}

export function annotateRecord(rec, spec) {
  const full = fillSpec(rec, spec);
  const snap =
    spec !== undefined
      ? spec ?? rec.specSnapshot ?? null
      : rec.specSnapshot ?? null;
  return {
    ...rec,
    annotation: runK2(rec.lyrics, full),
    specSnapshot: snap,
  };
}

export function makeRecord(partial) {
  const rec = {
    id: uid("lyr"),
    createdAt: nowIso(),
    annotation: null,
    ...partial,
    humanOverride: partial.humanOverride ?? "",
    specSnapshot: partial.specSnapshot ?? null,
  };
  return annotateRecord(rec, rec.specSnapshot ?? undefined);
}

export function ensureAnnotated(rec) {
  if (isTropeReport(rec.annotation)) return rec;
  return annotateRecord(rec, rec.specSnapshot ?? undefined);
}

export function applySelfPlugRetention(records, now = Date.now()) {
  const cutoff = now - SELF_PLUG.retentionDays * 24 * 3600 * 1000;
  const keptSelf = records
    .filter((r) => r.collection === "self_generated")
    .filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return Number.isFinite(t) && t > cutoff;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, SELF_PLUG.cap);
  const keep = new Set(keptSelf.map((r) => r.id));
  return records.filter(
    (r) => r.collection !== "self_generated" || keep.has(r.id),
  );
}

export function hasReviewedSample(records, goldRows = []) {
  if (Array.isArray(goldRows) && goldRows.length > 0) return true;
  return records.some((r) => String(r.humanOverride ?? "").trim().length > 0);
}

function linesOf(list) {
  return list.flatMap((r) => r.annotation?.lines ?? []);
}

function meanCds(list) {
  const lines = linesOf(list);
  if (!lines.length) return 0;
  return lines.reduce((a, l) => a + l.cds, 0) / lines.length;
}

function flagRate(list) {
  const lines = linesOf(list);
  if (!lines.length) return 0;
  return lines.filter((l) => l.verdict !== "PASS").length / lines.length;
}

function blockShare(list) {
  const lines = linesOf(list);
  if (!lines.length) return 0;
  return lines.filter((l) => l.verdict === "BLOCK").length / lines.length;
}

function rewriteNeeded(list) {
  return linesOf(list).filter((l) => l.verdict === "REWRITE" || l.verdict === "BLOCK").length;
}

function rewriteOffered(list) {
  return linesOf(list).filter((l) => l.rewrite).length;
}

export function runSuites(records, options = {}) {
  let working = records.map(ensureAnnotated);
  if (options.collection) {
    assertCollection(options.collection);
    working = working.filter((r) => r.collection === options.collection);
  }
  working = applySelfPlugRetention(working);
  const gold = options.gold ?? [];

  const by = (c) => working.filter((r) => r.collection === c);
  const human = by("human_pd");
  const ai = by("ai_permissive");
  const self = by("self_generated");
  const goldMetrics = goldDetectionMetrics(gold, options.collection);

  const detection = {
    name: SUITE_NAMES.detection,
    summary:
      "Flag rate and n per collection. How often does K2 fire? Gold rows (not short overrides) are the label set.",
    metrics: {
      human_flag_rate: flagRate(human),
      ai_flag_rate: flagRate(ai),
      self_flag_rate: flagRate(self),
      n_human: human.length,
      n_ai: ai.length,
      n_self: self.length,
      ...goldMetrics,
    },
    notes: [
      ...goldSuiteNotes(gold),
      ...working
        .filter((r) => String(r.humanOverride ?? "").trim())
        .map((r) => `${r.collection} · ${r.title}: pointer “${r.humanOverride}”`),
    ],
  };

  const genre = {
    name: SUITE_NAMES.genre,
    summary:
      "BLOCK share overall + by collection. Veto should be rare on PD folk, higher on slogans.",
    metrics: {
      block_share: blockShare(working),
      block_share_human: blockShare(human),
      block_share_ai: blockShare(ai),
      block_share_self: blockShare(self),
    },
    notes: [
      "Collections reported separately; overall is a labeled dashboard total, not a mixed eval set.",
    ],
  };

  const rewrite = {
    name: SUITE_NAMES.rewrite,
    summary: "REWRITE/BLOCK lines vs T2 rewrite strings offered. Does the ladder propose fixes?",
    metrics: {
      rewrite_needed: rewriteNeeded(working),
      rewrite_offered: rewriteOffered(working),
      rewrite_needed_human: rewriteNeeded(human),
      rewrite_offered_human: rewriteOffered(human),
      rewrite_needed_ai: rewriteNeeded(ai),
      rewrite_offered_ai: rewriteOffered(ai),
      rewrite_needed_self: rewriteNeeded(self),
      rewrite_offered_self: rewriteOffered(self),
    },
    notes: [],
  };

  const divergence = {
    name: SUITE_NAMES.divergence,
    summary:
      "Mean CDS human_pd vs ai_permissive vs self_generated. Collections must stay separated.",
    metrics: {
      cds_human: meanCds(human),
      cds_ai: meanCds(ai),
      cds_self: meanCds(self),
    },
    notes: [
      "Never mix collections for primary precision/recall.",
      "Self-plugs feed only the overuse suite.",
    ],
  };

  const termFreq = {};
  for (const rec of self) {
    for (const w of rec.lyrics.toLowerCase().match(/[a-z']{4,}/g) ?? []) {
      termFreq[w] = (termFreq[w] ?? 0) + 1;
    }
  }
  const overused = Object.entries(termFreq)
    .filter(([, n]) => n >= SELF_PLUG.overuseHits)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const overuse = {
    name: SUITE_NAMES.overuse,
    summary: `Terms recurring ≥${SELF_PLUG.overuseHits} times across self_generated (active set, cap ${SELF_PLUG.cap} / ${SELF_PLUG.retentionDays}d).`,
    metrics: {
      unique_overused: overused.length,
      self_n: self.length,
    },
    notes: overused.map(([w, n]) => `${w} × ${n}`),
  };

  return [detection, genre, rewrite, divergence, overuse];
}

export function formatSuiteReport(results) {
  const blocks = [];
  for (const s of results) {
    blocks.push(`=== ${s.name} ===`);
    blocks.push(s.summary);
    for (const [k, v] of Object.entries(s.metrics)) {
      const num = typeof v === "number" && !Number.isInteger(v) ? v.toFixed(3) : String(v);
      blocks.push(`${k}: ${num}`);
    }
    if (s.notes.length) {
      blocks.push("notes:");
      for (const n of s.notes) blocks.push(`  ${n}`);
    }
    blocks.push("");
  }
  return blocks.join("\n").trimEnd() + "\n";
}

export function toJsonl(records) {
  return records.map((r) => JSON.stringify(r)).join("\n") + (records.length ? "\n" : "");
}

function looksLikeJsonObjectLine(line) {
  const t = line.trim();
  return t.startsWith("{") || t.startsWith("[");
}

export function parseIngest(text, collection, provenance = "ingest") {
  assertCollection(collection);
  const trimmed = text.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return [];

  try {
    const data = JSON.parse(trimmed);
    if (Array.isArray(data)) {
      return data
        .map((item, i) => ingestItem(item, collection, `${provenance}[${i}]`))
        .filter(Boolean);
    }
    if (data && typeof data === "object") {
      const rec = ingestItem(data, collection, provenance);
      return rec ? [rec] : [];
    }
  } catch {
    // not a single JSON value — try JSONL then plain
  }

  const rawLines = text.replace(/\r\n/g, "\n").split("\n");
  const nonempty = rawLines.map((l) => l.trim()).filter(Boolean);
  if (
    nonempty.length > 0 &&
    nonempty.every((l) => looksLikeJsonObjectLine(l))
  ) {
    const recs = [];
    for (let i = 0; i < nonempty.length; i++) {
      let obj;
      try {
        obj = JSON.parse(nonempty[i]);
      } catch {
        throw new Error(`JSONL parse error on line ${i + 1}`);
      }
      const rec = ingestItem(obj, collection, `${provenance}#${i + 1}`);
      if (rec) recs.push(rec);
    }
    return recs;
  }

  return [
    makeRecord({
      collection,
      title: firstTitleFromPlain(trimmed),
      lyrics: trimmed,
      provenance: provenance || "plain-text ingest",
      license: defaultLicense(collection),
      humanOverride: "",
      specSnapshot: null,
    }),
  ];
}

function firstTitleFromPlain(text) {
  const line = text.split("\n").find((l) => l.trim() && !l.trim().startsWith("["));
  const t = (line ?? "plain ingest").trim();
  return t.length > 48 ? `${t.slice(0, 45)}…` : t;
}

function ingestItem(item, collection, provenance) {
  if (typeof item === "string") {
    if (!item.trim()) return null;
    return makeRecord({
      collection,
      title: firstTitleFromPlain(item),
      lyrics: item,
      provenance,
      license: defaultLicense(collection),
      humanOverride: "",
      specSnapshot: null,
    });
  }
  if (!item || typeof item !== "object") return null;
  if (item.collection && item.collection !== collection) {
    throw new Error(
      `collection mix: record collection "${item.collection}" does not match source ${collection}. Never re-bucket.`,
    );
  }
  const lyrics = item.lyrics ?? item.text;
  if (!lyrics || !String(lyrics).trim()) return null;
  return makeRecord({
    collection,
    title: item.title ?? "untitled",
    lyrics: String(lyrics),
    provenance: item.provenance ?? provenance,
    license: item.license ?? defaultLicense(collection),
    humanOverride: item.humanOverride ?? "",
    specSnapshot: item.specSnapshot ?? null,
  });
}

/** @deprecated use parseIngest — kept so studio/CLI share one name */
export function fromJsonl(text, collection) {
  return parseIngest(text, collection, "ingest");
}

export function parseJsonlFile(text) {
  const out = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    let obj;
    try {
      obj = JSON.parse(t);
    } catch {
      throw new Error(`JSONL parse error on line ${i + 1}`);
    }
    out.push(normalizeRecord(obj));
  }
  return out;
}

export function exportRecords(records, collection) {
  if (collection) {
    assertCollection(collection);
    return records.filter((r) => r.collection === collection);
  }
  return records;
}

export function versionDiff(beforeRecords, afterRecords) {
  const before = beforeRecords.map(ensureAnnotated);
  const after = afterRecords.map(ensureAnnotated);
  const beforeSuites = runSuites(before);
  const afterSuites = runSuites(after);
  const suites = beforeSuites.map((b, i) => {
    const a = afterSuites[i] ?? { metrics: {}, name: b.name };
    const keys = new Set([...Object.keys(b.metrics), ...Object.keys(a.metrics ?? {})]);
    const deltas = {};
    const metrics = {};
    for (const k of keys) {
      const bv = b.metrics[k] ?? 0;
      const av = a.metrics?.[k] ?? 0;
      deltas[k] = av - bv;
      metrics[k] = { before: bv, after: av, delta: av - bv };
    }
    return { name: b.name, before: b.metrics, after: a.metrics ?? {}, deltas, metrics };
  });

  const afterById = new Map(after.map((r) => [r.id, r]));
  const flips = [];
  for (const rec of before) {
    const next = afterById.get(rec.id);
    if (!next) continue;
    const bLines = rec.annotation?.lines ?? [];
    const aLines = next.annotation?.lines ?? [];
    for (const bl of bLines) {
      const al = aLines.find((l) => l.section === bl.section && l.index === bl.index);
      if (al && al.verdict !== bl.verdict) {
        flips.push({
          id: rec.id,
          title: rec.title,
          collection: rec.collection,
          section: bl.section,
          index: bl.index,
          line: al.line || bl.line,
          from: bl.verdict,
          to: al.verdict,
        });
      }
    }
  }

  return { suites, flips };
}

export function formatVersionDiff(diff) {
  const blocks = ["=== version-diff ==="];
  for (const s of diff.suites) {
    blocks.push(`--- ${s.name} ---`);
    for (const [k, v] of Object.entries(s.metrics)) {
      const fmt = (n) =>
        typeof n === "number" && !Number.isInteger(n) ? n.toFixed(3) : String(n);
      const sign = v.delta > 0 ? "+" : "";
      blocks.push(`${k}: ${fmt(v.before)} → ${fmt(v.after)} (${sign}${fmt(v.delta)})`);
    }
  }
  blocks.push(`--- line flips (${diff.flips.length}) ---`);
  const sample = diff.flips.slice(0, 40);
  if (!sample.length) blocks.push("(none)");
  for (const f of sample) {
    blocks.push(
      `${f.collection} · ${f.title} · ${f.section} L${f.index + 1}: ${f.from} → ${f.to}`,
    );
    blocks.push(`  ${f.line}`);
  }
  if (diff.flips.length > sample.length) {
    blocks.push(`… ${diff.flips.length - sample.length} more`);
  }
  return blocks.join("\n") + "\n";
}

export function nextModuleVersion(existing) {
  const n = existing.length + 1;
  return `0.${n}.0`;
}

export function assertModuleWriteAllowed(records, forceUnreviewed, goldRows = []) {
  if (hasReviewedSample(records, goldRows)) return { ok: true, forced: false };
  if (forceUnreviewed) {
    return { ok: true, forced: true };
  }
  return {
    ok: false,
    forced: false,
    message:
      "module version bump blocked: review at least one sample (set humanOverride) or pass --force-unreviewed",
  };
}

/* ------------------------------------------------------------------ */
/* P1 — Regression gate                                                */
/*                                                                     */
/* goldDetectionMetrics scores against the predictions FROZEN at label  */
/* time, so it cannot see a change to K2 — rewrite the scorer and every */
/* number stays identical. replayGold re-runs the CURRENT scorer over   */
/* each gold row and asks whether the engine still does what the human  */
/* said it should. This is the only figure that moves when K2 moves.    */
/* ------------------------------------------------------------------ */

/** What the human said should happen at this line, in checkable form. */
export function expectedFor(goldRow) {
  const g = goldRow;
  if (
    g.label_scope === "cds" &&
    (typeof g.desired_cds_min === "number" || typeof g.desired_cds_max === "number")
  ) {
    return {
      kind: "cds_range",
      min: typeof g.desired_cds_min === "number" ? g.desired_cds_min : -Infinity,
      max: typeof g.desired_cds_max === "number" ? g.desired_cds_max : Infinity,
    };
  }
  if (g.desired_verdict) return { kind: "verdict", value: g.desired_verdict };
  switch (g.label) {
    // "pass" means the engine was right at label time: it must still agree.
    case "pass":
      return { kind: "verdict", value: g.pred_verdict };
    case "false_positive":
      return { kind: "quiet" };
    case "miss":
      return { kind: "fires" };
    default:
      // "partial" carries no machine-checkable target without desired_verdict.
      return { kind: "unscored" };
  }
}

function locateReplayLine(report, goldRow) {
  if (goldRow.line_index < 0) {
    const fail = (report.sectionFailures ?? []).find((f) =>
      String(f).startsWith(goldRow.section),
    );
    return { verdict: fail ? "CONDITIONAL" : "PASS", cds: null, classes: [], found: true };
  }
  const hit = (report.lines ?? []).find(
    (l) => l.section === goldRow.section && l.index === goldRow.line_index,
  );
  if (!hit) return { found: false };
  return { verdict: hit.verdict, cds: hit.cds, classes: hit.classes ?? [], found: true };
}

/**
 * Re-run the current K2 over every gold row.
 *
 * `records` must be the corpus the gold rows point at. A row whose record is
 * gone, or whose line no longer exists, is reported unresolved rather than
 * silently counted as agreement.
 */
export function replayGold(goldRows, records, options = {}) {
  const collection = options.collection;
  if (collection) assertCollection(collection);

  let gold = Array.isArray(goldRows) ? goldRows.slice() : [];
  if (collection) gold = gold.filter((g) => g.collection === collection);

  const byId = new Map((records ?? []).map((r) => [r.id, r]));
  const cache = new Map();
  const rows = [];

  for (const g of gold) {
    const rec = byId.get(g.record_id);
    if (!rec) {
      rows.push({ ...baseRow(g), status: "unresolved", detail: "record not in corpus" });
      continue;
    }
    let report = cache.get(rec.id);
    if (!report) {
      report = annotateRecord(rec, rec.specSnapshot ?? undefined).annotation;
      cache.set(rec.id, report);
    }
    const now = locateReplayLine(report, g);
    if (!now.found) {
      rows.push({ ...baseRow(g), status: "unresolved", detail: "line no longer in lyric" });
      continue;
    }

    const expected = expectedFor(g);
    const drifted = now.verdict !== g.pred_verdict;
    if (expected.kind === "unscored") {
      rows.push({
        ...baseRow(g),
        status: "unscored",
        current_verdict: now.verdict,
        current_cds: now.cds,
        drifted,
        detail: "partial label with no desired_verdict",
      });
      continue;
    }

    let correct;
    if (expected.kind === "verdict") correct = now.verdict === expected.value;
    else if (expected.kind === "quiet") correct = !engineFired(now.verdict);
    else if (expected.kind === "fires") correct = engineFired(now.verdict);
    else correct = now.cds !== null && now.cds >= expected.min && now.cds <= expected.max;

    rows.push({
      ...baseRow(g),
      status: correct ? "correct" : "incorrect",
      current_verdict: now.verdict,
      current_cds: now.cds,
      drifted,
      detail: correct ? "" : describeMiss(expected, now),
    });
  }

  return summariseReplay(rows);
}

function baseRow(g) {
  return {
    gold_id: g.gold_id,
    record_id: g.record_id,
    collection: g.collection,
    section: g.section,
    line_index: g.line_index,
    label: g.label,
    label_scope: g.label_scope,
    surface: g.proposed_surface ?? null,
    pred_verdict: g.pred_verdict,
    current_verdict: null,
    current_cds: null,
    drifted: false,
    detail: "",
  };
}

function describeMiss(expected, now) {
  if (expected.kind === "verdict") return `wanted ${expected.value}, got ${now.verdict}`;
  if (expected.kind === "quiet") return `should stay quiet, got ${now.verdict}`;
  if (expected.kind === "fires") return `should fire, got ${now.verdict}`;
  return `CDS ${now.cds} outside [${expected.min}, ${expected.max}]`;
}

function summariseReplay(rows) {
  const scored = rows.filter((r) => r.status === "correct" || r.status === "incorrect");
  const correct = rows.filter((r) => r.status === "correct");
  const newFalsePositives = rows.filter(
    (r) => r.status === "incorrect" && r.label === "false_positive",
  ).length;
  const newMisses = rows.filter((r) => r.status === "incorrect" && r.label === "miss").length;

  const bucket = (key) => {
    const out = {};
    for (const r of rows) {
      const k = r[key] ?? "none";
      out[k] ??= { n: 0, scored: 0, correct: 0 };
      out[k].n += 1;
      if (r.status === "correct" || r.status === "incorrect") out[k].scored += 1;
      if (r.status === "correct") out[k].correct += 1;
    }
    for (const v of Object.values(out)) {
      v.agreement = v.scored ? v.correct / v.scored : null;
    }
    return out;
  };

  return {
    n_gold: rows.length,
    n_scored: scored.length,
    n_correct: correct.length,
    n_incorrect: scored.length - correct.length,
    n_unscored: rows.filter((r) => r.status === "unscored").length,
    n_unresolved: rows.filter((r) => r.status === "unresolved").length,
    // null, not 1.0 — an empty gold set has no agreement, it has no evidence.
    agreement: scored.length ? correct.length / scored.length : null,
    new_false_positives: newFalsePositives,
    new_misses: newMisses,
    drift: rows.filter((r) => r.drifted).length,
    by_surface: bucket("surface"),
    by_collection: bucket("collection"),
    rows,
  };
}

export function formatReplayReport(result) {
  const pct = (v) => (v === null ? "n/a" : `${(v * 100).toFixed(1)}%`);
  const out = [];
  out.push("=== K2 replay (current scorer vs gold) ===");
  out.push(
    `agreement: ${pct(result.agreement)}  (${result.n_correct}/${result.n_scored} scored of ${result.n_gold} gold)`,
  );
  out.push(
    `new_false_positives: ${result.new_false_positives}  new_misses: ${result.new_misses}  drift: ${result.drift}`,
  );
  if (result.n_unscored || result.n_unresolved) {
    out.push(`unscored: ${result.n_unscored}  unresolved: ${result.n_unresolved}`);
  }
  if (result.n_scored === 0) {
    out.push("");
    out.push("No scorable gold rows. Agreement is unknown, not perfect.");
  }

  const section = (title, buckets) => {
    const keys = Object.keys(buckets);
    if (!keys.length) return;
    out.push("");
    out.push(title);
    for (const k of keys.sort()) {
      const b = buckets[k];
      out.push(`  ${k}: ${pct(b.agreement)} (${b.correct}/${b.scored}, n=${b.n})`);
    }
  };
  section("by surface:", result.by_surface);
  section("by collection:", result.by_collection);

  const bad = result.rows.filter((r) => r.status === "incorrect");
  if (bad.length) {
    out.push("");
    out.push("disagreements:");
    for (const r of bad.slice(0, 20)) {
      out.push(
        `  ${r.gold_id} ${r.collection} ${r.section}:${r.line_index} [${r.label}] ${r.detail}`,
      );
    }
    if (bad.length > 20) out.push(`  … ${bad.length - 20} more`);
  }

  const unresolved = result.rows.filter((r) => r.status === "unresolved");
  if (unresolved.length) {
    out.push("");
    out.push("unresolved:");
    for (const r of unresolved.slice(0, 10)) {
      out.push(`  ${r.gold_id} ${r.record_id}: ${r.detail}`);
    }
  }
  return out.join("\n") + "\n";
}

/** P5 — is there enough labelled evidence to accept this class of change? */
export function assertModuleEvidence(goldRows, opts = {}) {
  const change = opts.change === "threshold" ? "threshold" : "surface";
  const floor = EVIDENCE_FLOOR[change];
  let gold = Array.isArray(goldRows) ? goldRows : [];
  if (opts.collection) {
    assertCollection(opts.collection);
    gold = gold.filter((g) => g.collection === opts.collection);
  }
  const n = gold.length;
  if (n >= floor) return { ok: true, forced: false, change, floor, n };
  if (opts.force) return { ok: true, forced: true, change, floor, n };
  return {
    ok: false,
    forced: false,
    change,
    floor,
    n,
    message:
      `module bump blocked: a ${change} change needs ${floor} gold rows` +
      `${opts.collection ? ` in ${opts.collection}` : ""}, found ${n}. ` +
      `Label more with "pimp-mod gold add", or pass --force-unreviewed.`,
  };
}

/** P1 — refuse a bump that lowers agreement against the last accepted version. */
export function assertNoRegression(previousAgreement, currentAgreement, opts = {}) {
  if (typeof previousAgreement !== "number" || typeof currentAgreement !== "number") {
    return { ok: true, forced: false, delta: null };
  }
  const delta = currentAgreement - previousAgreement;
  if (delta >= 0) return { ok: true, forced: false, delta };
  if (opts.force) return { ok: true, forced: true, delta };
  return {
    ok: false,
    forced: false,
    delta,
    message:
      `module bump blocked: agreement fell from ${(previousAgreement * 100).toFixed(1)}% ` +
      `to ${(currentAgreement * 100).toFixed(1)}% (${(delta * 100).toFixed(1)} pts). ` +
      `Fix the regression, or pass --force-regression "<reason>".`,
  };
}
