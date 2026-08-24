import type { SpecBlock, TropeReport } from "../types";

export function parseSections(lyrics: string): {
  name: string;
  lines: { raw: string; lyric: boolean }[];
}[];

export function runK2(lyrics: string, spec: SpecBlock): TropeReport;

export function applySilentRewrites(lyrics: string, report: TropeReport): string;

export function formatTropeLog(report: TropeReport): string;
