import { Textarea } from "@/components/ui/field";
import { usePimp } from "@/pimp/store";
import { CopyBtn } from "./copy-btn";

export function SoundView() {
  const tracks = usePimp((s) => s.tracks);
  const activeId = usePimp((s) => s.activeId);
  const setStyle = usePimp((s) => s.setStyle);
  const t = tracks.find((x) => x.id === activeId);

  if (!t) {
    return (
      <p className="text-muted">Lock a spec first. Style prompt is built from the signal stack.</p>
    );
  }

  return (
    <div className="max-w-3xl space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">K3 Style / Production</p>
          <h1 className="font-display text-3xl mt-1">Paste-ready brief</h1>
        </div>
        <CopyBtn text={t.stylePrompt} />
      </header>
      <p className="text-sm text-muted">
        {t.stylePrompt.length}/1000 characters · Identity → Emotion → Genre → Production → Structure
      </p>
      <Textarea
        rows={12}
        value={t.stylePrompt}
        onChange={(e) => setStyle(e.target.value.slice(0, 1000))}
      />
    </div>
  );
}
