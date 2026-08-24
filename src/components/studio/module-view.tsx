import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Select, Textarea } from "@/components/ui/field";
import {
  exportRecords,
  GOLD_LABELS,
  runSuites,
  toJsonl,
} from "@/pimp/engine/corpus";
import { usePimp } from "@/pimp/store";
import type { CollectionId } from "@/pimp/types";
import { CopyBtn } from "./copy-btn";

export function ModuleView() {
  const corpus = usePimp((s) => s.corpus);
  const ingest = usePimp((s) => s.ingestText);
  const overrideRecord = usePimp((s) => s.overrideRecord);
  const dropRecord = usePimp((s) => s.dropRecord);
  const versions = usePimp((s) => s.moduleVersions);
  const propose = usePimp((s) => s.proposeModule);
  const accept = usePimp((s) => s.acceptModule);
  const lastError = usePimp((s) => s.lastError);
  const [text, setText] = useState("");
  const [collection, setCollection] = useState<CollectionId>("human_pd");
  const [filter, setFilter] = useState<CollectionId | "all">("all");
  const [forceUnreviewed, setForceUnreviewed] = useState(false);

  const suites = useMemo(
    () => runSuites(corpus, filter === "all" ? {} : { collection: filter }),
    [corpus, filter],
  );
  const shown = filter === "all" ? corpus : corpus.filter((r) => r.collection === filter);
  const exportSlice = exportRecords(corpus, filter === "all" ? undefined : filter);
  const reviewLines = shown.flatMap((r) =>
    (r.annotation?.lines ?? [])
      .filter((l) => l.verdict === "REWRITE" || l.verdict === "BLOCK")
      .map((l) => ({ rec: r, line: l })),
  );

  return (
    <div className="max-w-5xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">pimp-mod</p>
        <h1 className="font-display text-3xl mt-1">Module Lab</h1>
        <p className="text-muted mt-2 max-w-2xl leading-relaxed">
          Public-domain / CC human lyrics only. Permissive AI only. Self-plugs stay separated.
          Scores come from the same runK2 path as the CLI. Version bumps require a reviewed
          sample.
        </p>
      </header>

      {lastError ? (
        <p className="rounded-[var(--radius-md)] border border-fail/40 bg-surface px-3 py-2 text-sm text-fail">
          {lastError}
        </p>
      ) : null}

      <section className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5 space-y-3">
        <Label>Ingest (JSONL, JSON, or raw lyrics)</Label>
        <Textarea
          rows={6}
          className="font-mono text-xs"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'{"title":"…","lyrics":"[Verse 1]\\n…"}'}
        />
        <div className="flex flex-wrap gap-2">
          <Select
            className="max-w-xs"
            value={collection}
            onChange={(e) => setCollection(e.target.value as CollectionId)}
          >
            <option value="human_pd">human_pd</option>
            <option value="ai_permissive">ai_permissive</option>
            <option value="self_generated">self_generated</option>
          </Select>
          <Button
            type="button"
            onClick={() => {
              if (!text.trim()) return;
              ingest(text, collection, `ui-ingest ${collection}`);
              setText("");
            }}
          >
            Ingest + annotate
          </Button>
          <CopyBtn text={toJsonl(exportSlice)} label="Export JSONL" />
        </div>
        <p className="text-xs text-subtle">
          Ingest stamps the selected collection. Export never re-buckets.
        </p>
      </section>

      <section className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {suites.map((s) => (
          <article
            key={s.name}
            className="rounded-[var(--radius-md)] border border-border p-4 space-y-2"
          >
            <h2 className="text-sm font-medium">{s.name}</h2>
            <p className="text-xs text-muted leading-relaxed">{s.summary}</p>
            <ul className="text-xs font-mono text-subtle space-y-0.5">
              {Object.entries(s.metrics).map(([k, v]) => (
                <li key={k}>
                  {k}: {Number.isInteger(v) ? v : v.toFixed(3)}
                </li>
              ))}
            </ul>
            {s.notes.slice(0, 6).map((n) => (
              <p key={n} className="text-xs text-muted">
                {n}
              </p>
            ))}
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm uppercase tracking-widest text-muted">Corpus</h2>
          <Select
            className="max-w-[200px]"
            value={filter}
            onChange={(e) => setFilter(e.target.value as CollectionId | "all")}
          >
            <option value="all">all (split metrics)</option>
            <option value="human_pd">human_pd</option>
            <option value="ai_permissive">ai_permissive</option>
            <option value="self_generated">self_generated</option>
          </Select>
        </div>
        <ul className="space-y-2">
          {shown.map((r) => (
            <li key={r.id} className="rounded-[var(--radius-md)] border border-border p-3 text-sm">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs text-subtle">
                    {r.collection} · {r.license} · {r.provenance}
                  </p>
                  <p className="text-xs font-mono text-subtle mt-0.5">{r.id}</p>
                </div>
                <Button type="button" size="sm" variant="ghost" onClick={() => dropRecord(r.id)}>
                  Drop
                </Button>
              </div>
              <p className="text-xs text-muted mt-1">
                {r.annotation
                  ? `mean CDS ${(
                      r.annotation.lines.reduce((a, l) => a + l.cds, 0) /
                      Math.max(1, r.annotation.lines.length)
                    ).toFixed(2)} · ${r.annotation.lines.filter((l) => l.verdict !== "PASS").length} flags · passed=${r.annotation.passed}`
                  : "unannotated"}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {GOLD_LABELS.map((g) => (
                  <Button
                    key={g}
                    type="button"
                    size="sm"
                    variant={r.humanOverride === g ? "primary" : "secondary"}
                    onClick={() => overrideRecord(r.id, g)}
                  >
                    {g}
                  </Button>
                ))}
              </div>
              <input
                className="mt-2 h-9 w-full rounded-[var(--radius-sm)] border border-border bg-bg-elevated px-2 text-xs"
                placeholder="Human override / gold label (pass | false_positive | miss | free text)"
                defaultValue={r.humanOverride}
                key={`${r.id}:${r.humanOverride}`}
                onBlur={(e) => overrideRecord(r.id, e.target.value)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-muted">
          Review queue · REWRITE / BLOCK
        </h2>
        {reviewLines.length === 0 ? (
          <p className="text-xs text-muted">No rewrite/block lines in this filter.</p>
        ) : (
          <ul className="space-y-2 max-h-[420px] overflow-auto">
            {reviewLines.slice(0, 40).map(({ rec, line }) => (
              <li
                key={`${rec.id}-${line.section}-${line.index}`}
                className="rounded-[var(--radius-md)] border border-border p-3 text-xs"
              >
                <p className="text-subtle">
                  {rec.collection} · {rec.title} · {line.section} L{line.index + 1} ·{" "}
                  <span className={line.verdict === "BLOCK" ? "text-fail" : "text-warn"}>
                    {line.verdict}
                  </span>{" "}
                  · CDS {line.cds}
                  {line.classes.length ? ` · ${line.classes.join(", ")}` : ""}
                </p>
                <p className="mt-1 text-fg">{line.line}</p>
                {line.rewrite ? (
                  <p className="mt-1 text-muted">→ {line.rewrite}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-widest text-muted">Proposed diffs</h2>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            const over = suites.find((s) => s.name === "Self-overuse");
            propose(
              "K2",
              "Auto-proposal from self-overuse suite. Review before accept.",
              (over?.notes.join("\n") || "No overused terms.") +
                "\n\nSuggested: add frequency-cap negatives for listed tokens in Style prompt layer.",
            );
          }}
        >
          Propose K2 diff from suites
        </Button>
        <ul className="space-y-2">
          {versions.map((v) => (
            <li key={v.id} className="rounded-[var(--radius-md)] border border-border p-3">
              <p className="text-sm">
                {v.module} {v.version} {v.accepted ? "· accepted" : "· pending"}
              </p>
              <pre className="text-xs text-muted whitespace-pre-wrap mt-2">{v.diff}</pre>
              {!v.accepted && (
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => accept(v.id, { forceUnreviewed })}
                  >
                    Accept version
                  </Button>
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      className="size-4"
                      checked={forceUnreviewed}
                      onChange={(e) => setForceUnreviewed(e.target.checked)}
                    />
                    force unreviewed
                  </label>
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
