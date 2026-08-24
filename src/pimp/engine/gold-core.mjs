// @ts-nocheck
/**
 * Canonical gold-label store — separate from the lyric corpus.
 * Predictions are frozen at label time and never overwritten on re-annotate.
 */
function uid(prefix = "gold") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function specFields(rec) {
  const src = rec.specSnapshot ?? {};
  return {
    spec_trope_check: src.tropeCheck ?? "standard",
    spec_spine: src.genreSpine ?? "Singer-Songwriter / Folk",
    spec_color: src.genreColor ?? "none",
  };
}

export const GOLD_LABEL_ENUM = Object.freeze(["pass", "false_positive", "miss", "partial"]);
export const GOLD_SCOPE_ENUM = Object.freeze([
  "verdict",
  "cds",
  "class",
  "rewrite",
  "section_gate",
]);
export const GOLD_SURFACES = Object.freeze(["A", "B", "C", "D", "E"]);
export const GOLD_SURFACE_NAMES = Object.freeze({
  A: "Tier-1 phrase list",
  B: "CDS heuristic",
  C: "Rewrite map",
  D: "Section gate",
  E: "FC class detector",
});

const COLLECTION_RANK = { human_pd: 0, ai_permissive: 1, self_generated: 2 };
const SEVERITY_RANK = { high: 3, medium: 2, low: 1 };

export function assertGoldLabel(value) {
  if (!GOLD_LABEL_ENUM.includes(value)) {
    throw new Error(`illegal --label: ${value}. must be ${GOLD_LABEL_ENUM.join(" | ")}`);
  }
  return value;
}

export function assertGoldScope(value) {
  if (!GOLD_SCOPE_ENUM.includes(value)) {
    throw new Error(`illegal --scope: ${value}. must be ${GOLD_SCOPE_ENUM.join(" | ")}`);
  }
  return value;
}

export function assertSurface(value) {
  const letter = String(value ?? "").toUpperCase();
  if (!GOLD_SURFACES.includes(letter)) {
    throw new Error(`illegal --surface: ${value}. must be A|B|C|D|E`);
  }
  return letter;
}

export function parseLineRef(raw) {
  const s = String(raw ?? "").trim();
  const idx = s.lastIndexOf(":");
  if (idx <= 0) throw new Error(`--line must be Section:index (got ${raw})`);
  const section = s.slice(0, idx).trim();
  const line_index = Number(s.slice(idx + 1));
  if (!section || !Number.isInteger(line_index)) {
    throw new Error(`--line must be Section:index (got ${raw})`);
  }
  return { section, line_index };
}

export function engineFired(pred_verdict) {
  return pred_verdict === "REWRITE" || pred_verdict === "BLOCK" || pred_verdict === "CONDITIONAL";
}

function findLine(rec, section, line_index) {
  const lines = rec.annotation?.lines ?? [];
  if (line_index < 0) {
    const fail =
      rec.annotation?.sectionFailures?.find((f) => String(f).startsWith(section)) ??
      rec.annotation?.sectionFailures?.[0] ??
      "";
    return {
      section,
      index: -1,
      line: fail || `[section_gate ${section}]`,
      cds: null,
      classes: [],
      verdict: fail ? "CONDITIONAL" : "PASS",
      note: fail || "",
      rewrite: undefined,
    };
  }
  const hit = lines.find(
    (l) => l.section === section && l.index === line_index,
  );
  if (!hit) {
    throw new Error(`no line ${section}:${line_index} on ${rec.id}`);
  }
  return hit;
}

export function buildGoldRow(rec, fields) {
  const reason = String(fields.reason ?? "").trim();
  if (!reason) throw new Error("--reason required (one sentence)");
  const label = assertGoldLabel(fields.label);
  const label_scope = assertGoldScope(fields.scope ?? fields.label_scope ?? "verdict");
  const { section, line_index } =
    fields.section !== undefined && fields.line_index !== undefined
      ? { section: fields.section, line_index: fields.line_index }
      : parseLineRef(fields.line);
  const loc = findLine(rec, section, line_index);
  const spec = specFields(rec);
  const disagreement = label === "false_positive" || label === "miss" || label === "partial";
  let proposed_surface = fields.proposed_surface ?? fields.surface ?? null;
  if (disagreement) {
    proposed_surface = assertSurface(proposed_surface);
  } else if (proposed_surface) {
    proposed_surface = assertSurface(proposed_surface);
  }

  const row = {
    gold_id: fields.gold_id ?? uid("gold"),
    record_id: rec.id,
    collection: rec.collection,
    section: loc.section,
    line_index: loc.index,
    line_text: loc.line,
    pred_verdict: loc.verdict ?? null,
    pred_cds: loc.cds ?? null,
    pred_classes: Array.isArray(loc.classes) ? [...loc.classes] : [],
    pred_note: loc.note ?? "",
    pred_rewrite: loc.rewrite ?? null,
    spec_trope_check: spec.spec_trope_check,
    spec_spine: spec.spec_spine,
    spec_color: spec.spec_color,
    label,
    label_scope,
    reason,
    labeled_at: fields.labeled_at ?? new Date().toISOString(),
  };
  if (fields.severity) row.severity = fields.severity;
  if (fields.reviewer) row.reviewer = fields.reviewer;
  if (fields.desired_verdict) row.desired_verdict = fields.desired_verdict;
  if (fields.desired_cds_min != null) row.desired_cds_min = fields.desired_cds_min;
  if (fields.desired_cds_max != null) row.desired_cds_max = fields.desired_cds_max;
  if (fields.desired_classes) row.desired_classes = fields.desired_classes;
  if (fields.notes_for_rule) row.notes_for_rule = fields.notes_for_rule;
  if (proposed_surface) {
    row.proposed_surface = proposed_surface;
    row.notes_for_rule =
      fields.notes_for_rule ??
      `surface ${proposed_surface}: ${GOLD_SURFACE_NAMES[proposed_surface]}`;
  }
  return row;
}

