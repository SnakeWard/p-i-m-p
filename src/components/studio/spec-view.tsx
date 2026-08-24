import { formatSpec } from "@/pimp/engine/architect";
import { usePimp } from "@/pimp/store";
import { Button } from "@/components/ui/button";
import { CopyBtn } from "./copy-btn";
import { GenerateBar } from "./generate-bar";

export function SpecView() {
  const draft = usePimp((s) => s.draft);
  const conflicts = usePimp((s) => s.conflicts);
  const lockSpec = usePimp((s) => s.lockSpec);
  const setPhase = usePimp((s) => s.setPhase);
  const text = formatSpec(draft);

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Locked record</p>
        <h1 className="font-display text-3xl mt-1">Spec Block</h1>
      </header>
      {conflicts.length > 0 && (
        <div className="rounded-[var(--radius-md)] border border-danger/40 p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-danger">Conflict Alert</p>
          {conflicts.map((c) => (
            <p key={c.field} className="text-sm leading-relaxed">
              <strong>{c.field}.</strong> {c.issue} <span className="text-muted">{c.fix}</span>
            </p>
          ))}
        </div>
      )}
      <pre className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5 text-[13px] font-mono leading-relaxed whitespace-pre-wrap">
        {text}
      </pre>
      <div className="flex flex-wrap gap-2">
        <CopyBtn text={text} />
        <Button type="button" variant="secondary" onClick={lockSpec}>
          Re-lock
        </Button>
        <Button type="button" variant="ghost" onClick={() => setPhase("intent")}>
          Edit intent
        </Button>
      </div>
      <GenerateBar />
    </div>
  );
}
