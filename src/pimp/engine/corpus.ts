/** Corpus + suite battery — implementation in corpus-core.mjs (CLI + Module Lab). */
import type { CollectionId, LyricRecord, SpecBlock, TropeReport } from "../types";
import * as core from "./corpus-core.mjs";

export const COLLECTIONS = core.COLLECTIONS as readonly CollectionId[];
export const GOLD_LABELS = core.GOLD_LABELS as readonly string[];
export const SEED_PD = core.SEED_PD as Omit<LyricRecord, "id" | "createdAt" | "annotation">[];
export const SELF_PLUG = core.SELF_PLUG;
export const SUITE_NAMES = core.SUITE_NAMES;

export interface SuiteResult {
  name: string;
  summary: string;
  metrics: Record<string, number>;
  notes: string[];
}

export type VersionDiff = ReturnType<typeof versionDiff>;

export function uid(prefix?: string): string {
  return core.uid(prefix);
}

export function nowIso(): string {
  return core.nowIso();
}

export function assertCollection(value: unknown): CollectionId {
  return core.assertCollection(value) as CollectionId;
}

export function defaultLicense(collection: CollectionId): string {
  return core.defaultLicense(collection);
}

export function fillSpec(rec: LyricRecord, spec?: Partial<SpecBlock> | null): SpecBlock {
  return core.fillSpec(rec, spec) as SpecBlock;
}

export function isTropeReport(ann: unknown): ann is TropeReport {
  return core.isTropeReport(ann);
}

export function normalizeRecord(obj: unknown): LyricRecord {
  return core.normalizeRecord(obj) as LyricRecord;
}

export function annotateRecord(
  rec: LyricRecord,
  spec?: Partial<SpecBlock> | null,
): LyricRecord {
  return core.annotateRecord(rec, spec) as LyricRecord;
}

export function makeRecord(
  partial: Omit<LyricRecord, "id" | "createdAt" | "annotation"> & {
    id?: string;
    createdAt?: string;
    annotation?: TropeReport | null;
  },
): LyricRecord {
  return core.makeRecord(partial) as LyricRecord;
}

export function ensureAnnotated(rec: LyricRecord): LyricRecord {
  return core.ensureAnnotated(rec) as LyricRecord;
}

export function applySelfPlugRetention(records: LyricRecord[], now?: number): LyricRecord[] {
  return core.applySelfPlugRetention(records, now) as LyricRecord[];
}

export function hasReviewedSample(records: LyricRecord[], goldRows?: unknown[]): boolean {
  return core.hasReviewedSample(records, goldRows);
}

export function runSuites(
  records: LyricRecord[],
  options?: { collection?: CollectionId; gold?: unknown[] },
): SuiteResult[] {
  return core.runSuites(records, options) as SuiteResult[];
}

export function formatSuiteReport(results: SuiteResult[]): string {
  return core.formatSuiteReport(results);
}

export function toJsonl(records: LyricRecord[]): string {
  return core.toJsonl(records);
}

export function parseIngest(
  text: string,
  collection: CollectionId,
  provenance?: string,
): LyricRecord[] {
  return core.parseIngest(text, collection, provenance) as LyricRecord[];
}

export function fromJsonl(text: string, collection: CollectionId): LyricRecord[] {
  return core.fromJsonl(text, collection) as LyricRecord[];
}

export function parseJsonlFile(text: string): LyricRecord[] {
  return core.parseJsonlFile(text) as LyricRecord[];
}

export function exportRecords(
  records: LyricRecord[],
  collection?: CollectionId,
): LyricRecord[] {
  return core.exportRecords(records, collection) as LyricRecord[];
}

export function versionDiff(beforeRecords: LyricRecord[], afterRecords: LyricRecord[]) {
  return core.versionDiff(beforeRecords, afterRecords);
}

export function formatVersionDiff(diff: ReturnType<typeof versionDiff>): string {
  return core.formatVersionDiff(diff);
}

export function nextModuleVersion(existing: unknown[]): string {
  return core.nextModuleVersion(existing);
}

export function assertModuleWriteAllowed(
  records: LyricRecord[],
  forceUnreviewed?: boolean,
  goldRows?: unknown[],
): { ok: boolean; forced: boolean; message?: string } {
  return core.assertModuleWriteAllowed(records, forceUnreviewed, goldRows);
}
