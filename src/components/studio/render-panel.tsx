import { AudioLines, Download, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { nowIso } from "@/lib/utils";
import { completeAudio, musicModels, queueAudio, quoteAudio, retrieveAudio } from "@/pimp/api";
import { base64ToBytes, extensionForMime } from "@/pimp/audio/venice-client";
import { getRender, idbAvailable, putRender } from "@/pimp/audio/idb";
import {
  applyModelMetadata,
  buildRenderPlan,
  defaultModel,
  deriveInstrumental,
  findModel,
  gateRender,
  SONG_MODELS,
  targetDuration,
  type ModelMetadata,
  type RenderTier,
} from "@/pimp/engine/render-route";
import { AUDIO_PROVIDER_ID, usePimp } from "@/pimp/store";
import type { Track } from "@/pimp/types";

const POLL_MS = 3000;
const TIMEOUT_MS = 10 * 60 * 1000;

/** Session cache for GET /models?type=music. The static table is the fallback. */
let metadataCache: ModelMetadata[] | null = null;

export function RenderPanel({ track }: { track: Track }) {
  const providers = usePimp((s) => s.providers);
  const setRender = usePimp((s) => s.setRender);
  const clearRender = usePimp((s) => s.clearRender);
  const setPhase = usePimp((s) => s.setPhase);

  const apiKey = providers.find((p) => p.id === AUDIO_PROVIDER_ID)?.key ?? "";
  const render = track.render;

  // Hoisted so the poll effect depends on the job identity only — progress
  // ticks must not tear down and restart the timer.
  const trackId = track.id;
  const jobStatus = render?.status;
  const jobQueueId = render?.queueId ?? "";
  const jobModel = render?.model ?? "";

  const [tier, setTier] = useState<RenderTier>("draft");
  const [modelId, setModelId] = useState(() => defaultModel("draft", track.spec.performanceTarget));
  const [durationOverride, setDurationOverride] = useState<number | undefined>(undefined);
  const [instrumentalOverride, setInstrumentalOverride] = useState<boolean | undefined>(undefined);
  const [metadata, setMetadata] = useState<ModelMetadata[] | null>(metadataCache);
  const [quote, setQuote] = useState<number | null>(null);
  const [quoteNote, setQuoteNote] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [cacheWarning, setCacheWarning] = useState<string | null>(null);
  const keyRef = useRef(apiKey);
  keyRef.current = apiKey;

  const cap = useMemo(() => {
    const base = findModel(modelId);
    if (!base) return null;
    return applyModelMetadata(base, metadata?.find((m) => m.id === modelId));
  }, [modelId, metadata]);

  const plan = useMemo(() => {
    if (!cap) return null;
    return buildRenderPlan({
      spec: track.spec,
      stylePrompt: track.stylePrompt,
      lyrics: track.lyrics,
      cap,
      instrumental: instrumentalOverride,
      durationSeconds: durationOverride,
    });
  }, [cap, track.spec, track.stylePrompt, track.lyrics, instrumentalOverride, durationOverride]);

  const gateMsg = plan ? gateRender({ plan, hasKey: Boolean(apiKey) }) : "Pick a model.";
  const busy = render?.status === "queued" || render?.status === "processing";
  const shownDuration = plan?.body.duration_seconds ?? plan?.quoteDurationSeconds ?? 0;

  /* Capability discovery — once per session, key permitting. */
  useEffect(() => {
    if (metadataCache || !apiKey) return;
    let cancelled = false;
    void (async () => {
      try {
        const res = await musicModels({ data: { apiKey } });
        if (cancelled || !res.ok) return;
        metadataCache = res.models;
        setMetadata(res.models);
      } catch {
        // Static capability table stays authoritative.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  /* Quote, debounced. Venice does not require auth here, so it works keyless. */
  useEffect(() => {
    if (!plan) return;
    let cancelled = false;
    const handle = setTimeout(() => {
      void (async () => {
        try {
          const res = await quoteAudio({
            data: {
              apiKey: keyRef.current,
              model: plan.model,
              duration_seconds: plan.quoteDurationSeconds,
            },
          });
          if (cancelled) return;
          if (res.ok) {
            setQuote(res.quote);
            setQuoteNote(null);
          } else {
            setQuote(null);
            setQuoteNote(res.error);
          }
        } catch {
          if (!cancelled) setQuote(null);
        }
      })();
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [plan]);

  /* Revoke the previous object URL whenever it changes, and on unmount. */
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  /* Rehydrate a finished render from IndexedDB. A miss is a failure, not a lie. */
  useEffect(() => {
    if (jobStatus !== "ready" || blobUrl) return;
    let cancelled = false;
    void (async () => {
      if (!idbAvailable()) {
        if (!cancelled) setRender({ status: "failed", error: "audio cache missing" });
        return;
      }
      try {
        const row = await getRender(trackId);
        if (cancelled) return;
        if (!row) {
          setRender({ status: "failed", error: "audio cache missing" });
          return;
        }
        setBlobUrl(URL.createObjectURL(new Blob([row.bytes], { type: row.mime })));
      } catch {
        if (!cancelled) setRender({ status: "failed", error: "audio cache missing" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobStatus, blobUrl, trackId, setRender]);

  /*
   * Poller. Each tick is one server-fn call; the loop lives here so a reload
   * resumes an in-flight job from {model, queueId} instead of re-queueing it.
   */
  useEffect(() => {
    if (jobStatus !== "queued" && jobStatus !== "processing") return;
    if (!jobQueueId || !jobModel || !apiKey) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();

    async function tick() {
      if (cancelled) return;
      try {
        const res = await retrieveAudio({
          data: { apiKey, model: jobModel, queue_id: jobQueueId },
        });
        if (cancelled) return;

        if (!res.ok) {
          setRender({ status: "failed", error: res.error });
          return;
        }

        if (res.state === "processing") {
          setRender({
            status: "processing",
            avgMs: res.average_execution_time || null,
            elapsedMs: res.execution_duration || null,
            error: null,
          });
          if (Date.now() - startedAt > TIMEOUT_MS) {
            setRender({
              status: "failed",
              error: "Still processing after 10 minutes — stopped polling.",
            });
            return;
          }
          timer = setTimeout(() => void tick(), POLL_MS);
          return;
        }

        // Ready: bytes to IndexedDB first, and only then release the remote copy.
        const bytes = base64ToBytes(res.audioBase64);
        let cached = false;
        if (idbAvailable()) {
          try {
            await putRender({
              trackId,
              queueId: jobQueueId,
              model: jobModel,
              mime: res.mime,
              bytes,
              createdAt: nowIso(),
            });
            cached = true;
          } catch {
            cached = false;
          }
        }
        if (cancelled) return;

        setBlobUrl(URL.createObjectURL(new Blob([bytes], { type: res.mime })));
        setCacheWarning(
          cached ? null : "Not cached locally — this render will not survive a reload.",
        );
        setRender({ status: "ready", mime: res.mime, error: null });

        if (cached) {
          try {
            await completeAudio({
              data: { apiKey, model: jobModel, queue_id: jobQueueId },
            });
          } catch (e) {
            console.warn("venice complete failed (non-fatal)", e);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setRender({ status: "failed", error: e instanceof Error ? e.message : "Render failed" });
        }
      }
    }

    timer = setTimeout(() => void tick(), 0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [trackId, jobStatus, jobQueueId, jobModel, apiKey, setRender]);

  const startRender = useCallback(async () => {
    if (!plan || gateMsg) return;
    setCacheWarning(null);
    setBlobUrl(null);
    setRender({
      status: "queued",
      queueId: "",
      model: plan.model,
      mime: null,
      durationSec: plan.quoteDurationSeconds,
      costUsd: quote,
      error: null,
      avgMs: null,
      elapsedMs: null,
      createdAt: nowIso(),
    });
    try {
      const res = await queueAudio({ data: { apiKey, ...plan.body } });
      if (!res.ok) {
        setRender({ status: "failed", error: res.error });
        return;
      }
      setRender({ status: "queued", queueId: res.queue_id, model: res.model, error: null });
    } catch (e) {
      setRender({ status: "failed", error: e instanceof Error ? e.message : "Queue failed" });
    }
  }, [plan, gateMsg, quote, apiKey, setRender]);

  function onTier(next: RenderTier) {
    setTier(next);
    setModelId(defaultModel(next, track.spec.performanceTarget));
    setDurationOverride(undefined);
  }

  function onModel(next: string) {
    setModelId(next);
    setDurationOverride(undefined);
  }

  const derivedInstrumental = deriveInstrumental(track.spec);
  const pct =
    render?.avgMs && render.avgMs > 0
      ? Math.min(99, Math.round(((render.elapsedMs ?? 0) / render.avgMs) * 100))
      : null;
  const fileName = `${(track.spec.title || "pimp-track")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.${extensionForMime(render?.mime ?? null)}`;

  return (
    <section className="rounded-[var(--radius-lg)] border border-border bg-bg-elevated p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">K3-R Render</p>
          <h2 className="font-display text-xl mt-0.5">Venice audio</h2>
        </div>
        <div className="flex gap-2">
          {(["draft", "release"] as RenderTier[]).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={tier === v ? "primary" : "secondary"}
              onClick={() => onTier(v)}
            >
              {v === "draft" ? "Draft" : "Release"}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Renders the brief above with the K2-gated lyrics. No new lyrics are written.
      </p>

      {plan && (
        <p className={`text-xs ${plan.promptTrimmed ? "text-warn" : "text-subtle"}`}>
          Prompt budget {Math.min(plan.promptSourceLength, plan.promptLimit)}/{plan.promptLimit}
          {plan.promptTrimmed
            ? ` · brief is ${plan.promptSourceLength} chars and will be cut at the last clause that fits. Edit it above to control what goes.`
            : " · fits"}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Model</Label>
          <Select value={modelId} onChange={(e) => onModel(e.target.value)} disabled={busy}>
            {SONG_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} · {m.role}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Duration</Label>
          {cap?.durationOptions ? (
            <Select
              value={String(shownDuration)}
              onChange={(e) => setDurationOverride(Number(e.target.value))}
              disabled={busy}
            >
              {cap.durationOptions.map((n) => (
                <option key={n} value={n}>
                  {n}s
                </option>
              ))}
            </Select>
          ) : cap?.supportsDuration ? (
            <Input
              type="number"
              min={cap.durationMin ?? 3}
              max={cap.durationMax ?? 600}
              value={shownDuration}
              disabled={busy}
              onChange={(e) => setDurationOverride(Number(e.target.value))}
              onBlur={(e) => {
                const lo = cap.durationMin ?? 3;
                const hi = cap.durationMax ?? 600;
                setDurationOverride(Math.min(hi, Math.max(lo, Math.round(Number(e.target.value)))));
              }}
            />
          ) : (
            <p className="h-11 flex items-center text-sm text-subtle">
              Model default ({targetDuration(track.spec.performanceTarget)}s target)
            </p>
          )}
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          className="size-4"
          disabled={busy || !cap?.supportsInstrumental}
          checked={plan?.instrumental ?? false}
          onChange={(e) => setInstrumentalOverride(e.target.checked)}
        />
        <span className={cap?.supportsInstrumental ? "" : "text-subtle"}>
          Instrumental
          {!cap?.supportsInstrumental && " — not supported by this model"}
          {cap?.supportsInstrumental && derivedInstrumental && instrumentalOverride === undefined
            ? " (derived from vocal protocol)"
            : ""}
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
        <span className="text-sm text-muted">
          {quote === null ? (quoteNote ? "Quote unavailable" : "Pricing…") : `~$${quote.toFixed(3)}`}
          {shownDuration ? ` · ${shownDuration}s` : ""}
        </span>
        <div className="flex-1" />
        {render?.status === "failed" && (
          <Button type="button" size="sm" variant="secondary" onClick={() => void startRender()}>
            <RotateCcw className="size-4" />
            Retry
          </Button>
        )}
        <Button type="button" disabled={busy || Boolean(gateMsg)} onClick={() => void startRender()}>
          <AudioLines className="size-4" />
          {busy ? "Rendering…" : "Render audio"}
        </Button>
      </div>

      {gateMsg && !busy && (
        <p className="text-sm text-warn">
          {gateMsg}
          {!apiKey && (
            <button
              type="button"
              className="ml-2 underline text-accent"
              onClick={() => setPhase("providers")}
            >
              Open Providers
            </button>
          )}
        </p>
      )}

      {busy && (
        <div className="space-y-1.5">
          {pct === null ? (
            <div className="h-1 rounded-full shimmer" />
          ) : (
            <div className="h-1 rounded-full bg-bg-subtle overflow-hidden">
              <div
                className="h-full bg-accent transition-[width] duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          )}
          <p className="text-xs text-subtle">
            {render?.status === "queued" ? "Queued" : "Processing"}
            {render?.elapsedMs != null && render.avgMs != null
              ? ` · ${(render.elapsedMs / 1000).toFixed(1)}s of ~${(render.avgMs / 1000).toFixed(1)}s`
              : ""}
          </p>
        </div>
      )}

      {render?.status === "failed" && render.error && (
        <p className="text-sm text-danger">{render.error}</p>
      )}

      {render?.status === "ready" && blobUrl && (
        <div className="space-y-2">
          <audio controls src={blobUrl} className="w-full" />
          <div className="flex items-center gap-3">
            <a
              href={blobUrl}
              download={fileName}
              className="inline-flex items-center gap-2 h-9 px-3 text-sm rounded-[var(--radius-sm)] bg-bg-subtle border border-border hover:border-accent/40"
            >
              <Download className="size-4" />
              Download
            </a>
            <span className="text-xs text-subtle">
              {render.model}
              {render.costUsd != null ? ` · $${render.costUsd.toFixed(3)}` : ""}
            </span>
            <div className="flex-1" />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                clearRender();
                setBlobUrl(null);
                setCacheWarning(null);
              }}
            >
              Discard
            </Button>
          </div>
          {cacheWarning && <p className="text-xs text-warn">{cacheWarning}</p>}
        </div>
      )}
    </section>
  );
}
