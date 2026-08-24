import { PIMP_SYSTEM } from "@/pimp/engine/system-prompt";
import { CopyBtn } from "./copy-btn";

const CLI = `pimp-mod — empirical K-module harness (real runK2)
Usage:
  pimp-mod seed
  pimp-mod ingest  --source human_pd|ai_permissive|self_generated --file <path>
  pimp-mod annotate [--id <id>]
  pimp-mod suite   [--collection <c>]
  pimp-mod override --id <id> --label <pass|false_positive|miss|text>
  pimp-mod export  [--out corpus.jsonl] [--collection <c>]
  pimp-mod version-diff --before <file> --after <file>
  pimp-mod bump --module K2 [--notes <text>] [--force-unreviewed]

Sources: human_pd (PD/CC commercial-reuse only), ai_permissive, self_generated.
Collections never mix. Export preserves collection. Version bumps need a gold label.`;

export function HandoffView() {
  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Protocol 7</p>
        <h1 className="font-display text-3xl mt-1">Handoff package</h1>
      </header>
      <p className="text-muted leading-relaxed">
        Paste the system prompt into a local model host. Keep K1–K5 routing locked. Store
        personas and specs as JSON. Run pimp-mod beside the studio for empirical updates.
      </p>
      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-sm uppercase tracking-widest text-muted">System prompt</h2>
          <CopyBtn text={PIMP_SYSTEM} />
        </div>
        <pre className="rounded-[var(--radius-md)] border border-border p-4 text-xs whitespace-pre-wrap font-mono text-muted">
          {PIMP_SYSTEM}
        </pre>
      </section>
      <section className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-sm uppercase tracking-widest text-muted">CLI</h2>
          <CopyBtn text={CLI} />
        </div>
        <pre className="rounded-[var(--radius-md)] border border-border p-4 text-xs whitespace-pre-wrap font-mono text-muted">
          {CLI}
        </pre>
      </section>
      <p className="text-xs text-subtle">P.I.M.P. v0.9 · 2026-08-24 · protocols 0–7 locked</p>
    </div>
  );
}