export function goldPointer(gold_id) {
  return `gold:${gold_id}`;
}

export function parseGoldJsonl(text) {
  if (!text || !text.trim()) return [];
  const out = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t) continue;
    let obj;
    try {
      obj = JSON.parse(t);
    } catch {
      throw new Error(`gold JSONL parse error on line ${i + 1}`);
    }
    out.push(obj);
  }
  return out;
}

export function filterGold(rows, options = {}) {
  let out = rows;
  if (options.collection) out = out.filter((r) => r.collection === options.collection);
  if (options.label) {
    const wanted = String(options.label)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    out = out.filter((r) => wanted.includes(r.label));
  }
  return out;
}

export function goldBacklog(rows) {
  return rows
    .filter((r) => r.label === "miss" || r.label === "false_positive" || r.label === "partial")
    .filter((r) => GOLD_SURFACES.includes(r.proposed_surface))
    .sort((a, b) => {
      const sev = (SEVERITY_RANK[b.severity] ?? 1) - (SEVERITY_RANK[a.severity] ?? 1);
      if (sev) return sev;
      const col =
        (COLLECTION_RANK[a.collection] ?? 9) - (COLLECTION_RANK[b.collection] ?? 9);
      if (col) return col;
      return String(a.labeled_at).localeCompare(String(b.labeled_at));
    });
}

export function formatGoldList(rows, { backlog = false } = {}) {
  const list = backlog ? goldBacklog(rows) : rows;
  if (!list.length) return backlog ? "(backlog empty)\n" : "(no gold rows)\n";
  const blocks = [];
  for (const r of list) {
    const surf = r.proposed_surface
      ? ` surface ${r.proposed_surface} (${GOLD_SURFACE_NAMES[r.proposed_surface]})`
      : "";
    blocks.push(
      `${r.gold_id}  ${r.collection}  ${r.record_id}  ${r.section}:${r.line_index}`,
    );
    blocks.push(
      `  pred ${r.pred_verdict} cds=${r.pred_cds} [${(r.pred_classes || []).join(",")}]`,
    );
    blocks.push(`  ${r.line_text}`);
    blocks.push(
      `  ${r.label}/${r.label_scope}${r.severity ? ` sev=${r.severity}` : ""}${surf}`,
    );
    blocks.push(`  reason: ${r.reason}`);
    if (r.pred_rewrite) blocks.push(`  rewrite: ${r.pred_rewrite}`);
    blocks.push("");
  }
  return blocks.join("\n");
}

export function goldDetectionMetrics(goldRows, collection) {
  let gold = goldRows ?? [];
  if (collection) gold = gold.filter((r) => r.collection === collection);
  const by = (c) => gold.filter((r) => r.collection === c).length;
  const n = (lab) => gold.filter((r) => r.label === lab).length;
  const fpFire = gold.filter((r) => r.label === "false_positive" && engineFired(r.pred_verdict)).length;
  const missQuiet = gold.filter((r) => r.label === "miss" && !engineFired(r.pred_verdict)).length;
  const denom = Math.max(1, gold.length);
  return {
    n_gold: gold.length,
    n_gold_human: by("human_pd"),
    n_gold_ai: by("ai_permissive"),
    n_gold_self: by("self_generated"),
    n_pass: n("pass"),
    n_false_positive: n("false_positive"),
    n_miss: n("miss"),
    n_partial: n("partial"),
    proxy_fp_rate: fpFire / denom,
    proxy_miss_rate: missQuiet / denom,
  };
}

export function goldSuiteNotes(goldRows) {
  const n = (goldRows ?? []).length;
  const notes = (goldRows ?? [])
    .slice()
    .sort((a, b) => String(b.labeled_at).localeCompare(String(a.labeled_at)))
    .slice(0, 8)
    .map(
      (r) =>
        `${r.collection} · ${r.record_id} ${r.section}:${r.line_index}: gold “${r.label}” (${r.gold_id})`,
    );
  if (n < 20) {
    notes.unshift("n_gold < 20 — proxy FP/miss rates only; not formal precision.");
  }
  return notes;
}

export function migrateOverrideToGold(rec, extra = {}) {
  const raw = String(rec.humanOverride ?? "").trim();
  if (!raw || raw.startsWith("gold:")) return null;
  const label = GOLD_LABEL_ENUM.includes(raw) ? raw : "pass";
  const hot =
    rec.annotation?.lines?.find((l) => l.verdict === "BLOCK" || l.verdict === "REWRITE") ??
    rec.annotation?.lines?.find((l) => l.verdict !== "PASS") ??
    rec.annotation?.lines?.[0];
  if (!hot) throw new Error(`cannot migrate ${rec.id}: no annotated line`);
  return buildGoldRow(rec, {
    gold_id: extra.gold_id ?? `gold_${rec.id}_${hot.section.replace(/\s+/g, "")}_${hot.index}`,
    section: hot.section,
    line_index: hot.index,
    label,
    scope: extra.scope ?? "verdict",
    reason:
      extra.reason ??
      "Migrated from record humanOverride; prediction frozen at schema lock.",
    surface: extra.surface,
    severity: extra.severity ?? "medium",
    reviewer: extra.reviewer ?? "harness",
    labeled_at: extra.labeled_at,
  });
}
