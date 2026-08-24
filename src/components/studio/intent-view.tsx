import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { GENRES } from "@/pimp/knowledge/genres";
import { STRUCTURE_MODS, TEMPLATES } from "@/pimp/knowledge/templates";
import { usePimp } from "@/pimp/store";
import type { PerformanceTarget, TropeCheckMode, TropeTone } from "@/pimp/types";

const TONES = ["darker", "more aggressive", "cinematic", "intimate", "defiant"];
const ARCS = [
  "Chaos → Control",
  "Confrontation → Resolution",
  "Ritual → Ascension",
  "Dominance → Surrender",
  "Chase → Capture",
  "Absurdity → Joy",
];

export function IntentView() {
  const d = usePimp((s) => s.draft);
  const patch = usePimp((s) => s.patchDraft);
  const toggleMod = usePimp((s) => s.toggleMod);
  const toggleTone = usePimp((s) => s.toggleTone);
  const lockSpec = usePimp((s) => s.lockSpec);
  const loadExample = usePimp((s) => s.loadExample);
  const personas = usePimp((s) => s.personas);

  return (
    <div className="max-w-3xl space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Intent Architecture</p>
        <h1 className="font-display text-3xl md:text-4xl mt-2 tracking-tight">
          One intent. Then lock the spec.
        </h1>
        <p className="text-muted mt-3 max-w-xl leading-relaxed">
          Identity + Tension + Release. Spine owns rhythm and form. Color owns texture.
        </p>
      </header>

      <div className="space-y-5">
        <div>
          <Label>Psychological intent</Label>
          <Textarea
            rows={3}
            value={d.intent}
            onChange={(e) => patch({ intent: e.target.value })}
            placeholder="Leave without a speech. Lock the door on a life already gone."
          />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Title</Label>
            <Input
              value={d.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="Unsigned Lease"
            />
          </div>
          <div>
            <Label>Persona</Label>
            <Select
              value={d.persona}
              onChange={(e) => patch({ persona: e.target.value })}
            >
              <option value="—">— none —</option>
              {personas.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Primary spine</Label>
            <Select
              value={d.genreSpine}
              onChange={(e) => patch({ genreSpine: e.target.value })}
            >
              {GENRES.map((g) => (
                <option key={g.name}>{g.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Secondary color</Label>
            <Select
              value={d.genreColor}
              onChange={(e) => patch({ genreColor: e.target.value })}
            >
              <option value="none">none</option>
              {GENRES.map((g) => (
                <option key={g.name}>{g.name}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Narrative arc</Label>
            <Select
              value={d.narrativeArc}
              onChange={(e) => patch({ narrativeArc: e.target.value })}
            >
              {ARCS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Emotion path</Label>
            <Input
              value={d.emotionPath}
              onChange={(e) => patch({ emotionPath: e.target.value })}
              placeholder="restrained verse → chorus release"
            />
          </div>
        </div>
        <div>
          <Label>Vocal protocol</Label>
          <Input
            value={d.vocalProtocol}
            onChange={(e) => patch({ vocalProtocol: e.target.value })}
            placeholder="female, late 20s, raspy, intimate, restrained"
          />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Performance</Label>
            <Select
              value={d.performanceTarget}
              onChange={(e) =>
                patch({ performanceTarget: e.target.value as PerformanceTarget })
              }
            >
              {["streaming", "radio", "short-form", "trailer", "club", "sync"].map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>TropeCheck</Label>
            <Select
              value={d.tropeCheck}
              onChange={(e) => patch({ tropeCheck: e.target.value as TropeCheckMode })}
            >
              <option value="standard">standard</option>
              <option value="strict">strict</option>
              <option value="off">off</option>
            </Select>
          </div>
          <div>
            <Label>TropeTone</Label>
            <Select
              value={d.tropeTone}
              onChange={(e) => patch({ tropeTone: e.target.value as TropeTone })}
            >
              {[
                "Poetic",
                "Plainspoken",
                "Violent",
                "Tender",
                "Ironic",
                "Character Voice",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label>Structure template (auto if unchanged)</Label>
          <Select
            value={d.structureTemplate}
            onChange={(e) => patch({ structureTemplate: e.target.value })}
          >
            {TEMPLATES.map((t) => (
              <option key={t.name}>{t.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Tone flags</Label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleTone(t)}
                className={`h-9 px-3 rounded-full border text-sm ${
                  d.toneFlags.includes(t)
                    ? "border-accent bg-bg-subtle text-fg"
                    : "border-border text-muted"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Structure mods</Label>
          <div className="flex flex-wrap gap-2">
            {STRUCTURE_MODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMod(m)}
                className={`h-9 px-3 rounded-full border text-xs ${
                  d.structureMods.includes(m)
                    ? "border-accent bg-bg-subtle text-fg"
                    : "border-border text-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <Button type="button" onClick={lockSpec}>
          Lock Spec
        </Button>
        <Button type="button" variant="secondary" onClick={loadExample}>
          Load example track
        </Button>
      </div>
    </div>
  );
}
