import { Sparkles } from "lucide-react";
import { useState } from "react";
import { generateTrack } from "@/pimp/api";
import { scaffoldLyrics } from "@/pimp/engine/scaffold-lyrics";
import { usePimp } from "@/pimp/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";

export function GenerateBar() {
  const [instruction, setInstruction] = useState("");
  const generating = usePimp((s) => s.generating);
  const lastError = usePimp((s) => s.lastError);
  const tracks = usePimp((s) => s.tracks);
  const activeId = usePimp((s) => s.activeId);
  const providers = usePimp((s) => s.providers);
  const defaultGenerateProvider = usePimp((s) => s.defaultGenerateProvider);
  const lockSpec = usePimp((s) => s.lockSpec);
  const applyGeneration = usePimp((s) => s.applyGeneration);
  const setGenerating = usePimp((s) => s.setGenerating);
  const setLastError = usePimp((s) => s.setLastError);
  const setPhase = usePimp((s) => s.setPhase);

  const track = tracks.find((t) => t.id === activeId);
  const spec = track?.spec;
  const provider = providers.find((p) => p.id === defaultGenerateProvider);

  async function run(mode: "ai" | "scaffold") {
    if (!spec) {
      lockSpec();
    }
    const current = usePimp.getState();
    const t = current.tracks.find((x) => x.id === current.activeId);
    if (!t) {
      setLastError("Lock a spec first.");
      setPhase("intent");
      return;
    }
    if (mode === "scaffold") {
      applyGeneration(scaffoldLyrics(t.spec), t.stylePrompt, "scaffold");
      setLastError(null);
      return;
    }
    setGenerating(true);
    setLastError(null);
    try {
      const result = await generateTrack({
        data: {
          spec: t.spec,
          providerId: defaultGenerateProvider,
          providerKey: provider?.key || undefined,
          providerBaseUrl: provider?.baseUrl,
          providerModel: provider?.model,
          instruction: instruction || undefined,
        },
      });
      if (!result.ok) {
        setLastError(result.error);
        return;
      }
      applyGeneration(result.lyrics, result.stylePrompt, result.model);
    } catch (e) {
      setLastError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <Input
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Optional mutation — one layer only (e.g. darker chorus, more concrete V2)"
        />
        <div className="flex gap-2 shrink-0">
          <Button type="button" disabled={generating} onClick={() => void run("ai")}>
            <Sparkles className="size-4" />
            {generating ? "Generating…" : `Generate · ${provider?.label ?? "Grok"}`}
          </Button>
          <Button type="button" variant="secondary" onClick={() => void run("scaffold")}>
            Local scaffold
          </Button>
        </div>
      </div>
      {lastError && <p className="text-sm text-danger">{lastError}</p>}
      {generating && <div className="h-1 rounded-full shimmer" />}
    </div>
  );
}
