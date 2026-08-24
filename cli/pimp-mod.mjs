#!/usr/bin/env node
/**
 * pimp-mod — empirical loop for P.I.M.P. knowledge modules.
 * Legal ingest only. Collections never mix: human_pd | ai_permissive | self_generated.
 * Annotation is always the real K2 scorer (src/pimp/engine/k2-core.mjs).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  SEED_PD,
  annotateRecord,
  assertCollection,
  assertModuleWriteAllowed,
  ensureAnnotated,
  exportRecords,
  formatSuiteReport,
  formatVersionDiff,
  makeRecord,
  nextModuleVersion,
  parseIngest,
  parseJsonlFile,
  runSuites,
  toJsonl,
  versionDiff,
} from "../src/pimp/engine/corpus-core.mjs";
import {
  buildGoldRow,
  filterGold,
  formatGoldList,
  goldBacklog,
  goldPointer,
  parseGoldJsonl,
} from "../src/pimp/engine/gold-core.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = process.env.PIMP_MOD_DATA
  ? path.resolve(process.env.PIMP_MOD_DATA)
  : path.join(ROOT, "data", "pimp-mod.jsonl");
const VERSIONS = process.env.PIMP_MOD_VERSIONS
  ? path.resolve(process.env.PIMP_MOD_VERSIONS)
  : path.join(ROOT, "data", "module-versions.jsonl");
const GOLD = process.env.PIMP_MOD_GOLD
  ? path.resolve(process.env.PIMP_MOD_GOLD)
  : path.join(ROOT, "data", "gold-labels.jsonl");

function parseArgs(argv) {
  const raw = argv.slice(2);
  let cmd = raw[0];
  let rest = raw.slice(1);
  let sub;
  if (cmd === "gold") {
    if (rest[0] && !rest[0].startsWith("--")) {
      sub = rest[0];
      rest = rest.slice(1);
    }
  }
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    if (!rest[i].startsWith("--")) continue;
    const key = rest[i].slice(2);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith("--")) flags[key] = true;
    else flags[key] = rest[++i];
  }
  return { cmd, sub, flags };
}

async function loadAll() {
  if (!existsSync(DATA)) return [];
  const text = await readFile(DATA, "utf8");
  if (!text.trim()) return [];
  return parseJsonlFile(text);
}

async function saveAll(rows) {
  await mkdir(path.dirname(DATA), { recursive: true });
  await writeFile(DATA, toJsonl(rows));
}

async function loadGold() {
  if (!existsSync(GOLD)) return [];
  const text = await readFile(GOLD, "utf8");
  if (!text.trim()) return [];
  return parseGoldJsonl(text);
}

async function saveGold(rows) {
  await mkdir(path.dirname(GOLD), { recursive: true });
  await writeFile(GOLD, toJsonl(rows));
}

async function loadVersions() {
  if (!existsSync(VERSIONS)) return [];
  const text = await readFile(VERSIONS, "utf8");
  return text
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

async function appendVersion(entry) {
  await mkdir(path.dirname(VERSIONS), { recursive: true });
  await writeFile(
    VERSIONS,
    (existsSync(VERSIONS) ? await readFile(VERSIONS, "utf8") : "") +
      JSON.stringify(entry) +
      "\n",
  );
}

function requireFile(file, flag = "--file") {
  if (!file || file === true) {
    throw new Error(`${flag} required`);
  }
  const resolved = path.resolve(file);
  if (!existsSync(resolved)) {
    throw new Error(`missing file: ${resolved}`);
  }
  return resolved;
}

async function ingest(flags) {
  const source = assertCollection(flags.source);
  if (source === "human_pd") {
    console.log("human_pd: only public-domain or CC with commercial reuse. No protected catalogs.");
  }
  if (source === "self_generated") {
    console.log("self_generated: opt-in only. Internal drift detection — not a precision/recall set.");
  }
  const file = requireFile(flags.file, "--file");
  const raw = await readFile(file, "utf8");
  const incoming = parseIngest(raw, source, file);
  const rows = await loadAll();
  rows.push(...incoming);
  await saveAll(rows);
  console.log(`ingested ${incoming.length} into ${source}. corpus size ${rows.length}`);
}

async function annotate(flags) {
  const rows = await loadAll();
  if (flags.id && flags.id !== true) {
    const idx = rows.findIndex((r) => r.id === flags.id);
    if (idx < 0) throw new Error(`no record ${flags.id}`);
    rows[idx] = annotateRecord(rows[idx], rows[idx].specSnapshot);
    await saveAll(rows);
    const ann = rows[idx].annotation;
    console.log(
      `annotated ${rows[idx].id} · ${ann?.lines?.length ?? 0} lines · passed=${ann?.passed}`,
    );
    return;
  }
  const next = rows.map((r) => annotateRecord(r, r.specSnapshot));
  await saveAll(next);
  console.log(`annotated ${next.length} records with runK2`);
}

async function suite(flags) {
  const rows = (await loadAll()).map(ensureAnnotated);
  const gold = await loadGold();
  const collection =
    flags.collection && flags.collection !== true
      ? assertCollection(flags.collection)
      : undefined;
  const results = runSuites(rows, {
    ...(collection ? { collection } : {}),
    gold,
  });
  if (results.length !== 5) {
    throw new Error(`suite battery must emit 5 results, got ${results.length}`);
  }
  process.stdout.write(formatSuiteReport(results));
}

async function override(flags) {
  if (!flags.id || flags.id === true) throw new Error("--id required");
  if (flags.label === undefined || flags.label === true) throw new Error("--label required");
  const rows = await loadAll();
  const idx = rows.findIndex((r) => r.id === flags.id);
  if (idx < 0) throw new Error(`no record ${flags.id}`);
  rows[idx] = { ...rows[idx], humanOverride: String(flags.label) };
  await saveAll(rows);
  console.log(`override ${rows[idx].id} gold “${rows[idx].humanOverride}”`);
}

async function exp(flags) {
  const rows = await loadAll();
  const collection =
    flags.collection && flags.collection !== true
      ? assertCollection(flags.collection)
      : undefined;
  const sliced = exportRecords(rows, collection);
  const out = flags.out && flags.out !== true ? path.resolve(flags.out) : path.resolve("corpus.jsonl");
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, toJsonl(sliced));
  console.log(`wrote ${sliced.length} records to ${out}`);
}

async function seed() {
  const rows = await loadAll();
  const human = rows.filter((r) => r.collection === "human_pd");
  if (human.length > 0) {
    console.log(`seed skipped: human_pd already has ${human.length} records`);
    return;
  }
  const incoming = SEED_PD.map((s) =>
    makeRecord({
      ...s,
      humanOverride: s.humanOverride ?? "",
      specSnapshot: s.specSnapshot ?? null,
    }),
  );
  const next = [...rows, ...incoming];
  await saveAll(next);
  console.log(`seed loaded ${incoming.length} SEED_PD into human_pd. corpus size ${next.length}`);
}

async function diffCmd(flags) {
  const beforePath = requireFile(flags.before, "--before");
  const afterPath = requireFile(flags.after, "--after");
  const before = parseJsonlFile(await readFile(beforePath, "utf8"));
  const after = parseJsonlFile(await readFile(afterPath, "utf8"));
  const report = versionDiff(before, after);
  process.stdout.write(formatVersionDiff(report));
}

async function goldCmd(sub, flags) {
  if (sub === "add") {
    if (!flags.id || flags.id === true) throw new Error("--id required");
    if (!flags.line || flags.line === true) throw new Error("--line required (Section:index)");
    if (!flags.reason || flags.reason === true) throw new Error("--reason required");
    const rows = (await loadAll()).map(ensureAnnotated);
    const rec = rows.find((r) => r.id === flags.id);
    if (!rec) throw new Error(`no record ${flags.id}`);
    const gold = await loadGold();
    const row = buildGoldRow(rec, {
      label: flags.label,
      scope: flags.scope,
      line: flags.line,
      reason: flags.reason,
      surface: flags.surface,
      severity: flags.severity && flags.severity !== true ? flags.severity : undefined,
      reviewer: flags.reviewer && flags.reviewer !== true ? flags.reviewer : "cli",
      desired_verdict:
        flags["desired-verdict"] && flags["desired-verdict"] !== true
          ? flags["desired-verdict"]
          : undefined,
      notes_for_rule:
        flags["notes-for-rule"] && flags["notes-for-rule"] !== true
          ? flags["notes-for-rule"]
          : undefined,
    });
    gold.push(row);
    await saveGold(gold);
    const idx = rows.findIndex((r) => r.id === rec.id);
    rows[idx] = { ...rows[idx], humanOverride: goldPointer(row.gold_id) };
    await saveAll(rows);
    console.log(
      `gold add ${row.gold_id}  ${row.collection}  ${row.section}:${row.line_index}  ${row.label}/${row.label_scope}`,
    );
    return;
  }
  if (sub === "list") {
    const gold = await loadGold();
    const collection =
      flags.collection && flags.collection !== true
        ? assertCollection(flags.collection)
        : undefined;
    const label = flags.label && flags.label !== true ? flags.label : undefined;
    if (flags.backlog) {
      process.stdout.write(formatGoldList(filterGold(gold, { collection }), { backlog: true }));
      const top = goldBacklog(filterGold(gold, { collection }))[0];
      if (top) {
        console.log(
          `next H6: ${top.gold_id} → surface ${top.proposed_surface} (${top.label} ${top.collection})`,
        );
      }
      return;
    }
    const shown = filterGold(gold, { collection, label });
    process.stdout.write(formatGoldList(shown));
    return;
  }
  if (sub === "export") {
    const gold = await loadGold();
    const collection =
      flags.collection && flags.collection !== true
        ? assertCollection(flags.collection)
        : undefined;
    const sliced = filterGold(gold, { collection });
    const out =
      flags.out && flags.out !== true ? path.resolve(flags.out) : GOLD;
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, toJsonl(sliced));
    console.log(`wrote ${sliced.length} gold rows to ${out}`);
    return;
  }
  throw new Error("gold subcommand must be add | list | export");
}

async function bump(flags) {
  const rows = await loadAll();
  const gold = await loadGold();
  const force = Boolean(flags["force-unreviewed"]);
  const gate = assertModuleWriteAllowed(rows, force, gold);
  if (!gate.ok) throw new Error(gate.message);
  if (gate.forced) {
    console.warn("warning: --force-unreviewed — no gold-label sample in corpus");
  }
  const existing = await loadVersions();
  const entry = {
    id: `mod_${Date.now().toString(36)}`,
    module: flags.module && flags.module !== true ? flags.module : "K2",
    version: nextModuleVersion(existing),
    notes: flags.notes && flags.notes !== true ? String(flags.notes) : "",
    diff: flags.diff && flags.diff !== true ? await readFile(path.resolve(flags.diff), "utf8") : "",
    accepted: true,
    createdAt: new Date().toISOString(),
    forceUnreviewed: gate.forced,
    reviewedIds: [
      ...gold.map((g) => g.gold_id),
      ...rows.filter((r) => String(r.humanOverride ?? "").trim()).map((r) => r.id),
    ],
  };
  await appendVersion(entry);
  console.log(
    `bumped ${entry.module} ${entry.version}${gate.forced ? " (unreviewed)" : ""} · reviewed=${entry.reviewedIds.length}`,
  );
}

const HELP = `pimp-mod — empirical K-module harness (real runK2)
  ingest  --source human_pd|ai_permissive|self_generated --file <path>
  annotate [--id <id>]
  suite   [--collection <c>]
  override --id <id> --label <text>
  gold add --id <record_id> --line <Section:index> --label <pass|false_positive|miss|partial>
           --scope <verdict|cds|class|rewrite|section_gate> --reason "..."
           [--surface A|B|C|D|E] [--severity high|medium|low]
  gold list [--collection <c>] [--label miss|false_positive|partial|pass] [--backlog]
  gold export [--out data/gold-labels.jsonl] [--collection <c>]
  export  [--out <path>] [--collection <c>]
  seed
  version-diff --before <file> --after <file>
  bump    --module K2 [--notes <text>] [--diff <file>] [--force-unreviewed]

Collections never mix. Gold lives in data/gold-labels.jsonl (predictions frozen).
`;

const { cmd, sub, flags } = parseArgs(process.argv);

try {
  if (!cmd || cmd === "help" || cmd === "-h" || cmd === "--help") {
    process.stdout.write(HELP);
  } else if (cmd === "ingest") await ingest(flags);
  else if (cmd === "annotate") await annotate(flags);
  else if (cmd === "suite") await suite(flags);
  else if (cmd === "override") await override(flags);
  else if (cmd === "gold") await goldCmd(sub, flags);
  else if (cmd === "export") await exp(flags);
  else if (cmd === "seed") await seed();
  else if (cmd === "version-diff") await diffCmd(flags);
  else if (cmd === "bump") await bump(flags);
  else {
    console.error(`unknown command: ${cmd}`);
    process.stdout.write(HELP);
    process.exit(1);
  }
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
