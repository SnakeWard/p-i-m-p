#!/usr/bin/env node
/**
 * pimp-mod — empirical loop for P.I.M.P. knowledge modules.
 * Legal ingest only. Collections never mix: human_pd | ai_permissive | self_generated.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(ROOT, "data", "pimp-mod.jsonl");

const TIER1 = [
  "rise above",
  "shattered dreams",
  "neon lights",
  "whispers in the dark",
  "broken dreams",
];

function parseArgs(argv) {
  const [cmd, ...rest] = argv.slice(2);
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    if (rest[i].startsWith("--")) {
      flags[rest[i].slice(2)] = rest[i + 1]?.startsWith("--") ? true : rest[++i];
    }
  }
  return { cmd, flags };
}

function score(lyrics) {
  const lines = lyrics.split("\n").filter((l) => l.trim() && !l.startsWith("[") && !l.startsWith("("));
  let flags = 0;
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (TIER1.some((p) => lower.includes(p))) flags += 1;
  }
  return { lines: lines.length, flags, flagRate: lines.length ? flags / lines.length : 0 };
}

async function loadAll() {
  if (!existsSync(DATA)) return [];
  const text = await readFile(DATA, "utf8");
  return text
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

async function saveAll(rows) {
  await mkdir(path.dirname(DATA), { recursive: true });
  await writeFile(DATA, rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : ""));
}

async function ingest(flags) {
  const source = flags.source;
  if (!["human_pd", "ai_permissive", "self_generated"].includes(source)) {
    throw new Error(" --source must be human_pd | ai_permissive | self_generated");
  }
  if (source === "human_pd") {
    console.log("human_pd: only public-domain or CC with commercial reuse. No protected catalogs.");
  }
  const file = flags.file;
  if (!file) throw new Error("--file required");
  const raw = await readFile(path.resolve(file), "utf8");
  const rows = await loadAll();
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    let rec;
    try {
      rec = JSON.parse(t);
    } catch {
      rec = { title: "plain", lyrics: t };
    }
    if (!rec.lyrics) continue;
    const annotation = score(rec.lyrics);
    rows.push({
      id: `lyr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      collection: source,
      title: rec.title ?? "untitled",
      lyrics: rec.lyrics,
      provenance: rec.provenance ?? file,
      license: rec.license ?? (source === "human_pd" ? "PD/CC-attested" : source),
      createdAt: new Date().toISOString(),
      annotation,
    });
  }
  await saveAll(rows);
  console.log(`ingested into ${source}. corpus size ${rows.length}`);
}

async function suite() {
  const rows = await loadAll();
  const by = (c) => rows.filter((r) => r.collection === c);
  for (const c of ["human_pd", "ai_permissive", "self_generated"]) {
    const list = by(c);
    const flags = list.reduce((a, r) => a + (r.annotation?.flags ?? 0), 0);
    const lines = list.reduce((a, r) => a + (r.annotation?.lines ?? 0), 0);
    console.log(`${c}\tn=${list.length}\tlines=${lines}\tflags=${flags}\trate=${lines ? (flags / lines).toFixed(3) : "0"}`);
  }
  console.log("Collections stay separated. Accept module diffs in the studio Module Lab.");
}

async function exp(flags) {
  const rows = await loadAll();
  const out = flags.out ?? "corpus.jsonl";
  await writeFile(path.resolve(out), rows.map((r) => JSON.stringify(r)).join("\n") + "\n");
  console.log(`wrote ${rows.length} records to ${out}`);
}

const { cmd, flags } = parseArgs(process.argv);
const help = `pimp-mod
  ingest --source human_pd|ai_permissive|self_generated --file <jsonl>
  suite
  export [--out corpus.jsonl]
`;

try {
  if (cmd === "ingest") await ingest(flags);
  else if (cmd === "suite") await suite();
  else if (cmd === "export") await exp(flags);
  else console.log(help);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
