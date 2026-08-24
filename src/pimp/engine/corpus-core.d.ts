import type { CollectionId, LyricRecord, SpecBlock, TropeReport } from "../types";

export const COLLECTIONS: readonly CollectionId[];

export const SELF_PLUG: {
  readonly optInDefault: false;
  readonly cap: number;
  readonly retentionDays: number;
  readonly overuseHits: number;
};

export const GOLD_LABELS: readonly string[];

export const SUITE_NAMES: {
  readonly detection: "Detection";
  readonly genre: "Genre-strictness";
  readonly rewrite: "Rewrite ladder";
  readonly divergence: "Cross-corpus divergence";
  readonly overuse: "Self-overuse";
};

export const SEED_PD: Omit<LyricRecord, "id" | "createdAt" | "annotation">[];

export function uid(prefix?: string): string;
export function nowIso(): string;
export function assertCollection(value: unknown): CollectionId;
export function defaultLicense(collection: CollectionId): string;
export function fillSpec(rec: LyricRecord, spec?: Partial<SpecBlock> | null): SpecBlock;
export function isTropeReport(ann: unknown): ann is TropeReport;
export function normalizeRecord(obj: unknown): LyricRecord;
export function annotateRecord(rec: LyricRecord, spec?: Partial<SpecBlock> | null): LyricRecord;
export function makeRecord(
  partial: Omit<LyricRecord, "id" | "createdAt" | "annotation"> & {
    id?: string;
    createdAt?: string;
    annotation?: TropeReport | null;
  },
): LyricRecord;
export function ensureAnnotated(rec: LyricRecord): LyricRecord;
export function applySelfPlugRetention(records: LyricRecord[], now?: number): LyricRecord[];
export function hasReviewedSample(records: LyricRecord[]): boolean;

export interface SuiteResult {
  name: string;
  summary: string;
  metrics: Record<string, number>;
  notes: string[];
}

export function runSuites(
  records: LyricRecord[],
  options?: { collection?: CollectionId },
): SuiteResult[];
export function formatSuiteReport(results: SuiteResult[]): string;
export function toJsonl(records: LyricRecord[]): string;
export function parseIngest(
  text: string,
  collection: CollectionId,
  provenance?: string,
): LyricRecord[];
export function fromJsonl(text: string, collection: CollectionId): LyricRecord[];
export function parseJsonlFile(text: string): LyricRecord[];
export function exportRecords(records: LyricRecord[], collection?: CollectionId): LyricRecord[];

export interface VersionDiff {
  suites: {
    name: string;
    before: Record<string, number>;
    after: Record<string, number>;
    deltas: Record<string, number>;
    metrics: Record<string, { before: number; after: number; delta: number }>;
  }[];
  flips: {
    id: string;
    title: string;
    collection: CollectionId;
    section: string;
    index: number;
    line: string;
    from: string;
    to: string;
  }[];
}

export function versionDiff(beforeRecords: LyricRecord[], afterRecords: LyricRecord[]): VersionDiff;
export function formatVersionDiff(diff: VersionDiff): string;
export function nextModuleVersion(existing: unknown[]): string;
export function assertModuleWriteAllowed(
  records: LyricRecord[],
  forceUnreviewed?: boolean,
): { ok: boolean; forced: boolean; message?: string };
