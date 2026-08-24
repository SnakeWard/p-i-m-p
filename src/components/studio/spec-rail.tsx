import { formatSpec } from "@/pimp/engine/architect";
import { usePimp } from "@/pimp/store";
import { CopyBtn } from "./copy-btn";

export function SpecRail() {
  const draft = usePimp((s) => s.draft);
  const conflicts = usePimp((s) => s.conflicts);
  const text = formatSpec(draft);

  return (
    <aside className="hidden xl:flex w-[320px] shrink-0 flex-col border-l border-border bg-bg-elevated">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="text-xs uppercase tracking-widest text-muted">Spec Block</p>
        <CopyBtn text={text} label="Copy spec" />
      </div>
      <pre className="flex-1 overflow-auto p-4 text-[12px] leading-relaxed font-mono text-muted whitespace-pre-wrap">
        {text}
      </pre>
      {conflicts.length > 0 && (
        <div className="border-t border-border p-4 space-y-2 max-h-48 overflow-auto">
          <p className="text-xs uppercase tracking-widest text-danger">Conflict Alert</p>
          {conflicts.map((c) => (
            <p key={c.field} className="text-xs text-fg leading-relaxed">
              <span className="text-danger">{c.field}.</span> {c.issue}{" "}
              <span className="text-muted">{c.fix}</span>
            </p>
          ))}
        </div>
      )}
    </aside>
  );
}
