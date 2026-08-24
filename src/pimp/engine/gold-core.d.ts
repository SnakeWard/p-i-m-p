import type { CollectionId, LyricRecord } from "../types";

export type GoldLabel = "pass" | "false_positive" | "miss" | "partial";
export type GoldScope = "verdict" | "cds" | "class" | "rewrite" | "section_gate";
export type GoldSurface = "A" | "B" | "C" | "D" | "E";

export interface GoldRow {
  gold_id: string;
  record_id: string;
  collection: CollectionId;
  section: string;
  line_index: number;
  line_text: string;
  pred_verdict: string | null;
  pred_cds: number | null;
  pred_classes: string[];
  pred_note: string;
  pred_rewrite: string | null;
  spec_trope_check: string;
  spec_spine: string;
  spec_color: string;
  label: GoldLabel;
  label_scope: GoldScope;
  reason: string;
  labeled_at: string;
  severity?: string;
  reviewer?: string;
  desired_verdict?: string;
  desired_cds_min?: number;
  desired_cds_max?: number;
  desired_classes?: string[];
  notes_for_rule?: string;
  proposed_surface?: GoldSurface;
}

export const GOLD_LABEL_ENUM: readonly GoldLabel[];
export const GOLD_SCOPE_ENUM: readonly GoldScope[];
export const GOLD_SURFACES: readonly GoldSurface[];
export const GOLD_SURFACE_NAMES: Record<GoldSurface, string>;

export function assertGoldLabel(value: unknown): GoldLabel;
export function assertGoldScope(value: unknown): GoldScope;
export function assertSurface(value: unknown): GoldSurface;
export function parseLineRef(raw: string): { section: string; line_index: number };
export function engineFired(pred_verdict: string | null): boolean;
export function buildGoldRow(rec: LyricRecord, fields: Record<string, unknown>): GoldRow;
export function goldPointer(gold_id: string): string;
export function parseGoldJsonl(text: string): GoldRow[];
export function filterGold(
  rows: GoldRow[],
  options?: { collection?: CollectionId; label?: string },
): GoldRow[];
export function goldBacklog(rows: GoldRow[]): GoldRow[];
export function formatGoldList(rows: GoldRow[], opts?: { backlog?: boolean }): string;
export function goldDetectionMetrics(
  goldRows: GoldRow[],
  collection?: CollectionId,
): Record<string, number>;
export function goldSuiteNotes(goldRows: GoldRow[]): string[];
export function migrateOverrideToGold(
  rec: LyricRecord,
  extra?: Record<string, unknown>,
): GoldRow | null;
