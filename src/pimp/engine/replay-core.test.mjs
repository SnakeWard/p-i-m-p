import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assertModuleEvidence,
  assertNoRegression,
  EVIDENCE_FLOOR,
  expectedFor,
  formatReplayReport,
  makeRecord,
  replayGold,
} from "./corpus-core.mjs";
import { buildGoldRow } from "./gold-core.mjs";

const SLOGAN = `[Chorus]
We will rise above the pain
I can't go on without you`;

const CONCRETE = `[Verse 1]
I left the key on the pharmacy counter
The lease is still unsigned by the door`;

function rec(lyrics, collection = "ai_permissive") {
  return makeRecord({
    collection,
    title: "fixture",
    lyrics,
    provenance: "test",
    license: "test",
    humanOverride: "",
    specSnapshot: null,
  });
}

function goldFor(record, opts) {
  return buildGoldRow(record, {
    line: opts.line,
    label: opts.label,
    scope: opts.scope ?? "verdict",
    reason: "test fixture",
    surface: opts.surface ?? "B",
    desired_verdict: opts.desired_verdict,
  });
}

describe("P1 expectedFor — what the human asked for", () => {
  it("treats a pass label as 'keep doing exactly this'", () => {
    const e = expectedFor({ label: "pass", pred_verdict: "BLOCK" });
    assert.deepEqual(e, { kind: "verdict", value: "BLOCK" });
  });

  it("treats a false_positive as 'must go quiet'", () => {
    assert.deepEqual(expectedFor({ label: "false_positive", pred_verdict: "REWRITE" }), {
      kind: "quiet",
    });
  });

  it("treats a miss as 'must fire'", () => {
    assert.deepEqual(expectedFor({ label: "miss", pred_verdict: "PASS" }), { kind: "fires" });
  });

  it("lets desired_verdict override the label rule", () => {
    const e = expectedFor({ label: "miss", pred_verdict: "PASS", desired_verdict: "REWRITE" });
    assert.deepEqual(e, { kind: "verdict", value: "REWRITE" });
  });

  it("leaves a bare partial unscored rather than guessing", () => {
    assert.equal(expectedFor({ label: "partial", pred_verdict: "REWRITE" }).kind, "unscored");
  });

  it("reads a desired CDS range when the scope is cds", () => {
    const e = expectedFor({
      label: "partial",
      label_scope: "cds",
      pred_verdict: "REWRITE",
      desired_cds_min: 3,
      desired_cds_max: 4,
    });
    assert.deepEqual(e, { kind: "cds_range", min: 3, max: 4 });
  });
});

describe("P1 replayGold — measures the CURRENT scorer", () => {
  it("scores agreement when the engine still does what gold says", () => {
    const r = rec(SLOGAN);
    const fired = r.annotation.lines.find((l) => l.verdict !== "PASS");
    assert.ok(fired, "fixture must trip K2");
    const gold = goldFor(r, { line: `${fired.section}:${fired.index}`, label: "pass" });
    const out = replayGold([gold], [r]);
    assert.equal(out.n_scored, 1);
    assert.equal(out.n_correct, 1);
    assert.equal(out.agreement, 1);
    assert.equal(out.new_false_positives, 0);
  });

  it("counts a false_positive as unfixed while the engine still fires", () => {
    const r = rec(SLOGAN);
    const fired = r.annotation.lines.find((l) => l.verdict !== "PASS");
    const gold = goldFor(r, {
      line: `${fired.section}:${fired.index}`,
      label: "false_positive",
    });
    const out = replayGold([gold], [r]);
    assert.equal(out.n_correct, 0);
    assert.equal(out.new_false_positives, 1);
    assert.equal(out.agreement, 0);
    assert.match(out.rows[0].detail, /should stay quiet/);
  });

  it("counts a miss as unfixed while the engine stays quiet", () => {
    const r = rec(CONCRETE);
    const quiet = r.annotation.lines.find((l) => l.verdict === "PASS");
    assert.ok(quiet, "fixture must have a passing line");
    const gold = goldFor(r, { line: `${quiet.section}:${quiet.index}`, label: "miss" });
    const out = replayGold([gold], [r]);
    assert.equal(out.new_misses, 1);
    assert.equal(out.n_correct, 0);
  });

  it("reports agreement as null, not 1.0, when nothing is scorable", () => {
    const out = replayGold([], []);
    assert.equal(out.agreement, null);
    assert.equal(out.n_scored, 0);
    assert.match(formatReplayReport(out), /Agreement is unknown, not perfect/);
  });

  it("marks a gold row unresolved when its record is gone", () => {
    const r = rec(SLOGAN);
    const fired = r.annotation.lines.find((l) => l.verdict !== "PASS");
    const gold = goldFor(r, { line: `${fired.section}:${fired.index}`, label: "pass" });
    const out = replayGold([gold], []);
    assert.equal(out.n_unresolved, 1);
    assert.equal(out.n_scored, 0);
    assert.equal(out.agreement, null, "a vanished record must not read as agreement");
  });

  it("filters to one collection without mixing", () => {
    const a = rec(SLOGAN, "ai_permissive");
    const h = rec(SLOGAN, "human_pd");
    const fa = a.annotation.lines.find((l) => l.verdict !== "PASS");
    const fh = h.annotation.lines.find((l) => l.verdict !== "PASS");
    const gold = [
      goldFor(a, { line: `${fa.section}:${fa.index}`, label: "pass" }),
      goldFor(h, { line: `${fh.section}:${fh.index}`, label: "pass" }),
    ];
    const out = replayGold(gold, [a, h], { collection: "human_pd" });
    assert.equal(out.n_gold, 1);
    assert.deepEqual(Object.keys(out.by_collection), ["human_pd"]);
  });

  it("is sensitive to a scorer change — the whole point of P1", () => {
    // A gold row frozen against one verdict, replayed against a lyric whose
    // line now scores differently, must not silently read as agreement.
    const r = rec(SLOGAN);
    const fired = r.annotation.lines.find((l) => l.verdict !== "PASS");
    const gold = goldFor(r, { line: `${fired.section}:${fired.index}`, label: "pass" });
    const tampered = { ...gold, pred_verdict: "PASS" };
    const out = replayGold([tampered], [r]);
    assert.equal(out.n_correct, 0, "frozen PASS vs current firing must disagree");
    assert.equal(out.drift, 1);
  });
});

