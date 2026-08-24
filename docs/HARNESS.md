# pimp-mod Test Harness — Freeze (N0)

Empirical evolution of K2 (and later K modules) via measured corpora, not opinion.
**Single scorer path:** `src/pimp/engine/k2-core.mjs`  
CLI (`cli/pimp-mod.mjs` → `corpus-core.mjs` → `k2-core.mjs`) and studio Module Lab (`src/pimp/engine/k2.ts` re-exports the same file) **must not diverge**.

Frozen: 2026-08-24. No K2 rule edits in this commit.

---

## H0–H8 status

| Protocol | Title | Status |
|---|---|---|
| H0 | Harness lock — three collections never mix; legal sources only; auto-annotate + human review; CLI and Module Lab share schema + scoring | **implemented** |
| H1 | Lyric record schema (`id`, `collection`, `title`, `lyrics`, `provenance`, `license`, `createdAt`, `humanOverride`, `annotation`, `specSnapshot`) | **implemented** |
| H2 | Corpus rules — `human_pd` / `ai_permissive` / `self_generated`; JSONL at `data/pimp-mod.jsonl`; export never re-buckets | **implemented** |
| H3 | CLI surface — ingest, annotate, suite, override, export, seed, version-diff (+ bump gate) | **implemented** |
| H4 | Suite battery — Detection, Genre-strictness, Rewrite ladder, Cross-corpus divergence, Self-overuse | **implemented** |
| H5 | Annotation + human gate — auto-annotate on ingest/annotate; bump blocked until a gold label (or `--force-unreviewed`) | **implemented** |
| H6 | Module write path — suite before/after, version-diff, human sign-off, bump + changelog | **implemented** |
| H7 | Self-plug — opt-in default **off**; cap 20; 90-day drop; not a precision/recall set | **implemented** (kept off) |
| H8 | Success criteria — seed, real-K2 suite, ingest TropeReport, override in Detection notes, score agreement, no collection mix | **implemented** |

---

## CLI

```text
pimp-mod seed
pimp-mod ingest  --source human_pd|ai_permissive|self_generated --file <path>
pimp-mod annotate [--id <id>]
pimp-mod suite   [--collection <c>]
pimp-mod override --id <id> --label <pass|false_positive|miss|text>
pimp-mod export  [--out <path>] [--collection <c>]
pimp-mod version-diff --before <file> --after <file>
pimp-mod bump --module K2 [--notes <text>] [--diff <file>] [--force-unreviewed]
```

Illegal `--source` or a missing `--file` exits non-zero.
Storage: `data/pimp-mod.jsonl` (override with `PIMP_MOD_DATA`).
Versions: `data/module-versions.jsonl`.

---

## PD-vs-slogan baseline (pre-rule-change)

Corpus: `pimp-mod seed` (3 `human_pd` PD folk verses) + `cli/fixtures/slogan.jsonl` (1 labeled `ai_permissive` synthetic slogan block).

| Metric | human_pd (PD folk) | ai_permissive (slogan) |
|---|---|---|
| n | 3 | 1 |
| BLOCK share | **0** | **0.750** |
| rewrite needed | 0 | 4 |
| rewrite offered | 0 | 4 |
| mean CDS | **2.000** | **0.250** |
| flag rate (incl. CONDITIONAL) | 1.000 | 1.000 |

Overall BLOCK share (dashboard total, collections still labeled): 0.188.

**Calibration read:** veto is silent on PD folk and fires on portable slogans. Rewrite ladder offers a T2 string for every slogan REWRITE/BLOCK line. Collections stay separated.

Self-plug remains **off**. Do not enable until N0 + N2 + ≥3 gold labels (N4).

---

## Gold labels

`humanOverride` is the only gold field. Detection notes print `collection · title: gold "…"`.
Bump is blocked until at least one reviewed sample exists.

### N1 review (2026-08-24)

| Field | Value |
|---|---|
| record id | `lyr_c8fc77yu` |
| collection | `ai_permissive` |
| line | We will rise above the pain |
| verdict / CDS / classes | BLOCK / 0 / FC-5 |
| humanOverride | `pass` |
| reason | Portable slogan with no scene, object, or time — K2 veto is correct. |

Detection notes after override: `ai_permissive · Portable slogan (synthetic, permissive): gold “pass”`. Bump is no longer blocked.

---

## N2 — K2 0.1.0 (CDS heuristic only)

**Surface:** B. CDS heuristic. No phrase-list, rewrite-map, or section-gate edits.

**Change:** mid-line Proper Nouns (skip the line-initial capital) count as one concrete signal inside `cdsFor` only. `CONCRETE_HINTS` is unchanged so verse/section gates do not move.

**Human sign-off:** accepted. PD folk BLOCK share stayed 0.

| Metric | before | after | delta |
|---|---|---|---|
| human_flag_rate | 1.000 | 0.750 | −0.250 |
| cds_human | 2.000 | 2.250 | +0.250 |
| block_share_human | 0 | 0 | 0 |
| block_share_ai | 0.750 | 0.750 | 0 |
| rewrite_needed / offered | 4 / 4 | 4 / 4 | 0 |

Line flips (3), all `human_pd` CONDITIONAL → PASS:

- House of the Rising Sun L1: There is a house in New Orleans
- House of the Rising Sun L4: And God, I know I'm one
- Barbara Allen L1: In Scarlet Town where I was born

Slogan collection unchanged. Self-plug still off. Stop (N5): one measured bump.
