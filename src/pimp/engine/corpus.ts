import { uid, nowIso } from "@/lib/utils";
import type { CollectionId, LyricRecord, SpecBlock } from "../types";
import { runK2 } from "./k2";

export const SEED_PD: Omit<LyricRecord, "id" | "createdAt" | "annotation">[] = [
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
  },
];

export function annotateRecord(rec: LyricRecord, spec?: Partial<SpecBlock>): LyricRecord {
  const full: SpecBlock = {
    title: rec.title,
    persona: spec?.persona ?? "—",
    genreSpine: spec?.genreSpine ?? "Singer-Songwriter / Folk",
    genreColor: spec?.genreColor ?? "none",
    narrativeArc: spec?.narrativeArc ?? "Ritual→Ascension",
    emotionPath: spec?.emotionPath ?? "testimonial",
    structureTemplate: spec?.structureTemplate ?? "Singer-Songwriter / Acoustic Ballad",
    structureSections: spec?.structureSections ?? [],
    structureMods: spec?.structureMods ?? [],
    vocalProtocol: spec?.vocalProtocol ?? "close-mic",
    performanceTarget: spec?.performanceTarget ?? "streaming",
    tropeCheck: spec?.tropeCheck ?? "standard",
    tropeTone: spec?.tropeTone ?? "Plainspoken",
    intent: spec?.intent ?? rec.title,
    toneFlags: spec?.toneFlags ?? [],
  };
  return { ...rec, annotation: runK2(rec.lyrics, full), specSnapshot: spec };
}

export function makeRecord(
  partial: Omit<LyricRecord, "id" | "createdAt" | "annotation"> & {
    annotation?: LyricRecord["annotation"];
  },
): LyricRecord {
  const rec: LyricRecord = {
    id: uid("lyr"),
    createdAt: nowIso(),
    annotation: null,
    ...partial,
    humanOverride: partial.humanOverride ?? "",
  };
  return annotateRecord(rec, rec.specSnapshot);
}

export interface SuiteResult {
  name: string;
  summary: string;
  metrics: Record<string, number>;
  notes: string[];
}

export function runSuites(records: LyricRecord[]): SuiteResult[] {
  const by = (c: CollectionId) => records.filter((r) => r.collection === c);
  const human = by("human_pd");
  const ai = by("ai_permissive");
  const self = by("self_generated");

  const meanCds = (list: LyricRecord[]) => {
    const lines = list.flatMap((r) => r.annotation?.lines ?? []);
    if (!lines.length) return 0;
    return lines.reduce((a, l) => a + l.cds, 0) / lines.length;
  };

  const flagRate = (list: LyricRecord[]) => {
    const lines = list.flatMap((r) => r.annotation?.lines ?? []);
    if (!lines.length) return 0;
    return lines.filter((l) => l.verdict !== "PASS").length / lines.length;
  };

  const detection: SuiteResult = {
    name: "Detection accuracy (proxy)",
    summary:
      "Without labeled ground-truth, this reports flag rate and mean CDS per collection. Human override tags become gold labels when present.",
    metrics: {
      human_flag_rate: flagRate(human),
      ai_flag_rate: flagRate(ai),
      self_flag_rate: flagRate(self),
      n_human: human.length,
      n_ai: ai.length,
      n_self: self.length,
    },
    notes: records
      .filter((r) => r.humanOverride)
      .map((r) => `${r.title}: override “${r.humanOverride}”`),
  };

  const genre: SuiteResult = {
    name: "Genre-strictness calibration",
    summary: "Share of BLOCK verdicts — should be rare in PD folk, higher in synthetic slogans.",
    metrics: {
      block_share:
        records.flatMap((r) => r.annotation?.lines ?? []).filter((l) => l.verdict === "BLOCK")
          .length /
        Math.max(1, records.flatMap((r) => r.annotation?.lines ?? []).length),
    },
    notes: [],
  };

  const rewrite: SuiteResult = {
    name: "Rewrite ladder effectiveness",
    summary: "Count of REWRITE/BLOCK lines that produced a T2 rewrite string.",
    metrics: {
      rewrite_offered: records
        .flatMap((r) => r.annotation?.lines ?? [])
        .filter((l) => l.rewrite).length,
      rewrite_needed: records
        .flatMap((r) => r.annotation?.lines ?? [])
        .filter((l) => l.verdict === "REWRITE" || l.verdict === "BLOCK").length,
    },
    notes: [],
  };

  const divergence: SuiteResult = {
    name: "Cross-corpus divergence",
    summary: "Mean CDS human_pd vs ai_permissive vs self_generated. Collections must stay separated.",
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

  const termFreq: Record<string, number> = {};
  for (const rec of self) {
    for (const w of rec.lyrics.toLowerCase().match(/[a-z']{4,}/g) ?? []) {
      termFreq[w] = (termFreq[w] ?? 0) + 1;
    }
  }
  const overused = Object.entries(termFreq)
    .filter(([, n]) => n >= 4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const overuse: SuiteResult = {
    name: "Self-overuse / internal drift",
    summary: "Terms recurring ≥4 times across self_generated plugs (last corpus).",
    metrics: {
      unique_overused: overused.length,
      self_n: self.length,
    },
    notes: overused.map(([w, n]) => `${w} × ${n}`),
  };

  return [detection, genre, rewrite, divergence, overuse];
}

export function toJsonl(records: LyricRecord[]) {
  return records.map((r) => JSON.stringify(r)).join("\n");
}

export function fromJsonl(text: string, collection: CollectionId): LyricRecord[] {
  const out: LyricRecord[] = [];
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    try {
      const obj = JSON.parse(t) as Partial<LyricRecord> & { lyrics?: string; title?: string };
      if (!obj.lyrics) continue;
      out.push(
        makeRecord({
          collection: obj.collection ?? collection,
          title: obj.title ?? "untitled",
          lyrics: obj.lyrics,
          provenance: obj.provenance ?? "ingest",
          license: obj.license ?? "unknown",
          humanOverride: obj.humanOverride ?? "",
        }),
      );
    } catch {
      out.push(
        makeRecord({
          collection,
          title: "plain ingest",
          lyrics: t,
          provenance: "plain-text ingest",
          license: "user-attested",
          humanOverride: "",
        }),
      );
    }
  }
  return out;
}
