import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { makeRecord } from "./corpus-core.mjs";
import {
  buildGoldRow,
  engineFired,
  goldBacklog,
  goldDetectionMetrics,
  migrateOverrideToGold,
} from "./gold-core.mjs";

const slogan = `[Chorus]
We will rise above the pain
I can't go on without you
The fire burns inside my soul
Tomorrow it gets better`;

describe("gold schema", () => {
  it("freezes prediction fields at label time", () => {
    const rec = makeRecord({
      collection: "ai_permissive",
      title: "s",
      lyrics: slogan,
      provenance: "t",
      license: "CC0",
      humanOverride: "",
      specSnapshot: null,
    });
    rec.id = "lyr_c8fc77yu";
    const row = buildGoldRow(rec, {
      gold_id: "gold_hist_1",
      line: "Chorus:0",
      label: "pass",
      scope: "verdict",
      reason: "Portable slogan with no scene — veto is correct.",
    });
    assert.equal(row.record_id, "lyr_c8fc77yu");
    assert.equal(row.pred_verdict, "BLOCK");
    assert.equal(row.pred_cds, 0);
    assert.ok(row.pred_classes.includes("FC-5"));
    assert.equal(row.label, "pass");
    assert.equal(row.label_scope, "verdict");
    rec.annotation.lines[0].verdict = "PASS";
    rec.annotation.lines[0].cds = 4;
    assert.equal(row.pred_verdict, "BLOCK");
    assert.equal(row.pred_cds, 0);
  });

  it("requires reason and a surface for disagreement labels", () => {
    const rec = makeRecord({
      collection: "human_pd",
      title: "h",
      lyrics: `[Verse 1]\nAmazing grace, how sweet the sound`,
      provenance: "pd",
      license: "PD",
      humanOverride: "",
      specSnapshot: null,
    });
    assert.throws(
      () =>
        buildGoldRow(rec, {
          line: "Verse 1:0",
          label: "false_positive",
          scope: "verdict",
          reason: "",
        }),
      /reason/,
    );
    assert.throws(
      () =>
        buildGoldRow(rec, {
          line: "Verse 1:0",
          label: "false_positive",
          scope: "verdict",
          reason: "over-fire",
        }),
      /surface/,
    );
  });

  it("backlog sorts severity then human_pd first and requires a surface", () => {
    const rows = [
      {
        gold_id: "g_ai",
        collection: "ai_permissive",
        label: "miss",
        proposed_surface: "C",
        severity: "high",
        labeled_at: "2026-01-01",
      },
      {
        gold_id: "g_pd",
        collection: "human_pd",
        label: "false_positive",
        proposed_surface: "B",
        severity: "high",
        labeled_at: "2026-01-02",
      },
      {
        gold_id: "g_pass",
        collection: "human_pd",
        label: "pass",
        proposed_surface: "B",
        severity: "high",
        labeled_at: "2026-01-03",
      },
    ];
    const back = goldBacklog(rows);
    assert.equal(back[0].gold_id, "g_pd");
    assert.equal(back.length, 2);
  });

  it("proxy rates: fire ∩ FP and under-fire ∩ miss", () => {
    const gold = [
      { collection: "ai_permissive", label: "false_positive", pred_verdict: "BLOCK" },
      { collection: "human_pd", label: "miss", pred_verdict: "PASS" },
      { collection: "human_pd", label: "pass", pred_verdict: "BLOCK" },
    ];
    const m = goldDetectionMetrics(gold);
    assert.equal(m.n_gold, 3);
    assert.equal(m.n_false_positive, 1);
    assert.equal(m.n_miss, 1);
    assert.equal(m.proxy_fp_rate, 1 / 3);
    assert.equal(m.proxy_miss_rate, 1 / 3);
    assert.equal(engineFired("CONDITIONAL"), true);
    assert.equal(engineFired("PASS"), false);
  });

  it("migrates a short override into a full gold row", () => {
    const rec = makeRecord({
      collection: "ai_permissive",
      title: "s",
      lyrics: slogan,
      provenance: "t",
      license: "CC0",
      humanOverride: "pass",
      specSnapshot: null,
    });
    rec.id = "lyr_c8fc77yu";
    const row = migrateOverrideToGold(rec, {
      gold_id: "gold_lyr_c8fc77yu_Chorus_0",
      reason: "Migrated from record humanOverride; prediction frozen at schema lock.",
    });
    assert.equal(row.gold_id, "gold_lyr_c8fc77yu_Chorus_0");
    assert.equal(row.label, "pass");
    assert.equal(row.pred_verdict, "BLOCK");
    assert.equal(row.line_index, 0);
  });
});
