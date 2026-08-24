import { Button } from "@/components/ui/button";
import { usePimp } from "@/pimp/store";
import { CopyBtn } from "./copy-btn";

export function ReleaseView() {
  const tracks = usePimp((s) => s.tracks);
  const activeId = usePimp((s) => s.activeId);
  const build = usePimp((s) => s.buildReleasePackage);
  const t = tracks.find((x) => x.id === activeId);

  if (!t) return <p className="text-muted">Lock a spec first.</p>;

  const r = t.release;

  return (
    <div className="max-w-3xl space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">K4 Release Package</p>
          <h1 className="font-display text-3xl mt-1">Cover, hook, launch</h1>
        </div>
        <Button type="button" onClick={build}>
          Build package
        </Button>
      </header>
      {!r ? (
        <p className="text-muted">Build from the current spec and lyrics.</p>
      ) : (
        <div className="space-y-6">
          <section className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-sm uppercase tracking-widest text-muted">Cover prompt</h2>
              <CopyBtn text={r.coverPrompt} />
            </div>
            <p className="text-sm leading-relaxed text-fg">{r.coverPrompt}</p>
            <p className="text-xs text-subtle">Negative: {r.negativePrompt}</p>
            <p className="text-xs text-muted">Alt 1 — {r.coverAlts[0].slice(-80)}</p>
            <p className="text-xs text-muted">Alt 2 — {r.coverAlts[1].slice(-80)}</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-sm uppercase tracking-widest text-muted">
              Video hook · {r.hookType}
            </h2>
            <pre className="text-sm whitespace-pre-wrap font-sans text-fg">{r.hookPlan}</pre>
          </section>
          <section className="space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-sm uppercase tracking-widest text-muted">Caption</h2>
              <CopyBtn text={r.caption} />
            </div>
            <p>{r.caption}</p>
            <p className="text-muted text-sm">{r.shortCaption}</p>
            <p className="text-xs text-subtle">{r.hashtags.join(" ")}</p>
          </section>
        </div>
      )}
    </div>
  );
}
