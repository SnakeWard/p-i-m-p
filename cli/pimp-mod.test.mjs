import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, it } from "node:test";

const execFileAsync = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CLI = path.join(ROOT, "cli", "pimp-mod.mjs");
const PD = path.join(ROOT, "cli", "fixtures", "pd-sample.jsonl");
const SLOGAN = path.join(ROOT, "cli", "fixtures", "slogan.jsonl");

async function run(args, envExtra = {}) {
  const tmp = await mkdtemp(path.join(os.tmpdir(), "pimp-mod-"));
  const data = path.join(tmp, "pimp-mod.jsonl");
  const versions = path.join(tmp, "module-versions.jsonl");
  const gold = path.join(tmp, "gold-labels.jsonl");
  const personas = path.join(tmp, "personas");
  const env = {
    ...process.env,
    PIMP_MOD_DATA: data,
    PIMP_MOD_VERSIONS: versions,
    PIMP_MOD_GOLD: gold,
    PIMP_MOD_PERSONAS: personas,
    ...envExtra,
  };
  const invoke = async (argv) => {
    try {
      const r = await execFileAsync(
        process.execPath,
        ["--experimental-strip-types", CLI, ...argv],
        {
        cwd: ROOT,
        env,
        timeout: 20000,
      });
      return { code: 0, stdout: r.stdout, stderr: r.stderr, data, gold };
    } catch (e) {
      return {
        code: e.code ?? 1,
        stdout: e.stdout ?? "",
        stderr: e.stderr ?? e.message,
        data,
        gold,
      };
    }
  };
  return { tmp, data, versions, gold, invoke };
}

