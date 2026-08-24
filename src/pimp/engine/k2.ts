/** Canonical K2 scorer — implementation in k2-core.mjs (CLI + studio share this path). */
import type { SpecBlock, TropeReport } from "../types";
import {
  applySilentRewrites as applySilentRewritesImpl,
  formatTropeLog as formatTropeLogImpl,
  parseSections as parseSectionsImpl,
  runK2 as runK2Impl,
} from "./k2-core.mjs";

export function parseSections(lyrics: string): {
  name: string;
  lines: { raw: string; lyric: boolean }[];
}[] {
  return parseSectionsImpl(lyrics);
}

export function runK2(lyrics: string, spec: SpecBlock): TropeReport {
  return runK2Impl(lyrics, spec) as TropeReport;
}

export function applySilentRewrites(lyrics: string, report: TropeReport): string {
  return applySilentRewritesImpl(lyrics, report);
}

export function formatTropeLog(report: TropeReport): string {
  return formatTropeLogImpl(report);
}
