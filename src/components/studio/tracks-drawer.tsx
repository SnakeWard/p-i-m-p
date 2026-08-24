import { usePimp } from "@/pimp/store";
import { Button } from "@/components/ui/button";

export function TracksDrawer() {
  const tracks = usePimp((s) => s.tracks);
  const activeId = usePimp((s) => s.activeId);
  const load = usePimp((s) => s.loadTrack);
  const neu = usePimp((s) => s.newTrack);

  return (
    <div className="px-3 pb-4 space-y-1">
      <div className="flex items-center justify-between px-1 mb-2">
        <p className="text-[11px] uppercase tracking-widest text-subtle">Tracks</p>
        <Button type="button" size="sm" variant="ghost" onClick={neu}>
          New
        </Button>
      </div>
      {tracks.length === 0 && <p className="text-xs text-subtle px-1">Empty session</p>}
      {tracks.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => load(t.id)}
          className={`w-full text-left rounded-[var(--radius-sm)] px-2 py-2 text-sm ${
            t.id === activeId ? "bg-bg-subtle text-fg" : "text-muted hover:text-fg"
          }`}
        >
          <span className="block truncate">{t.spec.title || "Untitled"}</span>
          <span className="block text-[11px] text-subtle truncate">
            {t.spec.genreSpine.split(" ")[0]}
          </span>
        </button>
      ))}
    </div>
  );
}
