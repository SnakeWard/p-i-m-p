import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/field";
import { AUDIO_PROVIDER_ID, usePimp } from "@/pimp/store";

export function ProvidersView() {
  const providers = usePimp((s) => s.providers);
  const setKey = usePimp((s) => s.setProviderKey);
  const setDefault = usePimp((s) => s.setDefaultProvider);
  const gen = usePimp((s) => s.defaultGenerateProvider);
  const evalP = usePimp((s) => s.defaultEvalProvider);
  const optIn = usePimp((s) => s.selfPlugOptIn);
  const setOpt = usePimp((s) => s.setSelfPlugOptIn);

  return (
    <div className="max-w-3xl space-y-6">
      <header>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Auth layer</p>
        <h1 className="font-display text-3xl mt-1">Providers</h1>
        <p className="text-muted mt-2 leading-relaxed">
          Native Grok uses the studio session. Other engines take API keys stored only in this
          browser. Keys are sent with a generate request and never written to a remote store.
        </p>
      </header>
      <ul className="space-y-3">
        {providers.map((p) => (
          <li key={p.id} className="rounded-[var(--radius-md)] border border-border p-4 space-y-3">
            <div className="flex flex-wrap justify-between gap-2">
              <p className="font-medium">{p.label}</p>
              {p.id !== AUDIO_PROVIDER_ID && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={gen === p.id ? "primary" : "secondary"}
                    onClick={() => setDefault("generate", p.id)}
                  >
                    Default generate
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={evalP === p.id ? "primary" : "secondary"}
                    onClick={() => setDefault("eval", p.id)}
                  >
                    Default eval
                  </Button>
                </div>
              )}
            </div>
            {p.id !== "grok" && (
              <div>
                <Label>API key</Label>
                <Input
                  type="password"
                  autoComplete="off"
                  value={p.key}
                  onChange={(e) => setKey(p.id, e.target.value)}
                  placeholder="stored locally only"
                />
              </div>
            )}
            {p.id === "grok" && (
              <p className="text-xs text-muted">
                No key required in this studio. Offline builds accept XAI_API_KEY.
              </p>
            )}
            {p.id === AUDIO_PROVIDER_ID && (
              <p className="text-xs text-muted">
                Audio spend hits this key. Lyrics still use the generate provider.
              </p>
            )}
          </li>
        ))}
      </ul>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="size-4"
          checked={optIn}
          onChange={(e) => setOpt(e.target.checked)}
        />
        Auto self-plug last generations (opt-in; cap 20 or 90-day drop — not unbounded)
      </label>
    </div>
  );
}
