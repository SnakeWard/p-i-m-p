import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label, Textarea } from "@/components/ui/field";
import type { PersonaV1 } from "@/pimp/persona/schema";
import { usePimp } from "@/pimp/store";

export function PersonasView() {
  const personas = usePimp((s) => s.personas);
  const importPersona = usePimp((s) => s.importPersona);
  const drop = usePimp((s) => s.dropPersona);
  const useP = usePimp((s) => s.usePersona);
  const lastError = usePimp((s) => s.lastError);
  const lastNotice = usePimp((s) => s.lastNotice);
  const setLastError = usePimp((s) => s.setLastError);
  const setLastNotice = usePimp((s) => s.setLastNotice);
  const [paste, setPaste] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ field: string; message: string }[]>([]);
  const [showId, setShowId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const shown = personas.find((p) => p.id === showId) ?? null;

  function tryImport(raw: unknown) {
    const result = importPersona(raw);
    if (!result.ok) {
      setFieldErrors(result.errors);
      return;
    }
    setFieldErrors([]);
    setPaste("");
    setShowId(result.persona.id);
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        tryImport(JSON.parse(String(reader.result)));
      } catch {
        setFieldErrors([{ field: "json", message: "File is not valid JSON" }]);
        setLastError("File is not valid JSON");
      }
    };
    reader.readAsText(file);
  }

  function onUse(id: string, overwrite = false) {
    const status = useP(id, { overwrite });
    if (status === "needs-confirm") setPendingId(id);
    else setPendingId(null);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Identity Stabilization</p>
        <h1 className="font-display text-3xl mt-1">Personas</h1>
        <p className="text-muted mt-2 leading-relaxed">
          Import <span className="font-mono text-xs">pimp.persona.v1</span> JSON. Invalid files are
          rejected and never listed. Use binds defaults into the current Spec.
        </p>
      </header>

      {lastNotice ? (
        <p className="rounded-[var(--radius-md)] border border-pass/40 bg-surface px-3 py-2 text-sm text-pass">
          {lastNotice}
        </p>
      ) : null}
      {lastError ? (
        <p className="rounded-[var(--radius-md)] border border-fail/40 bg-surface px-3 py-2 text-sm text-fail">
          {lastError}
        </p>
      ) : null}

      <section className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5 space-y-3">
        <Label>Import JSON</Label>
        <input
          type="file"
          accept="application/json,.json"
          className="block w-full text-sm text-muted file:mr-3 file:h-9 file:rounded-[var(--radius-sm)] file:border file:border-border file:bg-bg-elevated file:px-3 file:text-fg"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        <Textarea
          rows={8}
          className="font-mono text-xs"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder='{"schema":"pimp.persona.v1", ...}'
        />
        <Button
          type="button"
          onClick={() => {
            try {
              tryImport(JSON.parse(paste));
            } catch {
              setFieldErrors([{ field: "json", message: "Paste is not valid JSON" }]);
              setLastError("Paste is not valid JSON");
            }
          }}
        >
          Validate + import
        </Button>
        {fieldErrors.length > 0 ? (
          <ul className="space-y-1">
            {fieldErrors.map((e) => (
              <li key={e.field} className="text-xs text-fail">
                <span className="font-mono">{e.field}</span> — {e.message}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {pendingId ? (
        <section className="rounded-[var(--radius-md)] border border-warn/40 bg-surface p-4 space-y-3">
          <p className="text-sm">A Spec already has a persona / intent / title. Overwrite defaults?</p>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={() => onUse(pendingId, true)}>
              Overwrite defaults
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setPendingId(null)}
            >
              Cancel
            </Button>
          </div>
        </section>
      ) : null}

      <ul className="space-y-3">
        {personas.length === 0 && <p className="text-muted text-sm">No personas yet.</p>}
        {personas.map((p) => (
          <li
            key={p.id}
            className="rounded-[var(--radius-md)] border border-border p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between gap-3">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted">{p.defaults.genre_spine}</p>
                <p className="text-xs text-subtle">
                  trope_check {p.defaults.trope_check} · {p.source} · {p.id}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => onUse(p.id)}>
                  Use
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowId(p.id)}>
                  Show
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    drop(p.id);
                    if (showId === p.id) setShowId(null);
                    setLastNotice(`Dropped ${p.name}`);
                  }}
                >
                  Drop
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {shown ? <PersonaDetail persona={shown} /> : null}
    </div>
  );
}

function PersonaDetail({ persona }: { persona: PersonaV1 }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-border p-5 space-y-3">
      <h2 className="text-sm uppercase tracking-widest text-muted">Show · {persona.name}</h2>
      <pre className="text-xs font-mono text-muted whitespace-pre-wrap leading-relaxed">
        {JSON.stringify(persona, null, 2)}
      </pre>
    </section>
  );
}
