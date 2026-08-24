// @ts-nocheck
/** Disk store for pimp.persona.v1 — CLI only. Studio uses zustand persist. */
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export function personaRoot(explicit) {
  if (explicit) return path.resolve(explicit);
  if (process.env.PIMP_MOD_PERSONAS) return path.resolve(process.env.PIMP_MOD_PERSONAS);
  return null;
}

function indexPath(root) {
  return path.join(root, "index.json");
}

function filePath(root, id) {
  const safe = String(id).replace(/[^a-zA-Z0-9._-]/g, "-");
  return path.join(root, `${safe}.json`);
}

export async function loadIndex(root) {
  const p = indexPath(root);
  if (!existsSync(p)) return { personas: [] };
  const raw = JSON.parse(await readFile(p, "utf8"));
  const personas = Array.isArray(raw.personas) ? raw.personas : [];
  return { personas };
}

async function saveIndex(root, index) {
  await mkdir(root, { recursive: true });
  await writeFile(indexPath(root), JSON.stringify(index, null, 2) + "\n");
}

export async function writePersonaFile(root, persona, updatedAt = new Date().toISOString()) {
  await mkdir(root, { recursive: true });
  const dest = filePath(root, persona.id);
  await writeFile(dest, JSON.stringify(persona, null, 2) + "\n");
  const index = await loadIndex(root);
  const entry = {
    id: persona.id,
    name: persona.name,
    version: persona.version,
    source: persona.source,
    updatedAt,
  };
  const next = index.personas.filter((e) => e.id !== persona.id);
  next.unshift(entry);
  await saveIndex(root, { personas: next });
  return dest;
}

export async function readPersonaFile(root, id) {
  const dest = filePath(root, id);
  if (!existsSync(dest)) return null;
  return JSON.parse(await readFile(dest, "utf8"));
}

export async function dropPersonaFile(root, id) {
  const dest = filePath(root, id);
  if (existsSync(dest)) await rm(dest);
  const index = await loadIndex(root);
  await saveIndex(root, { personas: index.personas.filter((e) => e.id !== id) });
}

export async function listPersonaFiles(root) {
  if (!existsSync(root)) return [];
  const index = await loadIndex(root);
  if (index.personas.length) return index.personas;
  const names = await readdir(root);
  const out = [];
  for (const n of names) {
    if (!n.endsWith(".json") || n === "index.json" || n.startsWith("_")) continue;
    const raw = JSON.parse(await readFile(path.join(root, n), "utf8"));
    if (raw && raw.id) {
      out.push({
        id: raw.id,
        name: raw.name,
        version: raw.version,
        source: raw.source,
        updatedAt: raw.createdAt,
      });
    }
  }
  return out;
}
