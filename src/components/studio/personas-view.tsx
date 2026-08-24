import { useState } from "react";
import { nowIso, uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { TEMPLATES } from "@/pimp/knowledge/templates";
import { usePimp } from "@/pimp/store";

export function PersonasView() {
  const personas = usePimp((s) => s.personas);
  const upsert = usePimp((s) => s.upsertPersona);
  const drop = usePimp((s) => s.dropPersona);
  const useP = usePimp((s) => s.usePersona);
  const [name, setName] = useState("");
  const [voice, setVoice] = useState("");
  const [visual, setVisual] = useState("");
  const [house, setHouse] = useState(TEMPLATES[2].name);

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Identity Stabilization</p>
        <h1 className="font-display text-3xl mt-1">Personas</h1>
      </header>
      <form
        className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          upsert({
            id: uid("per"),
            name: name.trim(),
            voice,
            visual,
            houseTemplate: house,
            createdAt: nowIso(),
          });
          setName("");
          setVoice("");
          setVisual("");
        }}
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label>House template</Label>
            <Select value={house} onChange={(e) => setHouse(e.target.value)}>
              {TEMPLATES.map((t) => (
                <option key={t.name}>{t.name}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label>Voice</Label>
          <Input
            value={voice}
            onChange={(e) => setVoice(e.target.value)}
            placeholder="male, 40s, gravel, close-mic"
          />
        </div>
        <div>
          <Label>Visual identity</Label>
          <Textarea rows={2} value={visual} onChange={(e) => setVisual(e.target.value)} />
        </div>
        <Button type="submit">Create persona</Button>
      </form>
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
                <p className="text-sm text-muted">{p.voice || "No voice spec"}</p>
                <p className="text-xs text-subtle">{p.houseTemplate}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => useP(p.id)}>
                  Use
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => drop(p.id)}>
                  Drop
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
