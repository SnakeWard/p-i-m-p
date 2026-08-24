import { Badge } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { usePimp } from "@/pimp/store";
import { CopyBtn } from "./copy-btn";
import { GenerateBar } from "./generate-bar";

export function LyricsView() {
  const tracks = usePimp((s) => s.tracks);
  const activeId = usePimp((s) => s.activeId);
  const setLyrics = usePimp((s) => s.setLyrics);
  const runQc = usePimp((s) => s.runQc);
  const applyRewrites = usePimp((s) => s.applyRewrites);
  const selfPlug = usePimp((s) => s.selfPlugActive);
  const t = tracks.find((x) => x.id === activeId);

  if (!t) {
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="font-display text-3xl">Lyrics</h1>
        <p className="text-muted">Lock a spec on Intent, then generate.</p>
        <GenerateBar />
      </div>
    );
  }

  const report = t.tropeReport;

  return (
    <div className="max-w-5xl grid lg:grid-cols-[1fr_280px] gap-6">
      <div className="space-y-4">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">K2-gated lyrics</p>
            <h1 className="font-display text-3xl mt-1">{t.spec.title || "Untitled"}</h1>
          </div>
          <CopyBtn text={t.lyrics} label="Copy lyrics" />
        </header>
        <GenerateBar />
        <Textarea
          rows={22}
          className="font-mono text-[13px]"
          value={t.lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="[Verse 1]"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={runQc}>
            Run TropeCheck
          </Button>
          <Button type="button" variant="secondary" onClick={applyRewrites}>
            Apply rewrites
          </Button>
          <Button type="button" variant="ghost" onClick={selfPlug}>
            Self-plug this take
          </Button>
        </div>
      </div>
      <aside className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4 space-y-3 h-fit">
        <p className="text-xs uppercase tracking-widest text-muted">QC</p>
        {report ? (
          <>
            <Badge tone={report.passed ? "ok" : "warn"}>
              {report.passed ? "Pass" : "Needs work"} · {report.mode}
            </Badge>
            <p className="text-xs text-muted">
              {report.lines.filter((l) => l.verdict === "REWRITE" || l.verdict === "BLOCK").length}{" "}
              rewrite/block · {report.lines.filter((l) => l.verdict === "CONDITIONAL").length}{" "}
              conditional
            </p>
            <ul className="space-y-2 max-h-[480px] overflow-auto">
              {report.lines
                .filter((l) => l.verdict !== "PASS")
                .map((l, i) => (
                  <li key={`${l.section}-${l.index}-${i}`} className="text-xs leading-relaxed">
                    <span className="text-muted">
                      {l.section} L{l.index + 1} · CDS {l.cds}
                    </span>
                    <br />
                    <span className="text-fg">{l.line}</span>
                    {l.rewrite && (
                      <>
                        <br />
                        <span className="text-ok">→ {l.rewrite}</span>
                      </>
                    )}
                  </li>
                ))}
            </ul>
            {report.sectionFailures.map((f) => (
              <p key={f} className="text-xs text-danger">
                {f}
              </p>
            ))}
          </>
        ) : (
          <p className="text-sm text-muted">Generate or run TropeCheck.</p>
        )}
      </aside>
    </div>
  );
}
