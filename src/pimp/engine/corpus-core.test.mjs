import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { runK2 } from "./k2-core.mjs";
import {
  SEED_PD,
  SUITE_NAMES,
  annotateRecord,
  assertCollection,
  assertModuleWriteAllowed,
  ensureAnnotated,
  exportRecords,
  fillSpec,
  formatSuiteReport,
  hasReviewedSample,
  isTropeReport,
  makeRecord,
  parseIngest,
  runSuites,
  toJsonl,
  versionDiff,
} from "./corpus-core.mjs";

const SLOGAN = `[Chorus]
We will rise above the pain
I can't go on without you
The fire burns inside my soul`;

describe("K2 scorer (shared path)", () => {
  it("runK2 returns a full TropeReport (cds, classes, verdict, rewrite)", () => {
    const rec = makeRecord({
      collection: "human_pd",
      title: SEED_PD[0].title,
      lyrics: SEED_PD[0].lyrics,
      provenance: SEED_PD[0].provenance,
      license: "PD",
      humanOverride: "",
      specSnapshot: null,
    });
    const spec = fillSpec(rec);
    const direct = runK2(rec.lyrics, spec);
    assert.equal(direct.mode, "standard");
    assert.ok(Array.isArray(direct.lines));
    assert.ok(direct.lines.length > 0);
    for (const line of direct.lines) {
      assert.equal(typeof line.cds, "number");
      assert.ok(["PASS", "CONDITIONAL", "REWRITE", "BLOCK"].includes(line.verdict));
      assert.ok(Array.isArray(line.classes));
    }
    assert.deepEqual(rec.annotation, direct);
    assert.ok(isTropeReport(rec.annotation));
    assert.equal("flags" in rec.annotation, false);
  });

  it("CLI annotateRecord and studio runK2 agree on the same lyrics + spec", () => {
    const lyrics = SLOGAN;
    const rec = makeRecord({
      collection: "ai_permissive",
      title: "slogan",
      lyrics,
      provenance: "fixture",
      license: "CC0",
      humanOverride: "",
      specSnapshot: { title: "slogan", tropeCheck: "standard" },
    });
    const again = annotateRecord(rec, rec.specSnapshot);
    assert.deepEqual(again.annotation, rec.annotation);
    assert.ok(rec.annotation.lines.some((l) => l.verdict === "BLOCK"));
    assert.ok(rec.annotation.lines.some((l) => l.rewrite));
  });
});

describe("ingest / collections", () => {
  it("rejects illegal collection", () => {
    assert.throws(() => assertCollection("genius"), /illegal/);
  });

  it("refuses to re-bucket a record into another collection", () => {
    const text = JSON.stringify({
      collection: "ai_permissive",
      title: "x",
      lyrics: "[Verse 1]\nhello",
    });
    assert.throws(() => parseIngest(text, "human_pd", "test"), /collection mix/);
  });

  it("accepts JSONL and plain, always annotates with TropeReport", () => {
    const jsonl = parseIngest(
      `{"title":"A","lyrics":"[Verse 1]\\nThe lease sits on the counter by the door"}`,
      "human_pd",
      "t",
    );
    assert.equal(jsonl.length, 1);
    assert.ok(isTropeReport(jsonl[0].annotation));
    assert.equal(jsonl[0].collection, "human_pd");

    const plain = parseIngest("[Verse 1]\nThe porch light is still on\nI left the key", "human_pd", "plain");
    assert.equal(plain.length, 1);
    assert.ok(plain[0].lyrics.includes("porch"));
    assert.ok(isTropeReport(plain[0].annotation));
  });

  it("export preserves collection and never re-buckets", () => {
    const mixed = [
      makeRecord({
        collection: "human_pd",
        title: "h",
        lyrics: "[Verse 1]\nhello door",
        provenance: "p",
        license: "PD",
        humanOverride: "",
        specSnapshot: null,
      }),
      makeRecord({
        collection: "ai_permissive",
        title: "a",
        lyrics: SLOGAN,
        provenance: "p",
        license: "CC0",
        humanOverride: "",
        specSnapshot: null,
      }),
    ];
    const onlyHuman = exportRecords(mixed, "human_pd");
    assert.equal(onlyHuman.length, 1);
    assert.equal(onlyHuman[0].collection, "human_pd");
    const jsonl = toJsonl(mixed);
    assert.ok(jsonl.includes('"collection":"human_pd"'));
    assert.ok(jsonl.includes('"collection":"ai_permissive"'));
    assert.equal(jsonl.split("\n").filter(Boolean).length, 2);
  });
});