describe("pimp-mod CLI", () => {
  it("exits non-zero on illegal --source", async () => {
    const { invoke } = await run();
    const r = await invoke(["ingest", "--source", "genius", "--file", PD]);
    assert.notEqual(r.code, 0);
    assert.match(r.stderr, /illegal/);
  });

  it("exits non-zero on missing file", async () => {
    const { invoke } = await run();
    const r = await invoke([
      "ingest",
      "--source",
      "human_pd",
      "--file",
      path.join(ROOT, "cli", "fixtures", "no-such.jsonl"),
    ]);
    assert.notEqual(r.code, 0);
    assert.match(r.stderr, /missing file/);
  });

  it("seed loads SEED_PD into human_pd and suite prints all five results from real K2", async () => {
    const { invoke } = await run();
    const seeded = await invoke(["seed"]);
    assert.equal(seeded.code, 0, seeded.stderr);
    assert.match(seeded.stdout, /SEED_PD/);

    const again = await invoke(["seed"]);
    assert.equal(again.code, 0);
    assert.match(again.stdout, /seed skipped/);

    const suite = await invoke(["suite"]);
    assert.equal(suite.code, 0, suite.stderr);
    for (const name of [
      "Detection",
      "Genre-strictness",
      "Rewrite ladder",
      "Cross-corpus divergence",
      "Self-overuse",
    ]) {
      assert.match(suite.stdout, new RegExp(`=== ${name} ===`));
    }
    assert.match(suite.stdout, /human_flag_rate:/);
    assert.match(suite.stdout, /block_share_human:/);
    assert.match(suite.stdout, /rewrite_needed:/);
    assert.match(suite.stdout, /cds_human:/);
    assert.match(suite.stdout, /unique_overused:/);

    const raw = await readFile(seeded.data, "utf8");
    const rec = JSON.parse(raw.split("\n").find(Boolean));
    assert.equal(rec.collection, "human_pd");
    assert.ok(Array.isArray(rec.annotation.lines));
    assert.equal(typeof rec.annotation.lines[0].cds, "number");
    assert.ok(rec.annotation.lines[0].verdict);
  });

  it("ingest JSONL/plain annotates with TropeReport; override appears in Detection notes", async () => {
    const { invoke, data } = await run();
    const ing = await invoke(["ingest", "--source", "human_pd", "--file", PD]);
    assert.equal(ing.code, 0, ing.stderr);

    const rows = (await readFile(data, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    assert.ok(rows.length >= 2);
    for (const rec of rows) {
      assert.equal(rec.collection, "human_pd");
      assert.ok(rec.annotation.lines);
      assert.equal("cds" in rec.annotation.lines[0], true);
    }

    const id = rows[0].id;
    const ov = await invoke(["override", "--id", id, "--label", "pass"]);
    assert.equal(ov.code, 0, ov.stderr);

    const suite = await invoke(["suite"]);
    assert.equal(suite.code, 0, suite.stderr);
    assert.match(suite.stdout, /pointer .pass./);

    const tmpPlain = path.join(path.dirname(data), "plain.txt");
    await writeFile(tmpPlain, "[Verse 1]\nThe porch light is still on\nI left the key on the meter\n");
    const plain = await invoke(["ingest", "--source", "human_pd", "--file", tmpPlain]);
    assert.equal(plain.code, 0, plain.stderr);
  });

  it("refuses collection mixing on ingest; export preserves collection", async () => {
    const { invoke, tmp, data } = await run();
    await invoke(["ingest", "--source", "human_pd", "--file", PD]);
    const mixedFile = path.join(tmp, "wrong.jsonl");
    await writeFile(
      mixedFile,
      JSON.stringify({
        collection: "ai_permissive",
        title: "nope",
        lyrics: "[Verse 1]\nhi",
      }) + "\n",
    );
    const bad = await invoke(["ingest", "--source", "human_pd", "--file", mixedFile]);
    assert.notEqual(bad.code, 0);
    assert.match(bad.stderr, /collection mix/);

    await invoke(["ingest", "--source", "ai_permissive", "--file", SLOGAN]);
    const out = path.join(tmp, "export.jsonl");
    const exp = await invoke(["export", "--out", out, "--collection", "human_pd"]);
    assert.equal(exp.code, 0, exp.stderr);
    const exported = (await readFile(out, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    assert.ok(exported.length >= 1);
    assert.ok(exported.every((r) => r.collection === "human_pd"));

    const all = (await readFile(data, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    const cols = new Set(all.map((r) => r.collection));
    assert.ok(cols.has("human_pd") && cols.has("ai_permissive"));
  });

  it("version-diff reports deltas; bump is gated on human review", async () => {
    const { invoke, tmp, data } = await run();
    await invoke(["ingest", "--source", "ai_permissive", "--file", SLOGAN]);
    const before = path.join(tmp, "before.jsonl");
    await writeFile(before, await readFile(data, "utf8"));

    const afterRows = (await readFile(data, "utf8"))
      .split("\n")
      .filter(Boolean)
      .map((l) => JSON.parse(l));
    afterRows[0].lyrics = `[Chorus]\nThe kettle clicks off and I still wait\nThe lease unsigned on the counter`;
    afterRows[0].annotation = null;
    const after = path.join(tmp, "after.jsonl");
    await writeFile(after, afterRows.map((r) => JSON.stringify(r)).join("\n") + "\n");

    const diff = await invoke(["version-diff", "--before", before, "--after", after]);
    assert.equal(diff.code, 0, diff.stderr);
    assert.match(diff.stdout, /version-diff/);
    assert.match(diff.stdout, /Genre-strictness/);

    const blocked = await invoke(["bump", "--module", "K2", "--notes", "test"]);
    assert.notEqual(blocked.code, 0);
    assert.match(blocked.stderr, /blocked/);

    const forced = await invoke([
      "bump",
      "--module",
      "K2",
      "--notes",
      "test",
      "--force-unreviewed",
    ]);
    assert.equal(forced.code, 0, forced.stderr);
    assert.match(forced.stderr, /force-unreviewed/);

    const id = afterRows[0].id;
    await invoke(["override", "--id", id, "--label", "miss"]);
    const ok = await invoke(["bump", "--module", "K2", "--notes", "reviewed"]);
    assert.equal(ok.code, 0, ok.stderr);
    assert.match(ok.stdout, /bumped K2/);
  });

  it("gold add writes a frozen row; list/export/suite n_gold work", async () => {
    const { invoke, data, gold } = await run();
    await invoke(["ingest", "--source", "ai_permissive", "--file", SLOGAN]);
    const rec = JSON.parse((await readFile(data, "utf8")).split("\n").find(Boolean));
    const add = await invoke([
      "gold",
      "add",
      "--id",
      rec.id,
      "--line",
      "Chorus:3",
      "--label",
      "miss",
      "--scope",
      "rewrite",
      "--surface",
      "C",
      "--reason",
      "rewrite equals the original slogan line",
    ]);
    assert.equal(add.code, 0, add.stderr);
    assert.match(add.stdout, /gold add gold_/);
    const listed = await invoke(["gold", "list", "--label", "miss"]);
    assert.match(listed.stdout, /miss\/rewrite/);
    const suite = await invoke(["suite"]);
    assert.match(suite.stdout, /n_gold: 1/);
    assert.match(suite.stdout, /n_miss: 1/);
    const out = path.join(path.dirname(gold), "gold-out.jsonl");
    const exp = await invoke(["gold", "export", "--out", out]);
    assert.equal(exp.code, 0, exp.stderr);
    const row = JSON.parse((await readFile(out, "utf8")).split("\n").find(Boolean));
    assert.equal(row.label, "miss");
    assert.equal(row.label_scope, "rewrite");
    assert.equal(row.proposed_surface, "C");
    assert.ok(row.reason);
    assert.equal(row.record_id, rec.id);
  });

  it("persona validate/load/list/show/drop round-trip", async () => {
    const { invoke, tmp } = await run();
    const valid = path.join(ROOT, "data", "personas", "_example.json");
    const invalid = path.join(ROOT, "cli", "fixtures", "persona-invalid.json");
    const bad = await invoke(["persona", "validate", "--file", invalid]);
    assert.notEqual(bad.code, 0);
    assert.match(bad.stderr, /anchors\.objects/);

    const ok = await invoke(["persona", "validate", "--file", valid]);
    assert.equal(ok.code, 0, ok.stderr);
    assert.match(ok.stdout, /vesper-hollow/);

    const loaded = await invoke(["persona", "load", "--file", valid]);
    assert.equal(loaded.code, 0, loaded.stderr);
    const listed = await invoke(["persona", "list"]);
    assert.match(listed.stdout, /vesper-hollow/);
    const shown = await invoke(["persona", "show", "vesper-hollow"]);
    assert.match(shown.stdout, /pimp\.persona\.v1/);
    const dropped = await invoke(["persona", "drop", "vesper-hollow"]);
    assert.equal(dropped.code, 0, dropped.stderr);
    const after = await invoke(["persona", "list"]);
    assert.match(after.stdout, /\(no personas\)/);
    const dir = path.join(tmp, "personas");
    const files = await import("node:fs/promises").then((fs) => fs.readdir(dir).catch(() => []));
    assert.equal(
      files.filter((f) => f.endsWith(".json") && f !== "index.json").length,
      0,
    );
  });
});