describe("P5 evidence floor", () => {
  it("uses 20 for a threshold change and 50 for a surface change", () => {
    assert.equal(EVIDENCE_FLOOR.threshold, 20);
    assert.equal(EVIDENCE_FLOOR.surface, 50);
  });

  it("blocks a surface change under 50 rows", () => {
    const gold = Array.from({ length: 49 }, () => ({ collection: "ai_permissive" }));
    const gate = assertModuleEvidence(gold, { change: "surface" });
    assert.equal(gate.ok, false);
    assert.match(gate.message, /needs 50 gold rows/);
  });

  it("admits the same evidence for a threshold change", () => {
    const gold = Array.from({ length: 20 }, () => ({ collection: "ai_permissive" }));
    assert.equal(assertModuleEvidence(gold, { change: "threshold" }).ok, true);
    assert.equal(assertModuleEvidence(gold, { change: "surface" }).ok, false);
  });

  it("defaults to the stricter surface floor", () => {
    const gold = Array.from({ length: 25 }, () => ({ collection: "ai_permissive" }));
    assert.equal(assertModuleEvidence(gold, {}).change, "surface");
    assert.equal(assertModuleEvidence(gold, {}).ok, false);
  });

  it("counts only the named collection", () => {
    const gold = [
      ...Array.from({ length: 30 }, () => ({ collection: "ai_permissive" })),
      ...Array.from({ length: 5 }, () => ({ collection: "human_pd" })),
    ];
    const gate = assertModuleEvidence(gold, { change: "threshold", collection: "human_pd" });
    assert.equal(gate.ok, false);
    assert.equal(gate.n, 5);
  });

  it("records that a forced bump was forced", () => {
    const gate = assertModuleEvidence([], { change: "surface", force: true });
    assert.equal(gate.ok, true);
    assert.equal(gate.forced, true);
  });
});

describe("P1 regression gate", () => {
  it("blocks a bump that lowers agreement", () => {
    const gate = assertNoRegression(0.9, 0.8);
    assert.equal(gate.ok, false);
    assert.match(gate.message, /agreement fell from 90.0% to 80.0%/);
  });

  it("allows an improvement or a hold", () => {
    assert.equal(assertNoRegression(0.8, 0.9).ok, true);
    assert.equal(assertNoRegression(0.8, 0.8).ok, true);
  });

  it("passes when there is no baseline to compare against", () => {
    assert.equal(assertNoRegression(undefined, 0.5).ok, true);
    assert.equal(assertNoRegression(0.5, null).ok, true);
  });

  it("allows a forced regression and marks it", () => {
    const gate = assertNoRegression(0.9, 0.5, { force: true });
    assert.equal(gate.ok, true);
    assert.equal(gate.forced, true);
    assert.ok(gate.delta < 0);
  });
});