describe("H4 suite battery", () => {
  it("emits the five locked suites with per-collection metrics", () => {
    const records = [
      ...SEED_PD.map((s) => makeRecord({ ...s })),
      makeRecord({
        collection: "ai_permissive",
        title: "slogan",
        lyrics: SLOGAN,
        provenance: "fixture",
        license: "CC0",
        humanOverride: "false_positive",
        specSnapshot: null,
      }),
    ];
    const results = runSuites(records);
    assert.equal(results.length, 5);
    assert.deepEqual(
      results.map((r) => r.name),
      [
        SUITE_NAMES.detection,
        SUITE_NAMES.genre,
        SUITE_NAMES.rewrite,
        SUITE_NAMES.divergence,
        SUITE_NAMES.overuse,
      ],
    );
    const det = results[0];
    assert.ok("human_flag_rate" in det.metrics);
    assert.ok("ai_flag_rate" in det.metrics);
    assert.ok("n_human" in det.metrics);
    assert.ok(det.notes.some((n) => n.includes("gold") && n.includes("false_positive")));

    const genre = results[1];
    assert.ok("block_share" in genre.metrics);
    assert.ok("block_share_human" in genre.metrics);
    assert.ok("block_share_ai" in genre.metrics);
    assert.ok(genre.metrics.block_share_ai > genre.metrics.block_share_human);

    const rewrite = results[2];
    assert.ok("rewrite_needed" in rewrite.metrics);
    assert.ok("rewrite_offered" in rewrite.metrics);

    const printed = formatSuiteReport(results);
    for (const name of Object.values(SUITE_NAMES)) {
      assert.ok(printed.includes(`=== ${name} ===`), `missing ${name}`);
    }
  });

  it("does not mix collections when filtered", () => {
    const records = [
      makeRecord({
        collection: "human_pd",
        title: "h",
        lyrics: SEED_PD[1].lyrics,
        provenance: "p",
        license: "PD",
        humanOverride: "",
        specSnapshot: null,
      }),
      makeRecord({
        collection: "ai_permissive",
        title: "a",
        lyrics: SLOGAN,
        provenance: "p",
        license: "CC0",
        humanOverride: "",
        specSnapshot: null,
      }),
    ];
    const humanOnly = runSuites(records, { collection: "human_pd" });
    assert.equal(humanOnly[0].metrics.n_human, 1);
    assert.equal(humanOnly[0].metrics.n_ai, 0);
    assert.equal(humanOnly[0].metrics.n_self, 0);
    assert.equal(humanOnly[3].metrics.cds_ai, 0);
  });
});

describe("H5 human gate + version-diff", () => {
  it("blocks module write without a gold label unless forced", () => {
    const bare = [
      makeRecord({
        collection: "human_pd",
        title: "h",
        lyrics: SEED_PD[0].lyrics,
        provenance: "p",
        license: "PD",
        humanOverride: "",
        specSnapshot: null,
      }),
    ];
    assert.equal(hasReviewedSample(bare), false);
    assert.equal(assertModuleWriteAllowed(bare, false).ok, false);
    assert.equal(assertModuleWriteAllowed(bare, true).forced, true);
    const reviewed = [{ ...bare[0], humanOverride: "pass" }];
    assert.equal(assertModuleWriteAllowed(reviewed, false).ok, true);
  });

  it("version-diff reports metric deltas and line flips", () => {
    const before = makeRecord({
      collection: "ai_permissive",
      title: "s",
      lyrics: SLOGAN,
      provenance: "p",
      license: "CC0",
      humanOverride: "",
      specSnapshot: null,
    });
    const after = makeRecord({
      collection: "ai_permissive",
      title: "s",
      lyrics: `[Chorus]\nThe kettle clicks off and I still wait\nThe lease unsigned on the counter`,
      provenance: "p",
      license: "CC0",
      humanOverride: "",
      specSnapshot: null,
    });
    after.id = before.id;
    const diff = versionDiff([before], [after]);
    assert.equal(diff.suites.length, 5);
    assert.ok(diff.flips.length >= 1);
    assert.ok(diff.suites[1].deltas.block_share_ai !== 0);
  });

  it("re-annotates toy scores via ensureAnnotated", () => {
    const rec = makeRecord({
      collection: "human_pd",
      title: "t",
      lyrics: SEED_PD[0].lyrics,
      provenance: "p",
      license: "PD",
      humanOverride: "",
      specSnapshot: null,
    });
    rec.annotation = { flags: 2, flagRate: 0.5, lines: 4 };
    assert.equal(isTropeReport(rec.annotation), false);
    const fixed = ensureAnnotated(rec);
    assert.ok(isTropeReport(fixed.annotation));
  });
});
